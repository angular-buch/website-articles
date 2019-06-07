---
title: "Angular 5: Änderungen für i18n"
author: Ferdinand Malcher
mail: mail@fmalcher.de
published: 2017-12-07
keywords:
  - Angular
  - Angular 5
  - i18n
  - Internationalisierung
  - Pipes
  - Locale
language: de
thumbnail: ../shared/angular5.png
---


Bis Version 4 setzte Angular auf die [Intl-API](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Intl).
In Angular 5 wurde diese Abhängigkeit verworfen – dadurch ändern sich einige Details bei der Internationalisierung und den lokalisierten Pipes.
In diesem Artikel haben wir die wichtigsten Änderungen zusammengefasst.


## Intl-API

Bis Angular 4 kam zur Lokalisierung die Intl-API zum Einsatz, die in den modernen Browsern nativ implementiert ist.
Dieser Weg bringt allerdings zwei wesentliche Nachteile mit sich:

1. Die API ist in den Browsern unterschiedlich implementiert.
2. In älteren Browsern ist ein Polyfill nötig, um die Funktionalität nachzurüsten.

In Angular 5.0.0 wurde die Abhängigkeit auf die Intl-API entfernt.
Das betrifft besonders die Pipes, die auf Lokalisierung setzen: `DatePipe`, `DecimalPipe` und `CurrencyPipe`.


## Sprache festlegen

Die genannten Pipes verarbeiten Informationen, die spezifisch für eine Region sind.
Beispielsweise werden Datumsangaben im Locale `en_US` anders dargestellt als für `de_DE`.
Ein weiteres Beispiel sind Dezimal- und Tausendertrennzeichen (Punkt und Komma) bei Zahlen.

In der Anwendung muss immer ein aktives Locale festgelegt werden.
Im einfachsten Fall legen wir die Sprache schon zur Entwicklungszeit fest, aber es existieren natürlich auch dynamische und flexiblere Wege.

Das aktuelle Locale ist im Token `LOCALE_ID` hinterlegt.
Um den Wert zu ändern, können wir das Token im DI-Container überladen.
Diesen Weg beschreiben wir so auch im Buch im Abschnitt 13.1.2 "Die Sprache einstellen":

```typescript
@NgModule({
  // ...
  providers: [
    { provide: LOCALE_ID, useValue: 'de' }
  ]
})
```

Ab Angular 5 müssen die verfügbaren Locales einzeln importiert und registriert werden.
Dafür wurde die Funktion `registerLocaleData()` eingeführt, die z.B. im `AppModule` aufgerufen werden kann:

```typescript
// app.module.ts
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

@NgModule({
  // ...
  providers: [
    { provide: LOCALE_ID, useValue: 'de' }
  ]
})
export class AppModule {
  constructor() {
    registerLocaleData(localeDe);
  }
}
```


## Änderungen bei den Pipes

### DatePipe

Im Zuge dieser Änderungen hat sich auch das Verhalten der lokalisierten Pipes geändert.
Die Tabellen mit den Platzhaltern für das Format der `DatePipe` (Seite 263 f. im Angular-Buch) sind damit nicht mehr komplett zutreffend, denn einige Platzhalter haben sich verändert.
Besonders die vordefinierten Aliase (z.B. `medium`) haben eine geänderte Signatur und es sind einige neue Patterns hinzugekommen.

In den meisten Fällen sind hier nur wenige Änderungen nötig.
Überprüfen Sie aber unbedingt alle Datumsangaben in Ihren Anwendungen.
Alle aktuellen Platzhalter finden Sie in der [Dokumentation für die DatePipe](https://angular.io/api/common/DatePipe).



### CurrencyPipe

Die [CurrencyPipe](https://angular.io/api/common/CurrencyPipe) hat ab Angular 5 eine geänderte Signatur:

```
expression | currency[:currencyCode[:display[:digitInfo[:locale]]]]
```

Damit fällt das alte Argument `symbolDisplay` weg und macht Platz für das neue `display`:

```
display = { 'code' | 'symbol' | 'symbol-narrow' }
```

`display` entscheidet, ob das Währungskürzel als Text (z.B. *EUR*), Symbol (z.B. *€*) oder gekürztes Symbol (relevant bei zusammengesetzten Währungen wie *AU$*, wird angezeigt als *$*) angezeigt werden soll.

Außerdem kann über das Argument `locale` ein spezifisches Locale angegeben werden, nach dem die Währungsangabe geparst wird.

Diese Beispiele veranschaulichen das neue Verhalten:

```
3.141 | currency:'EUR'                          // 3,14 €
3.141 | currency:'USD':'code'                   // 3,14 USD
3.141 | currency:'EUR':'code':'1.2-2'           // 3,14 EUR
3.141 | currency:'USD':'symbol':'1.2-2':'en_US' // $3.14
```




## i18n-Kommentare

Eine kleine Änderung gibt es in Sachen Mehrsprachigkeit.
Um Textknoten zur Übersetzung zu markieren, wird das `i18n`-Attribut eingesetzt.
Diese Syntax beschreiben wir im Angular-Buch auf Seite 352:

```html
<h1 i18n="meaning|description">Hallo Welt!</h1>
```

Für Text ohne abgegrenztes DOM-Element konnten wir bis Angular 4 auch HTML-Kommentare verwenden.
**Diese Magic Comments werden ab Angular 5 nicht mehr unterstützt!**

```html
<!--i18n: meaning|description -->
Meine Nachricht
<!--/i18n-->
```

Stattdessen müssen wir in diesem Fall nun den `<ng-container>` als umgebendes Element einsetzen.
Auf dem Container können wir dann wie gewohnt das `i18n`-Attribut verwenden:

```html
<ng-container i18n="meaning/description">
Meine Nachricht
</ng-container>
```

Der `<ng-container>` ist ein Hilfselement für Angular und ist im Browser später nicht mehr sichtbar.

Mit dieser Änderung ist die Markierung von Texten nun konsistent: Es wird in jedem Fall das `i18n`-Attribut eingesetzt.


### i18n-Attribute mit CSS markieren

Um bei der Arbeit mit i18n nicht den Überblick zu verlieren, konnten wir Elemente mit dem `i18n`-Attribut per CSS markieren.
Diesen Tipp geben wir auch im Angular-Buch auf Seite 359:

```css
[i18n],
[i18n-placeholder],
[i18n-title] {
  border: 1px solid green !important;
}
```

Leider funktioniert dieses Hilfsmittel seit Angular 4.3 nicht mehr, da alle `i18n`-Attribute automatisch aus dem Kompilat entfernt werden (siehe [#11042](https://github.com/angular/angular/issues/11042)). Dies geschieht leider immer, egal ob die Anwendung übersetzt wird, oder nicht. Vielleicht kommen die Attribute aber irgendwann wieder zurück. Das Problem wurde immerhin als Feature-Request klassifiziert (siehe [#20055](https://github.com/angular/angular/issues/20055)).
