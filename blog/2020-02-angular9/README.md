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
Auf [update.angular.io](https://update.angular.io) können Sie außerdem alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.


## topic 1

TODO: die wichtigsten Themen beschreiben, die auch fürs Buch relevant sind

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
