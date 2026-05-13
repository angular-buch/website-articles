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
language: de
header: angular22.jpg
sticky: true
hidden: true
isUpdatePost: true
---

Mit Beginn des Monats Juni gibt es Neuigkeiten aus der Angular-Welt: **Angular 22** ist da!
Dieses Release zieht viele Konzepte, die in den letzten Versionen reifen durften, über die Ziellinie:
**Signal Forms** und die **Resource API** sind stable, der `HttpClient` setzt nun standardmäßig auf die moderne Fetch-API und ein neuer `@Service()`-Decorator stellt eine vereinfachte Version vom bisherigen `@Injectable()` dar.
Hinzu kommen einige spannende neue Bausteine wie `injectAsync()`, `debounced()` und eine erste Integration für **WebMCP**.

Im [Angular-Blog](TODO) findest du die offiziellen Informationen zum neuen Release.
Um ein bestehendes Projekt auf Angular 22 zu migrieren, kannst du den Befehl `ng update` verwenden, siehe [Angular Update Guide](https://angular.dev/update-guide).

<!-- > 🇬🇧 This article is available in English language here: [Angular 22 is here!](https://angular.schule/blog/TODO) -->

## Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 22 notwendig:

- TypeScript: >=6.0.0 <6.1.0
- Node.js: ^22.22.0 || ^24.13.1 || >=26.0.0

Ausführliche Infos zu den unterstützten Versionen findest du in der [Angular-Dokumentation](https://angular.dev/reference/versions).


## Signal Forms sind stable

Mit Angular 21 wurden die *Signal Forms* als experimentelles Feature eingeführt – jetzt, ein halbes Jahr später, sind sie offiziell **stabil**.
Damit hat Angular einen ganz neuen Ansatz für die Verarbeitung von Formularen im Werkzeugkasten, der konsequent auf Signals setzt.

Die Grundidee ist denkbar einfach: Die Formulardaten werden als ganz normales Signal geführt.
Aus dieser Datenstruktur leitet Angular automatisch die Form-Struktur ab.
Validierungsregeln werden über eine schemabasierte API mit Funktionen wie `schema()`, `required()` oder `minLength()` deklariert.
Im Template kommt nur noch eine einzige Direktive zum Einsatz: `[formField]`.

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

Mit der Stabilisierung sind die APIs und Konzepte nun verlässlich – der Einsatz in Produktion ist offiziell empfohlen.
Wir gehen davon aus, dass *Reactive Forms* und *Template-Driven Forms* perspektivisch durch Signal Forms abgelöst werden.
Bestehende Reactive Forms müssen aber nicht über Bord geworfen werden:
Über die Compat-Schicht `@angular/forms/signals/compat` lassen sich beide Welten miteinander verzahnen.
Eine ausführliche Anleitung mit Top-down- und Bottom-up-Strategien gibt es im [Migration Guide](https://angular.dev/guide/forms/signals/migration).

In den letzten Monaten haben wir uns intensiv mit Signal Forms beschäftigt und eine vierteilige Blogpost-Serie veröffentlicht:

- [**Part 1: Getting Started with the Basics**](/blog/2025-10-signal-forms-part1)
- [**Part 2: Advanced Validation and Schema Patterns**](/blog/2025-10-signal-forms-part2)
- [**Part 3: Child Forms and Custom UI Controls**](/blog/2025-10-signal-forms-part3)
- [**Part 4: Metadata and Accessibility Handling**](/blog/2025-12-signal-forms-part4)


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


## HttpClient: Fetch-API ist jetzt der Default

Der `HttpClient` hat eine kleine, aber wirkungsvolle Veränderung erfahren:
Mit Angular 22 ist die **Fetch-API** der neue Standard.
Bisher musste die Fetch-Variante explizit über `withFetch()` aktiviert werden – andernfalls verwendete der `HttpClient` das ältere `XMLHttpRequest`.
Nun wird `FetchBackend` automatisch verwendet, und der Aufruf `provideHttpClient()` reicht ohne weitere Argumente aus.

```ts
// Reicht aus – Fetch ist jetzt Default
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};
```

Die Vorteile: bessere Kompatibilität mit Server-Side Rendering, eine moderne Browser-API und ein etwas schlankeres Bundle, weil der XHR-Pfad nicht mehr standardmäßig benötigt wird.

Allerdings ist diese Umstellung ein Breaking Change, der eine wichtige Einschränkung mit sich bringt:
Das `FetchBackend` unterstützt **keine Upload-Progress-Events**.
Wer in seiner Anwendung mit `reportProgress: true` den Fortschritt von Datei-Uploads tracken möchte, muss bei den betroffenen Requests explizit auf das XHR-Backend zurückwechseln.

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

Ein Thema, das uns in den nächsten Jahren noch intensiv begleiten wird, ist die Integration von KI-Agenten in unsere Anwendungen.
Mit dem aufkommenden Webstandard **[WebMCP](https://github.com/MiguelsPizza/WebMCP)** lässt sich aus einer Webseite heraus dem Browser – und damit angeschlossenen KI-Agenten – ein Set von **Tools** zur Verfügung stellen.

Tools werden über die neue Browser-API `navigator.modelContext.registerTool()` registriert.
Externe Agenten wie Claude, ChatGPT-Erweiterungen oder Gemini können diese Tools entdecken und auf Wunsch der Nutzer:innen aufrufen.
Damit verschmelzen Web-App und Agent: Aktionen, die sonst über die UI ausgeführt werden, können auch direkt aus einem Chat-Kontext heraus ausgelöst werden.

Angular 22 bringt dafür erste Bausteine mit, um diese Welt sauber an die Komponenten- und Service-Architektur anzudocken:

- Tools können direkt in Services oder Komponenten definiert und über die Dependency Injection bereitgestellt werden.
- Das Lifecycle-Handling übernimmt Angular: Tools werden automatisch wieder abgemeldet, wenn die zugehörige Komponente zerstört wird.

```ts
// TODO: konkretes Codebeispiel und Quelle prüfen (Doku/PR-Link), sobald die offizielle Doku verfügbar ist
```

### Signal Forms: `experimentalWebMcpTool`

Besonders charmant ist die Brücke zwischen Signal Forms und WebMCP:
Mit der Funktion **`experimentalWebMcpTool`** lässt sich ein Formular deklarativ als WebMCP-Tool registrieren.
Angular leitet das JSON-Schema automatisch aus der Form-Definition ab – inklusive aller Validierungsregeln.

Damit kann ein KI-Agent ein Formular stellvertretend "ausfüllen", ohne dass wir per Hand ein eigenes Tool definieren müssen.
Praktische Anwendungsfälle gibt es viele: Eine Buchsuche, eine Buchung oder eine strukturierte Datenerfassung, die der Agent im Auftrag der Nutzer:innen vornimmt.

```ts
// TODO: Beispielcode aus offizieller Doku prüfen / einfügen
import { form, schema, experimentalWebMcpTool } from '@angular/forms/signals';

protected readonly bookForm = form(this.bookData, bookFormSchema, {
  webMcpTool: experimentalWebMcpTool({
    name: 'create-book',
    description: 'Legt ein neues Buch im System an.',
  }),
});
```

Wie der Name verrät, ist diese Schnittstelle noch experimentell.
Die genaue Form der API kann sich also noch ändern – wir behalten das Thema im Auge und werden hier in Kürze einen ausführlichen Blogpost dazu veröffentlichen.


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

<small>**Titelbild:** TODO. Foto von Ferdinand Malcher</small>
