---
title: "State Management mit NgRx – Teil 3: SignalStore"
published: "2026-06-11"
lastModified: "2026-06-13"
hidden: true
---

**Zusatzmaterial zum Buch *Angular: Das große Praxisbuch (4. Auflage)* von Ferdinand Malcher, Danny Koppenhagen und Johannes Hoppe.**

Dieser Artikel ist **Teil 3** einer dreiteiligen Serie zum Thema State Management mit NgRx.

- Teil 1: Wie kommen wir zu zentralem State Management? → [zum Artikel](/material/ngrx-intro)
- Teil 2: Global Store mit NgRx → [zum Artikel](/material/ngrx-global-store)
- Teil 3: SignalStore (dieser Artikel)

[[toc]]

In [Teil 2](/material/ngrx-global-store) haben wir den **Global Store** kennengelernt: das klassische Redux-Pattern mit Actions, Reducers, Selektoren und Effects. Wir setzen für diesen Teil voraus, dass der Global Store bekannt ist – wir bauen direkt darauf auf und vergleichen beide Ansätze.

Der Global Store ist mächtig, bringt für viele Anwendungsfälle aber spürbar viel Zeremonie mit: Schon das Laden einer simplen Buchliste verteilt sich über Actions, einen Reducer, Selektoren und einen Effect. Genau hier setzt der **SignalStore** aus dem Paket `@ngrx/signals` an. Er ist eine leichtgewichtige, signal-basierte Alternative, die mit deutlich weniger Code auskommt und sich nahtlos in modernes, signal-zentriertes Angular einfügt.

> **Hinweis zur Version:** Wir verwenden **Angular 22** und die dazu passende NgRx-Version. Der SignalStore wohnt im Paket `@ngrx/signals` und wird unabhängig vom Global Store (`@ngrx/store`) installiert.

## Der architektonische Unterschied zum Global Store

Bevor wir Code schreiben, lohnt sich der Blick auf die grundlegend andere Architektur. Global Store und SignalStore lösen dasselbe Problem – zentrale Zustandsverwaltung – auf gegensätzliche Weise.

**Der Global Store ist ein zentrales, indirektes System.** Es gibt genau einen globalen State-Baum. Eine Komponente *beschreibt* mit einer Action nur, *was passiert ist* ("Load Books"); ein Reducer entscheidet an ganz anderer Stelle, *wie* sich der State daraufhin ändert; ein Effect kümmert sich wiederum getrennt um Seiteneffekte. Lesen und Schreiben sind strikt entkoppelt, der Datenfluss ist streng unidirektional. Diese Indirektion ist der eigentliche Wert des Patterns: Jeder Schritt ist nachvollziehbar, auditierbar (Redux DevTools, Time Travel) und klar getrennt – sie ist aber auch die Quelle des vielen Codes.

**Der SignalStore ist ein zusammengesetzter Service mit direktem Zugriff.** Ein Store ist hier kein globaler Baum, sondern ein ganz normaler, injizierbarer Service, den wir *deklarativ aus Bausteinen zusammensetzen* (`withState`, `withComputed`, `withMethods`, …). Den Zustand lesen wir direkt als **Signal** (`store.books()`), und wir ändern ihn, indem wir eine selbst definierte **Methode** aufrufen, die den State über `patchState()` aktualisiert. Es gibt keine verpflichtende Trennung in Action und Reducer mehr: Das "Was passiert" und das "Wie ändert sich der State" liegen zusammen in einer Methode. Das ist weniger Indirektion, weniger Code – aber eben auch weniger eingebaute Nachvollziehbarkeit.

Ein zweiter, ebenso wichtiger Unterschied ist der **Geltungsbereich**:

- Der **Global Store** ist immer **global**. Jeder Feature-State ist Teil des einen zentralen State-Objekts.
- Ein **SignalStore** kann **global *oder* lokal** sein. Wir können ihn mit `{ providedIn: 'root' }` global bereitstellen – oder ihn an eine Komponente binden, sodass er mit der Komponente entsteht und wieder zerstört wird. Damit eignet sich der SignalStore auch hervorragend für komponenten- oder feature-lokalen Zustand. Konzeptionell ersetzt er damit auch das ältere Projekt `@ngrx/component-store`.

Kurz gesagt: Der Global Store ist *ein* großes, strenges System. Der SignalStore ist eine Sammlung *vieler* kleiner, flexibler Stores.

## Der SignalStore im Detail

Schauen wir uns die Bausteine konkret an. Als durchgehendes Beispiel verwenden wir wieder den BookMonkey. Wir bauen Schritt für Schritt einen vollständigen `BookStore`, der die Buchliste vom Server lädt **und** Bücher anlegen, ändern und löschen kann – inklusive Lade- und Fehleranzeige. So lässt sich der direkte Vergleich zum Global Store aus Teil 2 ziehen.

### Installation

Der SignalStore wird über ein eigenes Paket installiert:

```bash
ng add @ngrx/signals
```

Anders als beim Global Store gibt es hier **nichts in der `app.config.ts` zu registrieren** – kein `provideStore()`, kein `provideEffects()`. Ein SignalStore ist ein gewöhnlicher Service und wird dort bereitgestellt, wo wir ihn brauchen.

### Ein Store als Komposition von Features

Einen SignalStore erzeugen wir mit der Funktion `signalStore()`. Sie nimmt eine Reihe von *Features* entgegen und gibt einen injizierbaren Service zurück. Das grundlegendste Feature ist `withState()`: Es definiert den initialen Zustand. Für jeden State-Slice wird automatisch ein passendes Signal erzeugt.

Unser State umfasst die Buchliste, ein `loading`-Flag für den Ladeindikator und ein `error`-Feld, in dem wir Fehlermeldungen für die Oberfläche ablegen:

```ts
// books/book.store.ts
import { signalStore, withState } from '@ngrx/signals';
import { Book } from '../shared/book';

type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null
};

export const BookStore = signalStore(
  withState(initialState)
);
```

Allein dadurch besitzt eine Instanz von `BookStore` bereits drei Signale: `books: Signal<Book[]>`, `loading: Signal<boolean>` und `error: Signal<string | null>`. Verschachtelte Objekte werden übrigens zu einem `DeepSignal`, das zusätzlich für jede Eigenschaft ein eigenes Signal bereitstellt.

### Den Store bereitstellen: lokal oder global

Ein SignalStore ist standardmäßig **an keinen Injector gebunden**. Wir entscheiden bewusst, wo er lebt.

**Global** (eine geteilte Instanz für die ganze Anwendung) – über die Option `{ providedIn: 'root' }` direkt bei der Definition:

```ts
export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState)
);
```

**Lokal** (eine eigene Instanz pro Komponente, gebunden an deren Lebenszyklus) – über das `providers`-Array der Komponente:

```ts
@Component({
  // ...
  providers: [BookStore]
})
export class BookListComponent {
  private store = inject(BookStore);
}
```

Auch eine **Route** kann den Store bereitstellen – ideal für ein lazy geladenes Feature, dessen State mit der Route entsteht und verschwindet:

```ts
// books/books.routes.ts
import { Routes } from '@angular/router';
import { BookStore } from './book.store';

export const booksRoutes: Routes = [
  {
    path: '',
    providers: [BookStore], // eigener Store-Lebenszyklus für dieses Feature
    children: [
      // ... Routen des Features
    ]
  }
];
```

Diese Wahlfreiheit ist einer der größten Vorteile gegenüber dem Global Store: Zustand, der nur eine Komponente oder ein Feature betrifft, muss nicht global abgelegt werden. Für unser Beispiel verwenden wir einen global bereitgestellten Store (`{ providedIn: 'root' }`).

### Zustand lesen

Da jeder State-Slice ein Signal ist, lesen wir ihn direkt – im Code wie im Template. Eine `AsyncPipe` brauchen wir nicht mehr; wir rufen das Signal einfach als Funktion auf. Im Template zeigen wir Ladeindikator, Fehlermeldung und Buchliste an:

```html
<h1>Books</h1>

@if (store.loading()) {
  <div class="loader">Loading ...</div>
}

@if (store.error(); as error) {
  <div class="error">{{ error }}</div>
}

<ul class="book-list">
  @for (book of store.books(); track book.isbn) {
    <li>{{ book.title }}</li>
  }
</ul>
```

Der Vergleich zu Teil 2 ist aufschlussreich: Dort haben wir das Signal erst über `store.selectSignal(selectAllBooks)` aus dem globalen Store herausgelöst. Beim SignalStore *ist* der State bereits ein Signal – ein Zwischenschritt über Selektoren entfällt.

### Abgeleitete Werte: `withComputed`

Berechnete Werte ergänzen wir mit dem Feature `withComputed()`. Es bekommt die bereits definierten Signale hinein und gibt neue, abgeleitete Signale zurück – das Pendant zu den Selektoren des Global Store, nur ohne separate Datei und ohne `createSelector()`.

```ts
import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length)
  }))
);
```

Wie bei den memoisierten Selektoren in Teil 2 wird auch ein `computed`-Signal nur neu berechnet, wenn sich seine Eingaben tatsächlich ändern.

### Zustand ändern: `withMethods` und `patchState`

Verhalten fügen wir mit dem Feature `withMethods()` hinzu. Die Factory erhält die Store-Instanz (und kann über `inject()` Abhängigkeiten anfordern) und gibt ein Objekt mit Methoden zurück. Den Zustand aktualisieren wir innerhalb der Methoden mit der Funktion `patchState()` – immer **immutabel**, ganz wie in einem Reducer.

`patchState()` nimmt den Store gefolgt von einem **partiellen State-Objekt** oder einer **Updater-Funktion** entgegen. Die Updater-Funktion bekommt den aktuellen State und gibt die Änderung zurück – damit aktualisieren wir auch Arrays und verschachtelte Strukturen sauber unveränderlich:

```ts
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Book } from '../shared/book';

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    // partielles State-Objekt:
    clearError(): void {
      patchState(store, { error: null });
    },
    // Updater-Funktion: neuen State aus dem alten ableiten (immutabel!)
    addBookLocal(book: Book): void {
      patchState(store, state => ({ books: [...state.books, book] }));
    }
  }))
);
```

Hier liegt der zentrale Unterschied zum Global Store: Es gibt keine Action und keinen Reducer als Zwischenschicht – die Methode beschreibt die Zustandsänderung direkt.

Übrigens ist der State eines SignalStore standardmäßig **vor Änderungen von außen geschützt** (Option `protectedState`, Default `true`): `patchState()` greift dann nur innerhalb des Stores. Erst wenn wir den Store mit `{ protectedState: false }` definieren, sind Änderungen auch von außen möglich. Der geschützte Standard hält den Datenfluss kontrollierbar – ähnlich der read-only-Eigenschaft des Global-Store-States.

### Asynchrone Seiteneffekte mit `rxMethod`: Daten laden

Für das Laden der Bücher brauchen wir einen asynchronen Seiteneffekt – die Aufgabe, die im Global Store ein Effect übernommen hat. Einfache Abläufe lassen sich direkt mit einer `async`-Methode und einem Promise erledigen. Für reaktive Abläufe mit RxJS bietet das Interop-Plugin die Funktion `rxMethod()` aus `@ngrx/signals/rxjs-interop`. Sie nimmt eine Kette von RxJS-Operatoren entgegen und gibt eine reaktive Methode zurück.

Zum sicheren Verarbeiten der HTTP-Antwort nutzen wir den Operator `tapResponse` aus `@ngrx/operators`. Er ruft je nach Ausgang den `next`-, `error`- oder `finalize`-Callback auf – und ein Fehler im Service-Aufruf beendet dadurch nicht den reaktiven Strom der Methode:

```ts
import { inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { BookStoreService } from '../shared/book-store.service';

// innerhalb von signalStore(...):
withMethods((store, service = inject(BookStoreService)) => ({
  loadBooks: rxMethod<void>(
    pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() =>
        service.getAll().pipe(
          tapResponse({
            next: books => patchState(store, { books }),
            error: (err: { message: string }) =>
              patchState(store, { error: err.message }),
            finalize: () => patchState(store, { loading: false })
          })
        )
      )
    )
  )
}))
```

Die so erzeugte Methode rufen wir später einfach als `store.loadBooks()` auf. Wir haben hier `switchMap()` gewählt: Wird während eines laufenden Ladevorgangs erneut geladen, soll nur die letzte Anfrage zählen.

### Schreiben: Bücher anlegen, ändern und löschen

Jetzt zum Kern jeder echten Anwendung: Daten verändern. Wir definieren je eine Methode zum Anlegen, Ändern und Löschen. Jede löst einen HTTP-Request aus (über den `BookStoreService`, der `create()`, `update()` und `remove()` anbietet) und schreibt das Ergebnis anschließend immutabel in den State.

Ein wichtiger Unterschied zum Laden betrifft den Flattening-Operator: Beim Laden ist `switchMap()` richtig (eine neue Anfrage macht die alte überflüssig). Bei **schreibenden** Operationen wollen wir laufende Requests aber *nicht* abbrechen – sonst ginge womöglich ein Speichervorgang verloren. Hier ist `concatMap()` die sichere Wahl: Die Anfragen werden der Reihe nach abgearbeitet.

```ts
import { concatMap, pipe } from 'rxjs';

// innerhalb von withMethods((store, service = inject(BookStoreService)) => ({ ... })):

// Anlegen: an die Liste anhängen
addBook: rxMethod<Book>(
  pipe(
    concatMap(book =>
      service.create(book).pipe(
        tapResponse({
          next: created =>
            patchState(store, state => ({ books: [...state.books, created] })),
          error: (err: { message: string }) =>
            patchState(store, { error: err.message })
        })
      )
    )
  )
),

// Ändern: das passende Buch in der Liste ersetzen
updateBook: rxMethod<Book>(
  pipe(
    concatMap(book =>
      service.update(book).pipe(
        tapResponse({
          next: updated =>
            patchState(store, state => ({
              books: state.books.map(b => b.isbn === updated.isbn ? updated : b)
            })),
          error: (err: { message: string }) =>
            patchState(store, { error: err.message })
        })
      )
    )
  )
),

// Löschen: das Buch anhand seiner ISBN aus der Liste filtern
deleteBook: rxMethod<string>(
  pipe(
    concatMap(isbn =>
      service.remove(isbn).pipe(
        tapResponse({
          next: () =>
            patchState(store, state => ({
              books: state.books.filter(b => b.isbn !== isbn)
            })),
          error: (err: { message: string }) =>
            patchState(store, { error: err.message })
        })
      )
    )
  )
)
```

An diesen drei Methoden sieht man das Muster für jede Mutation: HTTP-Request auslösen, bei Erfolg den State **immutabel** anpassen (anhängen mit Spread, ersetzen mit `map()`, entfernen mit `filter()`), bei Fehler die Meldung in `error` schreiben. Genau diese immutable Logik ist auch das Herz eines Reducers im Global Store – nur dass wir sie hier direkt in der Methode notieren, ohne Action und Reducer dazwischen.

### Das vollständige Beispiel

Setzen wir alle Bausteine zusammen, ergibt sich der komplette, kopierbare `BookStore`. Über `withHooks()` lädt er seine Daten beim ersten Verwenden gleich selbst (`onInit`), sodass die Komponente nur noch liest und Aktionen auslöst:

```ts
// books/book.store.ts
import { computed, inject } from '@angular/core';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Book } from '../shared/book';
import { BookStoreService } from '../shared/book-store.service';

type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null
};

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length)
  })),
  withMethods((store, service = inject(BookStoreService)) => ({
    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.getAll().pipe(
            tapResponse({
              next: books => patchState(store, { books }),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message }),
              finalize: () => patchState(store, { loading: false })
            })
          )
        )
      )
    ),
    addBook: rxMethod<Book>(
      pipe(
        concatMap(book =>
          service.create(book).pipe(
            tapResponse({
              next: created =>
                patchState(store, state => ({ books: [...state.books, created] })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    ),
    updateBook: rxMethod<Book>(
      pipe(
        concatMap(book =>
          service.update(book).pipe(
            tapResponse({
              next: updated =>
                patchState(store, state => ({
                  books: state.books.map(b => b.isbn === updated.isbn ? updated : b)
                })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    ),
    deleteBook: rxMethod<string>(
      pipe(
        concatMap(isbn =>
          service.remove(isbn).pipe(
            tapResponse({
              next: () =>
                patchState(store, state => ({
                  books: state.books.filter(b => b.isbn !== isbn)
                })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    )
  })),
  withHooks({
    onInit(store) {
      store.loadBooks();
    }
  })
);
```

Das ist der gesamte State-Management-Code für ein vollständiges CRUD-Feature – eine Datei, ohne Actions, Reducer, Selektoren-Dateien oder Effects-Klassen.

### Die Komponente: lesen und Aktionen auslösen

Die Komponente injiziert den Store, liest die Signale im Template und ruft für Nutzeraktionen die Store-Methoden auf. Da der Store sich über `onInit` selbst lädt, braucht die Komponente keinen Lade-Code mehr:

```ts
// books/book-list/book-list.component.ts
import { Component, inject } from '@angular/core';
import { BookStore } from '../book.store';
import { Book } from '../shared/book';

@Component({
  selector: 'bm-book-list',
  templateUrl: './book-list.component.html'
})
export class BookListComponent {
  protected store = inject(BookStore);

  deleteBook(isbn: string): void {
    this.store.deleteBook(isbn);
  }

  createBook(book: Book): void {
    this.store.addBook(book);
  }
}
```

Im Template lesen wir die Signale und lösen über Events die Methoden aus – ein Löschen-Button pro Buch, eine Fehlermeldung aus dem `error`-Signal:

```html
<!-- books/book-list/book-list.component.html -->
<h1>Books ({{ store.booksCount() }})</h1>

@if (store.loading()) {
  <div class="loader">Loading ...</div>
}

@if (store.error(); as error) {
  <div class="error">
    {{ error }}
    <button type="button" (click)="store.clearError()">OK</button>
  </div>
}

<ul class="book-list">
  @for (book of store.books(); track book.isbn) {
    <li>
      {{ book.title }}
      <button type="button" (click)="deleteBook(book.isbn)">Löschen</button>
    </li>
  }
</ul>
```

Ein Formular zum Anlegen würde im `(ngSubmit)` einfach `createBook(neuesBuch)` aufrufen. Weil der Store global (`providedIn: 'root'`) bereitsteht, teilen sich alle Komponenten dieselbe Instanz: Eine Detail- oder Formularkomponente, die `store.addBook()` aufruft, verändert denselben State, den die Liste anzeigt – die Oberfläche aktualisiert sich dank der Signale automatisch.

### Weniger Boilerplate: Entitäten mit `withEntities`

Die immutablen Array-Operationen aus unseren CRUD-Methoden (`[...state.books, created]`, `map(...)`, `filter(...)`) wiederholen sich in jeder Anwendung. Genau diese Routine nimmt uns das Plugin `@ngrx/signals/entities` mit dem Feature `withEntities()` ab – das Gegenstück zu `@ngrx/entity` aus Teil 2. Es legt die Signale `entityMap`, `ids` und `entities` an und bringt fertige Updater mit: `addEntity`, `updateEntity`, `removeEntity`, `setAllEntities` und weitere.

Standardmäßig erwartet `withEntities` ein Property `id`. Da ein Buch im BookMonkey über seine `isbn` identifiziert wird, geben wir – wie schon bei `@ngrx/entity` – einen eigenen ID-Selektor an. Bei `add*`-, `set*`- und `update*`-Updatern übergeben wir ihn als zweites Argument; die `remove*`-Updater ermitteln die ID automatisch:

```ts
// books/book.store.ts (Entity-Variante)
import { inject } from '@angular/core';
import { concatMap, pipe, switchMap } from 'rxjs';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  SelectEntityId,
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities
} from '@ngrx/signals/entities';

import { Book } from '../shared/book';
import { BookStoreService } from '../shared/book-store.service';

const selectId: SelectEntityId<Book> = book => book.isbn;

export const BookStore = signalStore(
  { providedIn: 'root' },
  withEntities<Book>(),
  withMethods((store, service = inject(BookStoreService)) => ({
    loadBooks: rxMethod<void>(
      switchMap(() =>
        service.getAll().pipe(
          tapResponse({
            next: books => patchState(store, setAllEntities(books, { selectId })),
            error: console.error
          })
        )
      )
    ),
    addBook: rxMethod<Book>(
      concatMap(book =>
        service.create(book).pipe(
          tapResponse({
            next: created => patchState(store, addEntity(created, { selectId })),
            error: console.error
          })
        )
      )
    ),
    updateBook: rxMethod<Book>(
      concatMap(book =>
        service.update(book).pipe(
          tapResponse({
            next: updated =>
              patchState(store, updateEntity({ id: updated.isbn, changes: updated }, { selectId })),
            error: console.error
          })
        )
      )
    ),
    deleteBook: rxMethod<string>(
      concatMap(isbn =>
        service.remove(isbn).pipe(
          tapResponse({
            next: () => patchState(store, removeEntity(isbn)),
            error: console.error
          })
        )
      )
    )
  }))
);
```

Die Entity-Updater automatisieren also exakt die immutablen Operationen, die wir zuvor von Hand geschrieben haben. Die Buchliste lesen wir nun über das mitgelieferte Signal `store.entities()`; die Pflege von `entityMap` und `ids` übernimmt das Plugin. Wollen wir zusätzlich eigene Felder wie `loading` oder `error` führen, kombinieren wir `withEntities()` einfach mit einem `withState(...)` für diese Felder.

### Wiederverwendbare Bausteine: `signalStoreFeature`

Ein besonders elegantes Konzept sind eigene Features. Mit `signalStoreFeature()` bündeln wir State, computed Signals und Methoden zu einem wiederverwendbaren Baustein – etwa einem Lade-Status, den viele Stores brauchen:

```ts
import { computed } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: 'idle' | 'pending' | 'fulfilled' }>({
      requestStatus: 'idle'
    }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending')
    }))
  );
}
```

Dieses Feature lässt sich anschließend in beliebig vielen Stores einsetzen: `signalStore(withEntities<Book>(), withRequestStatus())`. Eine derart bequeme, geschlossene Wiederverwendung quer über Stores hinweg bietet der Global Store nicht.

### Testing

Da ein SignalStore ein gewöhnlicher Service ist, testen wir ihn auch wie einen Service: Instanz beziehen, Methoden aufrufen, Signale auslesen. Ein vollständiges Store-Setup wie beim Global Store ist nicht nötig. Den HTTP-Service ersetzen wir wie gewohnt per `{ provide: …, useValue: … }`:

```ts
// books/book.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BookStore } from './book.store';
import { BookStoreService } from '../shared/book-store.service';
import { book } from './test-helper';

describe('BookStore', () => {
  it('lädt Bücher und zählt sie', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BookStoreService,
          useValue: { getAll: () => of([book(1), book(2), book(3)]) }
        }
      ]
    });

    const store = TestBed.inject(BookStore);
    store.loadBooks();

    expect(store.booksCount()).toBe(3);
  });
});
```

> **Hinweis:** Den geschützten State können wir in Tests mit dem Helfer `unprotected()` aus `@ngrx/signals/testing` gezielt setzen, falls einmal kein passender öffentlicher Setter zur Verfügung steht.

### Was ist mit den Redux DevTools?

Ein ehrlicher Punkt zum Abschluss der Vorstellung: Für den SignalStore gibt es **keine offizielle Anbindung an die Redux DevTools** und damit auch kein eingebautes Time Travel Debugging wie in Teil 2. Die Angular DevTools sollen Signals künftig unterstützen; bis dahin bietet das Community-Paket `@angular-architects/ngrx-toolkit` ein Feature `withDevtools()` an.

Wer den klaren, ereignisbasierten Datenfluss des Redux-Patterns auch mit dem SignalStore möchte, kann das **Events-Plugin** nutzen (`@ngrx/signals/events`, seit NgRx 19.2). Es ergänzt den SignalStore um Events, Reducer und Effects und stellt so einen unidirektionalen Fluss im Stil von Redux her – die beiden Welten lassen sich also annähern.

## SignalStore und Global Store im Vergleich

Beide Bausteine stammen aus dem NgRx-Projekt und lösen dieselbe Aufgabe, setzen aber unterschiedliche Schwerpunkte:

| Aspekt | Global Store (`@ngrx/store`) | SignalStore (`@ngrx/signals`) |
| --- | --- | --- |
| Grundidee | zentrales Redux-Pattern | deklarativ zusammengesetzter Service |
| Anzahl Stores | ein globaler State-Baum | viele kleine Stores |
| Geltungsbereich | immer global | lokal (komponenten-/routengebunden) **oder** global |
| Lesen | Selektoren + `selectSignal()` | State *ist* direkt ein Signal: `store.books()` |
| Schreiben | Action `dispatch()` → Reducer | Methode aufrufen → `patchState()` |
| Indirektion | hoch (Action/Reducer/Effect getrennt) | gering (Methode ändert State direkt) |
| Seiteneffekte | Effects (`@ngrx/effects`) | Methoden (`async`) oder `rxMethod` |
| Boilerplate | viel (Actions, Reducer, Selektoren, Effects) | wenig (`with…`-Features in einer Datei) |
| Entitäten | `@ngrx/entity` | `withEntities` (`@ngrx/signals/entities`) |
| DevTools / Time Travel | ja (Redux DevTools) | nicht offiziell (Angular DevTools / Community) |
| Erzwungener unidirektionaler Fluss | ja | optional (Events-Plugin) |

Der entscheidende Gegensatz: Der Global Store erkauft sich mit *mehr Code* *mehr Struktur und Nachvollziehbarkeit*. Der SignalStore bekommt für *weniger Struktur* *deutlich weniger Code und mehr Flexibilität* – insbesondere die Möglichkeit, Zustand lokal zu halten.

## Fazit: Wann was?

SignalStore und Global Store sind keine Konkurrenten, die einander ablösen – sie decken unterschiedliche Bedürfnisse ab.

**Der SignalStore ist heute für die meisten Fälle die naheliegende erste Wahl.** Er ist signal-nativ, kommt mit wenig Code aus, lässt sich lokal wie global einsetzen und ist leicht zu testen. Für komponenten- oder feature-lokalen Zustand, für überschaubare Anwendungen und überall dort, wo der volle Redux-Apparat zu schwer wäre, ist er ideal.

**Der Global Store lohnt sich, wenn die Stärken des Redux-Patterns wirklich gebraucht werden:** ein großer, von vielen Stellen geteilter und komplex verwobener Anwendungszustand, ein strikt nachvollziehbarer, auditierbarer Datenfluss und der Komfort der Redux DevTools mit Time Travel. In großen Anwendungen und Teams kann die strenge, einheitliche Struktur ein echter Vorteil sein – genau die Investition, die wir in Teil 2 beschrieben haben.

Eine gute Faustregel: **Wir beginnen mit dem SignalStore und greifen zum Global Store, wenn die Anwendung dessen Struktur und Werkzeuge tatsächlich erfordert.** Beide Ansätze lassen sich in einer Anwendung auch kombinieren – und mit dem Events-Plugin nähert sich der SignalStore bei Bedarf sogar dem Redux-Stil an.

Damit schließen wir unsere dreiteilige Reise durch das State Management mit NgRx ab: vom selbst hergeleiteten Modell in [Teil 1](/material/ngrx-intro) über den klassischen [Global Store](/material/ngrx-global-store) bis zum modernen SignalStore. Welcher Weg der richtige ist, entscheidet am Ende die konkrete Anwendung – und mit beiden Werkzeugen im Gepäck treffen wir diese Entscheidung fundiert.

---

**Zurück zu Teil 2:** [Global Store mit NgRx](/material/ngrx-global-store)
