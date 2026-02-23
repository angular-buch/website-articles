---
title: 'Server-Side Rendering mit Angular'
published: 2026-02-23
lastModified: 2026-02-23
---

# Server-Side Rendering (SSR) mit Angular

Single-Page-Anwendungen mit Angular bieten grundsätzlich eine gute Performance:
Im Gegensatz zu einer herkömmlichen Webanwendung ist der Anwendungscode bereits nach dem Start im Browser verfügbar, und weitere Inhalte werden zur Laufzeit nachgeladen.
Wir profitieren davon mit schnellen Seitenwechseln und Reaktionszeiten.
Ist die Anwendung einmal heruntergeladen, müssen nur noch die darzustellenden Daten und ggf. kleinere Anwendungsteile vom Server geladen werden.

So gut diese Eigenschaften aber auch klingen: Sie gehen mit Nachteilen einher.
Bis die Anwendung überhaupt vom Server heruntergeladen ist, vergeht Zeit.
Das fällt insbesondere bei einer langsamen Internetverbindung ins Gewicht.
Währenddessen sehen wir lediglich eine leere Seite.

In diesem Kapitel geht es darum, eine Angular-Anwendung bereits auf dem Server zu rendern und so an den Client auszuliefern.
Das bringt Verbesserungen in der wahrgenommenen Performance und optimiert die Seite besser für Suchmaschinen.

## Single-Page-Anwendungen, Suchmaschinen und Start-Performance

Die Basis einer Angular-Anwendung ist eine einzige leere HTML-Seite.
Sie ist der Einstiegspunkt in die Anwendung und die Seite, die beim Start im Browser geladen wird.

Dafür nehmen wir uns eine Angular-Anwendung, z. B. das Projekt *BookManager* aus dem Angular-Buch.
Wir starten die Anwendung mit `ng serve`, öffnen die Seite im Browser und lassen uns den Seitenquelltext anzeigen.
Bitte schau dir die Datei wirklich im Browser an, denn das "Original" aus dem Dateisystem enthält nicht die Referenzen auf die gebauten Bundles.
Nutze bitte auch nicht den Elements-Tab in den Chrome DevTools, sondern die statische Quelltextanzeige.
In Chrome klickst du dazu rechts in die Seite und wählst *View Page Source* / *Seitenquelltext anzeigen*.

Dort bekommen wir den folgenden Quelltext präsentiert:

```html
<!doctype html>
<html lang="en">
<head>
  <script type="module" src="/@vite/client"></script>

  <meta charset="utf-8">
  <title>BookManager</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <app-root></app-root>
  <script src="main.js" type="module"></script>
</body>
</html>
```

Diese Seite enthält nur ein HTML-Grundgerüst und ist ansonsten weitgehend leer.
Der Kern des Geschehens versteckt sich in den unteren Zeilen:
Wir sehen hier das Host-Element unserer Anwendung, welches dem Selektor der Komponente `App` entspricht, also in der Regel `<app-root>`.
Außerdem werden mithilfe von `<script>`-Tags die Bundles eingebunden, die beim Build erzeugt wurden.
Die Bundles enthalten die Angular-Anwendung, die das Element `<app-root>` mit Leben füllt.

Wir sehen hier das Grundprinzip einer Single-Page-Anwendung:
Die Basis ist eine (mehr oder weniger) leere HTML-Seite, und alle weiteren Inhalte werden mithilfe von JavaScript geladen, das in den Bundles untergebracht ist.
Die Seite wird zur Laufzeit der Anwendung niemals neu geladen, sondern der Router sorgt dafür, dass alle sichtbaren Seitenwechsel nur innerhalb der Angular-Anwendung durchgeführt werden.
Es findet dabei niemals eine echte Navigation im Browser statt, sondern Angular verwaltet die History des Browsers und erzeugt virtuelle Seitenwechsel.

Stellen wir uns nun einmal vor, dass die Ausführung von JavaScript im Browser deaktiviert ist.
Die statische HTML-Seite enthält dann keine Inhalte, und die Seite bleibt leer.
*Doch deaktiviert heutzutage noch jemand JavaScript im Browser?*
Diese Frage lässt sich klar mit *Ja* beantworten:
Auch Suchmaschinen und AI-Werkzeuge rufen unsere Website ab, und viele von ihnen können gar kein JavaScript ausführen.
Der Crawler von Google kann zwar JavaScript interpretieren, tut das allerdings nicht immer.
Rechenzeit ist teuer. Der GoogleBot führt JavaScript deshalb nur auf hoch bewerteten Seiten aus.
Die erste Indexierung wird immer nur über die empfangene statische HTML-Seite durchgeführt.
Wer hier versagt, wird höchstwahrscheinlich von den Algorithmen des Bots nicht gut bewertet.
Das bedeutet, dass Suchmaschinen lediglich eine weiße Seite sehen – für die Positionierung unserer Inhalte in den Suchergebnissen ist das eine denkbar schlechte Idee.

Diese Thematik betrifft auch andere Situationen, in denen Maschinen unsere Anwendung aufrufen.
Ein gutes Beispiel dafür ist die Inhaltsvorschau in sozialen Netzwerken.
Wenn du einen Link zu deiner Anwendung auf BlueSky oder LinkedIn postest, generiert die Plattform automatisch eine ansprechende Vorschau mit einem Bild und dem Text von der Seite.
Ist die abgerufene Seite allerdings leer, wird die Vorschau nur wenige Informationen enthalten.

Ein weiteres Problem tritt auf, wenn wir die Ladezeit der Anwendung über eine echte Internetverbindung betrachten.
Ist die Anwendung einmal geladen, so reagiert sie schnell.
Doch bis alle Bundles heruntergeladen wurden und Angular die Seite gerendert hat, vergeht Zeit.
Diese initiale Wartezeit lässt sich bereits dadurch optimieren, dass wir die Anwendung gezielt in Features separieren und einige Teile mithilfe von Lazy Loading oder Deferrable views erst später nachladen.
Trotzdem benötigt der Prozess eine Weile, und währenddessen sehen wir nur eine weiße Seite.

Für diese Herausforderungen gibt es zwei effektive Lösungen:

**Keine Single-Page-Anwendung nutzen:** Mit einer herkömmlichen Webanwendung gibt es diese Probleme nicht.
Dafür stehen wir vor anderen Herausforderungen: Das Nachladen dynamischer oder interaktiver Inhalte gestaltet sich als deutlich komplizierter.
Außerdem verzichten wir dann auf Angular, und das wäre wirklich schade!

**HTML-Seite nicht leer lassen:** Wir können uns darum bemühen, die ausgelieferte HTML-Seite mit Leben zu füllen, sodass Menschen und Suchmaschinen bereits einen sinnvollen Inhalt statt einer leeren Seite erhalten.
Das macht die Wartezeit erträglicher, und auch für Suchmaschinen, AI-Agenten und die automatische Inhaltsvorschau sind schon die nötigen Inhalte an Bord.

Damit wir die Inhalte dieser HTML-Seite nicht statisch hinterlegen müssen, wollen wir die echte Angular-Anwendung als Grundlage nutzen.
Wir betrachten dazu in diesem Artikel verschiedene Strategien:

- **Server-Side Rendering (SSR)**: Die Anwendung wird bei jedem Request auf dem Server gerendert.
- **Pre-Rendering (SSG)**: Die Anwendung wird zur Build-Zeit gerendert und als statische HTML-Dateien ausgeliefert.
- **Client-Side Rendering (CSR)**: Die Anwendung wird wie gewohnt im Browser gerendert.

Angular ermöglicht es, diese Strategien pro Route individuell zu konfigurieren – das nennt sich *Hybrid Rendering*.

Diese Aufgabe klingt zunächst nach viel Arbeit, doch die Plattformunabhängigkeit von Angular kommt uns zugute:
Angular verfügt bereits über alle Voraussetzungen, um nicht nur in einem Browser ausgeführt zu werden, sondern auch auf dem Server.

## SSR aktivieren

Als wir im Angular-Buch das Beispielprojekt *BookManager* angelegt haben, haben wir bewusst die Option `--no-ssr` verwendet:

```bash
ng new book-manager --style=css --no-ssr
```

Dadurch wurde kein zusätzlicher Quellcode zur Umsetzung von Server-Side Rendering generiert.
Das hat den Vorteil, dass wir uns zunächst auf die Grundlagen von Angular konzentrieren konnten, ohne uns mit der Komplexität von SSR auseinandersetzen zu müssen.

### SSR bei der Projekterstellung aktivieren

Wenn wir von Anfang an SSR nutzen möchten, können wir das Projekt ohne die Option `--no-ssr` anlegen:

```bash
ng new book-manager --style=css
```

Die Angular CLI fragt dann interaktiv nach, ob SSR aktiviert werden soll.
Alternativ können wir SSR auch explizit aktivieren:

```bash
ng new book-manager --style=css --ssr
```

### SSR nachträglich aktivieren

Haben wir ein bestehendes Projekt ohne SSR angelegt, können wir die Funktionalität jederzeit nachträglich hinzufügen.
Dazu nutzen wir das folgende Kommando:

```bash
ng add @angular/ssr
```

### Struktur des Projekts

Es werden verschiedene Abhängigkeiten installiert, und unsere Anwendung erhält eine Reihe von zusätzlichen Dateien und Änderungen:

- **`src/server.ts`**: enthält das Grundgerüst für den Serverprozess, der die Angular-Anwendung rendert und das erzeugte HTML ausliefert
- **`src/main.server.ts`**: Einstiegspunkt für den Server-Build
- **`src/app/app.config.ts`**: angepasste clientspezifische Konfiguration der Anwendung mit [Hydration](#hydration)
- **`src/app/app.config.server.ts`**: serverspezifische Konfiguration der Anwendung
- **`src/app/app.routes.server.ts`**: Server-Routing-Konfiguration, in der wir festlegen, wie jede Route gerendert werden soll
- **`angular.json`**: enthält neue Abschnitte mit der Build-Konfiguration für die servergerenderte Anwendung
- **`package.json`**: enthält neue Abhängigkeiten und NPM-Skripte für den Build-Prozess

In der Datei `angular.json` wird unter dem Build-Target `build` die SSR-Konfiguration hinterlegt.
Mit `outputMode` legen wir fest, wie die Anwendung ausgeliefert wird:
Der Wert `server` sorgt dafür, dass ein Server-Bundle generiert wird, das die Anwendung zur Laufzeit rendern kann.

```json
{
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          "options": {
            "server": "src/main.server.ts",
            "outputMode": "server",
            "ssr": {
              "entry": "src/server.ts"
            }
          }
        }
      }
    }
  }
}
```

## Server-Routing konfigurieren

Angular bietet eine flexible Möglichkeit, für jede Route individuell festzulegen, wie sie gerendert werden soll.
Die Konfiguration erfolgt in der Datei `app.routes.server.ts` mithilfe von `RenderMode`:

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Startseite wird im Client gerendert (CSR)
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  // Statische Seite wird beim Build vorgerendert (SSG)
  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },
  // Buchliste wird auf dem Server gerendert (SSR)
  {
    path: 'books',
    renderMode: RenderMode.Server,
  },
  // Alle anderen Routen werden auf dem Server gerendert
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
```

Die drei verfügbaren Rendering-Modi sind:

| Rendering-Modus             | Beschreibung                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `RenderMode.Server` (SSR)   | Die Anwendung wird bei jedem Request auf dem Server gerendert. Das ist ideal für dynamische Inhalte.   |
| `RenderMode.Client` (CSR)   | Die Anwendung wird im Browser gerendert. Das ist das Standard-Verhalten von Angular.           |
| `RenderMode.Prerender` (SSG)| Die Anwendung wird zur Build-Zeit gerendert. Das ist ideal für statische Inhalte.                      |

Die Server-Routing-Konfiguration wird in der Datei `app.config.server.ts` registriert:

```typescript
// app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

Die Serverkonfiguration wird mit `mergeApplicationConfig` mit der allgemeinen Konfiguration der Anwendung zusammengeführt.
Auf diese Weise müssen wir die Provider nicht doppelt definieren.

## Server-Side Rendering (SSR)

Wir wollen zuerst das dynamische serverseitige Rendering betrachten.
Die Grundidee ist die folgende:
Wird die Anwendung vom Browser angefragt, so wird zuerst die `index.html` ausgeliefert.
Diese Seite ist hingegen nicht leer, sondern auf dem Server wurde bereits die gesamte Angular-Anwendung mit der angefragten Route *gebootstrappt*.
Der resultierende DOM mit allen Komponenten und Inhalten wird als reiner Text in der Datei `index.html` zum Client ausgeliefert.
Diese HTML-Seite enthält außerdem weiterhin die `<script>`-Tags, mit denen die Anwendungsbundles geladen werden.
Sobald die Anwendung im Client hochgefahren ist, übernimmt Angular die gerenderte Seite und funktioniert wie gewohnt.
Zunächst sieht man im Browser das vorgerenderte HTML, anschließend *hydriert* Angular die Anwendung.
Im Idealfall bekommt man von diesem Prozess allerdings gar nichts mit und wir können die Anwendung nach dem Laden wie gewohnt nutzen.

### Die Anwendung bauen

Nach der Einrichtung kann die Anwendung wie gewohnt gebaut werden:

```bash
ng build
```

Im Ordner `dist/book-manager` befinden sich nun zwei Unterordner `browser` und `server`.
Sie enthalten die gebaute Anwendung in zwei Varianten: die normal gebaute Anwendung zur Ausführung im Browser und dieselbe Anwendung für den Server, sodass sie mit Node.js ausgeführt werden kann.
Der Serverprozess aus der Datei `src/server.ts` wurde bereits in das Serverbundle integriert.

### Den Server starten

Nach dem Bauen der Anwendung können wir den Serverdienst schließlich ausführen.
Das funktioniert entweder direkt mit Node.js aus dem Ordner `dist/book-manager/server` oder indem wir das vorbereitete NPM-Skript nutzen:

```bash
npm run serve:ssr:book-manager
```

Der Server startet, und wir können die Anwendung nun unter `http://localhost:4000` erreichen.

Wirf nun noch einmal einen Blick in den Quellcode der ausgelieferten HTML-Seite: Du wirst sehen, dass das Element `<app-root>` den vorgerenderten Inhalt der Angular-Anwendung enthält.
Das serverseitige Rendering hat also funktioniert!

### Entwicklungsserver mit SSR

Für die Entwicklung müssen wir die Anwendung nicht jedes Mal manuell bauen.
Wenn SSR aktiviert ist, wird der Entwicklungsserver automatisch mit SSR-Unterstützung gestartet.
Wir können die Anwendung also wie gewohnt mit `ng serve` starten und gleichzeitig das serverseitige Rendering testen.

```bash
ng serve
```

## Pre-Rendering (SSG)

Wir haben gesehen, wie Server-Side Rendering funktioniert.
Obwohl diese Strategie gut funktioniert, hat sie zwei Nachteile:

- Es wird immer ein Server mit Node.js benötigt. Ein einfacher Webserver, der die Dateien statisch ausliefert, reicht nicht aus.
- Die Angular-Anwendung wird bei jedem Request vollständig hochgefahren, gerendert und wieder abgebaut. Für Seiten mit dynamischen Inhalten ist das sinnvoll. Statische Seiten wie Impressum, Datenschutzerklärung oder Infoseiten hingegen müssen nicht bei jedem Request neu berechnet werden, da sich der Inhalt selten ändert.

Für statische Inhalte müssen wir das serverseitige Rendering nicht zur Laufzeit durchführen.
Stattdessen können wir die Anwendung bereits zur Build-Zeit rendern und die erzeugten HTML-Seiten im Dateisystem ablegen.
Von dort aus werden die Seiten schließlich von einem normalen Webserver ausgeliefert.
Dieses Prinzip nennt sich *Pre-Rendering* oder auch *Static Site Generation (SSG)*.

Um eine Route für Pre-Rendering zu konfigurieren, verwenden wir in der Server-Routing-Konfiguration die Variante `RenderMode.Prerender`:

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'books',
    renderMode: RenderMode.Prerender,
  },
];
```

Beim Build wird für jede festgelegte Route eine statische HTML-Datei gerendert.
Damit anschließend der Aufruf der URL `/books` auch tatsächlich die passende vorgerenderte HTML-Datei ausliefert, werden die einzelnen Dateien in Unterordner gegliedert und jeweils mit `index.html` benannt.
Das passiert beim Build automatisch, wie wir im Ordner `dist/book-manager/browser` sehen können.

### Parametrisierte Routen mit `getPrerenderParams`

Bei Routen mit Parametern wie `books/details/:isbn` ist nicht automatisch bekannt, welche konkreten Parameter eingesetzt werden müssen.
Der Build-Prozess kennt die möglichen ISBNs nicht.

Deshalb können wir die Funktion `getPrerenderParams()` verwenden.
Sie gibt ein Array von Objekten zurück, wobei jedes Objekt die Parameter für eine zu rendernde Route enthält.
Wir können zum Beispiel einen Service nutzen, um die Liste der ISBNs vom Server abzurufen.
Bitte beachte, dass wir hier das native `async`/`await` verwenden, das mit Promises arbeitet. Die Methode `getISBNList()` muss also eine Promise zurückgeben.

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';
import { inject } from '@angular/core';
import { BookStore } from './shared/book-store';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'books/details/:isbn',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const bookStore = inject(BookStore);
      const isbns = await bookStore.getISBNList();
      // Erzeugt Pfade wie: /books/details/1234567890, /books/details/0987654321
      return isbns.map(isbn => ({ isbn }));
    },
  },
];
```

> **Wichtig:** Die Funktion `inject()` muss synchron aufgerufen werden, bevor ein `await` verwendet wird.
> Sie kann nicht innerhalb von asynchronen Callbacks oder nach `await`-Statements verwendet werden.

### Fallback-Strategien

Wenn eine Route mit `RenderMode.Prerender` konfiguriert ist, aber nicht alle möglichen Parameter zur Build-Zeit bekannt sind, können wir eine Fallback-Strategie definieren.
Sie legt fest, was passiert, wenn eine nicht vorgerenderte Route angefragt wird:

```typescript
// app.routes.server.ts
import { RenderMode, PrerenderFallback, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'books/details/:isbn',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server, // Fallback zu SSR
    async getPrerenderParams() {
      // Nur die beliebtesten Bücher vorrendern
      return [{ isbn: '1234567890' }, { isbn: '0987654321' }];
    },
  },
];
```

Die verfügbaren Fallback-Strategien sind:

- `PrerenderFallback.Server` (Standard): Die Route wird zur Laufzeit auf dem Server gerendert (SSR).
- `PrerenderFallback.Client`: Die Route wird im Browser gerendert (CSR).
- `PrerenderFallback.None`: Es wird ein 404-Fehler zurückgegeben.

### SSG für die gesamte Anwendung

Standardmäßig erzeugt Angular beim Build sowohl vorgerenderte HTML-Dateien als auch einen Server für SSR.
Wenn du eine vollständig statisch gerenderte Anwendung ohne Server erstellen möchtest, kannst du in der `angular.json` den `outputMode` auf `static` setzen:

```json
{
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static"
          }
        }
      }
    }
  }
}
```

Mit dieser Einstellung werden nur statische HTML-Dateien erzeugt, und es wird kein Server-Bundle generiert.
Die Anwendung kann dann auf einem einfachen Webserver oder CDN gehostet werden.

Im Ordner `dist/book-manager/browser` befindet sich danach die geplante Ordnerstruktur mit den statisch vorgerenderten HTML-Dateien.
Außerdem enthält der Ordner weiterhin die komplette Angular-Anwendung für den Browser.
Du kannst den gesamten Ordner nun wie gewohnt mit einem Webserver bereitstellen.
Fragen wir die Route `/books` an, so wird zuerst die vorgerenderte Datei `books/index.html` ausgeliefert.
Anschließend werden die JavaScript-Bundles heruntergeladen, die mittels `<script>`-Tags eingebunden sind.
Ist die Anwendung vollständig geladen und gebootstrappt, übernimmt Angular die servergerenderte Seite, und die Anwendung funktioniert wie gewohnt.
Suchmaschinen sehen hingegen schon direkt den gerenderten Inhalt und können die Seite indexieren.

## Warten auf asynchrone Operationen

Sowohl beim Server-Side Rendering als auch beim Pre-Rendering wird die Anwendung vollständig ausgeführt.
Das bedeutet, dass z. B. auch HTTP-Requests durchgeführt und Timer gestartet werden.
Damit die Seite nicht unvollständig ausgeliefert wird, wartet der Server, bis alle HTTP-Requests und Timer beendet sind.

Das hat zwar den Vorteil, dass die Seite mit allen Daten gerendert wird, die per HTTP abgerufen werden – der Seitenaufbau verzögert sich allerdings, wenn diese Operationen Zeit in Anspruch nehmen.
Kritisch wird es, wenn lang laufende Timer in der Anwendung existieren oder gar ein Intervall verwendet wird, das niemals endet.
Schließt die asynchrone Operation niemals ab, wird die Anwendung niemals gerendert!

Probier es aus: Setze ein `setTimeout()` oder `setInterval()` in den Code und starte die Anwendung mit Server-Side Rendering.
Die Seite wird erst geladen, wenn die Operationen abgeschlossen sind.

Du musst deshalb darauf achten, asynchrone Aufgaben nur zu starten, wenn sie in absehbarer Zeit enden – oder du darfst solche Operationen nicht durchführen, wenn die Anwendung auf dem Server läuft.

## Serverkompatible Komponenten schreiben

Auf dem Server ist kein Browser vorhanden, sondern der DOM wird lediglich emuliert.
Browserspezifische Objekte wie `window`, `document`, `navigator` oder `location` stehen deshalb nicht zur Verfügung, ebenso einige Eigenschaften von `HTMLElement`.
Ein Aufruf von `window` führt daher beim Server-Side Rendering zu einem Fehler: `ReferenceError: window is not defined`.
Wir müssen also mit einer Unterscheidung nach der Plattform dafür sorgen, dass dieser Code nur dann ausgeführt wird, wenn die Anwendung im Browser gerendert wird.

Dies kann durch die Lifecycle Hooks `afterEveryRender` und `afterNextRender` sichergestellt werden.
Diese werden nur im Browser ausgeführt und auf dem Server übersprungen:

```typescript
import { Component, afterNextRender } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  constructor() {
    afterNextRender(() => {
      // Dieser Code wird nur im Browser ausgeführt
      console.log('Window width:', window.innerWidth);
    });
  }
}
```

### Plattform bestimmen mit `PLATFORM_ID`

In manchen Fällen reicht `afterNextRender` nicht aus, z. B. wenn wir Code unterschiedlich ausführen müssen, aber kein Rendering betroffen ist.
Angular kann uns Auskunft darüber geben, auf welcher Plattform die Anwendung gerade ausgeführt wird.
Wir können dazu das Token `PLATFORM_ID` injizieren und zusammen mit den Funktionen `isPlatformBrowser()` und `isPlatformServer()` verwenden:

```typescript
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({ /* ... */ })
export class MyComponent {
  #platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      // Dieser Code wird nur im Browser ausgeführt
    }

    if (isPlatformServer(this.#platformId)) {
      // Dieser Code wird nur auf dem Server ausgeführt
    }
  }
}
```

> **Wichtig:** Vermeide `isPlatformBrowser()` in Templates mit `@if` oder anderen Bedingungen, um unterschiedliche Inhalte auf Server und Client zu rendern.
> Dies führt zu Hydration-Mismatches und Layout-Verschiebungen, die sich negativ auf die User Experience und Core Web Vitals auswirken.
> Verwende stattdessen `afterNextRender()` für browserspezifische Initialisierungen und halte den gerenderten Inhalt auf beiden Plattformen konsistent.

### Zugriff auf `document` über Dependency Injection

Anstatt direkt auf das globale `document`-Objekt zuzugreifen, solltest du das `DOCUMENT`-Token verwenden, um plattformunabhängig auf das Dokument zuzugreifen:

```typescript
import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ /* ... */ })
export class MyComponent {
  #document = inject(DOCUMENT);

  constructor() {
    const title = this.#document.title;
  }
}
```

> **Tipp:** Für die Verwaltung von Seitentitel und Meta-Tags bietet Angular die Services `Title` und `Meta` an.


## Hydration

Wir haben bereits erwähnt, dass Angular die servergerenderte Seite im Client *hydriert*.
Hydration ist der Prozess, bei dem Angular die vom Server gerenderten DOM-Strukturen wiederverwendet, den Anwendungszustand überträgt und bereits abgerufene Daten übernimmt.

Ohne aktivierte Hydration würde die Anwendung im Browser komplett neu gerendert. Das ist nicht nur aufwendig, sondern kann zu einem sichtbaren Flackern in der Oberfläche führen.
Außerdem wirkt sich das Neurendern negativ auf Core Web Vitals wie Largest Contentful Paint (LCP) aus und verursacht ggf. Layout Shifts.
Hydration verbessert die Performance, indem Angular die bereits gerenderten DOM-Elemente mit der Anwendungsstruktur abgleicht und wiederverwendet, statt sie neu zu erzeugen.

### Hydration aktivieren

Wenn du die Angular CLI verwendet hast, um SSR zu aktivieren (entweder bei der Projekterstellung oder später über `ng add @angular/ssr`), ist der Code zur Aktivierung von Hydration bereits in deiner Anwendung enthalten.

Bei einer manuellen Einrichtung kannst du Hydration aktivieren, indem du den passenden Provider in der Datei `main.ts` hinzufügst:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideClientHydration } from '@angular/platform-browser';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    // ...
    provideClientHydration(),
  ],
});
```

### Hydration überprüfen

Um zu überprüfen, ob Hydration aktiviert ist, öffne die Entwicklertools im Browser und schau in die Konsole.
Du solltest eine Meldung mit Hydration-bezogenen Statistiken sehen, z. B. die Anzahl der hydrierten Komponenten und Knoten.

### Event Replay

Wenn eine Anwendung auf dem Server gerendert wird, ist sie im Browser sichtbar, sobald das erzeugte HTML geladen ist.
Benutzer könnten annehmen, dass sie mit der Seite interagieren können, aber Event-Listener werden erst nach Abschluss der Hydration angehängt.

Mit dem Event Replay-Feature können alle Events, die vor der Hydration auftreten, erfasst und nach Abschluss der Hydration wiedergegeben werden.
Du kannst es mit der Funktion `withEventReplay()` aktivieren:

```typescript
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(withEventReplay()),
  ],
});
```

### Hydration für einzelne Komponenten überspringen

Einige Komponenten funktionieren möglicherweise nicht korrekt mit aktivierter Hydration, z. B. wenn sie direkte DOM-Manipulation verwenden.
Als Workaround kannst du das Attribut `ngSkipHydration` zum Host-Element einer Komponente hinzufügen, um die Hydration für die gesamte Komponente zu überspringen:

```html
<app-chart ngSkipHydration></app-chart>
```

Alternativ kannst du das Attribut als Host Binding setzen. Es wird dann aus der Komponente heraus auf ihr Host-Element angewendet.

```typescript
@Component({
  // ...
  host: { ngSkipHydration: 'true' },
})
export class ChartViewer { }
```

> **Hinweis:** Das Attribut `ngSkipHydration` kann nur auf Komponenten-Host-Knoten verwendet werden.
> Wenn du es zur Root-Komponente hinzufügst, wird die Hydration für die gesamte Anwendung deaktiviert.

### Einschränkungen bei der Hydration

Für die Hydration ist es wichtig, dass die Anwendung auf Server und Client die exakt gleiche DOM-Struktur erzeugt.
Das betrifft auch Whitespaces und Kommentarknoten.

Komponenten, die direkte DOM-Manipulation mit nativen DOM-APIs durchführen, sind die häufigste Ursache für Probleme.
Wenn du Komponenten hast, die den DOM mit nativen APIs manipulieren oder die nativen HTML-Propertys `innerHTML` bzw. `outerHTML` verwenden, wird der Hydration-Prozess auf Fehler stoßen.

Verwende, wenn möglich, immer die Schnittstellen des Frameworks.
Falls das bei komplexen Szenarien nicht möglich ist, verwende das Attribut `ngSkipHydration` als Workaround.

## Incremental Hydration

Incremental Hydration ist eine fortgeschrittene Form der Hydration.
Sie ermöglicht eine genaue Kontrolle darüber, wann die Hydration stattfindet.
Teile der Anwendung können dehydriert bleiben und erst bei Bedarf hydriert werden.

Wenn wir Incremental Hydration verwenden, werden die definierten Bereiche beim Build in eigene Bundles verpackt, die erst später geladen werden.
Die initialen Bundles, die beim Start heruntergeladen werden müssen, sind also kleiner.
Das verbessert die initialen Ladezeiten und reduziert First Input Delay (FID) und Cumulative Layout Shift (CLS).

### Incremental Hydration aktivieren

Du kannst Incremental Hydration für Anwendungen aktivieren, die bereits SSR mit Hydration verwenden:

```typescript
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(withIncrementalHydration()),
  ],
});
```

> **Hinweis:** Incremental Hydration aktiviert automatisch Event Replay.
> Wenn du bereits `withEventReplay()` in der Liste der Providers hast, kannst du es nach der Aktivierung von Incremental Hydration entfernen.

### `@defer` mit Hydration-Triggern

Im Buch haben wir bereits `@defer` kennengelernt, um Teile der Anwendung verzögert zu laden.
Ohne Incremental Hydration hätte ein `@defer`-Block im sichtbaren Bereich dazu geführt, dass zuerst der Placeholder-Inhalt gerendert und dann durch den Hauptinhalt ersetzt wird – was einen Layout-Shift verursacht hätte.
Mit Incremental Hydration wird der Hauptinhalt des `@defer`-Blocks ohne Layout-Shift gerendert.

Dafür kannst du zusätzliche Hydration-Trigger zu `@defer`-Blöcken hinzufügen, die definieren, wann die Hydration stattfinden soll.
Die so markierten Inhalte bleiben zunächst dehydriert, bis der Hydration-Trigger auslöst.

| Trigger                    | Beschreibung                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| `hydrate on idle`          | Löst aus, wenn der Browser im Leerlauf ist.                               |
| `hydrate on viewport`      | Löst aus, wenn der Inhalt in den sichtbaren Bereich scrollt.              |
| `hydrate on interaction`   | Löst aus, wenn der Benutzer mit dem Element interagiert (Klick, Tastatur).|
| `hydrate on hover`         | Löst aus, wenn die Maus über den Bereich fährt.                           |
| `hydrate on immediate`     | Löst sofort aus, nachdem der nicht-verzögerte Inhalt gerendert wurde.     |
| `hydrate on timer(ms)`     | Löst nach einer bestimmten Zeitspanne aus.                                |
| `hydrate when <condition>` | Löst aus, wenn eine benutzerdefinierte Bedingung wahr wird.               |
| `hydrate never`            | Der Inhalt bleibt dauerhaft dehydriert (statischer Inhalt).               |

### Beispiele für Hydration-Trigger

```html
<!-- hydriert, wenn der Browser im Leerlauf ist -->
@defer (hydrate on idle) {
  <app-comments />
} @placeholder {
  <div>Kommentare werden geladen …</div>
}

<!-- hydriert, wenn der Inhalt in den sichtbaren Bereich scrollt -->
@defer (hydrate on viewport) {
  <app-footer />
} @placeholder {
  <div>Footer-Platzhalter</div>
}

<!-- hydriert bei Benutzerinteraktion -->
@defer (hydrate on interaction) {
  <app-interactive-chart />
} @placeholder {
  <div>Diagramm-Platzhalter</div>
}

<!-- hydriert nach 2 Sekunden -->
@defer (hydrate on timer(2000ms)) {
  <app-delayed-content />
} @placeholder {
  <div>Inhalt wird geladen …</div>
}

<!-- hydriert basierend auf einer Bedingung -->
@defer (hydrate when isLoggedIn) {
  <app-user-dashboard />
} @placeholder {
  <div>Dashboard-Platzhalter</div>
}

<!-- bleibt dauerhaft dehydriert (statischer Inhalt) -->
@defer (on viewport; hydrate never) {
  <app-static-footer />
} @placeholder {
  <div>Footer-Platzhalter</div>
}
```

### Hydration-Trigger mit regulären Triggern kombinieren

Hydration-Trigger können zusammen mit regulären `@defer`-Triggern verwendet werden.
Hydration wird einmalig beim Start der Anwendung ausgeführt, daher gelten Hydration-Trigger nur für diesen initialen Ladevorgang.
Beim nachfolgenden clientseitigen Rendering (z. B. beim Seitenwechsel mit Routing) wird der reguläre Trigger verwendet:

```html
@defer (on idle; hydrate on interaction) {
  <app-comments />
} @placeholder {
  <div>Kommentare werden geladen …</div>
}
```

`@defer` muss immer einen `@placeholder` besitzen.
Der Inhalt wird zwar nicht für Incremental Hydration verwendet, ist aber für das nachfolgende clientseitige Rendering notwendig.
Wechseln wir nach dem Start der Anwendung auf eine Unterseite der Anwendung, findet keine erneute Hydration statt.
Die Komponente wird rein lokal im Browser geladen, und die Inhalte des `@defer`-Blocks werden regulär gerendert.
In diesen Fällen wird der `@placeholder` angezeigt.

## Wann setze ich serverseitiges Rendering ein?

Server-Side Rendering und Pre-Rendering sind wirkungsvolle Mittel, um die wahrgenommene Ladezeit einer Anwendung zu verkürzen.
Außerdem wird die initiale HTML-Seite nicht leer ausgeliefert, sondern enthält bereits Informationen, die für Suchmaschinen und automatische Inhaltsvorschau sinnvoll sind.
Obwohl beide Strategien mit moderatem Aufwand umsetzbar sind, sollte immer untersucht werden, ob sich der Einsatz von serverseitigem Rendering für eine bestimmte Anwendung lohnt.
Dazu solltest du stets folgende Fragen beantworten:

- Wird die Anwendung über einen externen Link aufgerufen?
- Besuchen Suchmaschinen, Crawler oder AI-Agenten die Seite?
- Ist die wahrgenommene Start-Performance der Anwendung ein wichtiges Kriterium für die User Experience?

**Öffentliche Anwendungen:** Sinnvoll ist der Einsatz von Server-Side Rendering bei öffentlichen Portalen, deren Angebot über Links erreichbar ist und von Suchmaschinen indexiert wird.
Wenn wir die Seite mit einer potenziell langsamen Internetverbindung nutzen, kann die vorgerenderte HTML-Seite die gefühlte Performance verbessern.
Solche Anwendungen können z. B. ein Online-Shop, Blog oder eine öffentliche Firmenwebsite sein.

**Firmeninterne Anwendungen:** Für ausschließlich interne Anwendungen ist es meist nicht notwendig, das Rendering auf dem Server vorzunehmen.
Die Seite wird nicht von öffentlichen Suchmaschinen indexiert und wird hauptsächlich auf Desktop-Rechnern genutzt oder sogar lokal ausgeliefert.
Beispiele sind Intranetportale, Verwaltungssoftware und Desktopanwendungen.
Auch bei hochdynamischen Inhalten, die sich erst aus der Interaktion in der Oberfläche ergeben (z. B. ein Chat), kann es sein, dass Server-Side Rendering nicht zielführend ist.
Ebenso musst du nur die Seiten vorrendern, die von extern über einen Link aufgerufen werden können.
Interne Bereiche wie die individuelle Bestellverwaltung in einem Online-Shop müssen also nicht servergerendert werden.

**Statische Inhalte:** Pre-Rendering bietet sich immer dann an, wenn die Anwendung statische Inhalte besitzt, die keinen zeitlichen Bezug haben und sich nur aus dem Code der Anwendung ergeben.
Dabei musst du dich nicht für eine Strategie entscheiden, sondern du kannst dynamisches Server-Side Rendering und statisches Pre-Rendering parallel nutzen.
Beispielsweise kannst du die Startseite mit dynamischen Inhalten mittels Server-Side Rendering ausliefern, während das Impressum, das Kontaktformular und die Firmenhistorie auf der Website durch Pre-Rendering erzeugt werden.
Da für das Pre-Rendering immer die Pfade aller zu rendernden Routen bekannt sein müssen, eignet sich dieses Verfahren ohnehin nur für statische Seiten.
Geschützte Bereiche wie eine Nutzerverwaltung hingegen solltest du gar nicht vorrendern.
