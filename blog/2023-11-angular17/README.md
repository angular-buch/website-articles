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
  - Deferrable Views
  - View Transition API
  - ESBuild
language: de
thumbnail: angular17.jpg
sticky: true
hidden: true
---

Es ist wieder ein halbes Jahr vorbei: Anfang November 2023 erschien die neue Major-Version **Angular 17**!
Angular-Teammitglied Minko Gechev hatte diese Version schon vor einigen Wochen als sein ["favorite Angular release … ever"](https://twitter.com/mgechev/status/1681375250335039488) beschrieben.

Auch wir sind der Meinung: Die Community wurde nicht enttäuscht! Die wichtigsten Neuigkeiten zu Angular 17 fassen wir in diesem Blogpost zusammen.
Im offiziellen [Angular-Blog]() finden Sie alle Informationen des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).



## TOP SECRET

TODO @fmalcher


## Projekt updaten

Wenn Sie mit unserem Angular-Buch das Beispielprojekt *BookMonkey* entwickeln, sind keine Anpassungen am Code notwendig.
Die Inhalte des Buchs sind auch mit Angular 17 noch aktuell.

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=16.0-17.0).
Der Befehl `ng update` liefert außerdem Informationen zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 16 aktualisieren
ng update @angular/core@17 @angular/cli@17
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.

Unabhängig von den Inhalten unseres Buchs besteht grundsätzlich immer die Möglichkeit, die neuen Features von Angular auch im *BookMonkey* zu nutzen.
Probieren Sie doch zum Beispiel einmal den neuen Control Flow aus!


## Unterstützte Versionen von TypeScript und Node.js

Um Angular 17 zu nutzen, sind die folgenden Versionen von TypeScript und Node.js notwendig:

- **TypeScript 5.2**. Der Support für TypeScript-Versionen kleiner als 5.2 wurde eingestellt.
- **Node.js 18.13.0**. Node.js in Version 16 wird nicht mehr unterstützt.





## Signals gelten als stable

Mit Angular 16 wurde das Konzept der Signals in Angular eingeführt. 
Im Blogpost *[Angular 16 ist da!](/blog/2023-05-angular16)* haben wir die Ideen dieser neuen *Reactive Primitive* genauer beschrieben.
Die Signals-Bibliothek von Angular gilt nun als *stable*, sodass Signals auch in produktiven Anwendungen genutzt werden können.

Die Reise mit Signals ist damit aber noch nicht vorbei: In den nächsten Monaten werden weitere Neuerungen kommen, vor allem im Blick auf vollständig signal-basierte Komponenten ([siehe RFC auf GitHub](https://github.com/angular/angular/discussions/49682)).
Damit wird es möglich sein, Angular-Anwendungen "zoneless" zu betreiben, also ohne die Bibliothek zone.js.
Dieses Hilfsmittel ist seit jeher notwendig, um die Change Detection von Angular zu triggern – der Prozess, der Änderungen an den Daten ermittelt und die Views der Anwendung automatisch aktualisiert.
Um diesen Ablauf gezielter und performanter durchzuführen, sind Signals ein wichtiger Grundbaustein.

Übrigens: Die Signal-Methode `mutate()` ist in diesem Release nicht mehr enthalten.
Die Hintergründe sind im zugehörigen [Commit auf GitHub](https://github.com/angular/angular/commit/c7ff9dff2c14aba70e92b9e216a2d4d97d6ef71e) ausgeführt.
Statt `mutate()` muss also die Methode `update()` verwendet werden. Dabei müssen Arrays und Objekt als *immutable* behandelt werden.




## Neuer Control Flow: `@if`, `@for`, `@switch`

Die bekannten Strukturdirektiven `NgIf`, `NgFor` und `NgSwitch` sind in ihrer Funktionsweise stark abhängig von zone.js.
Auf dem Weg zu "Zoneless Angular Apps" musste das Angular-Team das Konzept dieser Direktiven überdenken.

Mit Angular 17 ist nun der neue *Control Flow* für Templates verfügbar!
Damit wird die Funktionalität der bekannten Direktiven direkt in die Template-Syntax integriert.
Diese Neuerung hat auch bei der Entwicklung einen entscheidenen Vorteil: Die Syntax wird vom Compiler ausgewertet, und es ist nicht mehr notwendig, die Direktiven bei Standalone Components zu importieren, damit sie überhaupt in der Komponente genutzt werden können.

Die Ausdrücke für den neuen Control Flow werden direkt im HTML-Code notiert und mit einem `@`-Symbol eingeleitet.


### Bedingungen mit dem `@if`-Block

Der `@if`-Block dient dazu, bestimmte Teile eines HTML-Templates nur dann anzuzeigen, wenn eine Bedingung erfüllt ist.
Er ersetzt die Direktive `*ngIf`.
Im `@if`-Block steht eine Bedingung. Nur wenn diese Bedingung wahr ist, wird der Teil der Benutzeroberfläche gezeigt.

Ein `@if`-Block kann auch `@else`-Blöcke enthalten. Das sind alternative Blöcke, die angezeigt werden, wenn die Bedingung im `@if`-Teil nicht erfüllt ist.
Man kann einen einfachen `@else`-Block definieren, der immer dann zum Einsatz kommt, wenn die `@if`-Bedingung nicht zutrifft – oder man kann zusätzliche `@else`-Blöcke mit weiteren Bedingungen definieren:


```html
<!-- VORHER -->
<ng-container *ngIf="books?.length >= 1; else elseBlock">
  
  <ng-container *ngIf="books?.length === 1; else elseBlock2">
    <book-details [book]="books[0]" />
  </ng-container>
  
  <ng-template #elseBlock2>
    <book-list [books]="books" />
  </ng-template>

</ng-container>

<ng-template #elseBlock>
  <p>Keine Bücher verfügbar!</p>
</ng-template>
```

```html
<!-- NACHHER -->
@if (books?.length > 1) {
  <book-list [books]="books" />
} @else if (books?.length === 1) {
  <book-details [book]="books[0]" />
} @else {
  <p>Keine Bücher verfügbar!</p>
}
```

Es fällt sofort auf, dass der `@else`-Zweig deutlich einfacher zu definieren ist als zuvor. Der Einsatz von `<ng-template>` ist nicht mehr notwendig!
Außerdem war es bisland häufig erforderlich, das spezielle Tag `<ng-container>` einzusetzen, um mehrere Elemente zu gruppieren, ohne ein unnötiges DOM-Element zu erzeugen.
Auch dies entfällt mit der neuen Syntax, da die Gruppierung nun über die Klammern geschieht.


### Wiederholungen mit `@for`

Der Schleifenblock `@for` ersetzt `*ngFor` für Iterationen und unterscheidet sich in einigen Punkten von der bislang eingesetzten Direktive:

```html
<!-- VORHER --> 
<ul>
  <li *ngFor="book of books">
    <book-list-item [book]="book" />
  </li>
  <p *ngIf="!books.length">Keine Bücher verfügbar!</p>
</ul>
```

```html
<!-- NACHHER --> 
<ul>
  @for (book of books; track book.isbn) {
    <li>
      <book-list-item [book]="book" />
    </li>
  } @empty {
    <li>Keine Bücher verfügbar!</li>
  }
</ul>
```

Es ist nun möglich, direkt einen `@empty`-Block anzugeben, der aktiv wird, wenn es keine Einträge gibt. Dies war zuvor nicht direkt möglich.
Die gezeigte Einstellung `track` ersetzt das Konzept der `trackBy`-Funktion: Sie bestimmt den Schlüssel für jede Zeile, der intern verwendet wird, um Array-Elemente eindeutig zu identifizieren. Bei der Direktive `*ngFor` war es optional, das explizite Tracking zu verwenden. mit der neuen Syntax ist `track` jedoch eine Pflichtangabe.

Eine weitere Vereinfachung besteht darin, dass die Hilfsvariablen nicht mehr extra deklariert werden müssen:

```html
<!-- VORHER --> 
<li *ngFor="book of books; index as i">
  {{ i + 1 }}. Buch: <book-list-item [book]="book" />
</li>
```

```html
<!-- NACHHER --> 
@for (book of books; track book.isbn) {
  <li>
    {{ $index + 1 }}. Buch: <book-list-item [book]="book" />
  </li>
}
```

Falls das iterierte Array nur primitive Werte (z. B. Strings) beinhaltet, wird der Wert selbst als Identifikator verwendet:

```html
@for (name of nameList; track name) {
  <li>{{ name }}</li>
}
```


Folgende Hilfsvariablen stehen in einem `@for`-Block zur Verfügung:

| Variable | Bedeutung                                              |
|----------|--------------------------------------------------------|
| $index   | Index der aktuellen Zeile                          |
| $first   | gibt an, ob die aktuelle Zeile die erste ist           |
| $last    | gibt an, ob die aktuelle Zeile die letzte ist          |
| $even    | gibt an, ob der Index der aktuellen Zeile gerade ist   |
| $odd     | gibt an, ob der Index der aktuellen Zeile ungerade ist |


### Fallunterscheidungen mit `@switch`

Auch die Direktive `NgSwitch` erhält einen Nachfolger. Die neue Syntax mit `@switch` ist nun deutlich ähnlicher zum `switch`-Statement in JavaScript als zuvor:

```html
<!-- VORHER -->
<ng-container [ngSwitch]="bedingung">
  <span *ngSwitchCase="1">Ansicht für Fall 1</span>
  <span *ngSwitchCase="2">Ansicht für Fall 2</span>
  <span *ngSwitchCase="3">Ansicht für Fall 3</span>
  <span *ngSwitchDefault>Standardansicht, wenn kein anderer Fall zutrifft</span>
</ng-container>
``````

```html
<!-- NACHHER -->
@switch (bedingung) {
  @case (1) {
    <span>Ansicht für Fall 1</span>
  }
  @case (2) {
    <span>Ansicht für Fall 2</span>
  }
  @case (3) {
    <span>Ansicht für Fall 3</span>
  }
  @default {
    <span>Standardansicht, wenn kein anderer Fall zutrifft</span>
  }
}
```

Auch hier ist jetzt kein Container-Element mehr nötig. Ansonsten ändert sich nicht viel: `@switch` kennt weiterhin kein "Durchfallen" – eine `break`-Operation ist nicht notwendig.


### Was passiert mit den Direktiven?

Die bisherigen Direktiven bleiben zunächst erhalten und können parallel zum Control Flow verwendet werden.
Sie müssen Ihre Anwendungen also nicht sofort migrieren, sondern können auch weiterhin den gewohnten Ablauf mit den Direktiven nutzen.
Ebenso ist ein Mischbetrieb möglich, sodass z. B. neue Features mit dem neuen Control Flow ausgestattet werden können.

Grundsätzlich empfehlen wir Ihnen jedoch, in den nächsten Monaten schrittweise zur neuen Control-Flow-Syntax zu migrieren.
Es ist möglich, dass die Direktiven `NgIf`, `NgFor` und `NgSwitch` in einer zukünftigen Major-Version als *deprecated* markiert werden.

Angular stellt übrigens ein Skript bereit, um die Templates auf den neuen Control Flow zu migrieren:

```bash
ng generate @angular/core:control-flow
```

Bitte beachten Sie, dass die Migration nicht vollständig automatisch funktioniert.
Die Ergebnisse müssen stets manuell geprüft und nachgebessert werden.
In unseren ersten Experimenten war die Automigration hilfreich, hat aber nicht alle Fälle korrekt erfasst.


## Deferrable Views mit `@defer`

<!-- siehe https://github.com/angular/angular/discussions/50716 -->

Mit dem neuen Control Flow wird ein sehr nützliches neues Feature eingeführt: der `@defer`-Block.

Mit diesem neuen Feature können wir Teile von HTML-Templates verzögert nachladen.
Dabei ist es egal, ob es sich um reines HTML, eine Komponente, eine Direktive, eine Pipe oder ein komplexeres Template handelt – wenn HTML-Inhalte in einem solchen Block platziert werden, lädt Angular diese Inhalte nur unter bestimmten Bedingungen oder bei bestimmten Ereignissen zur Laufzeit nach.
Das ist besonders nützlich, um die Leistung zu optimieren, insbesondere wenn bestimmte Komponenten nicht sofort benötigt werden oder für die anwendende Person noch nicht sichtbar sind.

Grundsätzlich ermöglicht der Router mithilfe von Lazy Loading bereits, ganze Seiten zur Laufzeit nachzuladen. Mit Deferrable Views wird dieses Konzept jetzt noch differenzierter einsetzbar: Wir behandeln nicht nur ganze Seiten, sondern nach Bedarf auch kleinere Teile ihrer Templates.


```html
<p>Dieser folgende Teil des Templates wird später geladen!</p>

@defer {
  <book-details [book]="myBook" />
}
@loading {
  <span>Inhalte werden geladen …</span>
} @placeholder {
  <span>Inhalt wurde noch nicht geladen.</span>
} @error {
  <span>Es kam zu einem Fehler!</span>
}
```

Folgende Helfer stehen zur Verfügung

* `@loading`: Zeigt den angegebenen Inhalt an, während die Abhängigkeiten geladen werden.
* `@placeholder`: Zeigt den angegebenen Inhalt als Platzhalter, bis a) das Laden gestartet wurde, wenn es einen `@loading`-Block gibt bzw. b) der eigentliche Inhalt vollständig gerendert ist. Der Platzhalter muss in den meisten Fällen angegeben werden! 
* `@error`: Zeigt den angegebenen Inhalt an, falls ein Problem beim Laden des Inhalts auftritt.


Standardmäßig wird der Inhalt eines `@defer`-Blocks sofort geladen, nachdem die Anwendung fertig gerendert wurde.
Um das Verhalten genauer zu steuern, steht eine Sammlung von Triggern zu Verfügung.
Sie steuern, wann Angular den Inhalt laden und rendern soll.

### Loading Trigger: `on viewport`

Der Inhalt soll nachgeladen werden, wenn das Element sichtbar wird, also in den Viewport des Browsers rückt:

```html
@defer (on viewport) {
  <p>Dieser Inhalt wird später geladen!</p>
}
@placeholder {
  <p>Inhalt wurde noch nicht geladen …</p>
}
```

### Loading Trigger: `on timer`

Der Inhalt soll nachladen, wenn ein Timer abgelaufen ist:

```html
@defer (on timer(3s)) {
  <p>Dieser Inhalt wird erst nach 3 Sekunden geladen!</p>
}
@placeholder {
  <p>Inhalt wurde noch nicht geladen …</p>
}
```

### Loading Trigger: `when`

Der Inhalt soll nachladen, wenn Bedingung erfüllt ist:

```html
@defer (when myDeferFlag) {
  <p>Dieser Inhalt wird einmalig geladen, wenn `myDeferFlag` wahr ist!</p>
}
@placeholder {
  <p>Inhalt wurde noch nicht geladen …</p>
}
```



## Routing mit View Transition API

Der Router von Angular unterstützt nun die native [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API).
Damit ist es möglich, animierte Übergänge im DOM beim Wechsel zwischen Routen zu implementieren.
Bitte beachten Sie, dass die Schnittstelle noch nicht in allen Browsern unterstützt wird.

Um das neue Feature zu nutzen, verwenden wir die Funktion `withViewTransitions()` in der Konfiguration des Routers:

```ts
// app.config.ts

import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfiug: ApplicationConfig = {
  providers: [
    provideRouter(
      [/* ... */], // Routen
      withViewTransitions() // View Transitions aktivieren
    ),
  ],
});
```

Damit der Effekt sichtbar wird, müssen wir außerdem eine passende Animation implementieren.
Dafür werden die CSS-Pseudo-Selektoren `::view-transition-old` und `::view-transition-new` verwendet:

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

Anstatt der Angabe `root` können wir hier auch einen anderen CSS-Selektor angeben, auf dem die View Transition angewandt werden soll.
Mit dem Wert `root` erfolgt die Transition auf dem gesamten Dokument.


## Neuerungen bei Server-Side Rendering

Das Angular-Team hat im neuesten Release stark an dem Support für Server-Side-Rendering (SSR) gearbeitet.
Das bisherige Projekt *Angular Universal* wurde dafür direkt in den Core von Angular aufgenommen. Es wird ab sofort unter dem neuen Namen `@angular/ssr` veröffentlicht.

Mithilfe von Server-Side Rendering kann die Angular-Anwendung bereits auf dem Server ausgeführt werden, sodass der Aufbau des DOM-Baums nicht mehr vollständig im Browser passieren muss.
Das kann für eine bessere wahrgenommene Start-Performance sorgen, weil beim Laden der Seite bereits grundlegender Inhalt sichtbar ist.
Richtig eingesetzt kann SSR bessere Ergebnisse bei den Core Web Vitals ermöglichen.
Außerdem ist SSR ein elementarer Baustein für Suchmaschinenoptimierung.

Angular hat hier bei der sogenannten _Partial Hydration_ nachgebessert:
Nach der ersten Auslieferung der server-gerenderten Anwendung wird im Browser nicht mehr die gesamte Anwendung neu gerendert und ersetzt.
Stattdessen werden nur die relevanten (interaktiven) Teile der Anwendung ermittelt, und nur diese werden mithilfe von JavaScript _hydriert_, also zum dynamischen Leben erweckt.
Dieses Konzept wurde grundlegend bereits mit Angular 16 eingeführt.

Wenn Sie bereits Angular Universal nutzen, können Sie Ihrer Anwendung mit dem folgenden Befehl auf das neue Package migrieren:

```bash
ng update @nguniversal/express-engine
```

Neu ist auch, dass wir beim Anlegen unseres Projekts mit `ng new` sofort den Support für SSR aktivieren können:

```bash
ng new book-monkey --ssr
```


## Application Builder auf Basis von ESBuild




## Sonstiges

Neben den großen Features hat Angular eine Menge von kleineren Neuerungen und Bugfixes an Bord.
Einige interessante Punkte haben wir hier aufgeführt:

- Die `styleUrls` in den Metadaten einer Komponente mussten seit jeher als Array notiert werden. Da häufig nur eine einzige Style-URL angegeben wird, können wir dort nun auch einen einfachen String angeben: `styleUrls: './my.component.scss'`.
- Die Option `--routing` ist beim Erzeugen eines neuen Workspace mit `ng new` nun standardmäßig aktiviert.
- Animationen mit `@angular/animations` können lazy geladen werden, sodass die Implementierung nicht mehr sofort zusammen mit der Hauptanwendung geladen werden muss. Siehe [Commit](https://github.com/angular/angular/commit/e753278faae79a53e235e0d8e03f89555a712d80).

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 17!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Raukenlandschaft, Fårö/Gotland, Schweden. Foto von Ferdinand Malcher</small>
