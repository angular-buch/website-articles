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

Das Update zur neuen Angular-Version ist kinderleicht. Dalls Ihr Projekt noch nicht in der letzten Version von Angular 8 vorliegt, machen Sie zunächst das folgende Update:

```sh
ng update @angular/cli@8 @angular/core@8
```

Anschließend kann das Update auf Angular 9 erfolgen:

```sh
ng update @angular/cli @angular/core
```

Die Angular CLI führt automatisch alle nötigen Anpassungen am Code der Anwendung durch, sofern notwendig.
Hier zeigt sich bereits die erste Änderung: Beim `ng update` werden ab sofort ausführliche Informationen ausgegeben, die Ihnen beim Update helfen.
Außerdem verwendet die Angular CLI ab Version 8.3.19 immer die Zielupdate-Version der Angular CLI zur Durchführung des Updates.

Auf [update.angular.io](https://update.angular.io) können Sie außerdem alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## `@ViewChild()` und `@ContentChild()`

Mit der Einführung von Angular in der Version 8, gab es einen Breaking Change, der sich auf die Verwendung der Dekoratoren `@ViewChild()` und `@ContentChild()` auswirkte.
Der Breaking Change war notwendig, da das Standard-Verhalten der beiden Dekoratoren geändert wurde.
In unserem [Artikel zum Upodate auf Angular 8](https://angular-buch.com/blog/2019-06-angular8#breaking-change-viewchild-und-contentchild-), haben wir den Change im Detail beschrieben.

Mit Angular 9 kommt nun die Finalisierung der Übergangsphase.
Das explizite Setzen des `static` Flags mit dem Wert `false` für `@ViewChild()` und `@ContentChild()` ist nun nicht länger notwendig:

```ts
// Statische Query ab Angular 8:
// Das Ergebnis ist im LifeCycle-Hook `ngOnInit()` verfügbar
@ViewChild('foo', { static: true }) foo: ElementRef;
@ContentChild('bar', { static: true }) bar: ElementRef;

// Dynamische Query in Angular 8:
// Das Ergebnis ist im LifeCycle-Hook `ngAfterViewInit()` verfügbar
// `{ static: false }` musste explizit gesetzt werden
@ViewChild('foo', { static: false }) foo: ElementRef;
@ContentChild('bar', { static: false }) bar: ElementRef;

// Dynamische Query ab Angular 9:
// `{ static: false }` muss nicht mehr explizit gesetzt werden
@ViewChild('foo') foo: ElementRef;
@ContentChild('bar') bar: ElementRef;
```

## Weitere Neuigkeiten

Wir haben in diesem Artikel natürlich nur die wichtigsten Änderungen und Neuigkeiten erwähnt.
Das neue Major-Release bringt dazu eine Vielzahl von Bugfixes, Optimierungen unter der Haube und kleinere Features, die für die meisten Entwicklerinnen und Entwickler zunächst nicht relevant sind.

TODO: hier ein paar ausgewählte weitere Änderungen beschreiebn

Außerdem sind die folgenden Änderungen interessant:

- TODO: Auslistung weiterer interessanter kleiner Änderungen

Eine detaillierte Liste alle Änderungen finden Sie im offiziellen [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md#900-2020-02-06) und [der Angular CLI](https://github.com/angular/angular-cli/releases/tag/v9.0.0) zum Release 9.0.0.

<hr>

Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß mit Angular wünschen<br>
Johannes, Danny und Ferdinand**

<small>**Titelbild:** TODO: hier eine kurze Beschreibung einfügen</small>
