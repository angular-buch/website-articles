---
title: 'Neu in Angular 19: LinkedSignal für reaktive Zustandsverwaltung'
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
author2: Ferdinand Malcher
mail2: ferdinand@malcher.media
published: 2024-11-07
lastModified: 2024-12-04
keywords:
  - Angular
  - JavaScript
  - Signals
  - Reactive Programming
  - Linked Signal
  - Angular 19
  - Computed Signals 
language: de
header: linkedsignal.jpg
sticky: false
---


Mit Angular 19 wurde ein [neues Feature](https://github.com/angular/angular/commit/8311f00faaf282d1a5b1ddca29247a2fba94a692) vorgestellt: das **Linked Signal**. Es erleichtert die Verwaltung von lokalem Zustand in Verbindung mit anderen Signals. Bei dem Linked Signal handelt sich um ein beschreibbares Signal, das automatisch zurückgesetzt wird, wenn sich andere Signals ändern. Dies ist besonders nützlich, wenn wir lokale Zustände mit dynamischen Daten synchronisieren wollen.
In diesem Blogpost stellen wir vor, was ein Linked Signal ist, wie es funktioniert und in welchen Anwendungsfällen es sinnvoll eingesetzt werden kann.


## Inhalt

[[toc]]

> 🇬🇧 This article is available in English language here: [Angular 19: Introducing LinkedSignal for Responsive Local State Management](https://angular.schule/blog/2024-11-linked-signal)


## Was ist ein Linked Signal?

Das Linked Signal wurde als neues Feature von Angular 19 vorgestellt.
Es soll die Arbeit mit Zuständen erleichtern, die mit anderen Signals synchronisiert werden müssen.
Kurz gesagt: Wir erhalten ein beschreibbares Signal, dessen Wert automatisch neu berechnet wird, sobald sich der Wert seines Quellsignals ändert.
Ein Linked Signal kann mit der Factory-Funktion [`linkedSignal()`](https://next.angular.dev/api/core/linkedSignal) erzeugt werden.


Ein Linked Signal hat die folgenden Eigenschaften:

- **Schreibbar und reaktiv**: Der Wert kann manuell aktualisiert werden (wie mit der Funktion [`signal`](https://angular.dev/guide/signals#writable-signals)). Das Linked Signal reagiert aber auch auf Änderungen von der Quelle.
- **Eine Kombination aus Signal und Computed**: Es funktioniert wie ein Signal, das mit [`computed`](https://angular.dev/guide/signals#computed-signals) erstellt wurde, denn der Wert wird von anderen Signals abgeleitet. Dabei bleibt es aber beschreibbar, sodass wir den Wert bei Bedarf manuell neu setzen können.

Dadurch bieten Linked Signals eine flexible Möglichkeit zur Verwaltung von Zuständen, die sich an Änderungen in zugehörigen Signals anpassen – aber bei Bedarf auch direkt gesteuert werden können.
Um das Linked Signal besser kennenzulernen, betrachten wir das folgende Beispiel, in dem `linkedSignal` und `computed` miteinander verglichen werden:

```ts
import { computed, linkedSignal } from '@angular/core';

const timestampMs = signal(Date.now());

// computed(): Signal (nicht überschreibbar)
const timestampSeconds = computed(() => timestampMs() / 1000);
timestampSeconds.set(0); // ❌ Fehler

// linkedSignal(): WritableSignal
const timestampSecondsLinked = linkedSignal(() => timestampMs() / 1000);
timestampSecondsLinked.set(0); // ✅ funktioniert
```

Die beiden Funktionen `computed()` und `linkedSignal()` sehen auf den ersten Blick sehr ähnlich aus: 
Beide erhalten eine *Computation Function*, die das Ergebnis des Signals neu berechnet, wenn sich eines der gebundenen Signals (hier: `timestampMs`) ändert.
Der wesentliche Unterschied ist der Rückgabewert:
Während `computed()` ein reines `Signal` zurückgibt, das nur lesbar ist, erzeugt die neue Funktion `linkedSignal()` ein `WritableSignal`.

Das bedeutet, dass wir den Wert bei Bedarf mit `set()` und `update()` überschreiben können.
Ein Signal, das mit `computed()` erstellt wurde, bietet diese Schnittstelle nicht an.

Im ersten Beispiel haben wir die **Kurzschreibweise** für das Linked Signal verwendet. Es ist aber auch möglich, die Berechnung in eine separate Funktion auszulagern. 
Der Wert des Signals aus `source` wird dann automatisch an die Berechnungsfunktion `computation` übergeben.

```ts
const timestampMs = signal(Date.now());

const timestampSecondsLinked = linkedSignal({
  source: timestampMs,
  computation: ms => ms / 1000
});
```

Ob das ausführlichere Options-Objekt mit `source` und `computation` oder die Kurzschreibweise verwendet werden sollte, hängt vom Anwendungsfall und persönlichen Geschmack ab. 
Beide gezeigten Beispiele für `timestampSecondsLinked` haben genau das gleiche Verhalten. 
In komplexeren Fällen kann eine separate Berechnungsfunktion den Code jedoch leichter verständlich und lesbarer machen.


## Grundlegende Nutzung von Linked Signal

Wir schauen uns ein umfangreicheres Beispiel an:
Unsere Komponente `BookListComponent` hält eine Liste von Büchern im Signal `books`.
Anschließend verwenden wir ein Linked Signal, um das *erste Buch* in der Liste zu ermitteln.
Wir haben uns entschieden, die ausführliche Notation mit einem Optionsobjekt zu verwenden. 
Die separate *Computation Function* macht den Code lesbarer im Vergleich zu einer einzeiligen Funktion, die Quelle und Berechnung vereint.

Immer wenn sich die Liste der Bücher ändert (dies geschieht in unserem Beispiel durch die Methode `changeBookList()`), berechnet das Signal `firstBook` seinen Wert automatisch neu, und das neu ermittelte erste Buch wird angezeigt.
Bis hierhin hätten wir dafür auch ein Computed Signal verwenden können.
Das Linked Signal macht es aber nun möglich, den Wert in der Methode `overrideFirstBook()` manuell zu überschreiben.

```typescript
import { Component, linkedSignal, signal } from '@angular/core';

@Component({
  selector: 'app-book-list',
  template: `
    <p>First book in list: {{ firstBook() }}</p>
    <button (click)="changeBookList()">Change Book List</button>`
})
export class BookListComponent {
  books = signal(['Angular', 'React', 'Vue']);

  firstBook = linkedSignal({
    source: this.books,
    computation: books => books[0]
  });

  // Alternativ: Kurzschreibweise
  // firstBook = linkedSignal(() => this.books()[0]);

  overrideFirstBook() {
    // Manuelles Update von `firstBook`, gibt jetzt 'jQuery' zurück
    this.firstBook.set('jQuery');
  }

  changeBookList() {
    // Änderungen an `books` bewirken, dass `firstBook` zurückgesetzt wird.
    // Der Rückgabewert ist dann wieder 'Next.js'
    this.books.set(['Next.js', 'Svelte', 'Nuxt']);
  }
}
```

In diesem Beispiel geschieht Folgendes:
- Das Linked Signal `firstBook` zeigt zunächst auf das erste Buch in der Liste der `books`.
- Wir können den Wert jederzeit manuell überschreiben, wie bei dem Buch „jQuery“ zu erkennen ist.
- Wenn sich `books` ändert, wird `firstBook` neu berechnet, um den ersten Eintrag in der aktualisierten Liste wiederzugeben.

Das Signal enthält immer den neuesten Wert: Entweder wird er manuell durch `set()`/`update()` gesetzt oder er wird von der Berechnungsfunktion ermittelt, wenn sich das gebundene Signal ändert.


### Anwendungsfall mit Input-Signals

Ein häufiger Anwendungsfall für ein Linked Signal ist eine Komponente, die sich basierend auf einem Input-Signal zurücksetzt.
Ein gutes Beispiel dafür ist eine Warenkorb-Komponente (hier: `ShoppingCartComponent`).
Sie besitzt ein Eingabefeld für die Menge, das zurückgesetzt werden soll, wenn sich das ausgewählte Produkt ändert.
Wir könnten ein solches Ergebnis zwar auch mit `computed()` erzielen, allerdings wollen wir die Menge zusätzlich durch das Formular verändern können.

```typescript
import { Component, input, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-shopping-cart',
  template: `
    <p>Book: {{ selectedBook().title }}</p>
    <input [(ngModel)]="amount">`,
  imports: [FormsModule]
})
export class ShoppingCartComponent {
  selectedBook = input.required<Book>();
  amount = linkedSignal({
    source: this.selectedBook,
     // Auf 1 zurücksetzen, wenn sich selectedBook ändert
    computation: () => 1
  });
}
```

In diesem Fall wird der Wert von `amount` stets auf `1` zurückgesetzt, wenn sich `selectedBook` ändert.
Das `<input>`-Feld im Template spiegelt diese Änderung wider und setzt sich ebenfalls auf 1 zurück.
Dieses Muster ist nützlich für Formulare, die in ihren Ausgangszustand zurückgesetzt werden sollen, sobald bestimmte Signals geändert werden.

Für diesen Anwendungsfall ist die **Langschreibweise** mit `source` und `computation` der eleganteste Weg:
Wir sind nicht am tatsächlichen Wert von `selectedBook` interessiert.
Stattdessen möchten wir den Wert jedes Mal auf `1` zurücksetzen, wenn sich `selectedBook` ändert.
Aus diesem Grund haben wir `source` und `computation` getrennt und nicht die Kurzschreibweise verwendet.

## Fortgeschrittene Szenarien für Linked Signals

### Nested State Management

Wir wollen ein weiteres Beispiel betrachten, in dem wieder die Buch-Entität verwendet wird. In dieser Komponente arbeiten wir mit zwei Eigenschaften des Buchs: `title` und `rating`.
Diese Felder sollen zurückgesetzt und neu berechnet werden, wenn ein anderes Buch über ein Input-Signal ausgewählt wird.
So könnte man dies mit einem Linked Signal umsetzen:

```typescript
import { Component, computed, input, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-book',
  template: `
    <p>Title: {{ title() }}</p>
    <p>Rating: {{ rating() }}</p>

    <button (click)="doRateUp()">Rate up</button>
  `,
})
export class BookComponent {
  book = input.required<Book>();
  ratingChange = output<{ isbn: string, newRating: number }>();

  title = computed(() => this.book().title);
  rating = linkedSignal(() => this.book().rating);

  // Alternativ: Langschreibweise
  /*rating = linkedSignal({
    source: this.book,
    computation: book => book.rating,
  });*/

  doRateUp() {
    const newRating = this.rating() + 1;
    this.rating.set(newRating);

    this.ratingChange.emit({ 
      isbn: this.book().isbn,
      newRating
    });
  }
}
```

Die Eigenschaften `title` und `rating` werden aus dem Quellsignal `book` abgeleitet. Ihre Werte werden automatisch neu berechnet, wenn sich `book` ändert.
Während das Linked Signal sicherstellt, dass die Daten bei Bedarf zurückgesetzt werden, können wir den lokalen Zustand weiterhin direkt aktualisieren.
In diesem Beispiel verändern wir die Bewertung lokal. Anschließend übermitteln wir die Änderung an die übergeordnete Komponente, indem das Event `ratingChange` ausgelöst wird.
Da wir `title` in dieser Komponente nicht manuell ändern müssen, reicht hier ein Computed Signal aus.

Wir haben uns für die Kurzschreibweise für das Linked Signal entschieden, weil die Berechnung sehr einfach ist.
Außerdem sehen die Zeilen mit `computed()` und `linkedSignal()` sehr ähnlich aus, was die Lesbarkeit erhöht.
Je nach Geschmack ist aber auch die Langschreibweise möglich.


### Daten vom Server auf der Client-Seite bearbeiten

Ein Linked Signal ist auch bei der Arbeit mit Daten vom Server hilfreich, die lokal bearbeitet werden sollen.
In dem folgenden Beispiel wollen wir Daten von einer HTTP-API laden.
Der `BookStoreService` nutzt dafür den `HttpClient` von Angular.
Die Quelle der Daten ist somit ein Observable, das nicht direkt editierbar ist. Als zusätzliche Anforderung haben wir aber genau diesen Wunsch: Wir wollen die Daten ohne Umwege direkt lokal editieren. Hierfür bietet sich das Linked Signal an:

```typescript
import { Component, inject, linkedSignal } from '@angular/core';
import { BookStoreService } from './book-store.service';

@Component({
  selector: 'app-dashboard',
  template: `
    @for (b of books(); track b.isbn) {
      <app-book
        (ratingChange)="handleRatingChange($event.isbn, $event.newRating)"
        [book]="b"
      />
    } 

    <button (click)="changeOrder()">Change order (locally)</button>
  `,
})
export class DashboardComponent {
  private bookStore = inject(BookStoreService);

  books = linkedSignal(
    toSignal(this.bookStore.getAllBooks(), { initialValue: [] })
  );

  changeOrder() {
    this.books.update(books => books.toReversed());
  }

  handleRatingChange(isbn: string, newRating: number) {
    this.books.update(books =>
      books.map(b => {
        // falls es sich um das zu aktualisierende Buch handelt, 
        // setzen wir das neue Rating
        if (b.isbn === isbn) {
          return { ...b, rating: newRating };
        } else {
          // alle anderen Bücher in der Liste bleiben unverändert
          return b;
        }
      })
    );
  }
}
```

In diesem Beispiel enthält `books` die Daten, die vom Server geladen wurden.
Normalerweise würden wir `toSignal()` verwenden, um das Observable in ein Signal umzuwandeln.
Mit `toSignal()` allein könnten wir die abgerufenen Daten jedoch nicht nachträglich bearbeiten – dazu müssten wir das Observable dazu bringen, ein neues Element auszugeben.

Da wir aber ein Linked Signals verwendet haben, können wir die Daten trotzdem lokal überschreiben.
Wird die Quelle zurückgesetzt (z. B. bei einem Neuladen der Daten vom Server) werden die neu geladenen Daten verwendet.

Wir haben hier die Kurzschreibweise für `linkedSignal()` verwendet und das Signal von `toSignal()` direkt übergeben, denn wir möchten lediglich die Quelle in ein Linked Signal umwandeln. 
Die lange Schreibweise mit einer separaten Funktion zur Berechnung ist nicht erforderlich.

Zusätzlich haben wir in diesem Beispiel zwei weitere Anforderungen aufgenommen, die die Komplexität ein wenig erhöhen sollen:
Wenn die Methode `changeOrder()` aufgerufen wird, ändern wir die Reihenfolge der Bücherliste.
Zusätzlich behandeln wir das Event `ratingChange` aus dem vorherigen Beispiel.
Die zugehörige Methode `handleRatingChange()` nimmt den Identifikator `isbn` und das neue Rating entgegen und ersetzt das alte Buchobjekt durch eine aktualisierte Kopie.

Um das Ganze abzurunden, könnte man auch die Buchdaten ändern und den aktualisierten Zustand an den Server zurücksenden – aber diese Aufgabe überlassen wir unseren Leserinnen und Lesern. 😉


> ℹ️ **Wussten Sie schon?** In Version 19 von Angular wurde zusätzlich die neue experimentelle **Resource API** eingeführt. Sie ermöglicht das asynchrone Laden von Daten und das Auslesen des Ladestatus, wobei das Signal für die Daten lokal beschreibbar bleibt.
> Wir haben die Resource API in einem separaten Blogbeitrag vorgestellt: **[Neu in Angular 19: Daten laden mit der Resource API](https://angular-buch.com/blog/2024-10-resource-api)**


### Reactive Forms mit Signals kombinieren

Mit Linked Signals können wir Hilfsfunktionen erstellen, um die traditionelle, nicht-signal-basierte Welt mit der Welt von Signals zu verbinden.
Die folgende Wrapper-Funktion synchronisiert ein `FormControl` (oder ein anderes Control) mit einem Signal.
Die Daten werden bidirektional ausgetauscht: Wenn sich der Formularwert ändert (`valueChanges`), wird auch der Wert des Signals aktualisiert.
Die Funktion gibt ein schreibbares Signal zurück. Wenn wir den Wert des Signals ändern, wird auch der Formularwert aktualisiert (`setValue()`).

```ts
export function signalFromControl<T>(control: AbstractControl<T>) {
  const controlSignal = linkedSignal(
    toSignal(control.valueChanges, { initialValue: control.value })
  );
  effect(() => control.setValue(controlSignal()));
  return controlSignal;
}
```

Wir verwenden hier die Funktion `effect()`, um einen Effekt zu erzeugen, der automatisch auf Änderungen von Signals reagiert.
So stellen wir sicher, dass bei jeder Änderung im Signal `controlSignal` auch der Wert des Formular-Controls über `setValue()` aktualisiert wird.
Dadurch entsteht eine **bidirektionale Synchronisierung** zwischen dem Signal und dem Formular-Control.
Wenn Sie mehr über die Möglichkeiten von `effect()` erfahren möchten, lesen Sie unseren Artikel: **[Angular 19: Mastering effect and afterRenderEffect](https://angular.schule/blog/2024-11-effect-afterrendereffect)**.

Der Helfer kann wie folgt verwendet werden:

```ts
bookForm = new FormGroup({
  isbn: new FormControl('', { nonNullable: true }),
  title: new FormControl('', { nonNullable: true }),
});

title = signalFromControl(this.bookForm.controls.title);

// ...
// Der Formularwert wird auf 'Angular' aktualisiert
this.title.set('Angular');

// Der Signalwert wird auf 'Signals' aktualisiert
this.bookForm.setValue({ isbn: '123', title: 'Signals' });
```


## Linked Signal und andere Signals

Abschließend noch ein kurzer Vergleich mit anderen Arten von Signals:

- **`signal()`**: Erzeugt ein Signal, das beschreibbar ist und seinen Wert unabhängig von anderen Signals beibehält. Es hat einen Startwert, welcher mit `set()` und `update()` überschrieben werden kann.
- **`computed()`**: Erzeugt ein schreibgeschütztes Signal, das seinen Wert von anderen Signals ableitet und automatisch neu berechnet. Es lässt aber keine manuellen Änderungen zu.
- **`linkedSignal()`**: Kombiniert die Reaktivität von `computed()` mit der Veränderbarkeit von `signal()`. Der Wert kann manuell aktualisiert werden, während er weiterhin mit einem Quellsignal gekoppelt bleibt.

Wir empfehlen, `linkedSignal()` nur für Zustände zu verwenden, die aufgrund von konkreter Abhängigkeiten zurückgesetzt werden sollen.
Nutzen Sie weiterhin `computed()` für abgeleitete Daten, die nicht überschrieben werden müssen.

## Best Practices für die Nutzung von Linked Signals

Hier sind einige Tipps für die optimale Nutzung von Linked Signals:

- **Berechnungsfunktionen einfach halten**: Vermeiden Sie komplexe Berechnungen in der Computation Function, um zyklische Abhängigkeiten zu vermeiden und den Code besser verständlich zu halten.
  Führt eine Berechnung zu einem zyklischen Zugriff auf sich selbst, stoppt Angular die Ausführung mit dieser Fehlermeldung: ["Detected cycle in computations."](https://github.com/angular/angular/blob/7d0ba0cac85220cbbe4044667a51e5b95512f5d6/packages/core/primitives/signals/src/computed.ts#L114)
- **Nutzung zum Zurücksetzen**: `linkedSignal()` ist ideal für Fälle, in denen ein Zustand basierend auf einem bestimmten Signal zurückgesetzt werden soll, z. B. das Leeren eines Formularfelds, wenn ein neues Element ausgewählt wird.
  Wenn der Wert nicht durch ein Formular verändert werden soll, ist `computed()` die bessere Wahl.
- **Effects für komplexe Szenarien in Betracht ziehen**: Wenn mehrere Signals auf eine einzige Änderung reagieren sollen, kann die Nutzung von `effect()` übersichtlicher und effizienter sein, als mehrere Signals mit `linkedSignal()` zu erstellen.


## Demo-Anwendung

Um Linked Signals direkt in Aktion zu sehen, haben wir eine Demo-Anwendung auf  erstellt, die alle in diesem Artikel besprochenen Beispiele zeigt.
Der erste Link führt zum Quellcode auf GitHub.
Der zweite Link öffnet eine Online-Demo der Anwendung, die Sie direkt ausprobieren können.
Schließlich bietet der dritte Link eine interaktive Demo auf StackBlitz, in der Sie den Quellcode bearbeiten und die Ergebnisse in Echtzeit sehen können.

> **[1️⃣ Quelltext auf GitHub: demo-linked-signal](https://github.com/angular-schule/demo-linked-signal)**<br>
> **[2️⃣ Demo der Anwendung](https://angular-schule.github.io/demo-linked-signal/)**<br>
> **[3️⃣ StackBlitz Demo](https://stackblitz.com/github/angular-schule/demo-linked-signal?file=src%2Fapp%2Fbooks%2Fdashboard%2Fdashboard.component.ts)**


## Fazit

Das Linked Signal von Angular 19 bietet eine praktische Lösung zur Verwaltung von lokalem State, der mit anderen Signals synchronisiert werden soll. 
Dieses neue Feature schließt die Lücke zwischen `signal()` und `computed()` und bietet eine neue Möglichkeit, komplexe reaktive Frontends zu gestalten.
Probieren Sie doch `linkedSignal()` einmal in Ihrem Angular-Projekt aus!
**⚠️ Bitte beachten Sie, dass die API sich noch im Status "Developer Preview" befindet und Änderungen unterliegen kann.**
<hr>

<small>Vielen Dank an Danny Koppenhagen für das Review und das wertvolle Feedback!</small>

<small>**Titelbild:** generiert mit Adobe Firefly</small>
