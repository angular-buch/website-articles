---
title: 'Angular 19 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2024-11-XX
lastModified: 2024-11-XX
keywords:
  - Angular
  - Angular 19
language: de
thumbnail: angular19.jpg
sticky: true
hidden: true
---



## Resource API

Mit Angular 19 wurde die *experimentelle* Resource API vorgestellt.
Damit können wir intuitiv Daten laden und in Komponenten verarbeiten.
Eine Resource repräsentiert einen Datensatz, der asynchron geladen wird, in der Regel per HTTP.
Die Resource bietet eine Schnittstelle an, um die Daten zu verarbeiten, neuzuladen und sogar manuell zu überschreiben.

> Wir erläutern die Resource API ausführlich in einem separaten Blogpost:
> **[Die neue Resource API von Angular](/blog/2024-10-resource-api/)**

Eine Resource wird mit der Funktion `resource` und einer Loader-Funktion initialisiert.
Dieser Loader ist dafür verantwortlich, die Daten asynchron zu laden. Die Funktion muss immer eine Promise zurückgeben, weshalb wir hier zunächst die native Fetch API verwenden und nicht den `HttpClient` von Angular:

```ts
import { resource } from '@angular/core';
// ...

booksResource = resource({
  loader: () => fetch(this.apiUrl + '/books').then(res => res.json()) as Promise<Book[]>
});
```

Alternativ können wir auch wie üblich den `HttpClient` einsetzen und das Observable mithilfe der Funktion `firstValueFrom` in eine Promise umwandeln:

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
import { firstValueFrom } from 'rxjs';
// ...

booksResource = resource({
  loader: () => firstValueFrom(this.bs.getAll())
});
```

Der Loader wird automatisch ausgeführt, sobald die Resource initialisiert wird.
Um mit den Daten zu arbeiten, bietet die Resource drei Signals an: `value` enthält stets die Daten, `status` gibt Auskunft zum Zustand der Resource, und `error` enthält Fehler.
Mithilfe von `booksResource.value()` können wir die Daten also in der Komponente anzeigen:

```html
{{ booksResource.value() | json }}

@for(book of booksResource.value(); track book.isbn) {
  <p>{{ book.title }}</p>
}
```

Gegenüber einem einfachen HTTP-Request bietet die Resource einige besondere Features.
Der Zustand der Resource erlaubt es uns, einen Ladeindikator anzuzeigen.
Dafür bietet das Objekt sogar ein eigenes Signal `isLoading()` an:

```html
@if (booksResource.isLoading()) {
  <div>LOADING</div>
}
```

Eine Resource kann jederzeit neugeladen werden. Der Loader wird beim Aufruf der Methode `reload()` erneut ausgeführt, und die geladenen Daten stehen anschließend in `value` zur Verfügung:

```ts
@Component({ /* ... */ })
export class BookListComponent {
  booksResource = resource({ /* ... */ });

  reloadList() {
    this.booksResource.reload();
  }
}
```

Außerdem kann der Wert einer Resource jederzeit manuell überschrieben werden.
Dafür bietet das Signal `value` die bekannten Methoden `set()` und `update()` an.
Mit einem Observable oder einem Signal, das durch `toSignal()` aus einem Observable erstellt wurde, wäre das nicht so einfach möglich.

```ts
clearBookList() {
  this.booksResource.value.set([]);
}
```

Die Loader-Funktion kann Parameter verarbeiten. Das ist sinnvoll, wenn der HTTP-Request weitere Informationen benötigt, z. B. die ID des zu ladenden Datensatzes.
Dafür können wir in der Resource optional einen `request` definieren: Dieses Signal dient als Trigger für die Loader-Funktion.
Immer wenn sich der Wert ändert, wird der Loader neu ausgeführt.
Der Wert des `request`-Signals steht dann als Argument in der Loader-Funktion zur Verfügung.

Im folgenden Beispiel erhält die Komponente eine ISBN per Input-Property.
Immer wenn sich die ISBN ändert, wird der HTTP-Request für das dazugehörige Buch neu ausgeführt.

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  private bs = inject(BookStoreService);
  isbn = input.required<string>();

  bookResource = resource({
    request: this.isbn,
    loader: ({ request }) => this.bs.getSingle(request)
  });
}
```

Für die Kompatibilität mit Observables aus der Bibliothek RxJS bietet Angular die sogenannte `rxResource` an.
Sie funktioniert wie `resource`, aber die Loader-Funktion gibt ein Observable zurück.
Auf diese Weise können wir Observables aus dem `HttpClient` direkt verwenden, ohne Umweg über eine Promise:

```ts
import { rxResource } from '@angular/core/rxjs-interop';
// ...

booksResource = rxResource({
  loader: () => this.bs.getAll()
});
```


Bitte beachten Sie, dass die Resource API experimentell ist und sich die Schnittstelle vor dem finalen Release noch ändern könnte.



## Linked Signals

Ein weiteres *experimentelles* Feature von Angular 19 ist das Linked Signal.
Es handelt sich um ein Signal, das seinen Wert automatisch auf Basis anderer Signals berechnet – ähnlich wie ein Computed Signal mit `computed()`.
Der Unterschied: Der Wert eines Linked Signals kann jederzeit mit den Methoden `set()` und `update()` von außen überschrieben werden, so wie wir es von `signal()` kennen.
Ein Linked Signal vereint also das Beste aus beiden Welten, wie der folgende Vergleich zeigt:

```ts
import { linkedSignal } from '@angular/core';

timestampMs = signal(Date.now());

// Wert des Signals kann überschrieben werden
timestampMs.set(Date.now());
timestampMs.update(ms => ms + 1000);

// computed(): Signal (nicht schreibbar)
const timestampSeconds = computed(() => timestampMs() / 1000);
timestampSeconds.set(0); // ❌ Compilation Error

// linkedSignal(): WritableSignal (schreibbar)
const timestampSecondsLinked = linkedSignal(() => timestampMs() / 1000);
timestampSecondsLinked.set(0); // ✅ funktioniert
```

Wir können alternativ eine ausführlichere Schreibweise wählen: In einem Optionsobjekt übergeben wir dazu `source` und `computation`.
Der aktuelle Wert des Signals in `source` wird als Argument an die Computation Function übergeben.
Welche Schreibweise zu wählen ist, hängt vom Anwendungsfall und Geschmack ab, beide Implementierungen von `timestampSecondsLinked` führen zum gleichen Ergebnis.

```ts
const timestampMs = signal(Date.now());

const timestampSecondsLinked = linkedSignal({
  source: timestampMs,
  computation: ms => ms / 1000
});
```

Ein Linked Signal ist besonders nützlich, wenn lokaler State mit dynamisch geladenen Daten synchronisiert werden soll.
Das Signal berechnet seinen Wert aus einer Quelle, z. B. ein Component Input oder ein HTTP-Request, die Komponente kann das Signal aber weiterhin selbst mit Werten überschreiben.

> Wir stellen das Linked Signal ausführlich in einem separaten Blogpost vor. Dort finden Sie mehrere praktsiche Anwendungsfälle für `linkedSignal()`:
> **[Angular 19: Introducing Linked Signal for Responsive Local State Management](https://angular.schule/blog/2024-11-linked-signal)**



<hr>


Wir wünschen Ihnen viel Spaß mit Angular 19!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Cala Paquita, Mallorca, Spanien. Foto von Tom Torgau</small>
