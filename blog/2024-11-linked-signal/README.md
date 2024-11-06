---
title: 'Angular 19: Einführung von LinkedSignal für eine lokale reaktive Zustandsverwaltung'
author: Johannes Hoppe and Ferdinand Malcher
mail: team@angular.schule
published: 2024-11-04
lastModified: 2024-11-04
keywords:
  - Angular
  - JavaScript
  - Signals
  - Reactive Programming
  - Linked Signal
  - Angular 19
  - Computed Signals 
language: de
thumbnail: linkedsignal.jpg
sticky: false
---


Mit Angular 19 gibt es ein [neues experimentelles Feature](https://github.com/angular/angular/commit/8311f00faaf282d1a5b1ddca29247a2fba94a692) namens **Linked Signal**, das die Verwaltung von lokalem Zustand in Verbindung mit anderen Signals erleichtert. Das Linked Signal ist ein beschreibbare Signals, das sich automatisch zurücksetzt, wenn sich andere Signals ändern. Dies ist besonders nützlich, wenn wir lokale Zustände mit dynamischen Daten im Einklang halten müssen.  
Schauen wir uns an, was ein Linked Signal ist, wie es funktioniert und in welchen Anwendungsfällen es sinnvoll eingesetzt werden kann.


## Inhalt

* [Was ist ein Linked Signal?](/blog/2024-11-linked-signal#was-ist-ein-linked-signal)
* [Grundlegende Nutzung von Linked Signal](/blog/2024-11-linked-signal#grundlegende-nutzung-von-linked-signal)
* [Fortgeschrittene Szenarien für Linked Signals](/blog/2024-11-linked-signal#fortgeschrittene-szenarien-fuer-linked-signals)
* [Linked Signal und andere Signals](/blog/2024-11-linked-signal#linked-signal-vs-andere-signals)
* [Best Practices für die Nutzung von Linked Signal](/blog/2024-11-linked-signal#best-practices-für-die-nutzung-von-linked-signal)
* [Demo-Anwendung](/blog/2024-11-linked-signal#demo-anwendung)
* [Fazit](/blog/2024-11-linked-signal#fazit)


> **🇬🇧 This article is available in English language here: [Angular 19: Introducing LinkedSignal for Responsive Local State Management](https://angular.schule/blog/2024-11-linked-signal)**


## Was ist ein Linked Signal?

Ein Linked Signal ist ein experimentelles Feature von Angular 19, um die Verwaltung von Zuständen zu erleichtern, die automatisch mit anderen Signals synchronisiert werden.
Kurz gesagt: wir erhalten ein beschreibbares Signal, das sich selbst zurücksetzt, wenn sich der Wert seines Quellsignals ändert.
Ein Linked Signal kann über die [`linkedSignal()`-Factory-Funktion](https://next.angular.dev/api/core/linkedSignal) erstellt werden.


Ein Linked Signal hat die folgenden Eigenschaften:

- **Schreibbar und reaktiv**: Wie ein [`Signal`](https://angular.dev/guide/signals#writable-signals) kann der Wert eines Linked Signals manuell aktualisiert werden, aber es reagiert auch auf Änderungen von seiner Quelle.
- **Eine Kombination aus Signal und Computed**: Es ist wie ein Signal das mit [`computed`](https://angular.dev/guide/signals#computed-signals) erstellt wurde , weil es seinen Wert von anderen Signalen ableitet. Es bleibt aber beschreibbar, so dass wir es bei Bedarf den Wert manuell neu setzen können.

Durch die Kombination dieser Eigenschaften bieten Linked Signals eine flexible Möglichkeit zur Verwaltung von Zuständen, die sich an Änderungen in zugehörigen Signalen anpassen, aber bei Bedarf auch direkt gesteuert werden können.
Um die Flexibilität zu verstehen, betrachten wir das folgende Beispiel, in dem ``linkedSignal` und `computed`` miteinander verglichen werden:

```ts
import { computed, linkedSignal } from '@angular/core';

const timestampMs = signal(Date.now());

// computed(): Signal (not writable)
const timestampSeconds = computed(() => timestampMs() / 1000);
timestampSeconds.set(0); // ❌ Fehler

// linkedSignal(): WritableSignal
const timestampSecondsLinked = linkedSignal(() => timestampMs() / 1000);
timestampSecondsLinked.set(0); // ✅ funktioniert
```

Hier ist die genaue Übersetzung des angegebenen Abschnitts:

---

Die Signatur und Nutzung von `computed()` und `linkedSignal()` sehen sehr ähnlich aus: 

Beide akzeptieren eine Berechnungsfunktion, die den Ergebniswert des Signals aktualisiert, wenn sich eines der gebundenen Signals (hier: `timestampMs`) ändert. 
Der Unterschied liegt in ihren Rückgabewerten:
Während `computed()` ein schreibgeschütztes `Signal` zurückgibt, erzeugt die neue Funktion `linkedSignal()` ein `WritableSignal`.

Das bedeutet, dass wir den Wert bei Bedarf mit `set()` und `update()` überschreiben können.
Ein mit `computed()` erstelltes Signal erlaubt es nicht, den Wert manuell zu ändern.

Im ersten Beispiel haben wir die **Kurzschreibweise** für das Linked Signal verwendet. Es ist aber auch möglich, die Berechnung in eine separate Funktion auszulagern. 
Der Wert der Quelle wird automatisch an die Berechnungsfunktion übergeben.

```ts
const timestampMs = signal(Date.now());

const timestampSecondsLinked = linkedSignal({
  source: timestampMs,
  computation: ms => ms / 1000
});
```

Ob das ausführlichere Options-Objekt mit `source` und `computation` oder die Kurzschreibweise verwendet werden sollte, hängt vom Anwendungsfall und persönlichen Geschmack ab. 
Beide gezeigten Beispiele für `timestampSecondsLinked` haben genau das selbe Verhalten. 
In komplexeren Fällen kann eine separate Berechnungsfunktion den Code jedoch leichter verständlich und lesbarer machen.


## Grundlegende Nutzung von Linked Signal

Schauen wir uns ein weiteres konkretes Beispiel an, um zu veranschaulichen, wie das neue Signal funktioniert. 
Unsere Komponente mit dem Namen `BookListComponent` hält eine Liste von Büchern im Signal `books`.  
Anschließend verwenden wir ein Linked Signal, um das *erste Buch* in der Liste zu ermitteln.
Wir haben uns entschieden, die ausführliche Notation mit dem Optionsobjekt zu verwenden. 
Die separate Berechnung macht den Code lesbarer im Vergleich zu einer einzeiligen Funktion.

Wann immer sich die Liste der Bücher ändert (dies geschieht in unserem Beispiel durch die `changeBookList()`-Methode), berechnet das `firstBook`-Signal seinen Wert automatisch neu und zeigt das neu ermittelte erste Buch an.
Bis zu diesem Punkt könnte die vorgestellte Funktionalität auch mit einem Computed Signal umgesetzt werden.
Jedoch ermöglicht es das Linked Signal, den Wert in der `overrideFirstBook()`-Methode manuell zu überschreiben.

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

  // dies funktioniert auch (Kurzschreibweise)
  // firstBook = linkedSignal(() => this.books()[0]);

  overrideFirstBook() {
    // Manuelles update von `firstBook`, gibt jetzt 'jQuery' zurück
    this.firstBook.set('jQuery');
  }

  changeBookList() {
    // Änderungen an `books` bewirken das `firstBook` zurück gesetzt wird
    // der Rückgabewert ist dann wieder 'Next.js'
    this.books.set(['Next.js', 'Svelte', 'Nuxt']);
  }
}
```

In diesem Beispiel geschieht Folgendes:
- Das Linked Signal `firstBook` zeigt zunächst auf das erste Buch in der Liste der `books`.
- Wir können den Wert jederzeit manuell überschreiben, wie bei dem „jQuery“-Buch gezeigt.
- Wenn sich `books` ändert, wird `firstBook` neu berechnet, um den ersten Eintrag in der aktualisierten Liste wiederzugeben.

Das Signal enthält immer den neuesten Wert - entweder wird er manuell durch `set()`/`update()` gesetzt oder von der Berechnungsfunktion ermittelt, wenn sich das gebundene Signal ändert.


### Anwendungsfall mit Input-Signals

Ein häufiger Anwendungsfall für ein Linked Signal ist eine Komponente, die sich basierend auf einem Input-Signal zurücksetzt.  
Ein Beispiel dafür wäre eine Warenkorb-Komponente (hier: `ShoppingCartComponent`), bei der das Eingebefeld für die Menge zurückgesetzt werden soll, wenn sich das ausgewählte Produkt ändert.  
Zwar könnten wir solch ein Ergebnis auch mit `computed` erzielen, jedoch wollen wir die Menge zusätzlich durch Änderung der Formularwerte festlegen können.

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
     // Auf 1 zurück setzen, wenn sich selectedBook ändert
    computation: () => 1
  });
}
```

In diesem Fall wird der Wert von `amount` jedes Mal auf 1 zurückgesetzt, wenn sich `selectedBook` ändert.  
Das `<input>`-Feld im Template spiegelt diese Änderung wider und setzt sich ebenfalls auf 1 zurück.  
Dieses Muster ist nützlich in Formularen, in denen Felder in ihren Ausgangszustand zurückgesetzt werden sollen, sobald bestimmte Signals geändert werden.

Für diesen Anwendungsfall ist die **Langschreibweise** mit `source` und `computation` der eleganteste Weg:
Wir sind nicht am tatsächlichen Wert von `selectedBook` interessiert.
Stattdessen möchten wir den Wert jedes Mal auf `1` zurücksetzen, wenn sich `selectedBook` ändert.
Aus diesem Grund haben wir `source` und `computation` getrennt und nicht die Kurzschreibweise verwendet.

## Fortgeschrittene Szenarien für Linked Signals

### Nested State Management

Angenommen, wir haben verschachtelte Daten wie Bucheigenschaften (`title` und `rating`), und diese Felder sollen zurückgesetzt werden, wenn ein anderes Buch über ein Input-Signal ausgewählt wird.
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
export class BookComponent  {
  book = input.required<Book>();
  ratingChange = output<{ isbn: string, newRating: number }>();

  title = computed(() => this.book().title);
  rating = linkedSignal(() => this.book().rating);

  // dies funktioniert auch (Langschreibweise)
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

Die Eigenschaften `title` und `rating` werden von der Quelle `book` abgeleitet.
Sowohl `title` als auch `rating` berechnen ihre Werte neu, wenn sich `book` ändert.
Dies hilft, die Daten in Fällen zu synchronisieren, in denen die Struktur des Zustands hierarchisch ist oder von bestimmten Identifikatoren abhängt.
Während das Linked Signal sicherstellt, dass die Daten bei Bedarf zurückgesetzt werden, können wir unseren lokalen Zustand dennoch direkt aktualisieren.
In diesem Beispiel aktualisieren wir die Bewertung lokal und übermitteln die Änderung an die übergeordnete Komponente über das `ratingChange`-Event zurück.
Da wir `title` innerhalb der Komponente nicht ändern müssen, reicht hier ein „Computed Signal“ aus.

Wir haben uns für die Kurzschreibweise des Linked Signal entschieden, weil die Berechnung sehr einfach ist.
Außerdem sehen die Zeilen mit dem `computed()` und dem `linkedSignal()` sehr ähnlich aus, was die Lesbarkeit erhöht.
Je nach Geschmack ist aber auch die Langschreibweise möglich.


### Synchronizing Server-Data for Client-Side Edits

Ein verknüpftes Signal ist auch bei der Arbeit mit Daten vom Server hilfreich, die lokal bearbeitet werden sollen.
In diesem folgenden werden Daten von unserer HTTP-API verwendet, die über einen einfachen `HttpClient`-Wrapper namens `BookStoreService` abgerufen werden. Obwohl die Daten aus einem Observable stammen, wollen wir die Einträge ohne Umwege lokal editieren können:

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

In diesem Beispiel enthält `books` die Serverdaten.  
Normalerweise würden wir `toSignal()` verwenden, um das RxJS-Observable in ein Signal umzuwandeln.  
Mit `toSignal()` allein könnten wir die abgerufenen Daten jedoch nicht direkt bearbeiten – außer durch das Senden eines neuen Elements aus dem Observable.

Durch die Verwendung eines Linked Signals können wir die Daten trotzdem lokal ändern, und bei einem größeren Zurücksetzen (z. B. einem Neuladen der Daten vom Server) können die Originaldaten wiederhergestellt werden.

Wir haben hier die Kurzschreibweise für `linkedSignal()` verwendet und das Signal von `toSignal()` direkt übergeben, da wir lediglich die Quelle in ein Linked Signal umwandeln möchten. 
Die lange Schreibweise mit der dedizierten Funktion zur Berechnung ist nicht erforderlich.

Kommen wir nun zu zwei zusätzlichen Anforderungen, die die Komplexität dieses Beispiels ein wenig erhöhen sollen.
Wenn die Methode `changeOrder()` aufgerufen wird, ändern wir die Reihenfolge der Bücherliste.
Zusätzlich behandeln wir das `ratingChange`-Event aus dem vorherigen Beispiel.  
Die zugehörige Methode `handleRatingChange()` nimmt den Identifikator `isbn` und das neue Rating entgegen und ersetzt das veraltete Buchobjekt durch eine aktualisierte Kopie.  

Um das Ganze abzurunden, könnte man auch die Buchdaten ändern und den aktualisierten Zustand an den Server zurücksenden. Aber diese Aufgabe überlassen wir unseren Lesern. 😉


> ℹ️ **Wussten Sie schon?** In Version 19 von Angular wird zusätzlich die neue experimentelle **Resource API** eingeführt. Sie ermöglicht das asynchrone Laden von Daten und das Auslesen des Ladestatus, wobei auch dieses Signal beschreibbar bleibt.  
> Wir haben die Resource API in einem separaten Blogbeitrag vorgestellt: **[Die neue Resource API von Angular](https://angular-buch.com/blog/2024-10-resource-api)**


## Linked Signal und andere Signals

Hier ein schneller Vergleich mit anderen Arten von Signals von Angular:

- **`signal()`**: Erzeugt ein Basis-Signal, das beschreibbar ist und seinen Wert unabhängig von anderen Signalen beibehält. Es hat einen Startwert, welcher mit `set()` und `update()` überschrieben werden kann.
- **`computed()`**: Erzeugt ein schreibgeschütztes Signal, das von anderen Signalen abgeleitet ist und automatisch neu berechnet wird, aber keine manuellen Änderungen zulässt.
- **`linkedSignal()`**: Kombiniert die Reaktivität von `computed()` mit der Veränderbarkeit von `signal()`, so dass man den Wert manuell aktualisieren kann, während er weiterhin mit einem Quell-Signal gekoppelt bleibt.

Wir empfehlen, `linkedSignal()` nur für Zustände zu verwenden, die aufgrund von konkreter Abhängigkeiten zurückgesetzt werden sollen.
Nutzen Sie weiterhin `computed()` für abgeleitete Daten, die nicht überschrieben werden müssen.

## Best Practices für die Nutzung von Linked Signal

Hier sind einige Tipps für die optimale Nutzung von Linked Signals:

- **Berechnungsfunktionen einfach halten**: Vermeiden Sie komplexe Berechnungen in der `computation`-Funktion, um zyklische Abhängigkeiten zu vermeiden und den Code besser verständlich zu halten.  
  Führt eine Berechnung zu einem zyklischen Zugriff auf sich selbst, stoppt Angular die Ausführung mit dieser Fehlermeldung: ["Detected cycle in computations."](https://github.com/angular/angular/blob/7d0ba0cac85220cbbe4044667a51e5b95512f5d6/packages/core/primitives/signals/src/computed.ts#L114)
- **Nutzung für das Zurücksetzen**: `linkedSignal()` ist ideal für Fälle, in denen ein Zustand basierend auf einem bestimmten Signal zurückgesetzt werden soll, wie Beispielsweise das Leeren eines Formularfeldes, wenn ein neues Element ausgewählt wird.  
  Wenn keine Reset-Funktionalität benötigt wird, ist wahrscheinlich `computed()` die bessere Wahl.
- **Effects für komplexe Szenarien in Betracht ziehen**: Wenn mehrere Signals auf eine einzige Änderung reagieren sollen, kann die Nutzung von `effect()` übersichtlicher und effizienter sein, als mehrere Signals mit `linkedSignal()` zu erstellen.


## Demo-Anwendung

Um Linked Signals direkt in Aktion zu sehen, haben wir eine Demo-Anwendung auf GitHub erstellt, die alle in diesem Artikel besprochenen Beispiele zeigt.
Der erste Link führt zum Quellcode auf GitHub, den Sie herunterladen können.
Der zweite Link öffnet eine deployte Demo der Anwendung, die Sie direkt ausprobieren können.
Und schließlich bietet der dritte Link eine interaktive Demo auf StackBlitz, in der Sie den Quellcode bearbeiten und die Ergebnisse in Echtzeit sehen können.

> **[1️⃣ Quelltext auf GitHub: demo-linked-signal](https://github.com/angular-schule/demo-linked-signal)**  
> **[2️⃣ Demo der Anwendung](https://angular-schule.github.io/demo-linked-signal/)**  
> **[3️⃣ StackBlitz Demo](https://stackblitz.com/github/angular-schule/demo-linked-signal?file=src%2Fapp%2Fbooks%2Fdashboard%2Fdashboard.component.ts)**  


## Fazit

Das Linked Signal von Angular 19 bietet eine praktische Lösung zur Verwaltung von lokalem State, der mit anderen Signalen synchronisiert werden sollen. 
Dieses neue Feature schließt die Lücke zwischen `signal()` und `computed()` und bietet eine neue Möglichkeit, komplexe reaktive Frontends zu gestalten, bei denen die Synchronisierung von komplexen Zuständen notwendig ist.
Probieren Sie `linkedSignal()` in Ihrem Angular-Projekt aus, um herauszufinden, ob es Ihre Datenverwaltung vereinfachen kann. 
** ⚠️ Bitte bedenken Sie, dass diese API noch experimentell ist und sich Details aufgrund des Feedbacks der Community drastisch verändern können.**
<hr>

<small>Vielen Dank an Danny Koppenhagen für das Review und das wertvolle Feedback!</small>

<small>**Titelbild:** Mit Adobe Firefly generiert</small>
