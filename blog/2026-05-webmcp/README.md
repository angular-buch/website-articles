---
title: 'WebMCP: KI-Agenten in Angular-Apps integrieren'
author: Danny Koppenhagen
mail: mail@k9n.dev
published: 2026-05-27
lastModified: 2026-05-27
keywords:
  - Angular
  - Angular 22
  - WebMCP
  - Web Model Context Protocol
  - AI
  - KI
  - Agent
  - Signal Forms
  - MCP
  - Browser API
language: de
header: webmcp.jpg
---

Die Integration von KI-Agenten in Web-Anwendungen wird in den nächsten Jahren ein zentrales Thema.
Mit dem in Entwicklung befindlichen Vorschlag **WebMCP** (Web Model Context Protocol) sollen Webseiten dem Browser – und damit angeschlossenen KI-Agenten – strukturierte **Tools** zur Verfügung stellen können.
Heute müssen Agenten den DOM parsen, den Accessibility Tree auswerten oder Screenshots analysieren – das ist langsam, fehleranfällig und anfällig für Prompt-Injection-Angriffe.
WebMCP soll einen besseren Weg bieten: Die Webseite deklariert ihre Fähigkeiten, und der Agent ruft sie direkt auf.

Angular bringt ab Version 22 experimentelle Unterstützung für WebMCP mit.
In diesem Artikel zeigen wir, wie das Ganze funktioniert und wie wir es in unseren Angular-Anwendungen einsetzen können.

## Was ist WebMCP?

[WebMCP](https://github.com/webmachinelearning/webmcp) ist ein Vorschlag, der von der [W3C Web Machine Learning Community Group](https://www.w3.org/community/webmachinelearning/) entwickelt wird.
Die Spezifikation hat aktuell den Status eines _Unofficial Draft_ – sie ist also weder ein verabschiedeter W3C-Standard noch befindet sie sich auf dem offiziellen W3C Standards Track.
Bislang gibt es nur eine experimentelle Umsetzung in Chrome (hinter einem Flag); andere Browser-Hersteller haben noch keine Implementierungsabsicht signalisiert.

Die Idee dahinter: Statt dass ein KI-Agent die DOM-Struktur einer Seite analysieren, den Accessibility Tree parsen oder Screenshots auswerten muss, kann eine Web-App ihre Funktionalität als strukturierte Tools deklarieren.
Externe Agenten wie Gemini, Claude oder ChatGPT-Erweiterungen sollen diese Tools entdecken und auf Wunsch der Nutzer:innen aufrufen können.

Der Unterschied ist drastisch: Bei einer klassischen Anwendung ohne WebMCP muss der Agent z. B. über 40 DOM-Knoten parsen, um ein Formular zum Anlegen eines Buchs zu bedienen.
Mit WebMCP hingegen reichen ein oder zwei deklarierte Tools, die direkt aufgerufen werden.
Das funktioniert schneller, zuverlässiger und mit weniger Token-Verbrauch.

> Eine eindrucksvolle Visualisierung dieses Unterschieds bietet die [WebMCP-Demo von Sarah Drasner](https://webmcp-demo-sdras.netlify.app/).
> Dort wird dasselbe Widget einmal per DOM-Scraping und einmal per WebMCP-Tools gesteuert.

### Wie funktioniert WebMCP?

Der Ablauf lässt sich in drei Schritte zusammenfassen:

1. **Die Webseite registriert Tools:** Auf jeder Seite können Aktionen deklariert werden, die ein Agent ausführen darf. Jedes Tool hat einen Namen, eine Beschreibung und ein JSON-Schema für die erwarteten Parameter.
2. **Der Browser exponiert die Tools:** Ein WebMCP-fähiger Browser (oder eine Browser-Extension) sammelt die registrierten Tools und stellt sie dem angeschlossenen Agenten zur Verfügung.
3. **Der Agent ruft die Tools auf:** Der Agent sieht einen klaren Vertrag, liefert strukturierte Argumente – und unser Code erledigt den Rest. Die Nutzer:innen behalten dabei die Kontrolle über Berechtigungen und Bestätigungen.


### Zwei APIs: imperativ und deklarativ

> **Wichtig:** Die WebMCP-Spezifikation befindet sich noch in einem frühen Stadium.
> Die APIs sind experimentell und können sich auch außerhalb von Major-Releases ändern.
> Chrome bietet seit Februar 2026 eine [Early Preview](https://developer.chrome.com/blog/webmcp-epp) an.

Die WebMCP-Spezifikation definiert zwei Wege, um Tools zu registrieren:

- **Imperative API:** Tools werden per JavaScript über `navigator.modelContext.registerTool()` registriert. Das ist der Weg, den Angular unter der Haube nutzt.
- **Deklarative API:** Für einfache Formulare reichen HTML-Attribute wie `toolname`, `tooldescription` und `toolparamdescription` direkt am `<form>`-Element, ganz ohne JavaScript.


```html
<!-- Deklarative API: Formular als WebMCP-Tool per HTML-Attribute -->
<form toolname="createBook"
      tooldescription="Create a new book in the catalog"
      toolautosubmit>
  <input name="title" toolparamdescription="Book title" required>
  <input name="isbn" toolparamdescription="ISBN (13 digits)" required>
  <textarea name="description" toolparamdescription="Book description"></textarea>
  <button type="submit">Create</button>
</form>
```

Für Angular-Anwendungen ist die imperative API relevanter, weil Angular die Tool-Registrierung in seine DI- und Lifecycle-Mechanismen integriert.
Die deklarative API ist aber ein guter Einstieg für einfache Seiten ohne Framework.

## WebMCP in Angular

Angular 22.0 bringt experimentelle Unterstützung für WebMCP mit und integriert das Konzept sauber in die bestehende Architektur von Komponenten und Services.

Tools lassen sich auf zwei Wegen registrieren:

- Über die Provider-Funktion `provideExperimentalWebMcpTools()`, die wir in jedem Injector einsetzen können – also global in der App-Config, in den Providern einer Route oder in den Providern einer Komponente.
- Über `declareExperimentalWebMcpTool()` im Injection Context, z. B. im Konstruktor eines Services.

Angular übernimmt dabei das Lifecycle-Handling: Tools werden automatisch wieder abgemeldet, wenn der zugehörige Injector zerstört wird.
Wichtig ist, dass Tool-Namen eindeutig sein müssen. Eine doppelte Registrierung führt zu einem Laufzeitfehler.

## Tools mit `provideExperimentalWebMcpTools()` definieren

Mit der Funktion `provideExperimentalWebMcpTools()` definieren wir MCP-Tools als Provider.
Sie nimmt ein Array von Tool-Definitionen entgegen und liefert einen Provider zurück, den wir an einen beliebigen Injector hängen können.
Die Lebensdauer eines Tools entspricht damit der Lebensdauer des zugehörigen Injectors.

Ein Tool besteht aus folgenden Eigenschaften:

- `name`: Eindeutiger Name des Tools, unter dem der Agent es aufrufen kann.
- `description`: Beschreibung in natürlicher Sprache, anhand derer der Agent entscheidet, wann er das Tool nutzt.
- `inputSchema`: JSON-Schema, das die erwarteten Parameter beschreibt.
- `execute`: Callback, der beim Aufruf des Tools ausgeführt wird. Er läuft im Injection Context des zugehörigen Injectors, sodass wir direkt `inject()` verwenden können, um auf Services zuzugreifen.

Ein einfaches Beispiel:

```ts
import { provideExperimentalWebMcpTools, Service, inject } from '@angular/core';

@Service()
class BookStore {
  search(query: string) { /* ... */ }
}

provideExperimentalWebMcpTools([{
  name: 'searchBooks',
  description: 'Searches the book catalog.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search keywords.' },
      maxResults: { type: 'number', description: 'Max results to return.' }
    },
    required: ['query'],
    additionalProperties: false,
  },
  execute: ({ query, maxResults }) => {
    const store = inject(BookStore);
    return { content: [{ type: 'text', text: store.search(query) }] };
  },
}])
```

Die erwarteten Parameter werden über ein `inputSchema` im [JSON-Schema-Format](https://json-schema.org/) definiert.
Angular leitet daraus automatisch die TypeScript-Typen für den `execute`-Callback ab.
Mit `required` markieren wir Pflichtfelder, und `additionalProperties: false` schränkt die erlaubten Parameter ein.

> **Tipp:** Angular validiert die Eingaben des Agenten nicht automatisch gegen das Schema.
> Es empfiehlt sich, im `execute`-Callback eine explizite Prüfung der Argumente vorzunehmen.

## Wo wir Tool-Provider registrieren können

Da `provideExperimentalWebMcpTools()` ein gewöhnlicher Provider ist, können wir ihn an verschiedenen Stellen einsetzen.
Vom Injector, in dem die Provider hängen, hängt die Gültigkeit der Tools ab.

### Global im Root-Injector

Sollen Tools für die gesamte Lebensdauer der Anwendung verfügbar sein, registrieren wir sie in der App-Config:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalWebMcpTools } from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideExperimentalWebMcpTools([/* ... */]),
  ],
});
```

Der Root-Injector wird während der Laufzeit der Anwendung nicht zerstört, die Tools sind also dauerhaft verfügbar.

### Pro Route

In komplexen Anwendungen möchten wir bestimmte Tools nur dann verfügbar machen, wenn die Nutzer:innen eine bestimmte Route betrachten.
Dafür hängen wir die Provider in die Route-Definition:

```ts
import { provideExperimentalWebMcpTools } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard-page').then(m => m.DashboardPage),
    providers: [
      provideExperimentalWebMcpTools([{
        name: 'exportDashboardReports',
        description: 'Exports the current dashboard analytics.',
        inputSchema: { type: 'object', properties: {} },
        execute: () => ({
          content: [{ type: 'text', text: 'Dashboard export triggered.' }],
        }),
      }]),
    ],
  },
];
```

Damit das Tool beim Verlassen der Route automatisch abgemeldet wird, sollten wir den Router mit `withExperimentalAutoCleanupInjectors()` konfigurieren:

```ts
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withExperimentalAutoCleanupInjectors())
  ],
};
```

Ohne diese Option bleiben Tools, die auf Routen registriert wurden, auch nach dem Navigieren weiterhin für den Agenten sichtbar – die Route-Injectoren werden standardmäßig nicht zerstört.

### Pro Komponententeilbaum

Genauso lässt sich `provideExperimentalWebMcpTools()` in den `providers` einer Komponente einsetzen:

```ts
import { Component } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';

@Component({
  selector: 'app-book-form',
  providers: [
    provideExperimentalWebMcpTools([/* ... */]),
  ],
  templateUrl: './book-form.html',
})
export class BookForm {}
```

Die Tools sind dann genau so lange registriert, wie die Komponente und ihr Teilbaum existieren.
Sobald die Komponente zerstört wird, meldet Angular die Tools automatisch ab.

## Tools in Services registrieren

Für dynamische Anwendungsfälle können wir mit `declareExperimentalWebMcpTool()` ein Tool direkt in einem Injection Context registrieren.
Das Tool wird automatisch abgemeldet, wenn der zugehörige Injector zerstört wird.

```ts
import { Service, declareExperimentalWebMcpTool, signal } from '@angular/core';

@Service()
export class Counter {
  readonly count = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the global counter.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => ({
        content: [{ type: 'text', text: `The count is: ${this.count()}.` }],
      }),
    });
  }
}
```

Weil `declareExperimentalWebMcpTool()` in jedem Injection Context funktioniert, sollten wir darauf achten, es bevorzugt in Root-Services zu verwenden.
In Komponenten-Konstruktoren kann es zu Namenskollisionen kommen, wenn die Komponente mehrfach auf der Seite gerendert wird.

## Signal Forms als WebMCP-Tools

Besonders charmant ist die Brücke zwischen Signal Forms und WebMCP:
Mit der Option `experimentalWebMcpTool` in der Funktion `form()` lässt sich ein Formular deklarativ als WebMCP-Tool registrieren.

Angular leitet das JSON-Schema automatisch aus dem initialen Wert des Form-Models ab – inklusive der Pflichtfelder, die sich aus den `required()`-Validatoren ergeben.
Damit kann ein KI-Agent ein Formular stellvertretend "ausfüllen" und absenden, ohne dass wir per Hand ein eigenes Tool mit JSON-Schema definieren müssen.

### Feature aktivieren

Zunächst registrieren wir den Provider `provideExperimentalWebMcpForms()` in der App-Config:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalWebMcpForms()
  ]
};
```

### Formular als Tool deklarieren

Anschließend können wir ein Signal Form als WebMCP-Tool deklarieren, indem wir die Option `experimentalWebMcpTool` mit einem Namen und einer Beschreibung übergeben:

```ts
import { Component, inject, signal } from '@angular/core';
import { form, required, minLength, maxLength, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  selector: 'app-book-create-page',
  imports: [FormField, FormRoot],
  templateUrl: './book-create-page.html',
})
export class BookCreatePage {
  #bookStore = inject(BookStore);
  #router = inject(Router);

  readonly #bookFormData = signal({
    isbn: '',
    title: '',
    subtitle: '',
    authors: [''],
    description: '',
    imageUrl: '',
  });

  protected readonly bookForm = form(
    this.#bookFormData,
    (path) => {
      required(path.title, { message: 'Title is required.' });
      required(path.isbn, { message: 'ISBN is required.' });
      minLength(path.isbn, 13, { message: 'ISBN must have 13 digits.' });
      maxLength(path.isbn, 13, { message: 'ISBN must have 13 digits.' });
      required(path.description, { message: 'Description is required.' });
    },
    {
      experimentalWebMcpTool: {
        name: 'createBook',
        description: 'Create a new book',
      },
      submission: {
        action: async (bookForm) => {
          const value = bookForm().value();
          const newBook = { ...value, createdAt: new Date().toISOString() };
          const created = await this.#bookStore.create(newBook);
          await this.#router.navigate(['/books', 'details', created.isbn]);
        }
      }
    }
  );
}
```

Angular generiert daraus ein WebMCP-Tool mit folgendem Verhalten:

- Die Felder `isbn`, `title`, `subtitle`, `authors`, `description` und `imageUrl` werden als Parameter aus dem initialen Wert des Signals abgeleitet.
- `title`, `isbn` und `description` werden als `required` markiert, weil sie einen `required()`-Validator besitzen.
- `authors` wird als Array von Strings erkannt, weil der initiale Wert ein nicht-leeres Array ist.
- Wenn der Agent das Tool aufruft, validiert Angular die Eingaben und gibt eventuelle Fehler zurück – der Agent kann sich selbst korrigieren und es erneut versuchen.
- Bei erfolgreicher Validierung wird automatisch die `submission.action` ausgeführt.

### Einschränkungen beim Form-Model

Angular leitet die Typen aus den initialen Werten ab.
Dabei gelten zwei Einschränkungen:

- Felder dürfen **nicht** mit `null` oder `undefined` initialisiert werden – Angular kann daraus keinen Typ ableiten.
- Arrays müssen **mindestens einen Eintrag** enthalten, damit der Elementtyp erkannt werden kann.

Außerdem werden asynchrone Validatoren beim Tool-Aufruf nicht ausgeführt.
Asynchrone Prüfungen (z. B. Eindeutigkeitschecks gegen einen Server) sollten stattdessen in der `submission.action` behandelt werden.

## Testen im Browser

Um WebMCP lokal zu testen, muss das experimentelle Feature im Browser aktiviert werden.
In Chrome geht das über das Flag:

```text
chrome://flags/#enable-webmcp-testing
```

Anschließend steht die Testing-API `navigator.modelContextTesting` in der Browser-Konsole zur Verfügung.
Damit lässt sich ein registriertes Tool manuell aufrufen:

```js
const result = await navigator.modelContextTesting.executeTool(
  'createBook',
  JSON.stringify({
    title: 'Web MCP',
    isbn: '9871234567890',
    description: 'A brand new book about Web MCP',
    authors: ['Claude Opus 4.6'],
    imageUrl: 'https://picsum.photos/200'
  })
);
console.log(JSON.parse(result));
```

### Chrome Extension für WebMCP

Zusätzlich gibt es eine [WebMCP Chrome Extension](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd), die das Debugging deutlich erleichtert.
Mit der Extension können wir:

- sehen, welche Tools auf einer Seite registriert sind (über die `navigator.modelContext`-API),

- Tools manuell aufrufen und die Ergebnisse inspizieren,

- prüfen, ob das JSON-Schema korrekt definiert ist und

- per natürlicher Sprache mit dem Agenten interagieren und testen, ob er die richtigen Tools erkennt und aufruft.


### Unit-Tests

Für automatisierte Unit-Tests empfiehlt die Angular-Dokumentation das Paket [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill) als Mock-Implementierung der Browser-API.

## Fazit

WebMCP ist ein spannendes neues Konzept, das die Art und Weise verändern könnte, wie KI-Agenten mit Web-Anwendungen interagieren.
Wichtig ist dabei zu betonen, dass es sich aktuell noch nicht um einen verabschiedeten Webstandard handelt, sondern um einen frühen Entwurf einer W3C Community Group, der bislang nur experimentell in Chrome verfügbar ist.
Angular macht den Einstieg durch die Integration in die bestehende Architektur – insbesondere die Brücke zu Signal Forms – aber bereits heute bemerkenswert einfach.
Die APIs sind explizit als experimentell markiert, und es bleibt abzuwarten, ob und in welcher Form sich der Vorschlag tatsächlich als Standard etablieren wird.

Alle Details findest du im offiziellen [Angular WebMCP Guide](https://angular.dev/ai/webmcp).


<hr>

<small>**Titelbild:** generiert mit Adobe Firefly, bearbeitet</small>
