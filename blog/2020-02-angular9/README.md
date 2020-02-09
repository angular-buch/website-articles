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

Am 6. Februar 2020 wurde bei Google in Kalifornien der "rote Knopf" gedrückt: Das lang erwartete neue Release ist da – die neue Major-Version **Angular 9.0.0**!

Durch eine Reihe von Bugs und offene Features hatte sich das Release um einige Wochen verzögert – ursprünglich angestrebt war das Release im November.
Der wohl wichtigste Punkt ist die Umstellung auf den neuen Renderer _Ivy_, der einige Features und vor allem Verbesserungen in der Performance mit sich bringt.
Es gibt auch wieder kleinere Breaking Changes, doch das Update auf die neue Version ist undramatisch und geht leicht von der Hand.

Wir möchten Ihnen in diesem Artikel kurz die wichtigsten Neuerungen vorstellen.
Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular Blog](https://blog.angular.io/23c97b63cfa3).

## Update auf Angular 9

Das Update zur neuen Angular-Version ist in wenigen Schritten getan.
Falls Ihr Projekt noch nicht in der letzten Version von Angular 8 vorliegt, sollten Sie zunächst das folgende Update erledigen:

```sh
ng update @angular/cli@8 @angular/core@8
```

Anschließend kann das Update auf Angular 9 erfolgen:

```sh
ng update @angular/cli @angular/core
```

Die Angular CLI führt automatisch alle nötigen Anpassungen am Code der Anwendung durch, sofern notwendig.
Hier zeigt sich bereits die erste Neuerung: Beim `ng update` werden ab sofort ausführliche Informationen zu neuen Features ausgegeben, die Ihnen beim Update helfen.
Außerdem verwendet die Angular CLI jetzt zur Durchführung des Updates unter der Haube jetzt immer die Version, auf die Sie updaten wollen.

Auf [update.angular.io](https://update.angular.io) können Sie übrigens alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Der neue Ivy-Renderer

### AOT per Default

### Performance

### Change Detection

Wer sich einen guten Überblick über den Prozess der Change Detection mit Ivy machen will, sollte einen Blick auf die [Visualierung von Alexey Zuev](https://alexzuza.github.io/angular-9-ivy-change-detection-preview/) werfen.

### Testing

Mit dem neuen Ivy-Renderer wird nicht nur die Anwendung signifikant performanter, sondern auch die Ausführung der Tests.
Bis einschließlich Angular 8 wurden vor jedem Testschritt alle Komponenten neu kompiliert.
Ab Angular 9 werden die Komponenten und Module bei der Verwendung von `Testbed` gecached.
Somit können die Tests erheblich schneller ausgeführt werden.

## Server-Side Rendering

## `TestBed.inject<T>`: Abhängigkeiten im Test anfordern

Bisher wurden Abhängigkeiten in Tests mittels `Testbed.get<any>` angeforert.
Mit Angular 9 ist dieser Aufruf als `deprecated` markiert worden.
Stattdessen sollte nun `TestBed.inject<T>` genutzt werden.
Die API der beiden Implementierungen sieht für den Nutzer zunächst gleich aus.
Der Unterschied liegt hier in der Typsicherheit.
Durch die Nutzung von `TestBed.inject` kann per Typinferenz auf die konkrete Klasse oder die abstrakte Klasse und deren Properties zugreifen.

```ts
// book-store.service.spec.ts
it('infers dependency types', () => {
  // `service` ist vom Typ `BookStoreService` in Angular 9 dank Typinferenz
  const service = TestBed.inject(BookStoreService);
});
```

## i18n mit `@angular/localize`

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

### Verbesserte Typenüberprüfung

Angular 9 bringt auch Verbesserungen in der Typenüberprüfung mit sich.
Wir können zwei optionale Features aktivieren:

- `fullTemplateTypeCheck`: Wenn das Flag aktiviert ist wird nicht nur der TypeScript Code auf Typen geprüft, sondern auch die zugehörigen Auswertungen in den Templates (z.B. die Direktiven `ngIf` und `ngFor`).
- `strictTemplates`: Wird dieses Flag gesetzt, werden zusätzliche Typenüberprüfungen aktiv.

Wir können die Optionen über die `angularCompilerOptions` in der Datei `tsconfig.json` aktivieren:

```json
{
  "angularCompilerOptions": {
    "fullTemplateTypeCheck": true,
    "strictTemplates": true
  }
}
```

### Schematics für Interceptoren

Neu hinzugekommen ist auch ein Workflow zur Erstellung von HTTP-Interceptoren.
Bisher musste man die Interceptor-Klasse per Hand bauen, ab sofort unterstützt die Angular CLI uns dabei mit folgendem Befehl:

```sh
ng generate interceptor
```

### `providedIn` für Services: `any` und `platform`

Für Services wird ab Angular 6.0.0 standardmäßig die Option `providedIn: 'root'` verwendet (wir haben dazu im [Update-Artikel zu Angular 6](https://angular-buch.com/blog/2018-05-angular6) berichtet).
Mit Angular 9 kommen neben `root` zwei neue Optionen für die Sichtbarkeit eines Providers hinzu: `any` und `platform`.

- `root`: Die Anwendung erhält _eine einzige Instanz_ des Services.
- `any`: Jedes Modul der Anwendung erhält eine _eigene Instanz_ des Services.
- `platform`: Alle Anwendungen auf der Seite teilen sich _dieselbe Instanz_. Das ist vor allem im Kontext von [Angular Elements](https://angular.io/guide/elements) interessant, wenn mehrere Anwendungen auf einer Seite gebootstrappt werden.

### Optional Chaining mit TypeScript

TypeScript wurde auf Version 3.7 aktualisiert. Damit ist auch ein neues interessantes Sprachfeature in Angular verwendbar: [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining).

Bei der Arbeit mit verschachtelten Objekten musste man bisher jeden Schritt im Objektpfad einzeln auf Existenz prüfen, um Fehler zu vermeiden.
Wollen wir beispielsweise die Thumbnail-URL eiens Buchs ermitteln, müssen wir so vorgehen, wenn nicht sicher ist, ob das Thumbnail existiert:

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

Ein weiteres neues Feature von TypeScript ist das _Nullish Coalescing_, das als Rückfall auf einen Standard-Wert angesehen werden kann.
Der Rückfall greift allerdings im Gegensatz zu `||` nur bei den Werten `null`, `NaN` oder `undefined`.

```ts
const foo = 0;

// Prüfung auf Falsy Werte (null, undefined, NaN, '', 0)
let value = foo || 'default';
// value = 'default'

// Zuweisung eines Standard-Wertes ohne Nullish Coalescing ('' und 0 sind erlaubt)
let value = foo !== null && foo !== undefined ? foo : 'default';
// value = 0

// Zuweisung eines Standard-Wertes mit Nullish Coalescing ('' und 0 sind erlaubt)
let value = foo ?? 'default';
// value = 0
```

<hr>

Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß mit Angular wünschen<br>
Johannes, Danny und Ferdinand**

<small>**Titelbild:** TODO: hier eine kurze Beschreibung einfügen</small>