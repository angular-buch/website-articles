---
title: "Angular 5 ist da!"
author: Ferdinand Malcher
mail: mail@fmalcher.de
published: 2017-11-10
keywords:
  - Angular
  - Angular 5
language: de
thumbnail: angular.png
---

Angular 5 ist da! Anfang November 2017 erschien die neue Major-Version von Angular und bringt einige Neuerungen mit sich. Die gute Nachricht: Ihre alten Projekte mit Angular 4 sind weiterhin lauffähig – nur an einigen wenigen Stellen müssen Kleinigkeiten angepasst werden.

In diesem Artikel stellen wir Ihnen die wichtigsten Neuerungen vor.
Zu einzelnen Themen haben wir separate Artikel verfasst, um Ihnen einen fundierten Überblick zu geben.

Die offizielle Ankündigung zum Angular-5-Release finden Sie im [Angular-Blog](https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced).
Für Details zu einzelnen Änderungen lohnt sich außerdem ein Blick in den [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md).

Beim Update auf Angular 5 hilft der [Angular Update Guide](https://angular-update-guide.firebaseapp.com/). Das Tool stellt eine Checkliste und die passenden Befehle für das Update bereit.


## Build Optimizer / White Spaces

In Projekten mit Angular 5 ist ab sofort automatisch der *Build Optimizer* aktiv.
Dadurch wird die effektive Bundle-Größe weiter reduziert und die Start-Performance verbessert.

Außerdem wurde für den Compiler die neue Option `preserveWhitespaces` eingeführt.
Wird die Option deaktiviert, werden White Space Characters in den Templates automatisch entfernt – und damit die Bundle-Größe weiter reduziert.
Die Option kann in den Komponenten oder global in der `tsconfig.json` angepasst werden.

```js
// tsconfig.app.json
{
  // ...
  "angularCompilerOptions": {
    "preserveWhitespaces": false
  }
}
```

```typescript
// my.component.ts
@Component({
  template: '...',
  preserveWhitespaces: false
})
export class MyComponent
```

```html
<!-- my.component.html -->
<div ngPreserveWhitespaces>
  White Spaces werden in diesem Block erhalten
</div>
```

Weitere Infos zu `preservWhitespaces` finden Sie in der [offiziellen Dokumentation](https://angular.io/api/core/Component#preserveWhitespaces).


## Lokalisierte Pipes

Einige der eingebauten Pipes basieren auf lokalisierten Informationen: `DatePipe`, `DecimalPipe` und `CurrencyPipe`.
Bisher war für die Lokalisierung ein Polyfill nötig. In Angular 5 wurde das Polyfill entfernt und die Lokalisierung wurde mit anderen Regeln gelöst.

Damit ändern sich allerdings folgende Feinheiten:
- Die oben genannten Pipes verhalten sich zu Teil anders und haben geänderte Signaturen
- Zum Einstellen der Sprache sind zusätzliche Schritte nötig

Mehr zu dem Thema erfahren Sie demnächst in unserem zusätzlichen Blogartikel.


## HttpClient


## RxJS Lettable Operators
