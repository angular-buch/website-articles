---
title: 'Angular 20 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2025-05-30
lastModified: 2025-05-30
keywords:
  - Angular
  - Angular 20
  - Strukturdirektiven
  - vitest
  - Component Suffix
language: de
header: angular20.jpg
sticky: true
---

Alles neu macht der Mai – oder zumindest eine neue Major-Version von Angular:
Am **28. Mai 2025** wurde **Angular 20** veröffentlicht! Im offiziellen [Angular-Blog](https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301) finden Sie die Release-Informationen direkt vom Angular-Team.

Für die Migration auf Angular 20 empfehlen wir, den Befehl `ng update` zu nutzen.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).




# Versionen von TypeScript und Node.js

Für Angular 20 sind *mindestens* die folgenden Versionen von TypeScript und Node.js erforderlich:

- TypeScript: 5.8
- Node.js: 20.19.x oder höher, 22.12.x oder höher, oder 24.0.x oder höher

Der Support für Node.js Version 18 wurde entfernt. In der [Angular-Dokumentation](https://angular.dev/reference/versions) finden Sie ausführliche Infos zu den unterstützten Versionen.


# Der neue Coding Style Guide

Angular hat sich in den letzten Jahren stark weiterentwickelt und viele neue Konzepte wurden in das Framework integriert.
Die Angular-Dokumentation war teilweise nicht auf dem aktuellsten Stand: Insbesondere der Coding Style Guide hatte noch keine Empfehlungen für den aktuellen Status Quo parat.
Mit Angular 20 hat sich das geändert:
Der neue [Style Guide](https://angular.dev/style-guide) wurde stark überarbeitet und verschlankt.
Er beinhaltet aktuelle Empfehlungen und Best Practices und gilt als Leitlinie für die Entwicklung mit den aktuellen Versionen von Angular.

## Keine Suffixes mehr: bewusstere Benennung und neue Patterns

Eine wichtige Änderung, die nicht unerwähnt bleiben sollte, betrifft die Suffixe in Datei- und Klassennamen:
Der neue Style Guide empfiehlt *nicht* mehr, Komponenten, Services und Direktiven mit einem Suffix zu versehen.
Ab Angular 20 generiert die CLI standardmäßig keine Suffixes wie `.component.ts` oder `.service.ts` mehr. Diese neue Einstellung greift natürlich nur bei neu angelegten Projekten.

Der Befehl `ng generate component book-card` erzeugt also die folgende Ausgabe:

**bis Angular 19:**

```
src/app
  book-card
    book-card.component.ts
    book-card.component.html
    book-card.component.scss
    book-card.component.spec.ts
```

```ts
// book-card.component.ts
// ...
@Component(/* ... */)
export class BookCardComponent {}
```

**ab Angular 20:**

```
src/app
  book-card
    book-card.ts
    book-card.html
    book-card.scss
    book-card.spec.ts
```

```ts
// book-card.ts
// ...
@Component(/* ... */)
export class BookCard {}
```


Das Ziel dahinter: Angular-Anwendungen sollen weniger Boilerplate enthalten, und wir sollen uns bewusster mit der Benennung der Abstraktionen auseinandersetzen. Statt automatisch generierter Konstrukte wie `product-detail.component.ts`, ist nun mehr eigenes Nachdenken gefragt: Wie heißt diese Klasse? Was macht sie? Und wie viel sagt der Name allein aus? Wir begrüßen diese Entwicklung, denn sie führt zu kürzeren Datei- und Klassennamen, die gezielter gewählt werden.

Ein Beispiel aus der Praxis: Bei gerouteten Komponenten bevorzugen wir den Zusatz `page`, etwa `checkout-page.ts` (Klassenname `CheckoutPage`), weil er den Einsatzzweck klar macht – ohne sich auf technische Details wie `Component` zu beziehen. Eine Komponente, die nur Inhalte anzeigt und keine Logik enthält, könnten wir dann zum Beispiel `CheckoutView` nennen.

Wer das bisherige Verhalten beibehalten möchte, kann beim Generieren weiterhin einen `type` angeben, aus dem ein Suffix erzeugt wird.
Diese Einstellung kann in der Datei `angular.json` auch permanent gesetzt werden.

```bash
ng generate component book-card --type=component
```


# Zoneless Developer Preview

Das Angular-Team arbeitet seit mehreren Jahren daran, die *Synchronization* (auch *Change Detection*) im Framework zu optimieren.
Ein Meilenstein auf diesem Weg war die Einführung von Signals, die eine gezielte Erkennung von Änderungen ermöglichen.
In Zukunft muss Angular also nicht mehr auf die Bibliothek *zone.js* setzen, um Browserschnittstellen zu patchen und so die Change Detection auszulösen.

Wir haben in unserem [Blogpost zum Release von Angular 18](/blog/2024-06-angular18) bereits ausführlich über die Change Detection und die Einstellung für eine "Zoneless Application" berichtet.

Mit Angular 20 wird *zoneless* im Status *Developer Preview* veröffentlicht.
Die Schnittstelle ist also weitgehend stabil. Trotzdem können kurzfristig Änderungen vorgenommen werden, sodass ein Einsatz in produktiven Anwendungen sorgfältig abgewägt werden sollte.

Um die Zoneless Change Detection zu aktivieren, müssen wir die Funktion `provideZonelessChangeDetection()` verwenden.
Das Wort `experimental` wurde aus dem Funktionsnamen entfernt.
Zusätzlich wird empfohlen, einen globalen Error Handler zu aktivieren, der Exceptions abfängt, die nicht im Anwendungscode behandelt werden.

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners()
};
```

Die Angular CLI bietet beim Anlegen eines neuen Projekts an, die Anwendung *zoneless* zu generieren:

```bash
➜  ~ ng new my-app
✔ Do you want to create a 'zoneless' application without zone.js (Developer Preview)? Yes
```

Die Einstellung kann auch über den neuen Parameter `zoneless` gesteuert werden, der bei Bedarf mit `no` negiert werden kann:

```bash
ng new my-app --zoneless
ng new my-app --nozoneless
```


# Strukturdirektiven `ngIf`, `ngFor`, `ngSwitch`

Mit Angular 20 werden die alten Direktiven `ngIf`, `ngFor` und `ngSwitch` als *deprecated* markiert.
Voraussichtlich mit Angular 22 (in einem Jahr) werden diese Direktiven dann vollständig aus dem Framework entfernt.

Hintergrund ist der neue Built-in Control Flow, der mit Angular 17 eingeführt wurde.
Die Direktiven können also direkt durch die eingebauten Ausdrücke von Angular ersetzt werden: `@if`, `@for`, `@switch` und `@let`.

```html
<!-- mit Direktive (deprecated) -->
<div *ngIf="condition">Hello world</div>

<!-- mit Control Flow -->
@if (condition) {<div>Hello world</div>}
```

In unserem [Blogpost zum Release von Angular 17](/blog/2023-11-angular17#neuer-control-flow-if-for-switch) haben wir die Syntax zum Control Flow ausführlich behandelt.
Die Angular CLI bietet außerdem ein Migrationsskript an, sodass der Umstieg auf die neue Syntax nicht aufwendig sein sollte:

```bash
ng generate @angular/core:control-flow
```


# Experimenteller Test-Builder für Vitest

Der Test-Runner Karma, der immer noch Standard für Unit- und Integrationstests in Angular ist, wird nicht mehr weiterentwickelt.
Seit dieser Entscheidung arbeitet das Angular-Team daran, einen alternativen Test-Runner in die Angular CLI zu integrieren.
Schon vor zwei Jahren wurden experimentelle Builder für [Jest und Web Test Runner veröffentlicht](
https://blog.angular.dev/moving-angular-cli-to-jest-and-web-test-runner-ef85ef69ceca).
Mit Angular 20 kommt eine weitere experimentelle Integration für [Vitest](https://vitest.dev) dazu:
Vitest hat sich bereits in anderen Web-Frameworks basierend auf dem Bundler [Vite](https://vite.dev) als fester Bestandteil etabliert.
Der Build-Prozess von Angular basiert bereits [seit Version 16 auf ESBuild mit Vite](/blog/2023-05-angular16#esbuild).
Mit dieser schrittweisen Umstellung des Unterbaus können wir nun auch auf Vitest zurückgreifen, um Unit- und Integrationstests auszuführen.

Welcher der experimentellen Test-Runner der neue Standard für Angular wird, ist damit noch nicht entschieden!
Alle Ansätze sind experimentell und werden in den nächsten Monaten weiter evaluiert.

Um Vitest mit der Angular CLI zu nutzen, müssen wir zunächst die benötigten Abhängigkeiten hinzufügen:

```sh
npm i vitest jsdom --save-dev
```

Anschließend müssen wir die Testing-Konfiguration in der Datei `angular.json` anpassen:

```json
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
      "tsConfig": "tsconfig.spec.json",
      "buildTarget": "::development",
      "runner": "vitest"
  }
}
```

Jetzt müssen wir in unseren Tests die Funktionen von Vitest verwenden. Dazu sind die folgenden Imports notwendig:

```ts
import { describe, beforeEach, it, expect } from 'vitest';
// ...
```

Die Ausführung erfolgt im Anschluss wie gewohnt mit `ng test`.

Vitest ist zu einem großen Teil mit den Schnittstellen von [Jest](https://jestjs.io/) und auch mit Karma kompatibel – es lohnt sich auf jeden Fall, einmal den Umstieg auszuprobieren.
Im Idealfall müssen Sie in den Tests nur wenige Anpassungen vornehmen.

In Zukunft wird sich vermutlich einer der drei experimentellen Build (Jest, Web Test Runner, Vitest) als der neue Standard etablieren.
Wir begrüßen den Schritt, künftig auf etablierte Standards außerhalb der Angular-Welt zu setzen und den eigens entwickelten Test-Runner Karma abzuschaffen. Wir halten Sie hierzu weiterhin auf dem Laufenden.


# Stabile Signal-APIs: `effect`, `linkedSignal` und `toSignal`

Seit Angular 16 stehen mit Signals die Weichen auf ein neues, reaktives Angular. In Angular 20 wurden nun weitere APIs aus dem Signals-Ökosystem als stabil freigegeben: `effect`, `linkedSignal` und `toSignal`.

Diese Funktionen waren bisher experimentell und sind nun offiziell als Teil des stabilen API-Sets nutzbar:

* `effect()` reagiert automatisch auf Signal-Änderungen und führt dabei definierte Seiteneffekte aus – ganz ohne Lifecycle-Hooks.
* `linkedSignal()` erlaubt die bidirektionale Kopplung zwischen einem Signal und einer externen Quelle – etwa einer Komponente oder einem FormControl.
* `toSignal()` konvertiert Observable-Daten in ein lesbares Signal – ideal zur Integration bestehender Streams.

Weitere Details und Beispiele finden Sie in unserer Signals-Reihe:
* [Neu in Angular 19: LinkedSignal für reaktive Zustandsverwaltung](https://angular-buch.com/blog/2024-11-linked-signal)
* [Angular 19: Mastering effect and afterRenderEffect](https://angular.schule/blog/2024-11-effect-afterrendereffect)


# httpResource: Daten laden mit Signals

Im Oktober 2024 wurde bereits die neue experimentelle Resource API vorgestellt. Wir haben darüber ausführlich [in einem Blogpost](https://angular-buch.com/blog/2024-10-resource-api) berichtet.
Sie verbindet die synchrone Welt von Signals mit asynchron abrufbaren Daten, z. B. mittels HTTP.
Die Daten werden mithilfe eines Loaders asynchron geladen und über Signals bereitgestellt.

Vor einigen Wochen wurde eine weitere Variante der Resource vorgestellt: `httpResource`.
Sie nutzt unter der Haube den `HttpClient` von Angular, um direkt einen HTTP-Request zu stellen.
Es ist damit nicht mehr notwendig, den Request selbständig zu formulieren – darum kümmert sich die Resource.

```ts
booksResource = httpResource<Book[]>(
  () => 'https://api.example.org/books',
  { defaultValue: [] }
);
// ...
console.log(booksResource.value())
```

Der Request muss mithilfe einer Funktion generiert werden.
Hintergrund ist, dass es sich dabei um einen *Reactive Context* handelt: Verwenden wir darin Signals, wird der Request automatisch neu ausgeführt, sobald eins der Signals seinen Wert ändert.
Weitere Details für den Request können in einem Optionsobjekt übergeben werden.

```ts
booksResource = httpResource<Book[]>(
  () => ({
    url: 'https://api.example.org/books',
    params: {
      search: 'Angular'
    }
  })
);
```

Bitte beachten Sie, dass eine Resource ausschließlich dafür gedacht ist, Daten von einer Schnittstelle *abzurufen* und mit Signals bereitzustellen.
Schreibende Operationen wie Erstellen, Aktualisieren oder Löschen können mit einer Resource nicht abgebildet werden.
Dafür müssen wir weiterhin direkt den `HttpClient` verwenden.


## Sonstiges

Alle Details zu den Neuerungen finden Sie immer im Changelog von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).
Einige interessante Aspekte haben wir hier zusammengetragen:

- **`provideServerRouting()` deprecated:** Die Funktion `provideServerRouting()` ist deprecated. Stattdessen wird die bestehende Funktion `provideServerRendering()` mit dem Feature `withRoutes()` verwendet. (siehe [Commit](https://github.com/angular/angular-cli/commit/33b9de3eb1fa596a4d5a975d05275739f2f7b8ae))
- **Chrome DevTools:** Die Integration von Angular in die Chrome Developer Tools wurde deutlich verbessert. Im *Performance*-Tab können die Change Detection und andere Performance-Parameter von Angular untersucht werden.
- **Offizielles Maskottchen:** Das Angular-Team möchte ein offizielles Maskottchen für das Framework einführen – und hier ist die Community gefragt! Nutzen Sie die Chance, im [RFC auf GitHub](https://github.com/angular/angular/discussions/61733) für Ihren Favoriten abzustimmen oder Ihre ehrliche Meinung zu äußern.

<hr>


Wir wünschen Ihnen viel Spaß beim Entwickeln mit Angular 20!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Morgenstimmung im Anklamer Stadtbruch. Foto von Ferdinand Malcher</small>
