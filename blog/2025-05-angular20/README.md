---
title: 'Angular 20 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2025-05-XX
lastModified: 2025-05-XX
keywords:
  - Angular
  - Angular 20
language: de
header: angular20.jpg
sticky: true
hidden: true
---

Alles neu macht der Mai – oder zumindest eine neue Major-Version von Angular:
Am **XX. Mai 2025** wurde **Angular 20** veröffentlicht! Im offiziellen [Angular-Blog](TODO) finden Sie die Release-Informatioen direkt vom Angular-Team.

Für die Migration auf Angular 20 empfehlen wir, den Befehl `ng update` zu nutzen.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).






# Versionen von TypeScript und Node.js

Für Angular 20 sind *mindestens* die folgenden Versionen von TypeScript und Node.js erfoderlich:

- TypeScript: 5.8
- Node.js: 20.11.1

Der Support für Node.js Version 18 wurde entfernt. In der [Angular-Dokumentation](https://angular.dev/reference/versions) finden Sie ausführliche Infos zu den unterstützten Versionen.


# Suffix für Komponenten und Services

TODO



# Zoneless Developer Preview

Das Angular-Team arbeitet seit mehreren Jahren daran, die *Synchronization* (auch *Change Detection*) im Framework zu optimieren.
Ein Meilenstein auf diesem Weg war die Einführung von Signals, die eine gezielte Erkennung von Änderungen ermöglichen.
In Zukunft muss Angular also nicht mehr auf die Bibliothek *zone.js* setzen, um Browserschnittstellen zu patchen und so die Change Detection auszulösen.

Wir haben in unserem [Blogpost zum Release von Angular 18](/blog/2024-06-angular18) bereits ausführlich über die Change Detection und die Einstellung für eine "zoneless Application" berichtet.

Mit Angular 20 wird *zoneless* im Status *Developer Preview* veröffentlicht.
Die Schnittstelle ist also weitgehend stabil. Trotzdem können kurzfristig Änderungen vorgenommen werden, sodass ein Einsatz in produktiven Anwendungen sorgfältig abgewägt werden sollte.

Um die Zoneless Change Detection zu aktivieren, müssen wir die Funktion `provideZonelessChangeDetection()` verwenden.
Das Wort `experimental` wurde aus dem Funktionsnamen entfernt.

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection()
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
Die Angular CLI bietet außerdem ein Migrationsskript an, sodass der Umstieg auf die neue Syntax nicht aufwendiug sein sollte:

```bash
ng generate @angular/core:control-flow
```


# Experimenteller Test-Builder für vitest

TODO


## Sonstiges

Alle Details zu den Neuerungen finden Sie immer im Changelog von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).
Einige interessante Aspekte haben wir hier zusammengetragen:

- **`provideServerRouting()` deprecated:** Die Funktion `provideServerRouting()` ist deprecated. Stattdessen wird die bestehende Funktion `provideServerRendering()` mit dem Feature `withRoutes()` verwendet. (siehe [Commit](https://github.com/angular/angular-cli/commit/33b9de3eb1fa596a4d5a975d05275739f2f7b8ae))



<hr>


Wir wünschen Ihnen viel Spaß beim Entwickeln mit Angular 20!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** TODO. Foto von XXX</small>
