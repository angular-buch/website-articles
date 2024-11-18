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
header: angular19.jpg
sticky: true
---

Neben grauen Herbsttagen hat der November in Sachen Angular einiges zu bieten: Am 19. November wurde die neue **Major-Version Angular 19* releaset!
Angular bringt mit der Resource API und dem Linked Signal einige neue Features mit. Standalone Components müssen außerdem nicht mehr explizit als solche markiert werden.
Wir stellen in diesem Blogpost alle wichtigen Neuerungen vor.

Im offiziellen [Angular-Blog](TODO) finden Sie alle offiziellen Informationen direkt vom Angular-Team.

Für die Migration auf Angular 19 empfehlen wir, den Befehl `ng update` zu nutzen.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).


## Standalone Components: gekommen um zu bleiben

Standalone Components wurden mit Angular 15 eingeführt und haben sich seitdem zum Standard bei der Komponentenentwicklung mit Angular etabliert.
NgModules werden damit vollständig optional.
Ab Angular 19 ist es nicht mehr notwendig, eine Standalone Component explizit als solche zu markieren. Das Flag `standalone: true` in den Metadaten der Komponente entfällt, denn der neue Standardwert ist `true`:

```ts
// vor Angular 19
@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  standalone: true,
  imports: []
})
export class MyComponent {}
```

```ts
// ab Angular 19
@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
  imports: []
})
export class MyComponent {}
```

Modulbasierte Komponenten müssen nun explizit mit `standalone: false` markiert werden.
Eine automatische Migration beim Update mit `ng update` sorgt dafür, dass das Feld `standalone` korrekt gesetzt wird.

Wir empfehlen unbedingt, durchgehend auf Standalone Components zu setzen und NgModules nur noch in Ausnahmefällen zu verwenden, wenn es für die Kompatibilität nötig ist.

Übrigens: Mit Angular 19 wurde eine neue Compiler-Option eingeführt, die Standalone Components erzwingt. Setzen wir `strictStandalone` in der `tsconfig.json`, müssen alle Komponenten standalone sein.

```json
{
  "compilerOptions": { /* ... */ },
  "angularCompilerOptions": {
    "strictStandalone": true,
    // ...
  }
}
```

## Lokale Variablen mit `@let`

Mit dem neuen Schlüsselwort `@let` können wir lokale Variablen direkt im Template definieren.
Diese Syntax funktioniert schon seit Angular 18.1, wird mit Angular 19 aber als *stable* markiert.

```html
@let name = expression;
```

Die Variablen können im Template flexibel eingesetzt werden, aber:
Geschäftslogik sollte grundsätzlich in der TypeScript-Klasse untergebracht werden und *nicht* im Template (Trennung von Logik und Darstellung).
Die `@let`-Syntax sollte deshalb sparsam eingesetzt werden.

```html
@for (book of books(); track book.isbn) {
  @let preisBrutto = book.price * 1.19;
  <h2>{{ book.title }} – {{ preisBrutto | currency }}</h2>
}
```

Um Daten aus Observables aufzulösen, können wir im Template die AsyncPipe verwenden.
Mithilfe von `@let` können wir das Ergebnis der AsyncPipe elegant in eine Variable schreiben und anschließend einsetzen:

```html
@let book = book$ | async;
<h2>{{ book.title }}</h2>
<p>{{ book.description }}</p>
```

Der Conditional Control Flow (`@if`) und die Direktive `*ngIf` bieten seit jeher die Möglichkeit, das Ergebnis der Bedingung in eine lokale Variable zu schreiben:

```html
@if (book$ | async; as book) {
  <h2>{{ book.title }}</h2>
}

<ng-container *ngIf="book$ | async as book">
  <h2>{{ book.title }}</h2>
</ng-container>
```

Falls die Daten aus dem Observable `book$` zeitverzögert eintreffen oder als optional typisiert sind (`Book | undefined`), ist die Kombination mit `@if` der richtige Weg: Das Template soll nur angezeigt werden, wenn tatsächlich Daten vorliegen.
Häufig wird dieses Muster aber nur eingesetzt, um die Daten in eine Variable zu schreiben, ohne dass die if-Bedingung tatsächlich benötigt wird.
In diesem Fall sollte `@let` verwendet werden.

- `@if` + `as`: wenn Bedingung geprüft werden muss, bevor die Variable verwendet wird
- `@let`: wenn nur eine Variable benötigt wird



## Resource API

Mit Angular 19 wurde die *experimentelle* Resource API vorgestellt.
Damit können wir intuitiv Daten laden und in Komponenten verarbeiten.
Eine Resource repräsentiert einen Datensatz, der asynchron geladen wird, in der Regel per HTTP.
Die Resource bietet eine Schnittstelle an, um die Daten zu verarbeiten, neuzuladen und sogar manuell zu überschreiben.

Eine Resource wird mit der Funktion `resource` und einer Loader-Funktion initialisiert.
Dieser Loader ist dafür verantwortlich, die Daten asynchron zu laden. Die Funktion muss immer eine Promise zurückgeben: Wir können hier also entweder direkt die native Fetch API verwenden, oder wir wandeln das Observable aus dem `HttpClient` von Angular mithilfe von `firstValueFrom()` in eine Promise um:

```ts
import { resource } from '@angular/core';
// ...

booksResource = resource({
  loader: () => fetch(this.apiUrl + '/books').then(res => res.json()) as Promise<Book[]>
});

// bs.getAll() returnt Observable<Book[]>
booksResource = resource({
  loader: () => firstValueFrom(this.bs.getAll())
});
```


Der Loader wird automatisch ausgeführt, sobald die Resource initialisiert wird.
Um mit den Daten zu arbeiten, bietet die Resource drei Signals an: `value` enthält die Daten, `status` gibt Auskunft zum Zustand der Resource, und `error` enthält Fehler:

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

> 📝 Wir erläutern die Resource API ausführlich in einem separaten Blogpost:
> **[Neu in Angular 19: Daten laden mit der Resource API](/blog/2024-10-resource-api/)**


## Linked Signals

Das Linked Signal wurde mit Angular 19 als *Developer Preview* vorgestellt.
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

> 📝 Wir stellen das Linked Signal ausführlich in einem separaten Blogpost vor. Dort finden Sie mehrere praktische Anwendungsfälle für `linkedSignal()`:
> **[Neu in Angular 19: LinkedSignal für reaktive Zustandsverwaltung](/blog/2024-11-linked-signal/)**


## Migrationen für Signal-based APIs

Angular hat in den vergangenen Versionen viele Komponenten-Schnittstellen auf Signals und moderne Schnittstellen umgestellt:

- Component Inputs mit der Funktion `input()` liefern die Daten als Signal.
- Querys für ViewChildren und ContentChildren können mit den Funktionen `viewChild`/`viewChildren` und `contentChild`/`contentChildren` als Signals erfasst werden. Die früheren Dekoratoren sind dafür nicht mehr notwendig.
- Component Outputs können mit der Funktion `output()` definiert werden. Das Ergebnis ist zwar kein Signal, aber die Schnittstelle steht in einer Reihe mit dem neuen `input()`.

Angular bietet Migrationsskripte an, um die Propertys in den Komponenten korrekt auf die neuen Schnittstellen zu migrieren:

```bash
# Updates `@Input` declarations to signal inputs
ng generate @angular/core:signal-input-migration

# Updates query declarations to signal queries
ng generate @angular/core:signal-queries-migration

# Updates @output declarations to the functional equivalent
ng generate @angular/core:output-migration
```

Für Inputs und Querys (ViewChildren und ContentChildren) gibt es eine kombinierte Migration:

```bash
# Combines all signals-related migrations into a single migration
ng generate @angular/core:signals
```


## Signals schreiben in Effects

Ein Effect ist eine Funktion, die automatisch ausgeführt wird, wenn eins der darin verwendeten Signals seinen Wert ändert.
Damit können wir Code ausführen, sobald veränderte Daten vorliegen.

```ts
counter = signal(0);
counter100 = signal(0);

constructor() {
  effect(() => {
    console.log('Aktueller Counter-Wert:', this.counter());

    // funktioniert(e) nur mit `allowSignalWrites: true`
    this.counter100.set(this.counter() * 100);
  });
}
```

Dabei galt bisher die Empfehlung, in Effects keine Werte von Signals zu setzen.
Sollte das doch möglich sein, musste dafür die Option `allowSignalWrites` gesetzt werden – dann konnte der Effects auch in Signals schreiben.

Mit Angular 19 entfällt diese Option. In Effects können wir nun ohne zusätzliche Konfiguration die Werte von Signals ändern.
Diese Richtungsänderung hat das Angular-Team in einem eigenen [Blogpost](https://blog.angular.dev/latest-updates-to-effect-in-angular-f2d2648defcd) vorgestellt.  
Es gilt nun nicht mehr als schlechte Praxis, mit Effekten weitere Signale zu setzen oder andere Seiteneffekte auszulösen.

Bitte verwenden Sie Effects grundsätzlich dennoch sparsam! Häufig ist ein Computed Signal oder Linked Signal das bessere Mittel:

```ts
counter = signal(0);
counter100 = computed(() => this.counter() * 100);
```

## `afterRenderEffect`: Effekte für DOM-Interaktionen

Angular hat bereits vor einiger Zeit die neuen Lifecycle-Funktionen [`afterRender`](https://next.angular.dev/api/core/afterRender) und [`afterNextRender`](https://next.angular.dev/api/core/afterNextRender) vorgestellt.
Mit Angular 19 kommt nun das signalbasierte Pendant [`afterRenderEffect`](https://next.angular.dev/api/core/afterRenderEffect) hinzu.  
Das Besondere an `afterRenderEffect`: Die Daten zwischen den Render-Phasen werden als Signals ausgetauscht.  
Die Phasen werden nur erneut ausgeführt, wenn sich gebundenen Signale geändert haben.  
DOM-Manipulationen werden so auf das nötige Minimum reduziert.

Alle drei Hilfsmittel sind dafür gedacht, sicher mit dem DOM einer Komponente zu interagieren.
In der Regel ist das für normale Geschäftslogik nicht notwendig, weshalb die drei Funktionen eher für Spezialfälle gedacht sind.

> 📝 Wenn Sie mehr über das geänderte Verhalten von `effect()` und die neuen Effekte von `afterRenderEffect()` erfahren möchten, empfehlen wir unseren ausführlichen Blogpost dazu:  
> **[Angular 19: Mastering effect and afterRenderEffect](https://angular.schule/blog/2024-11-effect-afterrendereffect)**


## Sonstiges

Wir empfehlen, regelmmäßig einen Blick in den Changelog von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md) zu werfen.
Neben den großen neuen Features gibt es auch einige kleinere interessante Neuerungen:

- **Zoneless Application generieren:** Mit der Funktion `provideExperimentalZonelessChangeDetection()` können wir den älteren Mechanismus für die Change Detection auf Basis von Zone.js deaktivieren. Die Change Detection funktioniert dann vollständig mit Signals. Ab Angular 19 können wir diesen Modus schon beim Erzeugen eines Projekts wählen: `ng new --experimental-zoneless`. (siehe [Commit](https://github.com/angular/angular-cli/commit/755f3a07f5fe485c1ed8c0c6060d6d5c799c085c))
- **Default Export für Komponenten:** Komponenten werden standardmäßig als Named Export generiert: `export class FooComponent {}`. In manchen Fällen kann es sinnvoll sein, stattdessen einen *Default Export* zu verwenden (`export default class FooComponent {}`), z. B. für eine verkürzte Schreibweise beim Lazy Loading von Komponenten. Beim Anlegen einer Komponente mit der Angular CLI können wir nun auch einen Default Export generieren lassen: `ng g c foo --export-default`. (siehe [Commit](https://github.com/angular/angular-cli/commit/a381a3db187f7b20e5ec8d1e1a1f1bd860426fcd))
- **typeof im Template:** In Template Expressions wird jetzt auch das Schlüsselwort `typeof` unterstützt. Damit kann der Typ einer Variable direkt geprüft werden, ohne den Umweg über eine Methode der Komponente zu gehen: `@if (typeof foo === 'string') {}`. (siehe [Commit](https://github.com/angular/angular/commit/0c9d721ac157662b2602cf0278ba4b79325f6882))
- **Ungenutzte Standalone Imports:** Der Angular Language Service (in Visual Studio Code) erkennt ungenutzte Imports in Komponenten. Es wird ein Hinweis ausgegeben, wenn eine Komponente/Pipe/Direktive importiert wurde, aber nicht im Template genutzt wird.

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 19!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Cala Paquita, Mallorca, Spanien. Foto von Tom Torgau</small>
