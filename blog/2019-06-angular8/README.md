---
title: "Angular 8 ist da!"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2019-05-28
lastModified: 2019-05-28
keywords:
  - Angular
  - Angular 8
  - Differential Loading
  - Ivy
language: de
thumbnail: ./angular8.png
sticky: true
---


Es ist wieder soweit, das Angular-Team veröffentlichte am 28. Mai 2019 die neue Major-Version Angular 8.0.0.
Angular 8 und die Angular CLI 8, bringen wieder viele interessante Neuerungen mit sich.
Das Beste hierbei: Es gibt kaum Breaking Changes. Somit funktioniert das Upgrade sehr schnell und reibungslos.
In diesem Artikel wollen wir Ihnen die wichtigsten Neuigkeiten vorstellen.

Die offizielle Ankündigung des neuen Releases finden Sie im [Angular Blog](https://blog.angular.io/xxxxxxxxxx).


## Update auf Angular 8
Das Update zur neuen Angular Version ist kinderleicht. hierzu führen Sie einfach den folgenden Befehl in der Konsole aus:

```sh
ng update @angular/cli @angular/core
```

Sie können sich auch eine Liste der notwenigen Schritte zwischen ihrer aktuellen Version und Angular 8 auf [update.angular.io](https://update.angular.io/) anzeigen lassen.



## Breaking Change: @ViewChild und @ContentChild

Mit den Dekoratoren `@ViewChild()` und `@ContentChild()` können wir Querys auf DOM-Elemente in der View einer Komponente/Direktive stellen.
Ab Angular 8 müssen alle solche Querys zusätzlich mit dem Flag `static` versehen werden.
Damit wird definiert, ob es sich bei der Abfrage um eine statisches oder dynamisch veränderbares Element handelt.
Statische Elemente werden einmalig gerendert und sind dann zur Laufzeit der Komponente verfügbar, dynamische Elemente werden zur Laufzeit verändert.


**Bis Angular 7** wurden `@ViewChild()` und `@ContentChild()` wie folgt verwendet.
Je nach Template und Struktur der Komponente ist das Ergebnis dann im LifeCycle-Hook `ngOnInit()` oder `ngAfterViewInit()` verfügbar:

```ts
@ViewChild('foo') foo: ElementRef;
@ViewChild('bar') bar: ElementRef;
```

**Ab Angular 8** müssen `@ViewChild()` und `@ContentChild()` immer das Flag `static` tragen:

```ts
// Statische Query: Ergebnis ist im LifeCycle-Hook `ngOnInit` verfügbar
@ViewChild('foo', { static: true }) foo: ElementRef;
@ContentChild('bar', { static: true }) bar: ElementRef;

// Dynamische Query: Ergebnis ist im LifeCycle-Hook `ngAfterViewInit` verfügbar
@ViewChild('foo', { static: false }) foo: ElementRef;
@ContentChild('bar', { static: false }) bar: ElementRef;
```

### Automatische Migration

Verwenden Sie die Angular CLI für das Update auf Angular 8, so wird die Migration automatisch durchgeführt.
Sollte das Migrationsskript nicht identifiziern können, welcher Wert für `static` gesetzt werden muss, so wird an der entsprechenden Stelle ein Hinweis eingefügt, und Sie müssen manuell Hand anlegen:

```ts
/* TODO: add static flag */
```

### Statisch oder dynamisch? -- die richtige Einstellung wählen

Wir empfehlen Ihnen, im Regelfall für das Flag die Einstellung `false` zu verwenden.
Das führt dazu, dass das Ergebnis der Abfrage im Lifecycle-Hook

Im Regelfall empfehlen wir Ihnen `{static: false}` zu verwenden, da dies dazu führt, dass das Abfrageresultat im Lifecycle-Hook `ngAfterViewInit()` bzw. `ngAfterContentInit()` verfügbar ist.
Somit können Sie sichergehen, dass die Change Detection vollständig ausgeführt wurde und das angefragte Element vollständig geladen wurde.

Die Einstellung `{static: true}` benötigen Sie nur in wenigen Fällen, beispielsweise wenn Sie eingebettete Views "on-the-fly" generieren wollen.
Lesen Sie mehr hierzu in der offiziellen [Angular-Dokumentation](https://next.angular.io/guide/static-query-migration#is-there-a-case-where-i-should-use-static-true).

Übrigens: Falls Sie `@ViewChildren()` verwenden, müssen Sie nichts ändern.
Solche Querys sind immer dynamisch. 



## Lazy Loading: Dynamische Imports statt Magic-String

Angular unterstützt nun von Haus aus das `import()`-Statement zum Nachladen von Modulen.
Dadurch ändert sich die Schreibweise beim Routing, um Lazy Loading zu konfigurieren.
Die bisherige Syntax verwendet einen "Magic String", um das zu ladende Modul anzugeben:

```ts
{
  path: 'mypath',
  loadChildren: './foo/foo.module#FooModule'
}
```

Diese Schreibweise ist **ab Angular 8** als **deprecated** gekennzeichnet.
Stattdessen wird ein dynamischer Import verwendet, um das Modul beim Routing nachzuladen:

```ts
{
  path: 'mypath',
  loadChildren: () => import('./foo/foo.module').then(m => m.FooModule)
}
```

Die Syntax sieht zunächst komplizierter aus.
Im Wesentlichen besteht der Befehl allerdings nur aus einer anonymen Funktion, die aufgerufen wird, wenn die Route aktiviert wird.
Sie ruft `import()` auf und extrahiert im zweiten Schritt das Angular-Modul `FooModule` aus dem heruntergeladenen Bundle.
Diese neue Variante arbeitet vollständig mit nativ unterstützten Features und ohne einen Magic String, der spezifisch für Angular ist.
Dadurch unterstützt die IDE den Entwickler mit Autovervollständigung und Typprüfung.

Wenn Sie das Update mit der Angular CLI durchführen, werden die Magic Strings automatisch zur neuen Schreibweise migriert.
In der zweiten Auflage des Angular-Buchs, die im Juni 2019 erscheint, ist der neue Weg übrigens schon beschrieben.



## Der neue Ivy-Renderer: Opt-In Preview

Die neue Rendering-Engine _Ivy_ kann in Angular 8 als freiwilliges Opt-In aktiviert und genutzt werden.
Zum Ausprobieren können Sie in einem Projekt mit Angular 8 in der Datei `src/tsconfig.app.json` das Flag `enableIvy` setzen:

```json
{
  ...
  "angularCompilerOptions": {
    "enableIvy": true,
    ...
  }
}
```

Alternativ können Sie beim Anlegen eines neuen Angular-Projekts auch direkt die Option `--enable-ivy` nutzen:

```bash
ng new my-app --enable-ivy
```

Ivy wird vermutlich mit Angular 9 standardmäßig für alle Projekte aktiviert.
Bis dahin wird die neue Engine noch einem umfangreichen Praxistest unterzogen.
Einige Features lassen noch auf sich warten, zum Beispiel die Integration für Internationalisierung (i18n).
Das neue Tooling soll Übersetzungen zur Laufzeit erlauben und auch einen Service zur programmatischen Übersetzung mitbringen.

Für detaillierte Informationen zu Ivy können wir den Blogartikel ["Understanding Angular Ivy: Incremental DOM and Virtual DOM"](https://blog.nrwl.io/243be844bf36) von Victor Savkin empfehlen.


## Differential Loading: Mehrere Bundles für unterschiedliche Browser

Ein bekanntes Praxisproblem mit Angular ist die Größe der ausgelieferten Bundles.
Warum ein Bundle groß und "unhandlich" wird, kann verschiedene Ursachen haben und kann auf verschiedene Weise strategisch gelöst werden, z. B. durch Code Splitting, Tree Shaking und Lazy Loading.

Alle modernen Browser unterstützen mindestens den JavaScript-Standard ES2015.
Dennoch werden die meisten Angular-Anwendungen weiterhin in ES5 kompiliert, um auch in älteren Browsern lauffähig zu sein.
Das führt zu größeren Bundles, und es ist nötig, Polyfills für ältere Browser mit auszuliefern.

An dieser Stelle kommt ein neues Feature der Angular CLI ins Spiel: Differential Loading.
Die Angular CLI produziert dabei verschiedene Bundles der Anwendung -- für ältere Browser in ES5 und für neuere Browser in ES2015 oder höher.
Der Browser lädt nur die Bundles, die für ihn relevant sind.
Somit können moderne Browser auf neuere Features zugreifen und müssen nicht zusätzlich Polyfill-Dateien für Features laden, die Sie bereits von Haus aus verarbeiten können.
Ältere Browser greifen auf die sogenannten "Legacy Bundles" zurück und laden Polyfills und fehlende Funktionen zusätzlich zum Anwendungscode.

Die Neuerung führt vor allem bei modernen Browsern zu Performance-Verbessungen, weil weniger Code geladen werden muss.


TODO: Screenshot Build?



## Angular CLI Builders API

TODO: müssen wir noch spezifischer schreiben (oder weglassen)

Mit Veröffentlichung der Angular CLI 8 kommt noch ein weiteres Feature: Die Builders API.
Diese erlaubt es Ihnen Features zur CLI hinzuzufügen oder bestehende Features zu modifizieren.

Einen Einstiegsartikel zur Verwendung der API und der Entwicklung eines eigenen Builders, liefert ihnen Hans Larsen mit seinem Artikel [Introducing CLI Builders](https://blog.angular.io/d012d4489f1b).

<hr>

Haben Sie Fragen zur neue Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß mit Angular wünschen<br>
Johannes, Danny und Ferdinand**