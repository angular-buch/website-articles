---
title: 'Angular 17 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2023-11-XX
lastModified: 2023-11-XX
keywords:
  - Angular
  - Angular 17
  - Signals
  - Control Flow
language: de
thumbnail: angular17.jpg
sticky: true
hidden: true
---

Am 6. November 2023 erschien die neue Major-Version von Angular: **Angular 17**!
Mit diesem Release sind *Signals* sowie der neue Builder basierend auf *ESBuild* nun stable.
Die wohl größten Neuerungen kommen im Bereich *Server-Side-Rendering*, sowie der Template Syntax mit dem neuen *Control Flow* und der *Deferrable Views* zu Tage.

Wir fassen in diesem Blogpost wieder die wichtigsten Neuigkeiten in Angular 17 zusammen.
Im offiziellen [Angular-Blog]() finden Sie alle Informationen des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).

## Projekt updaten

Wenn Sie mit unserem Angular-Buch das Beispielprojekt *BookMonkey* entwickeln, sind keine notwendigen Anpassungen am Code notwendig.
Die Inhalte des Buchs sind auch mit Angular 17 noch aktuell, wenngleich sie mit Angular 17 die Möglichkeit haben auf den neuen Control Flow zu wechseln.

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=16.0-17.0).
Der Befehl `ng update` liefert außerdem Informationen zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 16 aktualisieren
ng update @angular/core@16 @angular/cli@16
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.

## Optionale Code-Migrationen

TODO: Irgendwie konnte man sich optionale Migrations listen und dann auch ausführen lassen. Sollten wir hier ggf. mit aufnehmen


## Unterstützte Versionen von TypeScript und Node.js

Um Angular 16 zu nutzen, sind die folgenden Versionen von TypeScript und Node.js notwendig:

- **TypeScript 5.2**. Der Support für TypeScript-Versionen kleiner als 5.2 wurde eingestellt.
- **Node.js 18.13.0**. Node.js in Version 16 wird nicht mehr unterstützt.


## Signals

Das mit Angular 16 im Developer Preview neu eingeführten Signals sind sind nun stable.
Im Blogpost *[Angular 16 ist da!](/blog/2023-11-angular17)* haben wir die Funktion der neuen Reactive Primitive detaillierter beschrieben.

## Neuerungen der Template Syntax

Mit Angular 17 wurde erstmal die Template-Syntax neu überdacht.
Zu den Änderungen gehören der neue *Control Flow* sowie die Implementierung der *Deferrable Views*.

### Control Flow

Der neue Control Flow sorgt dafür, dass die Funktionalität der Direktiven `NgIf`, `NgFor` udn `NgSwitch` direkt zum Teil der Template Syntax wird.
Wir müssen diese künftig bei Verwendung des Control Flows nicht mehr zuvor in einem Modul oder einer Komponente importieren.
Die Syntax zur Verwendung wird mit einem `@`-Symbol eingeleitet.


#### NgIf

```html
@if (books?.length > 1) {
  <book-list [books]="books" />
} @else if (books?.length === 1) {
  <book-details [book]="books[0]" />
} @else {
  <p>No book available</p>
}
```

#### NgFor

```html
<ul class="names">
  @for (book of books; track book.isbn) {
    <li>
      <book-list-item [book]="book" />
    </li>
  } @empty {
    <p>No book available</p>
  }
</ul>
```

#### NgSwitch

```html
@switch (caseNo) {
  @case (1) {
    <span>Rendering case 1</span>
  }
  @case (2) {
    <span>Rendering case 2</span>
  }
  @case (3) {
    <span>Rendering case 3</span>
  }
  @default {
    <span>Rendering default</span>
  }
}
```



Die bisherigen Direktiven bleiben vorerst erhalten und können parallel zum Control Flow verwendet werden.
Wir empfehlen jedoch die Migration zur neuen Control Flow Syntax, da die Verwendung der Direktiven vermutlich mit den nächsten Angular-Major-Releases deprecated werden wird.

Zur Migration können wir das vom Angular-Team bereitgestellte Schematic nutzen:

```bash

```

### Deferrable Views

## View Transition API

Ein brandneues Feature, dass mit Angular 17 kommt, ist der Support der [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) für den Angular Router.
Diese (noch nicht in allen Browsern vollständig umgesetzte) API ermöglicht animierte Übergängen des DOM beim Wechsel zwischen Routen.

Um die neue API zu nutzen, müssen wir zunächst den Router dazu befähigen:

```ts
import { provideRouter, withViewTransitions } from '@angular/router';

// ...

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      [/* ... */], // Routenkonfiguration
      withViewTransitions() // Aktivieren der View Transitions
    ),
  ],
})
```

Damit wir den entsprechenden Effekt auch sehen, benötigen wir allerdings noch eine passende Animation.
Die Ausführung erwirken wir über die beiden CSS Pseudo-Elemente `::view-transition-old` bzw. `::view-transition-new`:

```css
@keyframes slide-right {
  from {
    transform: translateX(100px);
  }
}

@keyframes slide-left {
  to {
    transform: translateX(-100px);
  }
}

::view-transition-old(root) {
  animation: 500ms linear both slide-left;
}

::view-transition-new(root) {
  animation: 500ms linear both slide-right;
}
```

Anstatt der Angabe `root`, können wir hier auch einen CSS Selektor angeben, auf dem die View Transition angewandt werden soll.
Behalten wir `root` bei, erfolgt die Transition entsprechend auf dem gesamten Dokument.


## SSR

Das Angular Team hat im neuesten Release stark an dem Support für Server-Side-Rendering (SSR) gearbeitet.
Hierfür wurde das bisherige Projekt Angular Universal in den Core von Angular aufgenommen umgezogen und unter dem neuen Namen  `@angular/ssr` veröffentlicht.
Die Verwendung von SSR in Angular sorgt für eine bessere Performance beim Laden der Anwendung.
Dadurch können ebenso bessere Ergebnisse bei den Core Web Vitals sowie eine verbesserte Search Enginge Optimization (SEO) erzielt werden.
Angular hat hier stark bei der sogenannten _Partial Hydration_ nachgebessert.
Dabei wird nach erstmaliger Auslieferung der statischen Website nicht mehr die gesamte Angular Anwendung neu geladen und die statische Seite wird ersetzt,
sondern es werden die relevanten (interaktiven) Teile der Anwendung erkannt, und nur diese werden mit dem dynamischen Code (aka. JavaScript) _hydriert_.

Wenn Sie bereits Angular Universal verwendet haben, sorgen die Angular Schematics dafür, dass Sie automatisch bei einem `ng update` auf das neue package migrieren.

```bash
ng update @nguniversal/express-engine
```

Neu ist auch, dass wir erstmalig direkt beim Anlegen unseres Projekts das Thema SSR mit berücksichtigen können.

```bash
ng new book-monkey --ssr
```

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 17!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Raukenlandschaft, Fårö/Gotland, Schweden. Foto von Ferdinand Malcher</small>
