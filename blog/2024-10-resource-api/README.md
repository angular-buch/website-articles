---
title: 'Reactive Angular: Daten laden mit der Resource API'
author: Ferdinand Malcher
mail: ferdinand@malcher.media
published: 2024-10-29
lastModified: 2025-06-18
keywords:
  - Resource API
  - Promise
  - Observable
  - resource
  - rxResource
  - Fetch API
language: de
header: header-resource-api.jpg
---

Eine interessante Neuerung in Angular ist die *Resource API*. Damit können wir intuitiv Daten laden und in Komponenten verarbeiten.
In diesem Blogartikel stellen wir die Ideen der neuen Schnittstelle vor.

Eine Resource repräsentiert einen Datensatz, der asynchron geladen wird. Dabei geht es in der Regel um HTTP-Requests, die Daten von einem Server abrufen. Die Resource geht allerdings einen Schritt weiter als nur einen einfachen HTTP-Request auszuführen: Die Daten können jederzeit neu geladen oder sogar manuell überschrieben werden. Außerdem bietet die Resource eigenständig Informationen zum Ladestatus an. Alle Informationen und Daten werden als Signals ausgegeben, sodass bei Änderungen stets der aktuelle Wert zur Verfügung steht.

> **🇬🇧 This article is available in English language here: [Reactive Angular: Loading Data with the Resource API](https://angular.schule/blog/2025-05-resource-api)**


## Was bisher geschah: Beispiel ohne Resource

Zur Einführung betrachten wir ein Szenario, das ganz klassisch und ohne die neue Resource API implementiert wird.

Wir wollen in einer Komponente eine Liste von Büchern anzeigen, die per HTTP von einem Server geladen wird.
Der dazu passende Service `BookStore` existiert bereits und wird per Dependency Injection angefordert. Die Methode `getAll()` im Service nutzt den `HttpClient` von Angular und gibt ein Observable zurück.

In der Komponente benötigen wir ein Property `books`, das die Daten zwischenspeichert, um sie im Template anzuzeigen.
Das Property wird ganz zeitgemäß mit einem Signal initialisiert.
Im Konstruktor subscriben wir auf das von `getAll()` erzeugte Observable. Sobald die Buchliste vom Server eingetroffen ist, schreiben wir die Daten in das Signal `books`.

```ts
@Component({ /* ... */ })
export class BookList {
  #bs = inject(BookStore);
  books = signal<Book[]>([]);

  constructor() {
    this.#bs.getAll().subscribe(receivedBooks => {
      this.books.set(receivedBooks);
    });
  }
}
```

In der Regel wird es aber nicht bei diesem einfachen Szenario bleiben, sondern weitere Anforderungen kommen hinzu:

- **Auf Knopfdruck soll die Buchliste neu geladen werden.** Dazu müssen wir in einer neuen Methode (z. B. `reloadList()`) den HTTP-Request erneut starten, subscriben, usw. – und somit den Code aus dem Konstruktor duplizieren.
- **Es sollen keine parallelen Requests ausgeführt werden.** Wenn die Daten neu geladen werden sollen, während noch ein vorheriger Request läuft, soll dieser entweder abgebrochen werden oder der neue Request soll ignoriert werden.
- **Es soll ein Ladeindikator angezeigt werden.** Dafür könnten wir ein Property `loading` einführen, das wir an den richtigen Stellen im Code auf `true` oder `false` setzen, um den Zustand zu erfassen.
- **Die Daten sollen lokal verändert/überschrieben werden.** Dazu können wir zwar das Signal mit einem neuen Wert setzen – wir wissen aber anschließend nicht mehr, ob der aktuelle Wert lokal gesetzt oder vom Server geladen wurde.
- **Die Subscription soll beendet werden, wenn die Komponente zerstört wird.** Dafür können wir z. B. den Operator [`takeUntilDestroyed()`](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed) verwenden oder auf eine andere Lösung mithilfe von RxJS zurückgreifen.

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

Interessanterweise erwartet der Loader zwingend eine Promise als Rückgabewert. Grundsätzlich spricht zwar nichts dagegen, dieses native Modell des Browsers zu verwenden. Bisher wurden jedoch in Angular bei asynchronen Operationen üblicherweise Observables und die Bibliothek RxJS eingesetzt.
Angular bricht hier also bewährte Prinzipien und setzt stattdessen auf das native Konstrukt des Browsers.

Um mit der Resource also einen HTTP-Request durchzuführen, gibt es drei Möglichkeiten:

- 1.) Wir verwenden einen HTTP-Client, der Promises zurückgibt, z. B. das native `fetch()` oder die Bibliothek `axios`.
- 2.) Wir verwenden die Funktion `firstValueFrom()` aus der Bibliothek RxJS. Sie wandelt ein Observable in eine Promise um, die das erste Element des Datenstroms ausgibt.
- 3.) Wir verwenden eine `rxResource`, die ein Observable als Loader verwendet. Dazu später mehr!



### Variante 1: Promises und die native Fetch API

Im `BookStore` verwenden wir die native Fetch API, sodass die Methode `getAll()` eine Promise zurückgibt. Im Loader können wir diese Promise direkt verwenden.

```ts
@Injectable({ /* ... */ })
export class BookStore {
  // ...
  getAll(): Promise<Book[]> {
    return fetch(this.apiUrl + '/books').then(res => res.json());
  }
}
```

```ts
// Komponente
booksResource = resource({
  loader: () => this.#bs.getAll()
});
```


### Variante 2: Observables und der `HttpClient` von Angular

Wir verwenden wie üblich den `HttpClient` von Angular, sodass die Methode `getAll()` ein Observable zurückgibt.
Um den Loader zu definieren, müssen wir das Observable mithilfe von `firstValueFrom()` in eine Promise umwandeln.

```ts
@Injectable({ /* ... */ })
export class BookStore {
  // ...
  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl + '/books');
  }
}
```

```ts
// Komponente
booksResource = resource({
  loader: () => firstValueFrom(this.#bs.getAll())
});
```


## Auf die Daten zugreifen

Der Loader wird sofort ausgeführt, sobald das Resource-Objekt initialisiert wird. Die Resource verarbeitet die Antwort und bietet folgende Signals an, um mit den Daten zu arbeiten:

- `value`: geladene Daten, hier `Book[]`
- `status`: Zustand der Resource vom Typ `ResourceStatus`, z. B. `resolved` oder `loading`, siehe nächster Abschnitt
- `error`: Fehler

Die geladenen Bücher können wir also wir folgt im Template anzeigen:

```html
{{ booksResource.value() | json }}

@for(book of booksResource.value(); track book.isbn) {
  <p>{{ book.title }}</p>
}
```

## Status der Resource

Mithilfe des Signals `status` können wir den Zustand der Resource auswerten, z. B. um einen Ladeindikator anzuzeigen. Alle Werte von `status` sind Teile des [Union Types `ResourceStatus`](https://angular.dev/api/core/ResourceStatus):

| Status aus `ResourceStatus` | Beschreibung                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `idle`                      | Es sind keine Parameter definiert und es wird nichts geladen. `value()` ist `undefined`. |
| `error`                     | Das Laden ist fehlgeschlagen. `value()` ist `undefined`.                             |
| `loading`                   | Die Resource lädt gerade.                                                            |
| `reloading`                 | Die Resource lädt gerade neu, nachdem das Neuladen mit `reload()` angefordert wurde.                |
| `resolved`                  | Das Laden ist abgeschlossen.                                                         |
| `local`                     | Der Wert wurde lokal überschrieben.                                                  |


Für einen Ladeindikator könnten wir den Zustand z. B. in einem Computed Signal verarbeiten und ein Boolean zurückgeben, wenn die Resource gerade lädt:

```ts
import { resource, computed, ResourceStatus } from '@angular/core';
// ...

isLoading = computed(() => this.booksResource.status() === 'loading');
```

```html
@if (isLoading()) {
  <div>LOADING</div>
}
```

Damit alle Fälle erfasst werden, müssen wir hier aber auch den Zustand `reloading` berücksichtigen.
Mit dem mitgelieferten Property `isLoading` ist das schnell gelöst: Dieses Signal gibt `true` aus, wenn sich die Resource im Zustand `loading` oder `reloading` befindet:

```html
@if (booksResource.isLoading()) {
  <div>LOADING</div>
}
```



## Resource neu laden

Eine Resource besitzt die Methode `reload()`.
Beim Aufruf wird intern die Loader-Funktion erneut ausgeführt, und die Daten werden neu geladen.
Das Ergebnis steht anschließend wieder im Signal `value` zur Verfügung.

```html
<button (click)="reloadList()">Reload book list</button>
```

```ts
@Component({ /* ... */ })
export class BookList {
  booksResource = resource({ /* ... */ });

  reloadList() {
    this.booksResource.reload();
  }
}
```

Die Resource stellt sicher, dass stets nur ein einziger Request gleichzeitig ausgeführt wird.
Das Neuladen ist erst möglich, wenn der vorherige Ladevorgang abgeschlossen ist.
Dieses Verhalten kann man im [Quellcode von Angular](https://github.com/angular/angular/blob/20.0.0/packages/core/src/resource/resource.ts#L294-L296) gut nachvollziehen.


## Wert lokal überschreiben

Die Resource bietet die Möglichkeit, den Wert lokal zu überschreiben.
Das Signal `value` ist ein `WritableSignal` und bietet die bekannten Methoden `set()` und `update()` an.

Wir wollen die Buchliste lokal sortieren, z. B. auf Knopfdruck mit Sortierung nach dem Rating der Bücher.
In der Methode können wir nach erfolgter Sortierung den Wert des Signals `value` direkt überschreiben.


```ts
@Component({ /* ... */ })
export class BookList {
  booksResource = resource({ /* ... */ });

  sortBookListLocally() {
    const currentBookList = this.booksResource.value();

    if (currentBookList) {
      const sortedList = currentBookList.toSorted((a, b) => b.rating - a.rating);
      this.booksResource.value.set(sortedList);
    }
  }
}
```

Wir möchten auf zwei Besonderheiten in diesem Code hinweisen:

- Das Signal `value` liefert den Typ `T | undefined`, in unserem Fall also `Book[] | undefined`. Solange die Daten noch nicht geladen wurden, ist der Wert also `undefined`. Deshalb ist hier eine Prüfung nötig, ob `currentBookList` überhaupt existiert. Alternativ können wir mit der Option `defaultValue` einen Startwert übergeben, um dieses Verhalten zu ändern.
- Anstelle von `Array.sort()` verwenden wir die neue Methode `Array.toSorted()`, die das Array unverändert lässt und eine sortierte Kopie zurückgibt. So bleibt die Immutability gewahrt. `toSorted()` kann nur verwendet werden, wenn die Option `lib` in der `tsconfig.json` mindestens den Eintrag `ES2023` enthält – aktuell ist das in neuen Angular-Projekten noch nicht der Fall.


## `params`: Loader mit Parameter

Unsere Anwendung soll eine Detailseite besitzen, auf der immer genau ein Buch angezeigt wird.
Für den HTTP-Request muss also die Information übergeben werden, welches Buch jeweils geladen werden soll.
Beim Wechsel auf eine andere Detailseite soll das Laden erneut angestoßen werden – aber für ein anderes Buch.

Der Loader muss also mit Parametern arbeiten können.
Dazu gehen wir davon aus, dass die Komponente ein Input-Property `isbn` besitzt, über das die aktuelle ISBN stets verfügbar ist.

Im Loader könnten wir nun das Signal `this.isbn` verwenden, um die ISBN an den Service zu übergeben:

```ts
@Component({ /* ... */ })
export class BookDetails {
  #bs = inject(BookStore);
  readonly isbn = input.required<string>();

  bookResource = resource({
    // ACHTUNG: Wird nur einmalig ausgeführt!
    loader: () => this.#bs.getSingle(this.isbn())
  });
}
```

Dieser Code funktioniert grundlegend – aber nur ein einziges Mal! Die Loader-Funktion ist *untracked*. Das bedeutet, dass der Loader bei einer Änderung der darin verwendeten Signals nicht erneut ausgeführt wird (wie es bei `effect()` oder `computed()` der Fall wäre).

Um dieses Problem zu lösen, können wir das Property `params` verwenden: Hier übergeben wir entweder ein Signal oder eine Funktion, in der Signals verwendet werden.
Immer wenn diese Signals ihren Wert ändern, wird der Loader automatisch neu ausgeführt.

Unter `params` stellen wir also die Parameter bereit, mit denen der Loader ausgeführt wird.

```ts
@Component({ /* ... */ })
export class BookDetails {
  #bs = inject(BookStore);
  readonly isbn = input.required<string>();

  bookResource = resource({
    params: this.isbn,
    // oder
    params: () => this.isbn(),
    loader: () => this.#bs.getSingle(this.isbn())
  });
}
```

Um den Loader nun etwas generischer und wiederverwendbarer zu gestalten, können wir auf die direkte Verwendung von `this.isbn()` verzichten.
Der Rückgabewert von `params` wird praktischerweise als Argument an die Loader-Funktion übergeben.
Auf diese Weise könnte man den Loader auch in eine separate Funktion auslagern und in anderen Resources erneut einsetzen.

Der Loader erhält automatisch ein Argument vom Typ `ResourceLoaderParams`, das ein Property `params` besitzt. Darin befindet sich in unserem Beispiel die ISBN, die von der Funktion `params` zurückgegeben wird.

```ts
@Component({ /* ... */ })
export class BookDetails {
  #bs = inject(BookStore);
  readonly isbn = input.required<string>();

  bookResource = resource({
    params: this.isbn,
    loader: ({ params }) => this.#bs.getSingle(params)
  });
}
```

> **Routenparameter mit Component Input Binding:** Damit das Input-Property `isbn` automatisch mit der aktuellen ISBN aus dem Routenparameter befüllt wird, können wir die Funktionalität [*Component Input Binding*](https://netbasal.com/binding-router-information-to-routed-component-inputs-in-angular-78ee92f63e64) des Routers nutzen.


## `rxResource`: Resource mit Observables

In allen bisherigen Beispielen haben wir die Loader-Funktion mithilfe von Promises implementiert. Die Fetch API des Browsers gibt eine Promise zurück, und die Funktion `firstValueFrom()` aus der Bibliothek RxJS hat uns geholfen, eine Promise aus dem Observable zu erstellen, das der `HttpClient` von Angular erzeugt.

Auch wenn Angular durch die Einführung von Signals an vielen Stellen nicht mehr direkt auf Observables setzt, haben die Möglichkeiten der reaktiven Programmierung mit RxJS für viele Szenarien weiterhin ihre Berechtigung.
Angular bietet deshalb die Funktion `rxResource` an. Sie funktioniert genauso wie `resource`, die Loader-Funktion gibt allerdings ein Observable zurück.
Wir können die Observables aus dem `HttpClient` auf diese Weise also direkt verwenden.

Da ein Observable unendlich viele Werte liefern *kann*, heißt das Property hier nicht `loader` sondern `stream`.

```ts
@Injectable({ /* ... */ })
export class BookStore {
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
  stream: () => this.#bs.getAll()
});
```

## Laufende Requests abbrechen

Die Resource bietet die Möglichkeit, einen laufenden Request abzubrechen, sobald ein neuer gestartet wird.
Besonders bei Loadern mit Parameter (in unserem Beispiel die ISBN auf der Detailseite) ist es wichtig, dass nur der zuletzt angefragte Datensatz verarbeitet wird.

Die `rxResource` verwaltet diese Mechanik ganz eigenständig, denn ein Observable stellt eine direkte Schnittstelle zum Abbrechen des Requests bereit.

Für einen Loader auf Basis von Promises ist das Beenden etwas komplizierter.
Der Loader erhält in seinem Parameter-Objekt auch ein sogenanntes `AbortSignal`.
Das ist ein natives Objekt des Browsers, das Auskunft gibt, wann der Request beendet werden soll.

Zusammen mit der nativen Fetch API lässt sich dieses Objekt direkt verwenden.
Liegt in `this.isbn` eine neue ISBN vor, während der Loader noch lädt, wird der laufende Fetch Request abgebrochen.

```ts
@Component({ /* ... */ })
export class BookDetails {
  #bs = inject(BookStore);
  readonly isbn = input.required<string>();

  bookResource = resource({
    params: this.isbn,
    loader: ({ abortSignal, params }) => fetch(
      detailsUrl + '/' + params,
      { signal: abortSignal }
    )
  });
}
```

Nutzen wir den `HttpClient` von Angular und die Funktion `firstValueFrom`, ist das Beenden sehr umständlich – wir müssten das `AbortSignal` in ein Observable umwandeln, um den Operator `takeUntil` zum Beenden des Datenstroms einzusetzen. In diesem Fall empfehlen wir unbedingt, die `rxResource` zu verwenden.

Übrigens sorgt die Resource auch dafür, dass beim Beenden der Komponente der laufende Request gestoppt wird.


## httpResource: Resource für HTTP-Requests

Im Frühjahr 2025 wurde eine weitere Variante der Resource vorgestellt: `httpResource`.
Sie nutzt unter der Haube den `HttpClient`, um direkt einen HTTP-Request zu stellen.
Es ist damit nicht mehr notwendig, den Loader selbständig zu formulieren – darum kümmert sich die Resource.

```ts
booksResource = httpResource<Book[]>(
  () => 'https://api.example.org/books',
  { defaultValue: [] }
);
```

Der Request muss mithilfe einer Funktion generiert werden.
Hintergrund ist, dass es sich dabei um einen *Reactive Context* handelt: Verwenden wir darin Signals, wird der Request automatisch neu ausgeführt, sobald eins der Signals seinen Wert ändert, ähnlich wie bei `params` in der Resource.
Weitere Details für den Request können in einem Optionsobjekt übergeben werden.

```ts
booksResource = httpResource<Book[]>(
  () => ({
    url: 'https://api.example.org/books',
    params: {
      search: 'Angular'
    }
  })
);
```

Bitte beachten Sie, dass eine Resource grundsätzlich nur dafür gedacht ist, Daten von einer Schnittstelle *abzurufen* und mit Signals bereitzustellen.
Schreibende Operationen wie Erstellen, Aktualisieren oder Löschen können mit einer Resource nicht abgebildet werden.
Dafür müssen wir weiterhin direkt den `HttpClient` verwenden.



## Fazit

Mit der neuen Resource API bietet Angular eine intuitive und gut integrierte Schnittstelle an, um Daten vom Server zu laden.
Anwendungsfälle, die über einen einfachen HTTP-Request hinausgehen, insbesondere wiederholtes Laden und Anzeige eines Ladeindikators, können mit der Resource schnell umgesetzt werden.
Bisher war dafür viel manueller Aufwand nötig.

Wir begrüßen, dass Angular hier ein häufiges Alltagsproblem adressiert. Die Lösung deckt die meisten Anwendungsfälle zuverlässig ab und sorgt für eine standardisierte Herangehensweise – nur bei Anforderungen, die über die gegebenen Funktionen hinausgehen, wird künftig eine eigene Implementierung notwendig sein.

Damit macht Angular einen weiteren Schritt, um Signals im Framework zu etablieren. Die Notwendigkeit, RxJS und Observables für einfache Aufgaben zu verwenden, wird weiter reduziert.

Die Resource API ist in Angular 19 ein experimenteller Baustein! Die Schnittstelle und das Verhalten können sich noch ändern, und es können Bugs auftreten.
Bitte probieren Sie das neue Tool trotzdem schon einmal aus! Das Feedback aus der Community ist wichtig, um die Schnittstelle vor dem finalen Release noch weiter zu verbessern.

Fraglich ist, welche Rolle der `HttpClient` von Angular in Zukunft spielen wird. Mit dem Einsatz von Promises ermutigt Angular, für HTTP-Kommunikation auf die native Fetch API zu setzen. Wünschenswert wäre, dass der `HttpClient` und die neue Resource nahtlos miteinander arbeiten. Denkbar wäre beispielsweise, dass der `HttpClient` direkt eine Resource zurückgibt, ohne den sichtbaren Umweg über ein Observable oder eine Promise zu gehen.
Die neue Schnittstelle ist aber aus unserer Sicht eine gute Basis – und wir sind gespannt, was in Zukunft folgt!


<hr>
<small>Vielen Dank an Johannes Hoppe und Danny Koppenhagen für Review und Feedback.</small>

<small>**Titelbild:** Foto von <a href="https://unsplash.com/de/@thepaintedsquarejessica">Jessica Lewis 🦋 thepaintedsquare</a> auf <a href="https://unsplash.com/de/fotos/geschnittene-erdbeeren-auf-blaugrunem-keramikteller-15nvaBz_doc">Unsplash</a> (bearbeitet)</small>
