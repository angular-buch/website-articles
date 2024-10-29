---
title: Die neue Resource API von Angular
author: Ferdinand Malcher
mail: ferdinand@malcher.media
published: 2024-10-28
lastModified: 2024-10-28
keywords:
  - Resource API
  - Promise
  - Observable
  - resource
  - rxResource
  - Fetch API
language: de
thumbnail: header-resource-api.jpg
sticky: false
hidden: true
---

Eine interessante Neuerung mit Angular 19 ist die *Resource API*. Damit können wir intuitiv Daten laden und in Komponenten verarbeiten.
In diesem Blogartikel stellen wir die Ideen der neuen Schnittstelle vor.

> ⚠️ Bitte beachten Sie, dass die Resource API mit Angular 19 als _experimental_ veröffentlicht wird. Die Syntax und Semantik der API können sich noch ändern.

Eine Resource repräsentiert einen Datensatz, der asynchron geladen wird. Dabei geht es in der Regel um HTTP-Requests, die Daten von einem Server abrufen. Die Resource geht allerdings einen Schritt weiter als nur einen einfachen HTTP-Request auszuführen: Die Daten können jederzeit neu geladen oder sogar manuell überschrieben werden. Außerdem bietet die Resource eigenständig Informationen zum Ladestatus an. Alle Informationen und Daten werden als Signals ausgegeben, sodass bei Änderungen stets der aktuelle Wert zur Verfügung steht.

## Was bisher geschah: Beispiel ohne Resource

Zur Einführung betrachten wir ein Szenario, das ganz klassisch und ohne die neue Resource API implementiert wird.

Wir wollen in einer Komponente eine Liste von Büchern anzeigen, die per HTTP von einem Server geladen wird.
Der dazu passende `BookStoreService` existiert bereits und wird per Dependency Injection angefordert. Die Methode `getAll()` im Service nutzt den `HttpClient` von Angular und gibt ein Observable zurück.

In der Komponente benötigen wir ein Property `books`, das die Daten zwischenspeichert, um sie im Template anzuzeigen.
Das Property wird ganz zeitgemäß mit einem Signal initialisiert.
Im Konstruktor subscriben wir auf das von `getAll()` erzeugte Observable. Sobald die Buchliste vom Server eingetroffen ist, schreiben wir die Daten in das Signal `books`.

```ts
@Component({ /* ... */ })
export class BookListComponent {
  private bs = inject(BookStoreService);
  books = signal<Book[]>([]);

  constructor() {
    this.bs.getAll().subscribe(receivedBooks => {
      this.books.set(receivedBooks);
    });
  }
}
```

In der Regel wird es aber nicht bei diesem einfachen Szenario bleiben, sondern weitere Anforderungen kommen hinzu:

- **Auf Knopfdruck soll die Buchliste neu geladen werden.** Dazu müssen wir in einer neuen Methode (z. B. `reloadList()`) den HTTP-Request erneut starten, subscriben, usw. – und somit den Code aus dem Konstruktor duplizieren.
- **Es sollen keine parallelen Requests ausgeführt werden.** Wenn die Daten neu geladen werden sollen, während noch ein vorheriger Request läuft, soll dieser abgebrochen werden.
- **Es soll ein Ladeindikator angezeigt werden.** Dafür könnten wir ein Property `loading` einführen, das wir an den richtigen Stellen im Code auf `true` oder `false` setzen, um den Zustand zu erfassen.
- **Die Daten sollen lokal verändert/überschrieben werden.** Dazu können wir zwar das Signal mit einem neuen Wert setzen – wir wissen aber anschließend nicht mehr, ob der aktuelle Wert lokal gesetzt oder vom Server geladen wurde.

All diese Aspekte lassen sich selbstverständlich mit moderatem Aufwand implementieren – aber wir müssen immer wieder ähnliche Schritte unternehmen, um zum Ziel zu kommen.
Anstatt auf imperativen Stil zu setzen, wie in unserem Beispiel, können wir auch die Möglichkeiten der Bibliothek RxJS nutzen. Der Kern des Problems bleibt aber erhalten: Es ist vergleichsweise viel Aufwand nötig, um wiederkehrende alltägliche Aufgaben umzusetzen.

Die neue Resource API soll diese Lücke schließen!

## Die neue Resource API

Eine Resource repräsentiert einen Datensatz, der mithilfe eines Loaders geladen wird.
Zur Initialisierung verwenden wir die Funktion `resource()`.
Der hier übergebene Loader ist eine Funktion, die das asynchrone Laden der Daten durchführt.
Dieser Loader wird übrigens sofort ausgeführt, sobald die Resource initialisiert wird.

In der Dokumentation wird die Resource wie folgt beschrieben:

> A Resource is an asynchronous dependency (for example, the results of an API call) that is managed and delivered through signals.
> [It] projects a reactive request to an asynchronous operation defined by a loader function, which exposes the result of the loading operation via signals.

```ts
import { resource } from '@angular/core';
// ...

myResource = resource({
  loader: () => /* Daten laden */
});
```

Überraschenderweise muss der Loader immer eine Promise zurückgeben! Grundsätzlich spricht zwar nichts dagegen, dieses native Modell des Browsers zu verwenden. In der Vergangenheit hat Angular aber stets auf Observables gesetzt, um asynchrone Operationen durchzuführen.
Angular bricht hier also bewährte Prinzipien und setzt stattdessen auf das native Konstrukt des Browsers.

Um mit der Resource also einen HTTP-Request durchzuführen, gibt es drei Möglichkeiten:

- 1.) Wir verwenden einen HTTP-Client, der Promises zurückgibt, z. B. das native `fetch()` oder die Bibliothek `axios`.
- 2.) Wir verwenden die Funktion `firstValueFrom()` aus der Bibliothek RxJS. Sie wandelt ein Observable in eine Promise um, die das erste Element des Datenstroms ausgibt.
- 3.) Wir verwenden eine `rxResource`, die ein Observable als Loader verwendet. Dazu später mehr!



### Variante 1: Fetch API und Promise

Im `BookStoreService` verwenden wir die native Fetch API, sodass die Methode `getAll()` eine Promise zurückgibt. Im Loader können wir diese Promise direkt verwenden.

```ts
@Injectable({ /* ... */ })
export class BookStoreService {
  // ...
  getAll(): Promise<Book[]> {
    return fetch(this.apiUrl + '/books')
      .then(res => res.json()) as Promise<Book[]>
  }
}
```

```ts
// Komponente
booksResource = resource({
  loader: () => this.bs.getAll()
});
```


### Variante 2: Angulars `HttpClient` und Observable

Wir verwenden wir üblich den `HttpClient` von Angular, sodass die Methode `getAll()` ein Observable zurückgibt.
Um den Loader zu definieren, müssen wir das Observable mithilfe von `firstValueFrom()` in eine Promise umwandeln.

```ts
@Injectable({ /* ... */ })
export class BookStoreService {
  // ...
  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl + '/books');
  }
}
```

```ts
// Komponente
booksResource = resource({
  loader: () => firstValueFrom(this.bs.getAll())
});
```


## Auf die Daten zugreifen

Der Loader wird sofort ausgeführt, sobald das Resource-Objekt initialisiert wird. Die Resource verarbeitet die Antwort und bietet folgende Signals an, um mit den Daten zu arbeiten:

- `value`: geladene Daten, hier `Book[]`
- `status`: Zustand der Resource vom Typ `ResourceStatus`, z. B. *Resolved* oder *Idle*, siehe nächster Abschnitt
- `error`: Fehler

Die geladenen Bücher können wir also wir folgt im Template anzeigen:

```html
{{ booksResource.value() | json }}

@for(book of booksResource.value(); track book.isbn) {
  <p>{{ book.title }}</p>
}
```

## Status der Resource

Mithilfe des Signals `status` können wir den Zustand der Resource auswerten, z. B. um einen Ladeindikator anzuzeigen. Alle Werte von `status` sind Felder aus dem [Enum `ResourceStatus`](https://next.angular.dev/api/core/ResourceStatus):

| Status aus `ResourceStatus` | Beschreibung                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `Idle`                      | Es ist kein Request definiert und es wird nichts geladen. `value()` ist `undefined`. |
| `Error`                     | Das Laden ist fehlgeschlagen. `value()` ist `undefined`.                             |
| `Loading`                   | Die Resource lädt gerade.                                                            |
| `Reloading`                 | Die Resource lädt gerade neu, nachdem das Neuladen angefordert wurde.                |
| `Resolved`                  | Das Laden ist abgeschlossen.                                                         |
| `Local`                     | Der Wert wurde lokal überschrieben.                                                  |

Für einen Ladeindikator können wir z. B. so vorgehen und ein Computed Signal verwenden, das den Zustand auswertet und ein Boolean bereitstellt:

```ts
import { resource, computed, ResourceStatus } from '@angular/core';
// ...

isLoading = computed(() => {
  return [ResourceStatus.Loading, ResourceStatus.Reloading]
    .includes(this.booksResource.status())
  });
```

```html
@if (isLoading()) {
  <div>LOADING</div>
}
```

## Resource neuladen

Eine Resource besitzt die Methode `reload()`.
Beim Aufruf wird intern die Loader-Funktion erneut ausgeführt und die Daten neu geladen.
Das Ergebnis steht nach erfolgreichem Neuladen automatisch im Signal `value` zur Verfügung.

```html
<button (click)="reloadList()">Reload book list</button>
```

```ts
@Component({ /* ... */ })
export class BookListComponent {
  booksResource = resource({ /* ... */ });

  reloadList() {
    this.booksResource.reload();
  }
}
```

Freundlicherweise kümmert sich die Resource automatisch darum, dass immer nur ein einziger Request gleichzeitig ausgeführt wird.
Das Neuladen ist erst möglich, wenn das vorherige Laden abgeschlossen ist.


## Wert lokal überschreiben

Die Resource bietet die Möglichkeit, den Wert lokal zu überschreiben.
Das Signal `value` ist ein `WritableSignal` und bietet die bekannten Methoden `set()` und `update()` an.

Wir wollen die Buchliste lokal sortieren, z. B. auf Knopfdruck mit Sortierung nach dem Rating der Bücher.
In der Methode können wir nach erfolgter Sortierung den Wert des Signals `value` direkt überschreiben.


```ts
@Component({ /* ... */ })
export class BookListComponent {
  booksResource = resource({ /* ... */ });

  sortBookListLocally() {
    const currentBookList = this.booksResource.value();

    if (currentBookList) {
      const sortedList = [...currentBookList].sort((a, b) => b.rating - a.rating);
      this.booksResource.value.set(sortedList);
    }
  }
}
```

Wir möchten auf zwei Besonderheiten in diesem Code hinweisen:

- Das Signal `value` liefert den Typ `T | undefined`, in unserem Fall also `Book[] | undefined`. Solange die Daten noch nicht geladen wurden, ist der Wert also `undefined`. Deshalb ist hier eine Prüfung nötig, ob `currentBookList` überhaupt existiert. Es wäre wünschenswert, wenn man der Resource einen Startwert übergeben kann, sodass `undefined` entfällt.
- Die Methode `Array.sort()` mutiert das Array! Um die Immutability zu wahren, nutzen wir zunächst den Spread Operator, um eine Kopie des Arrays zu erzeugen, die wir anschließend gefahrlos sortieren können.


## `request`: Loader mit Parameter

Unsere Anwendung soll eine Detailseite besitzen, auf der immer genau ein Buch angezeigt wird.
Für den HTTP-Request muss also die Information übergeben werden, welches Buch jeweils geladen werden soll.
Beim Wechsel auf eine andere Detailseite soll das Laden erneut angestoßen werden – aber für ein anderes Buch.

Der Loader muss also mit Parametern arbeiten können.
Dazu gehen wir davon aus, dass die Komponente ein Input Property `isbn` besitzt, über das die aktuelle ISBN stets verfügbar ist.

Im Loader könnten wir nun das Signal `this.isbn` verwenden, um die ISBN an den Service zu übergeben:

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  isbn = input.required<string>();

  bookResource = resource({
    loader: () => this.bs.getSingle(this.isbn())
  });
}
```

Dieser Code funktioniert grundlegend – aber nur ein einziges Mal! Die Loader-Funktion ist *untracked*. Das bedeutet, dass der Loader bei einer Änderung der darin verwendeten Signals nicht erneut ausgeführt wird (wie es bei `effect()` oder `computed()` der Fall wäre).

Um dieses Problem zu lösen, können wir das Property `request` verwenden: Hier übergeben wir ein Signal. Immer wenn dieses Signal seinen Wert ändert, wird der Loader automatisch neu ausgeführt.

Der Request stellt also die Parameter bereit, mit denen der Loader ausgeführt wird.

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  isbn = input.required<string>();

  bookResource = resource({
    request: this.isbn,
    loader: () => this.bs.getSingle(this.isbn())
  });
}
```

Um den Loader nun etwas generischer und wiederverwendbarer zu gestalten, können wir auf die direkte Verwendung von `this.isbn()` verzichten.
Der Rückgabewert von `request` wird praktischerweise als Argument an die Loader-Funktion übergeben.
Auf diese Weise könnte man den Loader auch in eine separate Funktion auslagern und in anderen Resources erneut einsetzen.

Der Loader erhält automatisch ein Argument vom Typ `ResourceLoaderParams`, das ein Property `request` besitzt. Darin befindet sich in unserem Beispiel die ISBN, die vom Request zurückgegeben wird.

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  isbn = input.required<string>();

  bookResource = resource({
    request: this.isbn,
    loader: ({ request }) => this.bs.getSingle(request)
  });
}
```

> **Routenparameter mit Component Input Binding:** Damit das Input Property `isbn` automatisch mit der aktuellen ISBN aus dem Routenparameter befüllt wird, können wir die Funktionalität [*Component Input Binding*](https://netbasal.com/binding-router-information-to-routed-component-inputs-in-angular-78ee92f63e64) des Routers nutzen.


## `rxResource`: Resource mit Observables

In allen bisherigen Beispielen haben wir die Loader-Funktion mithilfe von Promises implementiert. Die Fetch API des Browsers gibt eine Promise zurück, und die Funktion `firstValueFrom()` aus der Bibliothek RxJS hat uns geholfen, eine Promise aus dem Observable zu erstellen, das der `HttpClient` von Angular erzeugt.

Auch wenn Angular durch die Einführung von Signals an vielen Stellen nicht mehr direkt auf Observables setzt, haben die Möglichkeiten der reaktiven Programmierung mit RxJS für viele Szenarien weiterhin ihre Berechtigung.
Angular bietet deshalb die Funktion `rxResource` an. Sie funktioniert genauso wie `resource`, die Loader-Funktion gibt allerdings ein Observable zurück.
Wir können die Observables aus dem `HttpClient` auf diese Weise also direkt verwenden.

```ts
@Injectable({ /* ... */ })
export class BookStoreService {
  // ...
  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl + '/books');
  }
}
```

```ts
import { rxResource } from '@angular/core/rxjs-interop';
// ...

booksResource = rxResource({
  loader: () => this.bs.getAll()
});
```

## Laufende Requests abbrechen

Die Resource bietet die Möglichkeit, einen laufenden Request abzubrechen, sobald ein neuer gestartet wird.
Besonders bei Loadern mit Parameter (in unserem Beispiel die ISBN auf der Detailseite) ist es wichtig, dass nur der zuletzt angefragte Datensatz verarbeitet wird.

Die `rxResource` kümmert sich freundlicherweise komplett eigenständig um diese Mechanik, denn ein Observable bietet eine direkte Schnittstelle, um den Request wieder zu beenden.

Für einen Loader auf Basis von Promises ist das Beenden etwas komplizierter.
Der Loader erhält in seinem Parameter-Objekt auch ein sogenanntes `AbortSignal`.
Das ist ein natives Objekt des Browsers, das Auskunft gibt, wann der Request beendet werden soll.

Zusammen mit der nativen Fetch API lässt sich dieses Objekt direkt verwenden.
Liegt in `this.isbn` eine neue ISBN vor, während der Loader noch lädt, wird der laufende Fetch Request abgebrochen.

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  isbn = input.required<string>();

  bookResource = resource({
    request: this.isbn,
    loader: ({ abortSignal }) => fetch(
      detailsUrl + '/' + this.isbn(),
      signal: abortSignal
    )
  });
}
```

Nutzen wir den `HttpClient` von Angular und die Funktion `firstValueFrom`, ist das Beenden sehr umständlich – wir müssten das `AbortSignal` in ein Observable umwandeln, um den Operator `takeUntil` zum Beenden des Datenstroms einzusetzen. In diesem Fall empfehlen wir unbedingt, die `rxResource` zu verwenden.



## Fazit

Mit der neuen Resource API bietet Angular eine intuitive und gut integrierte Schnittstelle an, um Daten vom Server zu laden.
Anwendungsfälle, die über einen einfachen HTTP-Request hinausgehen, insbesondere wiederholtes Laden und Anzeige eines Ladeindikators, können mit der Resource schnell umgesetzt werden.
Bisher war dafür viel manueller Aufwand nötig.

Damit macht Angular einen weiteren Schritt, um Signals im Framework zu etablieren. Die Notwendigkeit, RxJS und Observables für einfache Aufgaben zu verwenden, wird weiter reduziert.

Die Resource API ist in Angular 19 ein experimenteller Baustein! Die Schnittstelle und das Verhalten können sich noch ändern, und es können Bugs auftreten.
Probieren Sie das neue Tool bitte trotzdem aus! Das Feedback aus der Community ist wichtig, um die Schnittstelle vor dem finalen Release noch weiter zu verbessern.

Fraglich ist, welche Rolle der `HttpClient` von Angular in Zukunft spielen wird. Mit dem Einsatz von Promises ermutigt Angular, für HTTP-Kommunikation auf die native Fetch API zu setzen. Wünschenswert wäre, dass der `HttpClient` und die neue Resource nahtlos miteinander arbeiten. Denkbar wäre beispielsweise, dass der `HttpClient` direkt eine Resource zurückgibt, ohne den sichtbaren Umweg über ein Observable oder eine Promise zu gehen.
Die neue Schnittstelle ist aber aus unserer Sicht eine gute Basis – und wir sind gespannt, was in Zukunft folgt!


<hr>

<small>**Titelbild:** Foto von <a href="https://unsplash.com/de/@thepaintedsquarejessica">Jessica Lewis 🦋 thepaintedsquare</a> auf <a href="https://unsplash.com/de/fotos/geschnittene-erdbeeren-auf-blaugrunem-keramikteller-15nvaBz_doc">Unsplash</a> (bearbeitet)
  </small>
