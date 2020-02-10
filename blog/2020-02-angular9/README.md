---
title: 'Angular 9 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2020-02-10
lastModified: 2020-02-10
keywords:
  - Angular
  - Angular 9
  - Ivy
  - TestBed
  - i18n
  - SSR
  - TypeScript
language: de
thumbnail: ./angular9.jpg
sticky: false
hidden: true
---

Am 6. Februar 2020 wurde bei Google in Kalifornien der "rote Knopf" gedrückt: Das lang erwartete neue Release ist da – die neue Major-Version **Angular 9.0.0**! Wir werden Ihnen in diesem Artikel die wichtigsten Neuerungen vorstellen.

Durch eine Reihe von Bugs und offene Features hatte sich das Release um einige Wochen verzögert – ursprünglich angestrebt war das Release im November.
Der wohl wichtigste Punkt ist die Umstellung auf den neuen Renderer _Ivy_, der einige Features und vor allem Verbesserungen in der Performance mit sich bringt.
Es gibt auch wieder kleinere Breaking Changes, doch das Update auf die neue Version ist undramatisch und geht leicht von der Hand.

Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular Blog](https://blog.angular.io/23c97b63cfa3).

**Inhalt**

- [Update auf Angular 9](#update-auf-angular-9)
- [Der neue Ivy-Renderer](#der-neue-ivy-renderer)
  - [Bundle Sizes](#bundle-sizes)
  - [AOT per Default](#aot-per-default)
  - [Change Detection](#change-detection)
  - [Testing](#testing)
- [Server-Side Rendering und Pre-Rendering](#server-side-rendering-und-pre-rendering)
- [`TestBed.inject<T>`: Abhängigkeiten im Test anfordern](#testbed-inject)
- [i18n mit `@angular/localize`](#i18n-mit-angularlocalize)
- [`@ViewChild()` und `@ContentChild()`](#viewchild-und-contentchild)
- [Weitere Neuigkeiten](#weitere-neuigkeiten)
  - [Verbesserte Typprüfung in Templates](#template-checks)
  - [Schematics für Interceptoren](#schematics-interceptor)
  - [`providedIn` für Services: `any` und `platform`](#provided-in)
  - [Optional Chaining mit TypeScript](#optional-chaining-mit-typescript)
  - [Nullish Coalescing mit TypeScript](#nullish-coalescing-mit-typescript)

## Update auf Angular 9

Das Update zur neuen Angular-Version ist in wenigen Schritten getan.
Falls Ihr Projekt noch nicht in der letzten Version von Angular 8 vorliegt, sollten Sie zunächst das folgende Update erledigen:

```bash
ng update @angular/cli@8 @angular/core@8
```

Anschließend kann das Update auf Angular 9 erfolgen:

```bash
ng update @angular/cli @angular/core
```

Die Angular CLI führt automatisch alle nötigen Anpassungen am Code der Anwendung durch, sofern notwendig.
Hier zeigt sich bereits die erste Neuerung: Beim `ng update` werden ab sofort ausführliche Informationen zu neuen Features ausgegeben, die Ihnen beim Update helfen.
Außerdem verwendet die Angular CLI jetzt zur Durchführung des Updates unter der Haube jetzt immer die Version, auf die Sie updaten wollen.

Auf [update.angular.io](https://update.angular.io) können Sie übrigens alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Der neue Ivy-Renderer

Die wohl größte Neuerung in Angular 9.0 ist der neue Renderer und Compiler _Ivy_ – also der Baustein, der die Templates mit Angular-Ausdrücken in JavaScript-Anweisungen umsetzt, die im Browser den DOM generieren.
Der neue Ivy-Renderer löst die vorherige _View Engine_ vollständig ab.
Ivy konnte bereits mit Angular 8 als Opt-In genutzt werden, ist ab sofort standardmäßig aktiv.

Ivy soll vollständig abwärtskompatibel sein. Für die meisten Nutzer ändert sich also nichts, in wenigen Ausnahmefällen könnte es zu Problemen mit der Kompatibilität mit alten Anwendungen kommen.

Das Projekt Ivy hat das Angular-Team nun fast zwei Jahre beschäftigt – doch das Ergebnis lässt sich sehen.
Ivy verspricht vor allem **kleinere Bundles**, was den Download beschleunigt und damit die **generelle Performance** der Anwendung deutlich erhöht.
Ebenso bringt Ivy deutliche Performance beim Kompilieren, verbessertes Tree Shaking, Template Checks und aufschlussreichere Fehlermeldungen mit sich.
Ivy wurde sehr lange und intensiv getestet, um in den meisten Projekten eine nahtlose Umstellung zu ermöglichen.
Sollten Sie bei der Migration zu Angular 9 dennoch unerwartet Probleme, so besteht noch immer die Möglichkeit, Ivy durch ein Opt-Out wieder zu deaktivieren:

```json
// tsconfig.json
{
  "angularCompilerOptions": {
    "enableIvy": false
  }
}
```

Nachfolgend wollen wir noch etwas konkreter auf ein paar wichtige Features und Verbesserungen von Ivy eingehen.

### Bundle Sizes

Das Entfernen von ungenutztem Code ("Tree Shaking") wurde mit dem Ivy-Compiler weiter verbessert.
Von den Verbesserungen profitieren vor allem kleine und große Anwendungen.

![](bundle-sizes.png)
> Bei kleinen Anwendungen konnte die Paketgröße um etwa 30%, bei großen Anwendungen um 25-40 % und bei mittleren Anwendungen nur minimal reduziert werden. ([Quelle](https://blog.angular.io/23c97b63cfa3))

Da die Anwendung insgesamt kleiner ist, kann sie schneller herunter geladen und ausgeführt werden.
Dies führt dazu, das die Anwendung deutlich schneller startet.

### AOT per Default

Mit Ivy wird standardmäßig die Ahead-of-Time Compilation (AOT) eingesetzt – auch bei der Entwicklung.
Das bedeutet, dass die Templates bereits zur Buildzeit in JavaScript umgesetzt werden und nicht erst zur Laufzeit im Browser.

Bisher wurde beim Ausführen von `ng serve` (Development Server) und auch bei der Ausführung der Tests _Just-in-Time_ Compilation_ (JIT) genutzt, die Anwendung wird also zur Laufzeit im Browser kompiliert.
Das lag vor allem daran, dass JIT mit dem alten Renderer deutlich schneller als AOT, wenn häufige Rebuilds zur ENtwicklungszeit durchgeführt werden mussten.
Für den Produktiv-Build wurde auch bisher schon die AOT-Kompilierung verwendet.

Durch die zwei verschiedenen Compiler-Modi konnte es vereinzelt zu unerwünschten Nebeneffekten kommen: Bei der Entwicklung lief die Anwendung reibungslos und alle Test waren grün.
Im Produktivmodus mit AOT tauchten dann plötzlich Fehler auf, die vorher nicht erkennbar waren.

Mit Ivy hat sich die Performance beim Kompilieren massiv verbessert, so dass der AOT-Modus nun standardmäßig immer aktiv sein kann.
Somit kann man sichergehen, dass bei der Entwicklung und im Produktivbetrieb stets derselbe Modus eingesetzt wird und bereits frühzeitig erkannt werden können.

### Change Detection

Wer sich einen guten Überblick über den Prozess der Change Detection mit Ivy machen will, sollte einen Blick auf die [Visualierung von Alexey Zuev](https://alexzuza.github.io/angular-9-ivy-change-detection-preview/) werfen.

### Testing

Mit dem neuen Ivy-Renderer wird nicht nur die Anwendung signifikant performanter, sondern auch die Ausführung der Tests.
Bis einschließlich Angular 8 wurden vor jedem Testschritt alle Komponenten neu kompiliert.
Ab Angular 9 werden die Komponenten und Module bei der Verwendung von `Testbed` gecached.
Somit können die Tests erheblich schneller ausgeführt werden.

## Server-Side Rendering und Pre-Rendering

Mit Version 9 wurde das Tooling für Server-Side Rendering mit Angular Universal erheblich verbessert.

Angular Universal bringt nun eigene Builder mit, die den Buildprozess erledigen.
Es ist nicht mehr notwendig, die Webpack-Config für den Serverprozess oder das Pre-Rendering selbst zu pflegen.

Mithilfe von `ng add` können wir alles Nötige einrichten, um Angular Universal zu verwenden:

```bash
ng add @nguniversal/express-engine
```

Es wird automatisch die Konfiguration für den Universal Builder in die `angular.json` eingefügt.
Die Datei `server.ts` enthält den Code für den Node.js-Server, der die Anwendung später ausliefert.
Neu mit Angular 9 ist, dass für die Serverseite nur noch ein einziges Bundle erstellt wird, das die Angular-Anwendung und den Node.js-Server zusammen beinhaltet.

Für Pre-Rendering vereinfacht sich der Workflow enorm.
Während wir bisher immer ein eigenes Skript erstellen mussten, um statische HTML-Seiten aus der Anwendung zu generieren, übernimmt das Angular-Tooling all das ab sofort automatisch.
In der `angular.json` befindet sich dazu der folgende neue Abschnitt:

```json
"prerender": {
  "builder": "@nguniversal/builders:prerender",
  "options": {
    "routes": [
      "/",
      "/books"
    ]
    // ...
  },
  // ...
}
```

Hier müssen wir lediglich die Routen eintragen, für die das Pre-Rendering ausgeführt werden soll.
Der folgende Befehl startet dann den Build-Prozess:

```bash
ng run book-rating:prerender
npm run prerender # Alternativ: Kurzform als NPM-Skript
```

Die notwendigen Schritte erledigt die Angular CLI bzw. der Universal Builder nun für uns.
Damit verringert sich die Fehleranfälligkeit, die es bisher mit selbst konfigurierten Skripten gab.

## `TestBed.inject<T>`: Abhängigkeiten im Test anfordern <a name="testbed-inject"></a>

Bisher wurden Abhängigkeiten in Tests mittels `Testbed.get<any>()` angeforert.
Mit Angular 9 wurde diese Methode als _deprecated_ markiert.
Stattdessen sollte nun `TestBed.inject<T>` genutzt werden.
Der Unterschied liegt hier in der Typsicherheit:
Mit `TestBed.inject()` ist der Rückgabewert mittels Typinferenz korrekt typisiert, und wir können auf die Propertys der Klasse zugreifen.
Das alte `TestBed.get()` lieferte hingegen stets `any` zurück.

```ts
// book-store.service.spec.ts
it('infers dependency types', () => {
  // `service` ist vom Typ `BookStoreService`
  const service = TestBed.inject(BookStoreService);
});
```

Grundsätzlich können beide Methoden synonym verwendet werden.
Technisch handelt es sich dennoch um einen Breaking Change, deshalb war es nötig, die Änderung über eine neue Methode anzubieten.

## i18n mit `@angular/localize`

Ein neues Paket mit dem Namen `@angular/localize` wurde mit Angular 9 eingeführt.
Dieses Paket ist ab sofort die Grundlage für die Internationalisierung (i18n) in Angular

Bei einem bestehenden Projekt mit Internationalisierung wird der Update-Prozess einige Änderungen an der `angular.json` durchführen.
Beim Start der Applikation werden Sie anschließend folgende Nachricht in der Konsole sehen:

> ERROR Error: Uncaught (in promise): Error: It looks like your application or one of its dependencies is using i18n.
> Angular 9 introduced a global `$localize()` function that needs to be loaded.
> Please run `ng add @angular/localize` from the Angular CLI.

Wie in der Nachricht bereits vorgeschlagen müssen wir folgenden Befehl ausführen:

```bash
ng add @angular/localize
```

Die Datei `polyfills.ts` wird um einen neuen Import ergänzt, der die Funktion `$localize()` verfügbar macht.
Schon ist das Update prinzipiell durchgeführt.
Die Syntax zur Übersetzung von Templates wurde nicht verändert.
Weiterhin markieren wir die zu übersetzenden Stellen im HTML durch das `i18n`-Attribut:

```html
<h1 i18n="@@HelloWorld">Hello World!!</h1>
```

Eine Übersetzung von Strings im TypeScript-Code war bislang nicht möglich.
Dieses dringend benötigte Feature ist nun endlich verfügbar:

```ts
const test = $localize`@@HelloWorld`;
```

Wir sehen hier den Einsatz der neuen global verfügbaren Funktion `$localize()`.
Diese Methode muss nicht importiert werden und kann als ["Tagged Template"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) verwendet werden.

In dem obigen Beispiel fehlt noch die Standard-Übersetzung – im Template-Beispiel lautete diese `Hello World!!`.
Das entsprechende Äquivalent können wir mit zwei zusätzlichen Doppelpunkten ausdrücken:

```ts
const test = $localize`:@@HelloWorld:Hello World!!`;
```

Eine weitere stark nachgefragte Funktionalität sind Übersetzungen zur Laufzeit.
Damit kann Angular leider immer noch nicht (ganz) aufwarten.
Angular unterstützt nun aber die Möglichkeit, zum Start der Applikation (also vor dem "Boostrapping") die notwendigen Übersetzungen bereitzustellen.
Dadurch muss man die Applikation nicht mehr langwierig in diverse Sprachen kompilieren.
Hierfür gibt es die neue Funktion `loadTranslations()`:

```ts
// main.ts
import { loadTranslations } from '@angular/localize';

loadTranslations({
  HelloWorld: 'Hallo Welt!!'
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

Wir können auch einen Schritt weitergehen und die Übersetzungen aus einer JSON-Datei nachladen.
Wichtig ist dabei nur, dass `loadTranslations()` vor `bootstrapModule()` ausgeführt werden muss.
Hierfür stellt Angular (noch) keinen Helfer bereit.
Diese Lücke füllt das Projekt [`locl`](https://github.com/loclapp/locl) vom ehemaligen Angular-Teammitglied Olivier Combe.
Folgendes Beispiel demonstriert das Nachladen von Übersetzungen vor dem "Bootstrapping":

```ts
// main.ts
import { loadTranslations } from '@angular/localize';
import { getTranslations, ParsedTranslationBundle } from '@locl/core';

const messages = '/assets/i18n/messages.de.json';
getTranslations(messages).then((data: ParsedTranslationBundle) => {
  loadTranslations(data.translations);
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
```

Mehr zu der Methode `getTranslations()` erfahren Sie auf der [GitHub-Seite des Projekts](https://github.com/loclapp/locl/tree/master/libs/core#usage).

## `@ViewChild()` und `@ContentChild()`

Mit Angular 8 gab es einen Breaking Change bei den Dekoratoren `@ViewChild()` und `@ContentChild()`: Es wurde das Flag `static` eingeführt, mit dem eine solche Query als statisch oder dynamisch markiert werden muss.
Die Änderung war notwendig, weil sich das Standardverhalten der beiden Dekoratoren mit Angular 9 ändern sollte.
In unserem [Artikel zum Update auf Angular 8](https://angular-buch.com/blog/2019-06-angular8#breaking-change-viewchild-und-contentchild-), haben wir die Thematik im Detail beschrieben.

Mit Angular 9 ist die Änderung final umgesetzt: Alle Querys sind nun grundsätzlich dynamisch, falls nicht anders angegeben.
Es ist also nicht länger notwendig, das `static`-Flag für `@ViewChild()` und `@ContentChild()` explizit auf `false` zu setzen.

```ts
// Dynamische Query ab Angular 9:
@ViewChild('foo') foo: ElementRef;
@ContentChild('bar') bar: ElementRef;

// Statische Query ab Angular 8:
@ViewChild('foo', { static: true }) foo: ElementRef;
@ContentChild('bar', { static: true }) bar: ElementRef;

// Dynamische Query in Angular 8:
// Das Ergebnis ist im LifeCycle-Hook `ngAfterViewInit()` verfügbar
// `{ static: false }` musste explizit gesetzt werden
@ViewChild('foo', { static: false }) foo: ElementRef;
@ContentChild('bar', { static: false }) bar: ElementRef;
```

## Weitere Neuigkeiten

Wir haben in diesem Artikel nur die wichtigsten Änderungen und Neuigkeiten erwähnt.
Das neue Major-Release bringt dazu eine Vielzahl von Bugfixes, Optimierungen unter der Haube und kleinere Features, die für die meisten Entwicklerinnen und Entwickler zunächst nicht relevant sind.

Eine detaillierte Liste aller Änderungen finden Sie im offiziellen [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md#900-2020-02-06) und [der Angular CLI](https://github.com/angular/angular-cli/releases/tag/v9.0.0) zum Release 9.0.0.

### Verbesserte Typprüfung in Templates <a name="template-checks"></a>

Angular 9 bringt zwei neue Optionen zur Typprüfung mit:

- `fullTemplateTypeCheck`: Wenn das Flag aktiviert ist wird nicht nur der TypeScript-Code auf Typen geprüft, sondern auch die zugehörigen Expressions in den Templates (z. B. die Direktiven `ngIf` und `ngFor`). Diese Option ist in einem neuen Angular-Projekt standardmäßig aktiviert.
- `strictTemplates`: Wird dieses Flag gesetzt, werden zusätzliche Typprüfungen für Templates aktiv.

Wir können die Optionen in der Datei `tsconfig.json` im Abschnitt `angularCompilerOptions` aktivieren:

```json
{
  "angularCompilerOptions": {
    "fullTemplateTypeCheck": true,
    "strictTemplates": true
  }
}
```

Im Strict Mode wird beispielsweise geprüft, ob der übergebene Typ eines Property Bindings auch zu dem dazugehörigen `@Input()` passt.
Mehr Informationen dazu finden Sie in der [Angular-Dokumentation](https://angular.io/guide/template-typecheck#strict-mode).

### Schematics für Interceptoren <a name="schematics-interceptor"></a>

Neu hinzugekommen ist auch ein Generator zur Erstellung von HTTP-Interceptoren.
Bisher musste man die Interceptor-Klasse per Hand erstellen, ab sofort unterstützt die Angular CLI uns dabei mit folgendem Befehl:

```bash
ng generate interceptor
```

### `providedIn` für Services: `any` und `platform` <a name="provided-in"></a>

Für Services wird ab Angular 6.0.0 standardmäßig die Option `providedIn: 'root'` verwendet (wir haben dazu im [Update-Artikel zu Angular 6](https://angular-buch.com/blog/2018-05-angular6) berichtet).
Mit Angular 9 kommen neben `root` zwei neue Optionen für die Sichtbarkeit eines Providers hinzu: `any` und `platform`.

- `root`: Die Anwendung erhält _eine einzige Instanz_ des Services.
- `any`: Jedes Modul der Anwendung erhält eine _eigene Instanz_ des Services.
- `platform`: Alle Anwendungen auf der Seite teilen sich _dieselbe Instanz_. Das ist vor allem im Kontext von [Angular Elements](https://angular.io/guide/elements) interessant, wenn mehrere Anwendungen auf einer Seite "gebootstrappt" (gestartet) werden.

### Optional Chaining mit TypeScript

Die von Angular verwendete Version von TypeScript wurde auf die Nummer 3.7 aktualisiert. Damit ist auch ein neues interessantes Sprachfeature im Code verwendbar: [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining).

Bei der Arbeit mit verschachtelten Objekten musste man bisher jeden Schritt im Objektpfad einzeln auf Existenz prüfen, um Fehler zu vermeiden.
Wollen wir beispielsweise die Thumbnail-URL eines Buchs ermitteln, müssen wir so vorgehen, wenn nicht sicher ist, ob das Thumbnail existiert:

```ts
const book = {
  title: '',
  thumbnail: { url: '', title: '' },
};

const url = book.thumbnail && book.thumbnail.url;
```

Mit Optional Chaining vereinfacht sich das Vorgehen. Wir verwenden den `?`-Operator, um die Evaluierung des Ausdrucks abzubrechen, falls ein Teilstück des Objekts nicht existiert:

```ts
const url = book.thumbnail?.url;
```

### Nullish Coalescing mit TypeScript

Ein weiteres neues TypeScript-Feature von TypeScript ist _Nullish Coalescing_.
Damit kann in einem Ausdruck ein Fallback-Wert definiert werden, der eingesetzt wird, wenn der geprüfte Wert ungültig ist.

Für diese Semantik konnte bisher der `||`-Operator verwendet werden.
Ist der Wert von `foo` _falsy_ (also `null`, `undefined`, `0`, `NaN`, `false` oder leerer String), wird stattdessen der Wert `default` eingesetzt:

```ts
const value = foo || 'default';
```

Mit dem neuen _Nullish Coalescing_ gelten `0`, `false`, `NaN` oder leerer String als gültige Werte.
Der Rückfall mit dem `??`-Operator greift im Gegensatz zu `||` also ausschließlich bei den Werten `null` oder `undefined`.

```ts
const foo = 0;

// Prüfung auf falsy values (null, undefined, '', 0, false, NaN)
const value = foo || 'default';
// value = 'default'

// Zuweisung eines Standardwerts ohne Nullish Coalescing ('', 0, false und NaN sind erlaubt)
const value = foo !== null && foo !== undefined ? foo : 'default';
// value = 0

// Zuweisung eines Standardwerts mit Nullish Coalescing ('', 0, false und NaN sind erlaubt)
const value = foo ?? 'default';
// value = 0
```

<hr>

Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß mit Angular wünschen  
Johannes, Danny und Ferdinand**

<small>**Titelbild:** Yosemite National Park, California, 2019</small>
