---
title: WIP Resource API
author: Ferdinand Malcher
mail: ferdinand@malcher.media
published: 2024-10-XX
lastModified: 2024-10-XX
keywords: []
language: de
thumbnail:
sticky: false
hidden: true
---

Eine der größeren Neuerungen mit Angular 19 ist die Resource API.
In diesem Blogartikel stellen wir die Ideen der neuen Schnittstelle vor.

> Bitte beachten Sie, dass die Resource API mit Angular 19 als _experimental_ veröffentlicht wurde. Syntax und Semantik können sich noch ändern

Eine Resource verkörpert einen Datensatz, der asynchron geladen wird. In der Regel verwenden wir dazu im Browser das HTTP-Protokoll. Im Gegensatz zu einem einfachen HTTP_Request (z. B. mit dem HttpClient von Angular) geht die Resource aber einen Schritt weiter: Die Daten können jederzeit neu geladen oder sogar manuell überschrieben werden. Außerdem bietet die Resource Informationen zum Ladestatus an. Alle Informationen werden als Signals ausgegeben, sodass bei Änderungen stets der aktuelle Wert zur Verfügung steht.

## Ohne Resource

Zur Einführung betrachten wir ein Szenario, das ganz klassisch und ohne die neue Resource API implementiert wird.
Eine Komponente soll eine Liste von Büchern anzeigen, die per HTTP von einem Server geladen wird.
Der dazu passende `BookStoreService` mit der Methode `getAll()` existiert bereits und wird per Dependency Injection angefordert.
In der Komponente benötigen wir außerdem ein Property `books`, das wir ganz zeitgemäß mit einem Signal initialisieren.
Im Konstruktor subscriben wir auf das Observable, das von `getAll()` erzeugt wird. Sobald die Buchliste vom Server eingetroffen ist, setzen wir das Signal.

```ts
@Component({
  /* ... */
})
export class BookListComponent {
  private bs = inject(BookStoreService);
  books = signal<Book[]>([]);

  constructor() {
    this.bs.getAll().subscribe((receivedBooks) => {
      this.books.set(receivedBooks);
    });
  }
}
```

In der Regel wird es aber nicht bei diesem einfachen Szenario bleiben, sondern weitere Anforderungen kommen hinzu:

- **Auf Knopfdruck soll die Buchliste neu geladen werden.** Dazu müssen wir in einer Methode `reloadList()` den HTTP-Request erneut starten und den Code aus dem Konstruktor duplizieren.
- **Es soll ein Ladeindikator angezeigt werden.** Dafür müssen wir ein Property `loading` einführen, das wir an den richtigen Stellen im Code auf `true` oder `false` setzen, um den Zustand korrekt zu erfassen.
- **Die Daten sollen lokal verändert/überschrieben werden.** Dazu können wir zwar das Signal mit einem neuen Wert setzen – wir wissen aber anschließend nicht mehr, ob der aktuelle Wert lokal gesetzt oder asynchron geladen wurde.

Diese Dinge lassen sich selbstverständlich mit moderatem Aufwand implementieren – aber wir müssen immer wieder ähnliche Schritte unternehmen, um zum Ziel zu kommen.
Anstatt auf imperativen Stil zu setzen, wie in unserem Beispiel, können wir auch die Möglichkeiten der Bibliothek RxJS nutzen. Der Kern des Problems bleibt aber erhalten: Es ist vergleichsweise viel Aufwand nötig, um alltägliche Aufgaben umzusetzen.

Die neue Resource API soll diese Lücke schließen!

## Resource API

Eine Resource repräsentiert einen Datensatz, der mithilfe eines Loaders geladen wird.
Zur Initialisierung verwenden wir die Funktion `resource()` mit einem Konfigurationsobjekt.
Der hier übergebene Loader ist eine Funktion, die das (asynchrone) Laden der Daten durchführt.
Dieser Loader wird übrigens sofort ausgeführt, sobald die Resource initialisiert wird.

````ts
myResource = resource({
  loader: () => /* Daten laden */
});

Überraschenderweise muss der Loader immer eine Promise zurückgeben! Grundsätzlich spricht zwar nichts dagegen, dieses native Modell des Browsers zu verwenden. In der Vergangenheit hat Angular aber stets auf Observables gesetzt, um asynchrone Operationen durchzuführen.

Um mit der Resource also einen HTTP-Request durchzuführen, gibt es drei Möglichkeiten:

Wir verwenden einen HTTP-Client, der Promises zurückgibt, z. B. das native `fetch()` oder die Bibliothek `axios`.
Wir verwenden die Funktion `firstValueFrom()` aus der Bibliothek RxJS. Sie wandelt ein Observable in eine Promise um, die das erste Element des Datenstroms ausgibt.
Wir nutzen die Funktion `rxResource`. Sie erstellt eine Resource, die ein Observable als Loader verwendet. Dazu gleich mehr!

```ts
booksResource = resource({
  // fetch
  loader: () => fetch('https://api5.angular-buch.com/books').then(res => res.json()) as Promise<Book[]>
  // firstValueFrom und HttpClient
  loader: () => firstValueFrom(this.bs.getAll())
});
````

Der Loader mit dem HTTP-Request wird sofort ausgeführt. Die Resource verarbeitet die Antwort und bietet folgende Signals an, um mit den Daten zu arbeiten:

- `value()`: geladene Daten, hier `Book[]`
- `status()`: Zustand der Resource vom Typ `ResourceStatus`, z. B. "Resolved" oder "Idle"
- `error()`: Fehler

Die geladenen Bücher können wir also wir folgt im Template anzeigen:

```html
{{ booksResource.value() | json }}

@for(book of booksResource.value(); track book.isbn) {
  <p>{{ book.title }}</p>
}
```

## Status der Resource

Mithilfe von `status()` können wir den Zustand der Resource auswerten, z. B. um einen Ladeindikator anzuzeigen. Alle Werte aus `status()` sind Felder aus dem Enum `ResourceStatus`:

| Status aus `ResourceStatus` | Beschreibung                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `Idle`                      | Es ist kein Request definiert und es wird nichts geladen. `value()` ist `undefined`. |
| `Error`                     | Das Laden ist fehlgeschlagen. `value()` ist `undefined`.                             |
| `Loading`                   | Die Resource lädt gerade.                                                            |
| `Reloading`                 | Die Resource lädt gerade neu, nachdem das Neuladen angefordert wurde.                |
| `Resolved`                  | Das Laden ist abgeschlossen.                                                         |
| `Local`                     | Der Wert wurde lokal überschrieben.                                                  |

Für einen Ladeindikator können wir z. B. so vorgehen und ein Computed Signal verwenden:

```ts
isLoading = computed(() => this.booksResource.status() === ResourceStatus.Loading || this.booksResource.status() === ResourceStatus.Reloading);
```

```html
@if (isLoading()) {
  <div>LOADING</div>
}
```

## Resource neuladen




## Wert lokal überschreiben




## Resource mit Request verwenden


## `rxResource`: Resource mit Observables


<hr>

<small>**Titelbild:** XXX. Foto von Ferdinand Malcher</small>
