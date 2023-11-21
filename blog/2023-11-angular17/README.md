---
title: 'Angular 17 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2023-11-06
lastModified: 2023-11-08
keywords:
  - Angular
  - Angular 17
  - Signals
  - Control Flow
  - Deferrable Views
  - View Transition API
  - ESBuild
  - Logo
  - angular.dev
language: de
thumbnail: angular17.jpg
sticky: false
---


Es ist wieder ein halbes Jahr vorbei: Anfang November 2023 erschien die neue Major-Version **Angular 17**!
Angular-Teammitglied Minko Gechev hatte diese Version schon vor einigen Wochen als sein ["favorite Angular release … ever"](https://twitter.com/mgechev/status/1681375250335039488) beschrieben.

Auch wir sind der Meinung: Die Community wurde nicht enttäuscht! Die wichtigsten Neuigkeiten zu Angular 17 fassen wir in diesem Blogpost zusammen.
Im offiziellen [Angular-Blog](https://blog.angular.io/introducing-angular-v17-4d7033312e4b) finden Sie alle Informationen des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).



## angular.dev: Das neue Gesicht von Angular

Angular hat ein neues Logo! Seit 6. November erstrahlt das große A unseres Lieblingsframeworks mit einem modernen Farbverlauf.
Die viel größere Neuigkeit verbirgt sich aber hinter der neuen Domain **[angular.dev](https://angular.dev)**: Hier finden Sie ab sofort die neue Landingpage und Dokumentation von Angular.
Die Inhalte wurden vollständig überarbeitet, um vor allem den Einstieg in das Framework zu vereinfachen.
Die Dokumentation setzt zum großen Teil auf die neuen Konzepte wie Signals und den neuen Control Flow mit der `@`-Syntax.

Die offizielle Ankündigung des Angular-Teams finden Sie im [Angular-Blog](https://blog.angular.io/announcing-angular-dev-1e1205fa3039).

### Angular im Wandel der Zeit

Das bisherige Angular-Logo ist weithin bekannt: Das weiße A auf einem roten Schild ist *das* Identifikationsmerkmal von Angular.
Gleichzeitig schaut das Logo auf eine lange Geschichte zurück: Die erste Version wurde ab 2012 mit dem Vorgänger-Framework "AngularJS" bekannt.
Im September 2016 wurde das neue Framework "Angular" veröffentlicht, das eine vollständige Neuentwicklung war – Name und Logo blieben jedoch grundlegend erhalten.

In den letzten Jahren hat Angular eine starke Entwicklung vollzogen. Standalone Components, Signals, Control Flow, die Funktion `inject()`, funktionale Guards/Interceptoren und Typed Reactive Forms sind nur eine Auswahl der neuen Strömungen.
Gelegentlich hören wir das Feedback, Angular sei "tot" oder werde "nicht mehr weiterentwickelt".
Doch das Gegenteil ist der Fall: Angular wird allein innerhalb des Konzerns Google in über 1.200 Anwendungen produktiv eingesetzt. Es ist eins der führenden Frameworks, um Webanwendungen für den Enterprise-Bereich zu entwickeln und kann auf einer Stufe mit anderen großen Frameworks wie Vue.js oder React stehen.

Um diesen frischen Wind nicht nur auf technischer Ebene sichtbar zu machen, präsentiert sich Angular seit Version 17 mit einem neuen Logo und einem neuen Portal für Entwicklerinnen und Entwickler.
Seit Version 2.0 im September 2016 hat sich in Angular viel getan – und wir freuen uns, dass dieser "Renaissance" nun ein neues Gesicht verliehen wurde.

<div style="margin: auto">
  <img src="https://website-articles.angular-buch.com/blog/2023-11-angular17/logo-history.png" alt="Geschichte des Logos">
  <p><small>Das Angular-Logo im Wandel der Zeiten: AngularJS (2012), Angular (2016), Angular (2023)</small></p>
</div>



## Projekt updaten

Wenn Sie mit unserem Angular-Buch das Beispielprojekt *BookMonkey* entwickeln, sind keine Anpassungen am Code notwendig.
Die Inhalte des Buchs sind auch mit Angular 17 noch aktuell.

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=16.0-17.0).
Der Befehl `ng update` liefert außerdem Informationen zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 17 aktualisieren
ng update @angular/core@17 @angular/cli@17
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.

Unabhängig von den Inhalten unseres Buchs besteht grundsätzlich immer die Möglichkeit, die neuen Features von Angular auch im *BookMonkey* zu nutzen.
Probieren Sie doch zum Beispiel einmal den neuen Control Flow aus – dazu gleich mehr!


## Unterstützte Versionen von TypeScript und Node.js

Um Angular 17 zu nutzen, sind die folgenden Versionen von TypeScript und Node.js notwendig:

- **TypeScript 5.2**. Der Support für TypeScript-Versionen kleiner als 5.2 wurde eingestellt.
- **Node.js 18.13.0**. Node.js in Version 16 wird nicht mehr unterstützt.


## Signals gelten als stable

Mit Angular 16 wurde das Konzept der Signals eingeführt. 
Im Blogpost *[Angular 16 ist da!](/blog/2023-05-angular16)* haben wir die Ideen dieser neuen *Reactive Primitive* genauer beschrieben.
Die Signals-Bibliothek von Angular gilt nun als *stable*, sodass Signals auch in produktiven Anwendungen genutzt werden können.

Die Reise mit Signals ist damit aber noch nicht vorbei: In den nächsten Monaten werden weitere Neuerungen kommen, vor allem im Blick auf vollständig signal-basierte Komponenten ([siehe RFC auf GitHub](https://github.com/angular/angular/discussions/49682)).
Damit wird es möglich sein, Angular-Anwendungen "zoneless" zu betreiben, also ohne die Bibliothek zone.js.
Dieses Hilfsmittel ist seit jeher notwendig, um die Change Detection von Angular zu triggern – der Prozess, der Änderungen an den Daten ermittelt und die Views der Anwendung automatisch aktualisiert.
Um diesen Ablauf gezielter und performanter durchzuführen, sind Signals ein wichtiger Grundbaustein.

Übrigens: Die Signal-Methode `mutate()` ist in diesem Release nicht mehr enthalten.
Die Hintergründe sind im zugehörigen [Commit auf GitHub](https://github.com/angular/angular/commit/c7ff9dff2c14aba70e92b9e216a2d4d97d6ef71e) ausgeführt.
Statt `mutate()` muss also die Methode `update()` verwendet werden. Dabei müssen Arrays und Objekte als *immutable* behandelt werden.




## Neuer Control Flow: `@if`, `@for`, `@switch`

Die bekannten Strukturdirektiven `NgIf`, `NgFor` und `NgSwitch` sind in ihrer Funktionsweise stark abhängig von zone.js.
Auf dem Weg zu "Zoneless Angular Apps" musste das Angular-Team das Konzept dieser Direktiven überdenken.

Mit Angular 17 ist nun der neue *Control Flow* für Templates verfügbar!
Damit wird die Funktionalität der bekannten Direktiven direkt in die Template-Syntax integriert.
Diese Neuerung hat auch bei der Entwicklung einen entscheidenen Vorteil: Die Syntax wird vom Compiler ausgewertet, und es ist nicht mehr notwendig, die Direktiven (oder das `CommonModule`) zu importieren, damit sie überhaupt in der Komponente genutzt werden können.

Die Ausdrücke für den neuen Control Flow werden direkt im HTML-Code notiert und mit einem `@`-Symbol eingeleitet.
Um Konflikte mit den neuen Steuerzeichen der Template-Syntax zu vermeiden (`@` und geschweifte Klammern), müssen diese Zeichen manuell escapet werden, wenn sie anderweitig im HTML-Code genutzt werden.
Beim automatischen Update auf Angular 17 wird dieser Schritt automatisch vorgenommen.

Wenn Sie die neue Syntax verwenden wollen, stellen Sie bitte sicher, dass Sie den *Angular Language Service* in Visual Studio Code installiert haben. Diese Extension sorgt für korrektes Syntax Highlighting in den Templates.
Die IDEs der Firma Jetbrains können auch bereits mit der Syntax umgehen.

> **Hinweis:** Der neue Control Flow ist im Status __Developer Preview__. Sie können dieses neue Feature bereits ausprobieren, aber es können sich noch Details ändern, bevor es als stabil gekennzeichnet wird!


### Bedingungen mit `@if`

Der `@if`-Block dient dazu, bestimmte Teile eines HTML-Templates nur dann anzuzeigen, wenn eine Bedingung erfüllt ist.
Er ersetzt die Direktive `*ngIf`.
Im `@if`-Block steht eine Bedingung. Nur wenn diese Bedingung wahr ist, wird der Teil des Templates gezeigt.

Ein `@if`-Block kann auch `@else`-Blöcke enthalten: Das sind alternative Zweige, die angezeigt werden, wenn die Bedingung im `@if`-Teil nicht erfüllt ist.
Man kann einen einfachen `@else`-Block definieren, der immer dann zum Einsatz kommt, wenn die `@if`-Bedingung nicht zutrifft – oder man kann zusätzliche `@else`-Blöcke mit weiteren Bedingungen definieren:


```html
<!-- VORHER -->
<ng-container *ngIf="books?.length > 1; else elseBlock">
  <book-list [books]="books" />
</ng-container>

<ng-template #elseBlock>
  <ng-container *ngIf="books?.length === 1; else elseBlock2">
    <book-details [book]="books[0]" />
  </ng-container>
</ng-template>

<ng-template #elseBlock2>
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
Außerdem war es bislang häufig erforderlich, das spezielle Tag `<ng-container>` einzusetzen, um mehrere Elemente zu gruppieren, ohne ein unnötiges DOM-Element zu erzeugen.
Auch dies entfällt mit der neuen Syntax, da die Gruppierung nun über die Klammern geschieht.


### Wiederholungen mit `@for`

Der Schleifenblock `@for` ersetzt `*ngFor` für Iterationen und unterscheidet sich in einigen Punkten von der bislang eingesetzten Direktive:

```html
<!-- VORHER --> 
<ul>
  <li *ngFor="book of books">
    <book-list-item [book]="book" />
  </li>
  <li *ngIf="!books.length">Keine Bücher verfügbar!</li>
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

Es ist nun möglich, einen `@empty`-Block anzugeben, der aktiv wird, wenn es keine Einträge gibt. Dies war zuvor nicht direkt möglich.
Die gezeigte Option `track` ersetzt das Konzept der `trackBy`-Funktion: Sie bestimmt für jede Zeile den Schlüssel, der intern verwendet wird, um Array-Elemente eindeutig zu identifizieren. Bei der Direktive `*ngFor` war es optional, das explizite Tracking zu verwenden. Mit der neuen Syntax ist `track` jedoch eine Pflichtangabe.

Eine weitere Vereinfachung besteht darin, dass die Hilfsvariablen nicht mehr extra deklariert werden müssen – sie sind nun direkt innerhalb des Blocks verfügbar.

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

Falls das iterierte Array nur primitive Werte (z. B. Strings) beinhaltet, wird für das Tracking übrigens der Wert selbst als Identifikator verwendet:

```html
@for (name of nameList; track name) {
  <li>{{ name }}</li>
}
```


Folgende Hilfsvariablen stehen in einem `@for`-Block zur Verfügung:

| Variable   | Bedeutung                                              |
|------------|--------------------------------------------------------|
| `$index`   | Index der aktuellen Zeile                              |
| `$first`   | gibt an, ob die aktuelle Zeile die erste ist           |
| `$last`    | gibt an, ob die aktuelle Zeile die letzte ist          |
| `$even`    | gibt an, ob der Index der aktuellen Zeile gerade ist   |
| `$odd`     | gibt an, ob der Index der aktuellen Zeile ungerade ist |


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



### Was passiert mit den Direktiven?

Die bisherigen Direktiven bleiben zunächst erhalten und können parallel zum Control Flow verwendet werden.
Sie müssen Ihre Anwendungen also nicht sofort migrieren, sondern können auch weiterhin den gewohnten Ablauf mit den Direktiven nutzen.
Ebenso ist ein Mischbetrieb möglich, sodass z. B. neue Features sofort mit dem neuen Control Flow ausgestattet werden können.

Grundsätzlich empfehlen wir Ihnen jedoch, in den nächsten Monaten schrittweise zur neuen Control-Flow-Syntax zu migrieren.
Es ist abzusehen, dass die Direktiven `NgIf`, `NgFor` und `NgSwitch` in einer zukünftigen Major-Version als *deprecated* markiert werden.

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
Wir können damit Teile von HTML-Templates verzögert nachladen.

Dabei ist es egal, ob es sich um reines HTML, eine Komponente, eine Direktive, eine Pipe oder ein komplexeres Template handelt – wenn HTML-Inhalte in einem solchen Block platziert werden, lädt Angular diese Inhalte nur unter bestimmten Bedingungen oder bei bestimmten Ereignissen zur Laufzeit nach.
Das ist besonders nützlich, um die Leistung zu optimieren, insbesondere wenn bestimmte Komponenten nicht sofort benötigt werden oder für die anwendende Person noch gar nicht sichtbar sind.

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

Folgende Hilfsblöcke stehen gemeinsam mit `@defer` zur Verfügung:

* `@placeholder`: Zeigt den angegebenen Inhalt als Platzhalter, bevor der eigentliche Inhalt geladen wurde. Der Platzhalter muss in den meisten Fällen angegeben werden! 
* `@loading`: Zeigt den angegebenen Inhalt an, *während* die Abhängigkeiten geladen werden, also nachdem der Ladevorgang gestartet wurde. Die Inhalte von `@loading` ersetzen den Placeholder!
* `@error`: Zeigt den angegebenen Inhalt an, falls ein Problem beim Laden des Inhalts auftritt.

Statten wir also einen `@defer`-Block mit `@placeholder` und `@loading` aus, so ist zunächst der Placeholder zu sehen.
Sobald das Laden der Inhalte durchgeführt wird, wird der `@loading`-Block angezeigt.
Ist das Laden abgeschlossen, sind die Inhalte sichtbar.

Standardmäßig wird der Inhalt eines `@defer`-Blocks sofort geladen, nachdem die Anwendung fertig gerendert wurde.
Um das Verhalten genauer zu steuern, steht eine Sammlung von Triggern zu Verfügung.
Sie steuern, wann Angular den Inhalt laden und rendern soll.

> **Hinweis:** Die neuen Deferrable Views sind im Status __Developer Preview__. Sie können dieses neue Feature bereits ausprobieren, aber es können sich noch Details ändern, bevor es als stabil gekennzeichnet wird!

### Loading Trigger: `on viewport`

Der Inhalt wird nachgeladen, wenn der Placeholder sichtbar wird, also in den Viewport des Browsers rückt:

```html
@defer (on viewport) {
  <p>Dieser Inhalt wird später geladen!</p>
}
@placeholder {
  <p>Inhalt wurde noch nicht geladen …</p>
}
```

### Loading Trigger: `on timer`

Der Inhalt wird nachgeladen, wenn der angegebene Timer abgelaufen ist:

```html
@defer (on timer(3s)) {
  <p>Dieser Inhalt wird erst nach 3 Sekunden geladen!</p>
}
@placeholder {
  <p>Inhalt wurde noch nicht geladen …</p>
}
```

### Loading Trigger: `when`

Der Inhalt wird nachgeladen, wenn die angegebene Bedingung erfüllt ist:

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

export const appConfig: ApplicationConfig = {
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

Anstatt der Angabe `root` können wir hier auch einen anderen CSS-Selektor angeben, auf den die View Transition angewandt werden soll.
Mit dem Wert `root` erfolgt die Transition auf dem gesamten Dokument.


## Neuerungen bei Server-Side Rendering

Das Angular-Team hat im neuesten Release stark an dem Support für Server-Side-Rendering (SSR) gearbeitet.
Das bisherige Projekt *Angular Universal* wurde dafür direkt in den Core von Angular aufgenommen. Es wird ab sofort unter dem neuen Namen `@angular/ssr` veröffentlicht.

Mithilfe von Server-Side Rendering kann die Angular-Anwendung bereits auf dem Server ausgeführt werden, sodass der Aufbau des DOM-Baums nicht mehr vollständig im Browser passieren muss.
Das kann für eine bessere wahrgenommene Start-Performance sorgen, weil beim ersten Laden der Seite bereits grundlegender Inhalt sichtbar ist, auch bevor Angular die Seite gerendert hat.
Richtig eingesetzt kann SSR bessere Ergebnisse bei den Core Web Vitals ermöglichen.
Außerdem ist SSR ein elementarer Baustein für Suchmaschinenoptimierung.

Angular hat hier bei der sogenannten _Partial Hydration_ nachgebessert:
Nach der ersten Auslieferung der server-gerenderten Anwendung wird im Browser nicht mehr die gesamte Anwendung neu gerendert und ersetzt.
Stattdessen werden nur die relevanten (interaktiven) Teile der Anwendung ermittelt, und nur diese werden mithilfe von JavaScript _hydriert_, also zum dynamischen Leben erweckt.
Dieses Konzept wurde grundlegend bereits mit Angular 16 eingeführt.

Die wichtigste Neuigkeit ist, dass wir beim Anlegen unseres Projekts mit `ng new` sofort den Support für SSR aktivieren können:

```bash
ng new book-monkey --ssr
```

Wollen wir in einem bestehenden Projekt nachträglich SSR aktivieren, können wir den folgenden Befehl nutzen:

```bash
ng add @angular/ssr
```

Dabei wird der neue Application Builder eingesetzt, den wir im nächsten Abschnitt vorstellen.


## Application Builder auf Basis von ESBuild

<!-- Quelle: https://github.com/angular/angular/pull/52407/files -->

Mit Angular 16 wurde ein neues Build-System auf Basis von [ESBuild](https://esbuild.github.io/) als *Developer Preview* vorgestellt. ESBuild kann vor allem mit einer deutlich besseren Performance aufwarten als das alte System. Dank vieler Verbesserungen und positiver Rückmeldungen aus der Community fühlt sich das Angular-Team nun sicher genug, den Builder in Angular 17 als stabil zu erklären.

> ℹ️ **Was ist ein Builder?** Jedes Mal, wenn wir einen Befehl wie `ng build`, `ng serve` oder `ng test` starten, wird im Hintergrund ein *Builder* ausgeführt. Es handelt sich also um das Skript, das den Build-Prozess durchführt. Der verwendete Builder wird in der Datei `angular.json` konfiguriert.


### Für neue Projekte 

Der ESBuild-basierte Build wird nun für alle Applikationen, die mit `ng new` bzw. `npm create` erstellt werden, automatisch aktiv sein. 
Dafür ist in der Datei `angular.json` der Builder mit dem Namen `@angular-devkit/build-angular:application` voreingestellt.
 

### Für bestehende Projekte

Das bestehende Build-System auf Basis von Webpack gilt weiterhin als stabil und wird vollständig unterstützt. Bestehende Projekte können den bisherigen Builder weiterhin nutzen und werden bei einem Update nicht automatisch umgestellt.
Um die Vorteile des neuen Build-Systems zu nutzen, können Sie die Datei `angular.json` wie folgt anpassen:

```json
{
  // VORHER
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser",
    }
  }
}
```

```json
{
  // NACHHER
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser-esbuild",
    }
  }
}
```

Weitergehende Änderungen sind nicht notwendig, um das neue Build-System zu nutzen.
Der neue Builder `browser-esbuild` dient als direkte Alternative ("drop-in replacement") zum bestehenden `browser`-Builder.
Wollen Sie Server-Side Rendering nutzen, ist in dieser Konfiguration weiterhin der bestehende Builder für Angular Universal erforderlich.

### Der neue `application`-Builder

Um die Landschaft der verschiedenen Builder-Skripte zu vereinheitlichen, wurde mit Angular 17 ein neuer Builder `application` eingeführt.
Für neue Projekte ist dieser Builder automatisch voreingestellt, sodass Sie nichts weiter tun müssen.
Auch für bestehende Projekte empfehlen wir, auf den `application`-Builder zu wechseln.

Der neue Builder vereint alle Aufgaben, die zuvor in verschiedenen Buildern untergebracht waren: Server-Side Rendering und Pre-Rendering stehen nun direkt zur Verfügung, ohne dass wir dafür separate Builder installieren müssen.

```json
{
  // VORHER
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser",
      "options: {
        // ...
      }
    }
  }
}
```

```json
{
  // NACHHER
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:application",
      "options: {
        // TODO: Optionen müssen aktualisiert werden
      }
    }
  }
}
```

Da es sich um einen vollständig neuen Builder handelt, müssen Sie einige Optionen in der Datei `angular.json` anpassen.
Nachdem Sie den Namen des Builders auf `application` geändert haben, aktualisieren Sie bitte die folgenden Einträge unter `options`:

1. Die Option `main` sollten Sie in `browser` umbenennen.
2. Bei `polyfills` sollten Sie den Wert in ein Array umwandeln, falls dies nicht bereits geschehen ist.
3. Die Optionen `buildOptimizer`, `resourcesOutputPath`, `vendorChunk`, `commonChunk`, `deployUrl` und `ngswConfigPath` können Sie entfernen. 
4. Den Wert von `ngswConfigPath` sollten Sie allerdings zu `serviceWorker` verschieben und dann die Option entfernen. `serviceWorker` ist jetzt entweder `false` oder ein Konfigurationspfad.

Wenn Ihre Anwendung kein Server-Side-Rendering (SSR) verwendet, sind dies alle Änderungen, die Sie vornehmen müssen, damit `ng build` wie gewohnt funktioniert.
Es ist möglich, dass dennoch Fehler oder Warnungen auftreten, wenn Ihre Anwendung spezifische Webpack-Features nutzt.
Sollte es unerwartete Verhaltensunterschiede zwischen den Buildern geben, bittet das Angular-Team darum, ein [Issue auf GitHub](https://github.com/angular/angular-cli/issues) zu eröffnen.

Für Anwendungen, die bereits SSR (mit und ohne Pre-Rendering) verwenden, sind zusätzliche manuelle Anpassungen erforderlich.
Der neue `application`-Builder übernimmt nun die Funktionalitäten aller bisherigen Builder `prerender`, `server`, `ssr-dev-server` und `app-shell`.
Die jeweiligen Optionen müssen deshalb gemeinsam an den `application`-Builder übergeben werden.

Wir begrüßen sehr, dass diese große Auwahl an Buildern für unterschiedliche Zwecke endlich vereinheitlicht wird.
Bitte konsultieren Sie den [SSR Guide](https://angular.dev/guide/ssr) bzw. [Prerendering Guide](https://angular.dev/guide/prerendering) in der offiziellen Dokumentation für eine ausführliche Beschreibung der notwendigen Schritte.


## Sonstiges

Neben den großen Features hat Angular eine Menge von kleineren Neuerungen und Bugfixes an Bord.
Einige interessante Punkte haben wir hier aufgeführt:

- Die `styleUrls` in den Metadaten einer Komponente mussten seit jeher als Array notiert werden. Da häufig nur eine einzige Style-URL angegeben wird, können wir dort nun auch einen einfachen String angeben: `styleUrls: './my.component.scss'`.
- Inline Styles einer Komponente (`styles`) mussten bisher als Array angegeben werden. Hier kann jetzt auch ein einzelner String notiert werden.
- Die Option `--routing` ist beim Erzeugen eines neuen Workspace mit `ng new` bzw. `npm create` nun standardmäßig aktiviert.
- Die Option `--standalone` ist beim Erzeugen eines neuen Workspace mit `ng new` bzw. `npm create` nun standardmäßig aktiviert – es werden also keine Angular-Module (`@NgModule()`) mehr erzeugt. 
- Animationen mit `@angular/animations` können lazy geladen werden, sodass die Implementierung nicht mehr sofort zusammen mit der Hauptanwendung geladen werden muss, siehe [Commit](https://github.com/angular/angular/commit/e753278faae79a53e235e0d8e03f89555a712d80). Mehr Infos gibt es im [Blogpost von Matthieu Riegler](https://riegler.fr/blog/2023-10-04-animations-async) aus dem Angular-Team.

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 17!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Raukenlandschaft, Fårö/Gotland, Schweden. Foto von Ferdinand Malcher</small>
