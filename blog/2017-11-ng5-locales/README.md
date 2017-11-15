---
title: "Internationalisierung in Angular 5"
author: Ferdinand Malcher
mail: mail@fmalcher.de
published: 2017-11-03
keywords:
  - Angular
  - Angular 5
language: de
thumbnail: ../angular5.png
darken-thumbnail: true
---

!! WIP !!

Bis Version 4 hat Angular auf die Intl-API gesetzt, die in den modernen Browsern nativ implementiert ist.
Dieser Weg bringt allerdings zwei wesentliche Nachteile mit sich:

1. Die API ist in den Browsern unterschiedlich implementiert.
2. In älteren Browsern ist ein Polyfill nötig, um die Funktionalität nachzurüsten.

In Angular 5.0.0 wurde die Abhängigkeit auf die Intl-API entfernt.
Das betrifft besonders die Pipes, die auf Lokalisierung setzen: `DatePipe`, `DecimalPipe` und `CurrencyPipe`.


## Sprache festlegen

Die besagten Pipes verarbeiten Informationen, die spezifisch für eine Region sind.
Beispielsweise werden Datumsangaben im Locale `en_US` anders dargestellt als für `de_DE`.
Ein weiteres Beispiel sind Dezimal- und Tausendertrennzeichen (Punkt und Komma) bei Zahlen.

In der Anwendung muss immer ein Locale festgelegt werden.
Im einfachsten Fall legen wir die Sprache schon zur Entwicklungszeit fest, aber es existieren natürlich auch dynamische und flexiblere Wege.

Das aktuelle Locale ist im Token `LOCALE_ID` festgelegt.
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
