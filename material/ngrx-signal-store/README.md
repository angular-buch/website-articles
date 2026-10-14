---
title: "State Management mit NgRx – Teil 3: SignalStore"
published: 2026-10-14
lastModified: 2026-10-14
sortKey: 52
---

**Zusatzmaterial zum Buch *Angular: Das große Praxisbuch (1. Auflage)* von Ferdinand Malcher, Danny Koppenhagen und Johannes Hoppe.**

Dieser Artikel ist **Teil 3** einer dreiteiligen Serie zum Thema State Management mit NgRx.

- Teil 1: Wie kommen wir zu zentralem State Management? → [zum Artikel](/material/ngrx-intro)
- Teil 2: Global Store mit NgRx → [zum Artikel](/material/ngrx-global-store)
- Teil 3: SignalStore (dieser Artikel)

[[toc]]

In [Teil 2](/material/ngrx-global-store) haben wir den **Global Store** kennengelernt: das klassische Redux-Pattern mit Actions, Reducers, Selektoren und Effects. Wir setzen für diesen Teil voraus, dass der Global Store bekannt ist. Wir bauen darauf auf und vergleichen beide Ansätze.

Der Global Store erfordert für viele Anwendungsfälle viel Code: Schon das Laden einer einfachen Buchliste verteilt sich über Actions, einen Reducer, Selektoren und einen Effect. Hier setzt der **SignalStore** aus dem Paket `@ngrx/signals` an. Er ist eine Alternative auf Basis von Signals, die mit deutlich weniger Code auskommt.

## Der architektonische Unterschied zum Global Store

Bevor wir Code schreiben, lohnt sich der Blick auf die grundlegend andere Architektur. Global Store und SignalStore lösen dasselbe Problem, die zentrale Zustandsverwaltung, auf gegensätzliche Weise.

**Der Global Store ist ein zentrales, indirektes System.** Es gibt genau einen globalen State-Baum. Eine Komponente *beschreibt* mit einer Action nur, *was passiert ist* („Load Books“); ein Reducer entscheidet an anderer Stelle, *wie* sich der State daraufhin ändert; ein Effect kümmert sich wiederum getrennt um Seiteneffekte. Lesen und Schreiben sind strikt entkoppelt, der Datenfluss ist streng unidirektional. Diese Indirektion macht jeden Schritt nachvollziehbar und in den Redux DevTools sichtbar. Sie ist aber auch der Grund für die vielen Bausteine.

**Der SignalStore ist ein zusammengesetzter Service mit direktem Zugriff.** Ein Store ist hier kein globaler Baum, sondern ein injizierbarer Service, den wir *deklarativ aus Bausteinen zusammensetzen* (`withState`, `withComputed`, `withMethods`, …). Den Zustand lesen wir direkt als **Signal** (`store.books()`), und wir ändern ihn, indem wir eine selbst definierte **Methode** aufrufen, die den State über `patchState()` aktualisiert. Es gibt keine verpflichtende Trennung in Action und Reducer mehr: Das „Was passiert“ und das „Wie ändert sich der State“ liegen zusammen in einer Methode. Das reduziert den Code erheblich; allerdings verlieren wir die Nachvollziehbarkeit, die die Action-Historie im Global Store bietet.

Ein zweiter, ebenso wichtiger Unterschied ist der **Geltungsbereich**:

- Der **Global Store** ist immer **global**. Jeder Feature-State ist Teil des einen zentralen State-Objekts.
- Ein **SignalStore** kann **global *oder* lokal** sein. Wir können ihn mit `{ providedIn: 'root' }` global bereitstellen oder ihn an eine Komponente binden, sodass er mit der Komponente entsteht und wieder zerstört wird. Damit eignet sich der SignalStore auch für komponenten- oder feature-lokalen Zustand. Für lokalen Zustand ist er damit auch eine Alternative zu `@ngrx/component-store`.

## Der SignalStore im Detail

Schauen wir uns die Bausteine konkret an. Als durchgehendes Beispiel verwenden wir wieder den BookManager. Wir bauen Schritt für Schritt einen vollständigen Store, der die Buchliste vom Server lädt **und** Bücher anlegen und löschen kann, inklusive Lade- und Fehleranzeige. So lässt sich der direkte Vergleich zum Global Store aus Teil 2 ziehen. Den vollständigen Code finden wir in der [Beispiel-App auf GitHub](https://github.com/angular-buch/website-articles/tree/main/material/ngrx-signal-store/demo).

Ein Hinweis zur Benennung: Im BookManager kümmert sich wie schon in Teil 2 ein Datenservice um die HTTP-Aufrufe gegen die API. Dieser Service heißt `BookStore` und liegt in `shared/book-store.ts`. Den SignalStore, den wir gleich aufbauen, nennen wir deshalb zur klaren Abgrenzung `BookSignalStore` (Datei `book-signal-store.ts`). Der `BookSignalStore` verwaltet den Zustand und ruft für den Datenzugriff den `BookStore`-Service auf.

### Installation

Der SignalStore wird über ein eigenes Paket installiert. Für die Verarbeitung der HTTP-Antworten nutzen wir außerdem den Operator `tapResponse` aus dem Paket `@ngrx/operators`, das wir zusätzlich installieren:

```bash
ng add @ngrx/signals
npm install @ngrx/operators
```

Anders als beim Global Store gibt es für den SignalStore nichts in der `app.config.ts` zu registrieren: `provideStore()` und `provideEffects()` entfallen. Ein SignalStore ist ein gewöhnlicher Service und wird dort bereitgestellt, wo wir ihn brauchen. Auch der `HttpClient` braucht keine Registrierung, denn Angular stellt ihn automatisch bereit. Die Funktion `provideHttpClient()` benötigen wir nur, wenn wir die HTTP-Integration konfigurieren möchten, etwa mit Interceptors.

### Ein Store als Komposition von Features

Einen SignalStore erzeugen wir mit der Funktion `signalStore()`. Sie nimmt eine Reihe von *Features* entgegen und gibt einen injizierbaren Service zurück. Das grundlegendste Feature ist `withState()`: Es definiert den initialen Zustand. Für jeden State-Slice wird automatisch ein passendes Signal erzeugt.

Unser State umfasst die Buchliste, ein `loading`-Flag für den Ladeindikator und ein `error`-Feld, in dem wir Fehlermeldungen für die Oberfläche ablegen:

```ts
// books/book-signal-store.ts
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

export const BookSignalStore = signalStore(
  withState(initialState)
);
```

Allein dadurch besitzt eine Instanz von `BookSignalStore` bereits drei Signale: `books: Signal<Book[]>`, `loading: Signal<boolean>` und `error: Signal<string | null>`. Verschachtelte Objekte werden übrigens zu einem `DeepSignal`, das zusätzlich für jede Eigenschaft ein eigenes Signal bereitstellt.

### Den Store bereitstellen: lokal oder global

Ein SignalStore ist standardmäßig an keinen Injector gebunden; wir legen selbst fest, wo er bereitgestellt wird.

**Global** (eine geteilte Instanz für die ganze Anwendung): über die Option `{ providedIn: 'root' }` direkt bei der Definition:

```ts
export const BookSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState)
);
```

**Lokal** (eine eigene Instanz pro Komponente, gebunden an deren Lebenszyklus): über das `providers`-Array der Komponente:

```ts
@Component({
  // ...
  providers: [BookSignalStore]
})
export class BooksOverview {
  protected store = inject(BookSignalStore);
}
```

Auch eine **Route** kann den Store bereitstellen. Das eignet sich für ein lazy geladenes Feature, dessen State mit der Route entsteht und verschwindet:

```ts
// books/books.routes.ts
import { Routes } from '@angular/router';
import { BookSignalStore } from './book-signal-store';

export const booksRoutes: Routes = [
  {
    path: '',
    providers: [BookSignalStore], // eigener Store-Lebenszyklus für dieses Feature
    children: [
      // ... Routen des Features
    ]
  }
];
```

Das ist ein Vorteil gegenüber dem Global Store: Zustand, der nur eine Komponente oder ein Feature betrifft, muss nicht global abgelegt werden. Für unser Beispiel stellen wir den Store trotzdem global bereit (`{ providedIn: 'root' }`), weil sich mehrere Komponenten denselben Buchbestand teilen: Jede Komponente, die den Store injiziert, liest und verändert dieselben Daten.

### Zustand lesen

Da jeder State-Slice ein Signal ist, lesen wir ihn im Code wie im Template, indem wir das Signal als Funktion aufrufen. Im Template zeigen wir Ladeindikator, Fehlermeldung und Buchliste an:

```html
<h2>Bücher</h2>

@if (store.loading()) {
  <p class="loader">Lädt …</p>
}

@if (store.error(); as error) {
  <p class="error">{{ error }}</p>
}

<ul class="book-list">
  @for (book of store.books(); track book.isbn) {
    <li>{{ book.title }}</li>
  }
</ul>
```

In Teil 2 haben wir das Signal erst über `store.selectSignal(selectAllBooks)` aus dem globalen Store herausgelöst. Beim SignalStore ist der State bereits ein Signal, der Zwischenschritt über Selektoren entfällt.

### Abgeleitete Werte: `withComputed`

Berechnete Werte ergänzen wir mit dem Feature `withComputed()`. Es bekommt die bereits definierten Signale hinein und gibt neue, abgeleitete Signale zurück. Das ist das Pendant zu den Selektoren des Global Store, nur ohne separate Datei und ohne `createSelector()`.

```ts
import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export const BookSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length)
  }))
);
```

Wie bei den memoisierten Selektoren in Teil 2 wird auch ein `computed`-Signal nur neu berechnet, wenn sich seine Eingaben ändern.

### Zustand ändern: `withMethods` und `patchState`

Verhalten fügen wir mit dem Feature `withMethods()` hinzu. Wir übergeben ihm eine Funktion, die die Store-Instanz erhält (und über `inject()` Abhängigkeiten anfordern kann) und ein Objekt mit Methoden zurückgibt. Den Zustand aktualisieren wir innerhalb der Methoden mit der Funktion `patchState()`, immer immutabel wie in einem Reducer.

`patchState()` nimmt den Store gefolgt von einem **partiellen State-Objekt** oder einer **Updater-Funktion** entgegen. Die Updater-Funktion bekommt den aktuellen State und gibt die Änderung zurück. Damit aktualisieren wir auch Arrays und verschachtelte Strukturen unveränderlich:

```ts
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Book } from '../shared/book';

export const BookSignalStore = signalStore(
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

Eine Action und einen Reducer brauchen wir dafür nicht: Die Methode beschreibt die Zustandsänderung selbst.

Übrigens ist der State eines SignalStore standardmäßig **vor Änderungen von außen geschützt** (Option `protectedState`, Default `true`): `patchState()` greift dann nur innerhalb des Stores. Erst wenn wir den Store mit `{ protectedState: false }` definieren, sind Änderungen auch von außen möglich. Der geschützte Standard hält den Datenfluss kontrollierbar, ähnlich der read-only-Eigenschaft des Global-Store-States.

### Asynchrone Seiteneffekte mit `rxMethod`: Daten laden

Für das Laden der Bücher brauchen wir einen asynchronen Seiteneffekt, also die Aufgabe, die im Global Store ein Effect übernimmt. Den eigentlichen HTTP-Aufruf übernimmt der `BookStore`-Service: Er kapselt wie schon in Teil 2 die Aufrufe mit dem `HttpClient` gegen die BookManager-API (`https://api1.angular-buch.com`) und bietet die Methoden `getAll()`, `create()` und `remove()` an, die jeweils ein `Observable` zurückgeben. Wir fordern ihn in der Funktion, die wir `withMethods()` übergeben, per `inject()` an.

Eine Store-Methode darf eine gewöhnliche Methode sein; einfache Abläufe ließen sich daher auch mit einer `async`-Methode und einem Promise erledigen, die das Ergebnis am Ende per `patchState()` in den State schreibt. Wir zeigen hier aber den reaktiven Weg mit RxJS, weil er sich direkt mit den `Observable`s des `BookStore`-Service kombinieren lässt: Dafür bietet das Interop-Plugin die Funktion `rxMethod()` aus `@ngrx/signals/rxjs-interop`. Sie nimmt eine Kette von RxJS-Operatoren entgegen und gibt eine reaktive Methode zurück. Diese Methode können wir mit einem einfachen Wert aufrufen oder mit einem Signal bzw. Observable; im zweiten Fall läuft die Kette bei jedem neuen Wert erneut.

Zum sicheren Verarbeiten der HTTP-Antwort nutzen wir den Operator `tapResponse` aus `@ngrx/operators`. Er ruft je nach Ausgang den `next`- oder den `error`-Callback auf. Ein Fehler im Service-Aufruf beendet dadurch nicht den reaktiven Strom der Methode:

```ts
import { inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { BookStore } from '../shared/book-store';
import { toMessage } from '../shared/error-message';

// innerhalb von signalStore(...):
withMethods((store, bookStore = inject(BookStore)) => ({
  loadBooks: rxMethod<void>(
    pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() =>
        bookStore.getAll().pipe(
          tapResponse({
            next: books => patchState(store, { books, loading: false }),
            error: (err: unknown) =>
              patchState(store, { error: toMessage(err), loading: false })
          })
        )
      )
    )
  )
}))
```

Die so erzeugte Methode rufen wir später als `store.loadBooks()` auf. Wir haben hier `switchMap()` gewählt: Wird während eines laufenden Ladevorgangs erneut geladen, soll nur die letzte Anfrage zählen.

Das Beenden des Ladeindikators notieren wir bewusst sowohl in `next` als auch in `error`, nicht im ebenfalls verfügbaren `finalize`-Callback von `tapResponse`. Der Grund: `finalize` feuert auch dann, wenn `switchMap()` eine laufende Anfrage abbricht, weil eine neue gestartet wurde. Der Indikator würde in diesem Moment verschwinden, obwohl die neue Anfrage noch läuft.

Den Fehler, den `tapResponse` als `unknown` liefert, wandeln wir wie in Teil 2 mit der Hilfsfunktion `toMessage()` in eine lesbare Meldung um. Sie übernimmt die Fehlermeldung der API aus der `HttpErrorResponse` (etwa bei HTTP 409 für eine doppelte ISBN) und prüft dabei zur Laufzeit, ob es sich um einen String handelt:

```ts
// shared/error-message.ts
import { HttpErrorResponse } from '@angular/common/http';

export function toMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const apiError = (error.error as { error?: unknown } | null)?.error;
    return typeof apiError === 'string' && apiError ? apiError : error.message;
  }
  return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
}
```

### Schreiben: Bücher anlegen und löschen

Als Nächstes wollen wir Daten verändern. Wir definieren je eine Methode zum Anlegen und zum Löschen. Jede löst einen HTTP-Request über den `BookStore`-Service aus (dessen `create()` bzw. `remove()`) und schreibt das Ergebnis anschließend immutabel in den State.

Für schreibende Operationen nutzen wir wie in Teil 2 den Operator `concatMap()`: Die Anfragen werden der Reihe nach abgearbeitet, und kein laufender Speichervorgang wird abgebrochen.

```ts
import { concatMap, pipe, tap } from 'rxjs';

// innerhalb von withMethods((store, bookStore = inject(BookStore)) => ({ ... })):

// Anlegen: an die Liste anhängen
addBook: rxMethod<Book>(
  pipe(
    tap(() => patchState(store, { error: null })),
    concatMap(book =>
      bookStore.create(book).pipe(
        tapResponse({
          next: created =>
            patchState(store, state => ({ books: [...state.books, created] })),
          error: (err: unknown) => patchState(store, { error: toMessage(err) })
        })
      )
    )
  )
),

// Löschen: das Buch anhand seiner ISBN aus der Liste filtern
deleteBook: rxMethod<string>(
  pipe(
    tap(() => patchState(store, { error: null })),
    concatMap(isbn =>
      bookStore.remove(isbn).pipe(
        tapResponse({
          next: () =>
            patchState(store, state => ({
              books: state.books.filter(b => b.isbn !== isbn)
            })),
          error: (err: unknown) => patchState(store, { error: toMessage(err) })
        })
      )
    )
  )
)
```

An diesen beiden Methoden sieht man das Muster für jede Mutation: zu Beginn eine alte Fehlermeldung zurücksetzen, den HTTP-Request auslösen, bei Erfolg den State immutabel anpassen (anhängen mit Spread, entfernen mit `filter()`) und bei Fehler die Meldung in `error` schreiben. Dieselbe immutable Logik steckt im Global Store in den Reducern; hier steht sie direkt in der Methode.

### Reiner Client-State: Favoriten ohne `rxMethod`

Bislang ging es um Zustand, der mit dem Server abgeglichen wird. Anwendungen haben aber auch Zustand, der nur im Client lebt und nie zum Server wandert. Im BookManager ist das die Favoriten-Liste: Wer ein Buch mag, markiert es als Favorit. Das ist ein reines UI-Feature ohne HTTP-Aufruf.

Synchroner Client-State braucht keinen Seiteneffekt und damit auch kein `rxMethod`. Wir ergänzen den State um einen Slice `likedBooks: Book[]`, leiten mit `withComputed` die Anzahl ab und ändern die Liste in gewöhnlichen Methoden direkt per `patchState()`; RxJS wird hier nicht benötigt. Das Anlegen dedupliziert dabei anhand der ISBN, damit ein Buch nicht doppelt in den Favoriten landet:

```ts
// im State:
type BookState = {
  // ... books, loading, error
  likedBooks: Book[];
};

// in withComputed (zusätzlich zu booksCount):
likedCount: computed(() => likedBooks().length),

// in withMethods – reiner Client-State, dedupliziert, ganz ohne Seiteneffekt:
likeBook(book: Book): void {
  if (!store.likedBooks().some(b => b.isbn === book.isbn)) {
    patchState(store, state => ({ likedBooks: [...state.likedBooks, book] }));
  }
},
clearLikedBooks(): void {
  patchState(store, { likedBooks: [] });
}
```

Wird ein Buch gelöscht, soll es auch aus den Favoriten verschwinden, sonst bleibt dort ein Eintrag zurück, den es nicht mehr gibt. Dazu filtern wir in `deleteBook` zusätzlich die `likedBooks` (zu sehen im vollständigen Beispiel unten).

Wie in Teil 2 leben die Favoriten nur im Speicher und sind nach einem Neuladen der Seite verloren.

### Das vollständige Beispiel

Setzen wir alle Bausteine zusammen, ergibt sich der vollständige `BookSignalStore`. Über `withHooks()` lädt er seine Daten beim ersten Verwenden gleich selbst (`onInit`), sodass die Komponente nur noch liest und Aktionen auslöst:

```ts
// books/book-signal-store.ts
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
import { BookStore } from '../shared/book-store';
import { toMessage } from '../shared/error-message';

type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
  likedBooks: Book[];
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null,
  likedBooks: []
};

export const BookSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books, likedBooks }) => ({
    booksCount: computed(() => books().length),
    likedCount: computed(() => likedBooks().length)
  })),
  withMethods((store, bookStore = inject(BookStore)) => ({
    clearError(): void {
      patchState(store, { error: null });
    },

    // Favoriten – reiner Client-State, dedupliziert, ganz ohne Seiteneffekt.
    likeBook(book: Book): void {
      if (!store.likedBooks().some(b => b.isbn === book.isbn)) {
        patchState(store, state => ({ likedBooks: [...state.likedBooks, book] }));
      }
    },
    clearLikedBooks(): void {
      patchState(store, { likedBooks: [] });
    },

    // Lesen: switchMap – eine neue Anfrage macht die alte überflüssig.
    // loading beenden wir bewusst in next/error (nicht in finalize):
    // finalize feuert auch beim Abbruch durch switchMap und würde den
    // Ladeindikator zurücksetzen, obwohl die neue Anfrage noch läuft.
    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          bookStore.getAll().pipe(
            tapResponse({
              next: books => patchState(store, { books, loading: false }),
              error: (err: unknown) =>
                patchState(store, { error: toMessage(err), loading: false })
            })
          )
        )
      )
    ),

    // Schreiben: concatMap – laufende Requests werden nicht abgebrochen.
    addBook: rxMethod<Book>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap(book =>
          bookStore.create(book).pipe(
            tapResponse({
              next: created =>
                patchState(store, state => ({ books: [...state.books, created] })),
              error: (err: unknown) => patchState(store, { error: toMessage(err) })
            })
          )
        )
      )
    ),
    deleteBook: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap(isbn =>
          bookStore.remove(isbn).pipe(
            tapResponse({
              next: () =>
                patchState(store, state => ({
                  books: state.books.filter(b => b.isbn !== isbn),
                  // Auch aus den Favoriten entfernen, sonst bleibt dort ein
                  // gelöschtes Buch zurück.
                  likedBooks: state.likedBooks.filter(b => b.isbn !== isbn)
                })),
              error: (err: unknown) => patchState(store, { error: toMessage(err) })
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

Der gesamte State-Management-Code für das Feature liegt damit in einer einzigen Datei. Sie umfasst das Laden, Anlegen und Löschen der Bücher sowie die Favoriten als reinen Client-State.

### Die Komponenten: lesen und Aktionen auslösen

Für die Oberfläche teilen wir die Verantwortung wie üblich in eine **smarte** und eine **präsentationale** Komponente auf. Die smarte `BooksOverview` injiziert den Store. Da der Store sich über `onInit` selbst lädt und seine Methoden direkt im Template aufgerufen werden können, bleibt nur das Anlege-Formular als eigene Methode übrig. Weil ein `Book` mehrere Pflichtfelder hat (`authors`, `description`, `imageUrl`, `createdAt`), nutzen wir wie in Teil 2 eine Factory `newBook()` neben dem Modell (`shared/book.ts`), die sinnvolle Defaults ergänzt, damit die API den POST akzeptiert:

```ts
// books/books-overview/books-overview.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { newBook } from '../../shared/book';
import { BookSignalStore } from '../book-signal-store';
import { BookCard } from '../book-card/book-card';

@Component({
  selector: 'app-books-overview',
  imports: [BookCard],
  templateUrl: './books-overview.html',
  styleUrl: './books-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksOverview {
  protected store = inject(BookSignalStore);

  addBook(isbn: HTMLInputElement, title: HTMLInputElement): void {
    if (!isbn.value || !title.value) {
      return;
    }
    this.store.addBook(newBook(isbn.value, title.value));
    isbn.value = '';
    title.value = '';
  }
}
```

Im Template lesen wir die Signale und lösen über Events die Methoden aus. Es gibt zwei Sektionen: oben die Favoriten (mit `likedCount` und einem Button zum Leeren), darunter die Bücherliste mit Ladeindikator, Fehlermeldung, einem kleinen Anlege-Formular und je einer Karte pro Buch:

```html
<!-- books/books-overview/books-overview.html -->
<section class="favorites">
  <h2>Favoriten ({{ store.likedCount() }})</h2>
  <button type="button" (click)="store.clearLikedBooks()">Leeren</button>
  <ul>
    @for (book of store.likedBooks(); track book.isbn) {
      <li>{{ book.title }}</li>
    } @empty {
      <li>Noch keine Favoriten.</li>
    }
  </ul>
</section>

<section class="books">
  <h2>Bücher ({{ store.booksCount() }})</h2>

  @if (store.loading()) {
    <p class="loader">Lädt …</p>
  }

  @if (store.error(); as error) {
    <p class="error">
      {{ error }}
      <button type="button" (click)="store.clearError()">OK</button>
    </p>
  }

  <div class="add-form">
    <input #isbnEl aria-label="ISBN" placeholder="ISBN" />
    <input #titleEl aria-label="Titel" placeholder="Titel" />
    <button type="button" (click)="addBook(isbnEl, titleEl)">Anlegen</button>
  </div>

  <div class="book-grid">
    @for (book of store.books(); track book.isbn) {
      <app-book-card [book]="book" (like)="store.likeBook($event)" (remove)="store.deleteBook($event)" />
    }
  </div>
</section>
```

Die Eingabefelder reichen wir bewusst ohne `FormsModule` als lokale Template-Referenzen (`#isbnEl`) direkt an die Methode weiter, die nach dem Anlegen die Felder leert; so bleibt der Fokus auf dem SignalStore. Anders als in Teil 2 rufen die Outputs der Karte und die Buttons die Store-Methoden direkt auf (`store.likeBook($event)`), ohne Durchreich-Methoden in der Komponente. Der Store übernimmt damit die Rolle der Facade aus Teil 2: Die Komponente kennt nur seine Signale und Methoden.

Die einzelne Buchkarte ist eine rein **präsentationale** Komponente: Sie kennt den Store gar nicht, sondern bekommt das Buch über ein `input` und meldet Nutzeraktionen über `output`s zurück nach oben:

```ts
// books/book-card/book-card.ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Book } from '../../shared/book';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCard {
  readonly book = input.required<Book>();
  readonly like = output<Book>();
  readonly remove = output<string>();

  likeBook(): void {
    this.like.emit(this.book());
  }

  removeBook(): void {
    this.remove.emit(this.book().isbn);
  }
}
```

```html
<!-- books/book-card/book-card.html -->
@let b = book();

<article class="book-card">
  <img class="book-card__cover" [src]="b.imageUrl" [alt]="b.title" loading="lazy" />
  <div class="book-card__body">
    <h3>{{ b.title }}</h3>
    @if (b.subtitle) {
      <p class="book-card__subtitle">{{ b.subtitle }}</p>
    }
    <p class="book-card__authors">{{ b.authors.join(', ') }}</p>
    <p class="book-card__isbn">ISBN {{ b.isbn }}</p>
  </div>
  <footer class="book-card__footer">
    <button type="button" (click)="likeBook()">★ Favorit</button>
    <button type="button" (click)="removeBook()">Löschen</button>
  </footer>
</article>
```

Da der Store global bereitsteht, könnte auch eine separate Formularkomponente `store.addBook()` aufrufen. Die Übersicht aktualisiert sich dank der Signale automatisch.

## Weiterführende Features

Der Store für den BookManager ist damit vollständig. Für größere Anwendungen bringt NgRx weitere Bausteine mit, die wiederkehrenden Code reduzieren oder den Redux-Stil zurückbringen.

### Weniger Boilerplate: Entitäten mit `withEntities`

Die immutablen Array-Operationen aus unseren Methoden (`[...state.books, created]`, `filter(...)`) wiederholen sich in jeder Anwendung. Diese Routine nimmt uns das Plugin `@ngrx/signals/entities` mit dem Feature `withEntities()` ab, das Gegenstück zu `@ngrx/entity` aus Teil 2. Es legt die Signale `entityMap`, `ids` und `entities` an und bringt fertige Updater mit: `addEntity`, `updateEntity`, `removeEntity`, `setAllEntities` und weitere.

Standardmäßig erwartet `withEntities` ein Property `id`. Da ein Buch im BookManager über seine `isbn` identifiziert wird, geben wir wie schon bei `@ngrx/entity` einen eigenen ID-Selektor an. Bei `add*`-, `set*`- und `update*`-Updatern übergeben wir ihn im Konfigurationsobjekt `{ selectId }` als zweites Argument; die `remove*`-Updater brauchen keinen ID-Selektor, denn sie erhalten die ID direkt als Argument. Der Übersicht halber zeigt das Listing nur den Entity-Teil; Lade- und Fehlerstatus, Favoriten und `withHooks()` bleiben wie im vollständigen Beispiel:

```ts
// books/book-signal-store.ts (Entity-Variante, gekürzt)
import { inject } from '@angular/core';
import { concatMap, switchMap } from 'rxjs';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  SelectEntityId,
  addEntity,
  removeEntity,
  setAllEntities,
  withEntities
} from '@ngrx/signals/entities';

import { Book } from '../shared/book';
import { BookStore } from '../shared/book-store';

const selectId: SelectEntityId<Book> = book => book.isbn;

export const BookSignalStore = signalStore(
  { providedIn: 'root' },
  withEntities<Book>(),
  withMethods((store, bookStore = inject(BookStore)) => ({
    loadBooks: rxMethod<void>(
      switchMap(() =>
        bookStore.getAll().pipe(
          tapResponse({
            next: books => patchState(store, setAllEntities(books, { selectId })),
            error: console.error
          })
        )
      )
    ),
    addBook: rxMethod<Book>(
      concatMap(book =>
        bookStore.create(book).pipe(
          tapResponse({
            next: created => patchState(store, addEntity(created, { selectId })),
            error: console.error
          })
        )
      )
    ),
    deleteBook: rxMethod<string>(
      concatMap(isbn =>
        bookStore.remove(isbn).pipe(
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

Die Entity-Updater automatisieren also exakt die immutablen Operationen, die wir zuvor von Hand geschrieben haben. Die Buchliste lesen wir nun über das mitgelieferte Signal `store.entities()`; die Pflege von `entityMap` und `ids` übernimmt das Plugin. Eigene Felder wie `loading` oder `error` führen wir weiter über ein `withState(...)`, das wir mit `withEntities()` kombinieren. Statt `selectId` bei jedem Updater zu wiederholen, können wir den ID-Selektor auch einmal zentral mit `entityConfig()` festlegen und diese Konfiguration an `withEntities()` und an die Updater übergeben.

### Wiederverwendbare Bausteine: `signalStoreFeature`

Mit `signalStoreFeature()` können wir eigene Features definieren: Es bündelt State, computed Signals und Methoden zu einem wiederverwendbaren Baustein, etwa einem Lade-Status, den viele Stores brauchen:

```ts
import { computed } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: 'idle' | 'pending' | 'fulfilled' }>({
      requestStatus: 'idle'
    }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending')
    })),
    withMethods(store => ({
      setPending(): void {
        patchState(store, { requestStatus: 'pending' });
      },
      setFulfilled(): void {
        patchState(store, { requestStatus: 'fulfilled' });
      }
    }))
  );
}
```

Dieses Feature lässt sich anschließend in beliebig vielen Stores einsetzen: `signalStore(withEntities<Book>(), withRequestStatus())`. Die Methoden des jeweiligen Stores rufen dann `setPending()` und `setFulfilled()` auf, etwa zu Beginn und am Ende eines HTTP-Requests. Im Global Store verteilt sich vergleichbare Wiederverwendung auf Reducer, Selektoren und Effects; einen Baustein, der State, abgeleitete Werte und Methoden in einem Stück bündelt, gibt es dort in dieser Form nicht.

### Events-Plugin: Redux-Stil im SignalStore

Wer den ereignisbasierten Datenfluss des Redux-Patterns auch mit dem SignalStore möchte, kann das **Events-Plugin** nutzen (`@ngrx/signals/events`, seit NgRx 19.2). Es ergänzt den SignalStore um Events, Reducer und Event Handler und stellt so einen unidirektionalen Fluss im Stil von Redux her.

## Testing

Da ein SignalStore ein gewöhnlicher Service ist, testen wir ihn auch wie einen Service: Instanz beziehen, Methoden aufrufen, Signale auslesen. Einen Mock-Store mit `provideMockStore()` und `provideMockActions()` wie beim Global Store brauchen wir nicht. Den `BookStore`-Service ersetzen wir wie gewohnt per `{ provide: BookStore, useValue: … }` durch ein Mock mit `Observable`-Rückgaben. Weil unser `BookSignalStore` sich über `onInit` beim Injizieren selbst lädt, müssen wir `loadBooks()` im Test nicht eigens aufrufen:

```ts
// books/book-signal-store.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BookSignalStore } from './book-signal-store';
import { BookStore } from '../shared/book-store';
// b() erzeugt vollständige Buch-Testdaten – eine kleine Factory,
// die wir für alle Spec-Dateien in testing/book-factory.ts ablegen
import { b } from '../testing/book-factory';

/** Erzeugt einen frischen Store mit gemocktem BookStore-Service. */
function createStore(mock: Partial<BookStore>) {
  TestBed.configureTestingModule({
    providers: [{ provide: BookStore, useValue: mock }]
  });
  return TestBed.inject(BookSignalStore);
}

describe('BookSignalStore', () => {
  it('lädt beim Init die Bücher und zählt sie', () => {
    // onInit löst loadBooks() bereits beim Injizieren aus:
    const store = createStore({ getAll: () => of([b('1'), b('2'), b('3')]) });
    expect(store.booksCount()).toBe(3);
  });

  it('addBook hängt ein Buch an die Liste an', () => {
    const store = createStore({ getAll: () => of([b('1')]), create: book => of(book) });
    store.addBook(b('2', 'Neu'));
    expect(store.books().map(x => x.isbn)).toEqual(['1', '2']);
  });

  it('schreibt eine Fehlermeldung in den State, wenn das Laden fehlschlägt', () => {
    const store = createStore({ getAll: () => throwError(() => new Error('Netzwerkfehler')) });
    expect(store.error()).toBe('Netzwerkfehler');
    expect(store.loading()).toBe(false);
  });

  it('likeBook fügt einen Favoriten hinzu und dedupliziert anhand der ISBN', () => {
    const store = createStore({ getAll: () => of([]) });
    store.likeBook(b('1'));
    store.likeBook(b('1'));
    expect(store.likedCount()).toBe(1);
  });
});
```

Den `BookStore`-Service testen wir unabhängig vom Store mit dem `HttpTestingController`, wie in [Teil 2](/material/ngrx-global-store) gezeigt. Alle Tests, auch die der Komponenten, liegen in der [Beispiel-App auf GitHub](https://github.com/angular-buch/website-articles/tree/main/material/ngrx-signal-store/demo).

> **Hinweis:** Den geschützten State können wir in Tests mit dem Helfer `unprotected()` aus `@ngrx/signals/testing` gezielt setzen, falls einmal kein passender öffentlicher Setter zur Verfügung steht.

## Was ist mit den Redux DevTools?

Für den SignalStore gibt es keine offizielle Anbindung an die Redux DevTools und damit auch kein eingebautes Time Travel Debugging wie in Teil 2. Die Angular DevTools enthalten einen *Signal Graph*, der die Abhängigkeiten zwischen Signals visualisiert. Eine Anbindung an die Redux DevTools bietet das Community-Paket `@angular-architects/ngrx-toolkit` mit dem Feature `withDevtools()`.

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
| Seiteneffekte | Effects (`@ngrx/effects`) | `rxMethod` für Async; synchroner Client-State (z. B. Favoriten) ohne `rxMethod` |
| Boilerplate | viel (Actions, Reducer, Selektoren, Effects) | wenig (`with…`-Features in einer Datei) |
| Entitäten | `@ngrx/entity` | `withEntities` (`@ngrx/signals/entities`) |
| DevTools / Time Travel | ja (Redux DevTools) | kein eingebautes Time Travel; Signal Graph (Angular DevTools), Redux DevTools über Community-Paket |
| Erzwungener unidirektionaler Fluss | ja | optional (Events-Plugin) |

## Fazit: Wann was?

Der SignalStore ist heute für die meisten Fälle die naheliegende erste Wahl. Er ist signal-nativ, kommt mit wenig Code aus, lässt sich lokal wie global einsetzen und ist leicht zu testen. Für komponenten- oder feature-lokalen Zustand, für überschaubare Anwendungen und überall dort, wo der volle Redux-Apparat zu schwer wäre, eignet er sich gut.

Der Global Store lohnt sich, wenn die Anwendung die Stärken des Redux-Patterns braucht: einen großen, von vielen Stellen geteilten und komplex verwobenen Anwendungszustand, einen strikt nachvollziehbaren Datenfluss und die Redux DevTools mit Time Travel. In großen Anwendungen und Teams ist die einheitliche Struktur ein Vorteil; diese Investition haben wir in Teil 2 beschrieben.

Eine gute Faustregel: Wir beginnen mit dem SignalStore und greifen zum Global Store, wenn die Anwendung dessen Struktur und Werkzeuge erfordert. Beide Ansätze lassen sich in einer Anwendung auch kombinieren. Mit dem Events-Plugin nähert sich der SignalStore bei Bedarf dem Redux-Stil an.

Damit ist unsere dreiteilige Serie zum State Management mit NgRx abgeschlossen: vom selbst entwickelten Modell in [Teil 1](/material/ngrx-intro) über den klassischen [Global Store](/material/ngrx-global-store) bis zum SignalStore.

---

**Zurück zu Teil 2:** [Global Store mit NgRx](/material/ngrx-global-store)
