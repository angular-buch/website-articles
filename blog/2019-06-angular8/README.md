---
title: "Angular 8 ist da!"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2019-05-28
lastModified: 2019-05-28
keywords:
  - Angular
  - Angular 8
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
Ab Angular 8 müssen alle Queries mit den Dekoratoren `@ViewChild` und `@ContentChild` mit dem `static` Flag versehen werden.
Das Flag defniert, ob es sich bei dem zugehörigen Element um eine statisches oder dynamisch veränderbares Element handelt.

### Vorher
Bis Angular 7 wurden `@ViewChild` und `@ContentChild` wie folgt verwendet:
```ts
// Je nach Template ist das Ergebnis ist im LifeCycle-Hook `ngOnInit` oder `ngAfterViewInit` verfügbar
@ViewChild('foo') foo: ElementRef;

// Je nach Template ist das Ergebnis ist im LifeCycle-Hook `ngOnInit` oder `ngAfterContentInit` verfügbar
@ViewChild('bar') bar: ElementRef;
```

### Nachher (ab Angular 8)
Ab Angular 8 müssen `@ViewChild` und `@ContentChild` den das `static` Flag übermittelt bekommen.

```ts
// Das Ergebnis ist im LifeCycle-Hook `ngOnInit` verfügbar
@ViewChild('foo', {static: true}) foo: ElementRef;

// Das Ergebnis ist im LifeCycle-Hook `ngOnInit` verfügbar
@ContentChild('bar', {static: true}) bar: ElementRef;
```

Bzw.:

```ts
// Das Ergebnis ist im LifeCycle-Hook `ngAfterViewInit` verfügbar
@ViewChild('foo', {static: false}) foo: ElementRef;

// Das Ergebnis ist im LifeCycle-Hook `ngAfterContentInit` verfügbar
@ContentChild('bar', {static: false}) bar: ElementRef;
```

Verwenden Sie die Angular CLI und führen ein Update auf Angular 8 durch, wird diese ihren Quellcode im Regelfall automatisch an den entsprechenden Stellen anzupassen.
Sollte die Angular CLI nicht identifiziern können, welcher Wert für `static` gesetzt werden soll, so wird an der entsprechenden Stelle ein Hinweis eingefügt und Sie müssen manuell Hand anlegen:

```ts
/* TODO: add static flag */
```

### Wann verwende ich was?  `{static: true}` VS.  `{static: false}`
Im Regelfall empfehlen wir Ihnen `{static: false}` zu verwenden, da dies dazu führt, dass das Abfrageresultat im Lifecycle-Hook `ngAfterViewInit` bzw. `ngAfterContentInit` verfügbar ist.
Somit können Sie sicher gehen, dass die Change Detection vollständig ausgeführt wurde und demzufolge das Element auf das Sie zugreifen wollen vollständig geladen wurde.

`{static: true}` benötigen Sie nur in wenigen Fällen, beispielsweise wenn Sie eingebettete Views on-the-fly generieren wollen. Lesen Sie mehr hierzu in der offiziellen [Angular-Dokumentation](https://next.angular.io/guide/static-query-migration#is-there-a-case-where-i-should-use-static-true).


## Lazy Loading - Import-Systax statt Magic-String
Angular unterstützt nun die _Import_-Syntax zum nachladen von Modulen in der Routingkonfiguration.
Die bisherige Syntax die auch als Magic-String bezeichnet wird, wurde vom Angular-Team als _deprecated_ gekennzeichnet.
Wenn Sie das Update mit der Angular CLI vollziehen, konvertiert diese die Magic-Strings autoimatisch zur neuen Import-Syntax.

### Vorher
```ts
loadChildren: './foo/foo.module#FooModule'
```

### Nachher (ab Angular 8)
```ts
loadChildren: () => import('./foo/foo.module').then(m => m.FooModule)
```


## Ivy Opt-In Preview
Die neue Rendering-Engine _Ivy_ kann in Angular 8 aktiviert und genutzt werden.
Um Ivy zu aktivieren und auszuprobieren können Sie nach dem Update auf Angular 8 in der Datei `src/tsconfig.app.json` das Flag `enableIvy` setzen.

```json
{
  ...
  "angularCompilerOptions": {
    "enableIvy": true,
    ...
  }
}
```

Für detaillierte Informationen zu Ivy können wir den Blogartikel [Understanding Angular Ivy: Incremental DOM and Virtual DOM](https://blog.nrwl.io/243be844bf36) von Victor Savkin empfehlen.


## Differential Loading
Die Angular CLI produziert jetzt verschiedene Bundles, die abhängig vom verwendeten Browser geladen werden.
Somit können moderne Browser auf neuere Features zugreifen und müssen nicht zusätzlich Polyfill-Dateien für Features laden, die Sie bereits von Hause aus verarbeiten können.
Ältere Browser greifen auf die sogenannten Legacy Bundles zurück und Laden Polyfills und fehlende Funktionen zusätzlich zum Anwendungscode.

Die Neuerung führt vor allem bei modernen Browsern zu Performance-Verbessungen, da diese weniger Code laden müssen.


## Angular CLI Builders API
Mit Veröffentlichung der Angular CLI 8 kommt noch ein weiteres Feature: Die Builders API.
Diese erlaubt es Ihnen Features zur CLI hinzuzufügen oder bestehende Features zu modifizieren.

Einen Einstiegsartikel zur Verwendung der API und der Entwicklung eines eigenen Builders, liefert ihnen Hans Larsen mit seinem Artikel [Introducing CLI Builders](https://blog.angular.io/d012d4489f1b).

<hr>

Viel Spaß mit Angular wünschen<br>
Johannes, Danny und Ferdinand