---
title: 'Angular 22 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2026-06-01
lastModified: 2026-06-01
keywords:
  - Angular
  - Angular 22
  - Signal Forms
  - Resource API
  - httpResource
  - rxResource
  - Fetch API
  - OnPush
  - Debounced Signals
  - Service Decorator
  - injectAsync
  - WebMCP
  - Angular ARIA
  - Vitest
  - Webpack
language: de
header: angular22.jpg
sticky: true
isUpdatePost: true
---

Es gibt wieder Neuigkeiten aus der Angular-Welt: **Angular 22** ist da!
Dieses Release zieht viele Konzepte über die Ziellinie:
**Signal Forms**, **Resource API** und **`@angular/aria`** sind stable.
Der `HttpClient` setzt nun standardmäßig auf die moderne Fetch API, und es wurde ein neuer `@Service()`-Decorator eingeführt.
Diese und einige weietre Neuerungen stellen wir in diesem Blogpost vor.

Im [Angular-Blog](TODO) findest du die offiziellen Informationen zum neuen Release.
Um ein bestehendes Projekt auf Angular 22 zu migrieren, kannst du den Befehl `ng update` verwenden, siehe [Angular Update Guide](https://angular.dev/update-guide).

<!-- > 🇬🇧 This article is available in English language here: [Angular 22 is here!](https://angular.schule/blog/TODO) -->

## Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 22 notwendig:

- TypeScript: >=6.0.0 <6.1.0
- Node.js: ^22.22.0 || ^24.13.1 || >=26.0.0

Ausführliche Infos zu den unterstützten Versionen findest du in der [Angular-Dokumentation](https://angular.dev/reference/versions).


## Unser neues Angular-Buch

Ende Mai 2026 erschien unser neues Angular-Buch im Handel! In der neuen 1. Auflage vermitteln wir einen fundierten praktischen Einstieg in Angular.
Das Buch basiert auf der neuen Major-Version Angular 22 und ist auch für folgende Versionen geeignet.
Unter anderem behandeln wir ausführlich die neuen Signal Forms und die Resource API.

Das [Beispielprojekt "BookManager"](https://bm1.angular-buch.com) aus dem Buch läuft ebenfalls aktuell auf Angular 22.


## Signal Forms sind stable

Mit Angular 21 wurden die *Signal Forms* als experimentelles Feature eingeführt – jetzt, ein halbes Jahr später, sind sie offiziell **stabil**.
Damit hat Angular einen ganz neuen Ansatz für die Verarbeitung von Formularen im Werkzeugkasten, der konsequent auf Signals setzt.

Die Grundidee: Die Formulardaten werden in einem Signal gespeichert, das von uns verwaltet wird.
Aus dieser Datenstruktur leitet Angular automatisch die Formularstruktur ab.
Validierungsregeln werden über eine schemabasierte API mit Funktionen wie `required()`, `minLength()` oder `validate()` deklariert.
Für die Datenbindung kommt im Template kommt nur noch eine einzige Direktive zum Einsatz: `[formField]`.

```ts
import { schema, form, FormField, required, minLength } from '@angular/forms/signals';

const bookFormSchema = schema<Book>(fieldPath => {
  required(fieldPath.title);
  minLength(fieldPath.isbn, 10);
});

@Component({
  imports: [FormField],
  template: `
    <input [formField]="bookForm.title" />
    <input [formField]="bookForm.isbn" />
  `,
})
export class BookForm {
  protected readonly bookData = signal<Book>({ title: '', isbn: '' });
  protected readonly bookForm = form(this.bookData, bookFormSchema);
}
```

Die Schnittstellen und Konzepte sind stabil, und der Einsatz in Produktion wird offiziell empfohlen.
Wir gehen davon aus, dass *Reactive Forms* und *Template-Driven Forms* perspektivisch durch Signal Forms abgelöst werden.
Bestehende Reactive Forms müssen aber nicht über Bord geworfen werden:
Über die Compat-Schicht `@angular/forms/signals/compat` lassen sich beide Welten miteinander verzahnen.
Eine ausführliche Anleitung mit Top-down- und Bottom-up-Strategien gibt es im [Migration Guide](https://angular.dev/guide/forms/signals/migration).

In den letzten Monaten haben wir uns intensiv mit Signal Forms beschäftigt und eine vierteilige Blogpost-Serie veröffentlicht:

- [**Part 1: Getting Started with the Basics**](/blog/2025-10-signal-forms-part1)
- [**Part 2: Advanced Validation and Schema Patterns**](/blog/2025-10-signal-forms-part2)
- [**Part 3: Child Forms and Custom UI Controls**](/blog/2025-10-signal-forms-part3)
- [**Part 4: Metadata and Accessibility Handling**](/blog/2025-12-signal-forms-part4)

Auch in unserem neuen Angular-Buch findest du drei ausführliche Kapitel zu Signal Forms.


## Resource API ist stable

Die zweite große Neuerung betrifft das Laden asynchroner Daten:
Die **Resource API** ist mit Angular 22 stabil.
Konkret betrifft das die Funktionen `resource()` und `rxResource()` aus `@angular/core` sowie `httpResource()` aus `@angular/common/http`.

Eine Resource repräsentiert einen asynchron geladenen Datensatz.
Sie liefert nicht nur den geladenen Wert, sondern auch reaktive Statusinformationen wie `isLoading`, `error` und `value` – jeweils als Signal.
Damit lässt sich der gesamte Datenladeprozess elegant in Komponenten abbilden, ohne sich um Subscriptions oder manuelles State-Management kümmern zu müssen.

Die drei Varianten unterscheiden sich in ihrem Loader:

- `resource()` arbeitet mit Promise-basierten Loadern.
- `rxResource()` ist die Brücke zur RxJS-Welt: Hier liefert der Loader einen Observable.
- `httpResource()` ist die HTTP-spezifische Variante. Sie nutzt unter der Haube den `HttpClient` und unterstützt damit auch alle HTTP-Interceptors.

```ts
import { httpResource } from '@angular/common/http';

@Service()
export class BookStore {
  selectedIsbn = signal<string | null>(null);

  book = httpResource<Book>(() => {
    const isbn = this.selectedIsbn();
    return isbn ? `/api/books/${isbn}` : undefined;
  });
}
```

Wir haben die Idee der Resource API bereits in einem ausführlichen Blogpost vorgestellt:
[**Reactive Angular: Daten laden mit der Resource API**](/blog/2024-10-resource-api).
Mit der Stabilisierung in Angular 22 ist das dort beschriebene Vorgehen offiziell der empfohlene Weg, um in Komponenten signal-basiert Daten zu laden.


## Angular ARIA ist stable

Auch das mit Angular 21 eingeführte Paket [`@angular/aria`](https://angular.dev/guide/aria/overview) hat den Schritt aus der Developer Preview heraus geschafft und ist mit Angular 22 **stable**.
Das Paket bietet eine Sammlung von Direktiven, die gängige [WAI-ARIA-Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) umsetzen – von Accordion über Combobox bis hin zu Tabs und Tree.
Tastaturinteraktionen, ARIA-Attribute, Fokus-Management und Screen-Reader-Unterstützung sind dabei bereits eingebaut.
Wir liefern lediglich die HTML-Struktur, das Styling und die fachliche Logik.

Mit dem Sprung zu stable können wir die Direktiven nun bedenkenlos in produktiven Anwendungen einsetzen.
Die Installation erfolgt wie gewohnt über die Angular CLI:

```bash
ng add @angular/aria
```


## HttpClient: Fetch-API ist jetzt der Default

Der `HttpClient` hat eine kleine, aber wirkungsvolle Veränderung erfahren:
Mit Angular 22 ist die **Fetch-API** der neue Standard.
Bisher musste die Fetch-Variante explizit über `withFetch()` aktiviert werden – andernfalls verwendete der `HttpClient` das ältere `XMLHttpRequest`.
Nun wird `FetchBackend` automatisch verwendet, ganz ohne zusätzliche Konfiguration.

Da seit Angular 21 die Providers für den `HttpClient` automatisch eingebunden werden, reicht es, den `HttpClient` per `inject()` in unseren Komponenten und Services zu nutzen.
Ein expliziter Aufruf von `provideHttpClient()` in der `app.config.ts` ist nicht mehr nötig – Fetch funktioniert ab Angular 22 ganz von allein.

```ts
@Service()
export class BookStore {
  // HttpClient ist out of the box verfügbar – mit Fetch als Default
  private http = inject(HttpClient);
}
```

Die Vorteile: bessere Kompatibilität mit Server-Side Rendering, eine moderne Browser-API und ein etwas schlankeres Bundle, weil der XHR-Pfad nicht mehr standardmäßig benötigt wird.

Allerdings ist diese Umstellung ein Breaking Change, der eine wichtige Einschränkung mit sich bringt:
Das `FetchBackend` unterstützt **keine Upload-Progress-Events**.
Wer in seiner Anwendung mit `reportProgress: true` den Fortschritt von Datei-Uploads tracken möchte, muss bei den betroffenen Requests explizit auf das XHR-Backend zurückwechseln.
Dafür rufen wir `provideHttpClient()` weiterhin manuell auf und konfigurieren das XHR-Backend:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withXhr())
  ]
};
```


## ChangeDetection.OnPush ist jetzt Default

Mit Angular 22 wird ein weiterer großer Schritt in Richtung Performance gegangen:
**`ChangeDetectionStrategy.OnPush` ist nun die Standard-Strategie** für alle Komponenten.
Dies basiert auf dem [RFC zum Thema](https://github.com/angular/angular/discussions/66779), an dem die Community lange mitdiskutiert hat.

Komponenten, in denen die `changeDetection`-Property nicht explizit gesetzt wurde, verhalten sich also ab sofort wie zuvor `OnPush`.
Damit setzt das Angular-Team konsequent den eingeschlagenen Weg fort:
Mit Angular 21 wurde Zoneless Change Detection zum Standard, Signals sind seit Längerem das zentrale Reaktivitätsprimitiv – und nun ist auch die granulare Change Detection per Default aktiv.
Das Ergebnis ist eine bessere Performance "out of the box", weil unnötige Change-Detection-Durchläufe vermieden werden.

Bei der Migration gibt es allerdings eine Stolperfalle:
Komponenten, die ihren View-Status über direkte Property-Zuweisungen aus einer Subscription heraus aktualisieren, ohne zusätzlich `markForCheck()` aufzurufen, können stillschweigend "einfrieren".
Die Daten kommen an, aber die Anzeige im Template aktualisiert sich nicht – weil Angular nicht mehr automatisch erkennt, dass eine Aktualisierung nötig ist.

Die saubere Lösung ist, Subscriptions auf Signals umzustellen, beispielsweise mit `toSignal()`.
Alternativ kann man explizit `markForCheck()` aufrufen oder den Wert über die `async`-Pipe in das Template binden.
Wer schon konsequent auf Signals setzt, muss in seinen eigenen Komponenten in der Regel gar nichts anpassen.

Besondere Vorsicht ist bei eigenen Bibliotheken gefragt:
Library-Autor:innen sollten ihre Komponenten überprüfen und – falls die Komponenten sich auf das alte Verhalten verlassen – die `changeDetection`-Property explizit auf `ChangeDetectionStrategy.Default` setzen, damit nichts unerwartet bricht.


## HTML-Kommentare in Angular-Templates

Eine kleine, aber im Alltag sehr nützliche Verbesserung betrifft die Templates:
Angular 22 erlaubt nun **Kommentare innerhalb von Template-Elementen** – zusätzlich zu den klassischen HTML-Kommentaren `<!-- ... -->`.

Bisher konnte man Attribute, Inputs oder Event-Bindings in einem mehrzeiligen Element-Tag nicht einfach auskommentieren oder mit einer kurzen Notiz versehen.
Jetzt akzeptiert der Template-Parser auch JavaScript-typische Kommentare im Stil `// ...` für einzelne Zeilen sowie `/* ... */` für mehrzeilige Kommentare – direkt zwischen den Attributen.

```html
<!-- BooksOverviewPage component template -->
<app-book-card
  // Pass a book as input
  [book]="b"
  /* Process received 'like' event */
  (like)="addLikedBook($event)"
/>
```

## Debounced Signals

Mit Angular 22 zieht eine neue experimentelle Funktion in `@angular/core` ein: **`debounced()`**.
Sie ermöglicht es, ein Signal zu *entprellen*, also seinen Wert erst nach einer kurzen Wartezeit weiterzureichen.
Das ist ein Klassiker bei Such-Eingabefeldern: Während die Nutzer:innen tippen, soll nicht nach jedem Tastendruck eine Anfrage abgeschickt werden – sondern erst, wenn die Eingabe zur Ruhe gekommen ist.

Bisher war dieses Muster fest in der Welt von RxJS verankert: Man musste das Signal mit `toObservable()` in einen Observable umwandeln, `debounceTime()` verwenden und das Ergebnis mit `toSignal()` zurückkonvertieren.
Mit `debounced()` geht das nun ohne Umwege direkt in der Signal-Welt.

```ts
import { debounced, resource, signal } from '@angular/core';

@Component({/* ... */})
export class Search {
  query = signal('');
  debouncedQuery = debounced(this.query, 300);

  results = resource({
    params: () => this.debouncedQuery.value(),
    loader: ({ params }) => fetchResults(params),
  });
}
```

Die Funktion `debounced()` liefert eine `Resource` zurück, deren Wert erst nach Ablauf der angegebenen Wartezeit (in Millisekunden) aktualisiert wird.
Während des Wartens hat die Resource den Status `loading`, danach `resolved`.
Statt einer festen Millisekundenzahl kann auch eine eigene Wait-Funktion übergeben werden, die ein `Promise<void>` zurückgibt – damit lassen sich z. B. unterschiedliche Wartezeiten je nach Eingabelänge realisieren.

Wichtig: `debounced()` muss in einem Injection Context aufgerufen werden, damit Angular die zugehörigen Timer beim Zerstören des Injectors automatisch aufräumen kann.

In den Signal Forms gibt es zusätzlich die verwandte Funktion `debounce()`, mit der sich asynchrone Validatoren entprellen lassen – etwa, um nicht bei jedem Tastendruck eine Server-seitige Eindeutigkeitsprüfung anzustoßen.


## Der neue Decorator `@Service()`

Mit Angular 22 wurde der neue Decorator `@Service()` eingeführt.
Er ist die moderne und ergonomische Alternative zum etablierten Decorator `@Injectable()` mit der Einstellung `providedIn: 'root'`.

Da das Klassennamen-Suffix `Service` [mit Angular 20 weggefallen ist](/blog/2025-05-angular20), ist der neue Decorator aus unserer Sicht eine sinnvolle Ergänzung.
So ist auf den ersten Blick erkennbar, dass es sich bei einer Klasse um einen Service handelt.

Der Decorator kann in den meisten Fällen direkt ersetzt werden:

```ts
// VORHER
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookStore {}
```

```ts
// NACHHER
import { Service } from '@angular/core';

@Service()
export class BookStore {}
```

Die Angular CLI generiert Services mit `ng generate service` nun ebenfalls standardmäßig mit dem neuen Decorator.
Um beim Generieren den älteren Decorator `@Injectable()` zu erhalten, können wir das Flag `--injectable` verwenden.

```bash
# mit Decorator `@Service()`
ng g service book-store

# mit Decorator `@Injectable()`
ng g service book-store --injectable
```

Im Vergleich zu `@Injectable()` sieht `@Service()` keine Konfigurationsmöglichkeiten vor und ist damit bewusst schlank gehalten.
Eine wichtige Eigenschaft sollte man dabei kennen: **Constructor Injection ist mit `@Service()` nicht erlaubt**.
Dependencies müssen über die Funktion `inject()` aufgelöst werden – andernfalls wirft Angular einen Fehler.
Diese Einschränkung schiebt uns sanft, aber bestimmt in Richtung des modernen, funktionalen DI-Stils.

Für spezielle Fälle wie `providedIn: 'platform'` benötigen wir weiterhin den Decorator `@Injectable()`.
Wir müssen also nicht befürchten, dass `@Injectable()` in naher Zukunft "deprecated" wird.
Wir empfehlen dennoch, neue Services mit dem neuen Decorator auszustatten – die Syntax ist kürzer und es sieht auch ein wenig schicker aus.

> Übrigens: Das Konzept eines `@Service()`-Decorators für Angular wurde von Johannes als Gedankenexperiment in einem [eigenen Blogpost](/blog/2025-09-service-decorator) durchgespielt – jetzt gibt es ihn wirklich!


## `injectAsync()`: Services lazy laden

Ein weiteres neues Werkzeug im Bereich Dependency Injection ist die Funktion **`injectAsync()`** aus `@angular/core`.
Damit lassen sich Services und ihre Abhängigkeiten **lazy laden**, ohne dass sie im initialen Bundle der Anwendung landen.

Bisher war das Pattern für lazy geladene Services umständlich:
Man musste den `Injector` per `inject()` holen, den Service dynamisch importieren und das Ergebnis selbst über `Injector.get()` auflösen und cachen.
Mit `injectAsync()` übernimmt Angular all diese Schritte automatisch.
Die Funktion bekommt einen Loader übergeben, der die Service-Klasse über einen dynamischen `import()` zurückgibt.
Beim ersten Aufruf des zurückgegebenen Promise wird der Service geladen, durch die DI aufgelöst und für nachfolgende Aufrufe gecacht.

```ts
import { Component, injectAsync, onIdle, signal } from '@angular/core';

@Component({/* ... */})
export class PostEditor {
  protected readonly content = signal('');

  private markdownService = injectAsync(
    () => import('../markdown.service').then(m => m.MarkdownService),
    { prefetch: onIdle }
  );

  async preview() {
    const svc = await this.markdownService();
    // ...
  }
}
```

Der Vorteil ist greifbar: Schwere Abhängigkeiten – etwa Markdown-Parser, Charting-Bibliotheken oder PDF-Renderer – tauchen nicht mehr im Initial-Bundle auf.
Sie werden erst dann nachgeladen, wenn die jeweilige Funktion aufgerufen wird.

Optional kann eine **Prefetch-Strategie** angegeben werden.
Mit `prefetch: onIdle` lädt Angular die Abhängigkeit ruhig im Hintergrund, sobald der Browser idle ist.
So bleibt das Initial-Bundle schlank, und die Nutzer:innen müssen trotzdem nicht warten, wenn sie das Feature später aufrufen – die Datei ist dann bereits im Cache.


## WebMCP: KI-Agenten in Web-Apps integrieren

Angular 22 bringt experimentelle Unterstützung für **[WebMCP](https://github.com/webmachinelearning/webmcp)** (Web Model Context Protocol) mit.
Dieser aufkommende Webstandard ermöglicht es, aus einer Web-App heraus strukturierte Tools für KI-Agenten im Browser bereitzustellen.
Statt DOM-Scraping und simulierten Klicks können Agenten wie Gemini oder Claude die deklarierten Tools direkt aufrufen – etwa um ein Formular auszufüllen oder eine Suche auszulösen.

Angular dockt WebMCP sauber an die bestehende Architektur an: Tools lassen sich global, pro Route oder in Services und Komponenten registrieren.
Besonders elegant ist die Brücke zu Signal Forms: Mit der Option `experimentalWebMcpTool` in der `form()`-Funktion wird ein Formular automatisch als WebMCP-Tool exponiert – inklusive JSON-Schema und Validierung.

Wir haben dem Thema einen eigenen ausführlichen Artikel gewidmet:
[**WebMCP: KI-Agenten in Angular-Apps integrieren**](/blog/2026-05-webmcp)


## Deprecation der Webpack-basierten Builder

Auf der Werkzeug-Seite zieht das Angular-Team einen weiteren Schlussstrich:
Die alten **Webpack-basierten Builder** (`@angular-devkit/build-angular:browser` und `@angular-devkit/build-angular:dev-server`) sind mit Angular 22 offiziell als **deprecated** markiert.

Schon seit einigen Versionen ist der esbuild-basierte `application`-Builder der Standard für neue Projekte – er ist deutlich schneller, unterstützt SSR direkt und integriert sich nahtlos in den Vitest-Test-Runner.
Wer noch auf einer Webpack-Konfiguration unterwegs ist, sollte spätestens jetzt die Migration zum neuen Builder einplanen.
Die Angular CLI stellt dafür ein passendes Migrationsskript bereit, das die `angular.json` automatisch umstellt:

```bash
ng update @angular/cli --name use-application-builder
```

Eine Entfernung der Webpack-Builder ist in einem der kommenden Major-Releases geplant.


## fakeAsync zu Vitest Fake Timers migrieren

Mit Angular 21 wurde Vitest zum neuen Standard-Test-Runner.
Wer bestehende Tests migriert, stößt früher oder später auf eine Stolperfalle:
Die altbekannten Helfer `fakeAsync()` und `tick()` aus `@angular/core/testing` basieren auf Zone.js und passen nicht mehr ohne Weiteres zum neuen, zonenlosen Setup.
Vitest bringt mit den **Fake Timers** ein eigenes, modernes Konzept zur Steuerung von Zeit in Tests mit.

Mit Angular 22 stellt die Angular CLI ein Schematic bereit, das Tests automatisch von `fakeAsync`/`tick` auf die Fake Timers von Vitest umstellt:

```bash
ng generate @schematics/angular:fake-async-to-vitest-fake-timers
```

Das Schematic ersetzt die `fakeAsync`-Wrapper durch `vi.useFakeTimers()`, übersetzt `tick(...)` in `vi.advanceTimersByTime(...)` und kümmert sich um die zugehörigen Imports.
In unserem [Vitest-Migrationsleitfaden](/blog/2025-11-zu-vitest-migrieren#asynchronit%C3%A4t-ohne-zonejs-mit-vitest-timer) haben wir die verschiedenen Vitest-Timer-APIs ausführlich erklärt und zeigen auch, in welchen Fällen das Schematic an seine Grenzen stößt.


## Sonstiges

Im Changelog von [Angular](https://github.com/angular/angular/releases) und der [Angular CLI](https://github.com/angular/angular-cli/releases) findest du stets alle Detailinformationen zur aktuellen Entwicklung des Frameworks.
Einige interessante Aspekte haben wir hier zusammengetragen:

- **TODO:** TODO (siehe [PR](https://github.com/angular/angular/pull/TODO)).
- **TODO:** TODO (siehe [Commit](https://github.com/angular/angular/commit/TODO)).

<hr>

Wir wünschen dir viel Spaß beim Entwickeln mit Angular 22!
Hast du Fragen zur neuen Version von Angular oder zu unserem Buch? Schreibe uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Joshua Tree National Park, Kalifornien, USA, 2019. Foto von Ferdinand Malcher</small>
