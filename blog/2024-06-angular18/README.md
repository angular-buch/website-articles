---
title: 'Angular 18 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2024-05-29
lastModified: 2024-05-29
keywords:
  - Angular
  - Angular 18
  - Zoneless
  - Zoneless Change Detection
language: de
thumbnail: angular18.jpg
sticky: false
---

Und schon wieder ist ein halbes Jahr vergangen:
Angular Version 18 ist jetzt verfügbar!

In den letzten Versionen wurden viele neue Funktionen und Verbesserungen eingeführt.
Diesmal lag der Fokus darauf, die bereits ausgelieferten APIs zu stabilisieren, diverse Feature Requests zu bearbeiten und eines der am meisten nachgefragten Projekte auf der Roadmap experimentell zu veröffentlichen: die **Zoneless Change Detection**.

Im offiziellen [Angular-Blog](https://blog.angular.dev/angular-v18-is-now-available-e79d5ac0affe) finden Sie alle offiziellen Informationen direkt vom Angular-Team.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md#1800-2024-05-22) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md#1800-2024-05-22).

Wenn Sie sich einen kurzweiligen Gesamtüberblick verschaffen wollen, so lohnt es sich, das hervorragende Video aus dem Release-Event anzuschauen:
[What’s new in Angular v18](https://www.youtube.com/watch?v=DK8M-ZFjaMw) 

Und für eine Zusammenfassung in deutscher Sprache lesen Sie jetzt einfach weiter. 🙂



## Neue Offizielle Website 

Das Angular Team hat mit Angular 17 die neue Website [angular.dev](https://angular.dev/) veröffentlich und damit die "Angular Renaissance" aufgerufen.
Die Website die jetzt die einzige offizielle Dokumentationswebsite für Angular ist und bietet eine intuitive, praxisorientierte Einstieg sowie viele hervorragende Artikel. Die alte Website [angular.io](https://angular.io/) wird nicht mehr weiter entwickelt und leitet jetzt auf die neue Domain um.

**TODO Screenshot**



## Zoneless Change Detection (experimentell)

Seit dem Beginn von Angular ist die Bibliothek [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) für das Auslösen der Änderungsüberprüfung (Change Detection) in Angular verantwortlich.
Zone.js hat den Umgang mit Angular massiv geprägt:
Änderungen an den anzuzeigenden Daten werden scheinbar wie durch Magie erkannt.
Aber leider hat diese Magie auch Reihe von technischen einige Nachteile mit sich gebracht.
Vor allem die Performance und die Handhabung beim Debugging werden so schon lange kritisiert, wie es die Integration von zone.js gibt.

Das Angular Team hat nun mehrere Jahre daran gearbeitet, eine Möglichkeit zu finden, Angular ohne zone.js zu verwenden. Endlich ist es soweit und wir können mit dieser neuen API experimentieren, indem folgendes Statement zur Datei `main.ts` hinzu gefügt:

```ts
bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
});
```

Anschließend kann `zone.js` aus dem Polyfills-Eintrag in der Datei `angular.json` entfernt werden.

Das Angular-Team verspricht folgende Vorteile durch die Zoneless Change Detection:

* Verbesserte Komponierbarkeit für Micro-Frontends und Interoperabilität mit anderen Frameworks
* Schnellere Initialisierung und Laufzeit der Angular-App
* Kleinere Bundle-Größe und schnellere Seitenladezeiten
* Lesbarere Stack-Traces
* Einfacheres Debugging

Allerdings bekommen wir all diese Vorteile nicht einfach umsonst.
Der "alte Angular-Stil", bei dem direkt Properties an den Komponenten abändert kann, ist mit dem zonenlosen Ansatz nicht direkt kompatibel.
Im Kern geht es darum, auf die neuen _Signals_ umzusteigen, die seit [Angular 16](https://angular-buch.com/blog/2023-05-angular16#reaktivit%C3%A4t-mit-signals) verfügbar sind. 
Wir haben über diesen modernen Ansatz in unserem letzten Blogpost bereichtet:
[Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm)

Diese simple Komponente...
```ts
// Alter Stil
@Component({
  ...
  template: `
    <h1>Hallo von {{ name }}!</h1>
    <button (click)="handleClick()">Mit zone.js</button>
  `,
})
export class App {
  name = 'Angular';

  handleClick() {
    this.name = 'Klassiches Angular';
  }
}
```

... würden wir jetzt mit Signals folgendermaßen abbilden:

```ts
// Neuer Stil mit Signals
@Component({
  ...
  template: `
    <h1>Hallo von {{ name() }}!</h1>
    <button (click)="handleClick()">Ohne zone.js</button>
  `,
})
export class App {
  name = signal('Angular');

  handleClick() {
    this.name.set('Zoneless Angular');
  }
}
```

Im obigen Beispiel wird beim Klicken auf den Button das _Signal_ mit der Bezeichnung `name` aktualisiert und anchliepend die Oberfläche aktualisiert.
Dies funktioniert genauso zuverlässig wie bei einer Anwendung mit zone.js, jedoch begrenzt Angular die internen Überprüfungen auf ganz wenige Auslöser - wie den Aktualisierungen der Signals.
Die Performance ist hierbei deutlich höher.

### Auf "zoneless" updaten

Angular entwickelt sich stetig weiter, und "zoneless" ist ein zentraler Bestandteil davon.
Während das Framework weiterentwickelt wird, stellt das Angular Team selbverständlich sicher, dass der klassische Stil weiterhin wie erwartet funktioniert.
Der zukünftige Fokus des Angular-Teams ist allerdings eindeutig.
Aber es ist an der Zeit, bei der Entwicklung auf Signals zu setzen!
Wir empfehlen, neue Angular-Anwendungen definitiv mit den Signals umzusetzen.
Der klassische Stil wird weiterhin unterstützt werden, aber hier wird es keine neuen Innovationen mehr geben.
<!-- TODO: oder irgendeinen anderen überzeugenden Grund nennen. Wer will denn schon freiwillig alles updaten??? -->

### Natives `async/await` für zonenlose Apps:

Zone.js fängt viele APIs im Browseraufrufe ab, um die bisherige Change Detection von Angular zu realisieren.
Leider gehört `async/await` zu den APIs, die zone.js nicht patchen kann. 
Als Workaround wird bisher von der Angular CLI jede Verwendung der beiden Schlüsselwörter auf Promises heruntergestuft – denn Promises kann zone.js patchen. 
Das ist suboptimal, da alle modernen Browser `async/await` unterstützen und optimieren können.

Wird die die experimentelle zonenlose Change Detction genutzt, wird das native `async/await` verwendet. 
Dies verbessert das Debugging und verkleinert die Bundles.

### Zonenlose Unterstützung in bestehenden Komponenten

[Angular Material](https://material.angular.io/) 3 ist jetzt stabil.
Das Angular Team hat mit der neuen Version auch gleich die zonenlose Unterstützung aktiviert. Ebenso kann man nun auch das [Angular CDK](https://material.angular.io/cdk/) vollständig ohne zone.js verwenden.

Wenn Sie also auf die Komponentensammlung Angular Material setzen, können Sie prinzipiell direkt auf eine zonenlose App umsteigen.
Sollten Sie einen Bibliothek von einem anderen Hersteller bzw. von einem anderen Open-Source Projekt verwenden, so prüfen Sie am besten Vorab ob die Bibliothek bereits "zoneless Angular" unterstützt.
Ist dem nicht so, werden sich nach einer Umstellung diverse Stellen in der Anwendung nicht mehr korrekt aktualisieren.



# Neue Signal-APIs

In den letzten Monaten wurden mit Angular 17.1, 17.2 und 17.3 bereits eine Reihe von spannenden APIs rund um die Signals als **Developer Preview** veröffentlicht. Wir haben diese in unserem Blogpost [Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm) bereits vorgestellt. Da Angular 18 die erste größere Version ist, die die APIs enthält, stellen wir die neuen Funktionen der Vollständigkeit halber noch einmal vor.


## Inputs als Signal

Mit dem Minor-Release von Angular 17.1 wurde eine Alternative zum bisherigen `@Input()`-Dekorator auf Basis von Signals eingeführt, siehe die [offizielle Information im Angular-Blog](https://blog.angular.io/signal-inputs-available-in-developer-preview-6a7ff1941823).
Nutzen wir die neue Funktion `input()`, wird der übergebene Wert eines Komponenten-Inputs direkt als Signal erfasst:

```ts
anzahl = input() // InputSignal<unknown>
anzahl = input<number>() // InputSignal<number | undefined>
anzahl = input.required() // InputSignal<unknown>
anzahl = input.required<number>() // InputSignal<number>
anzahl = input(5) // InputSignal<number>
```

Hier ein Beispiel, bei dem eine Kind-Komponente über ein Input aktulisiert wird:

```ts
import {input} from '@angular/core';

@Component({
  ...
  selector: 'app-katzen',
  template: `
    @if (anzahl()) {
      <img src="{{ imageUrl() }}">
    }
  `
})
export class KatzenComponent {
  anzahl = input<number>();
  imageUrl = computed(() => `https://api.angular.schule/avatar/${this.anzahl()}`);
}
```


Um das Beispiel vollständiger zu gestalten, sieht man hier auch gleich die Kombination mit einem Computed-Signal. 
Mit Hilfe der neuen Inputs können wir nun mit folgender Syntax einen Wer an die Kind-Komponente übergeben:

```html
<app-katzen [anzahl]="5" />
```

Je nach übergebener Zahl sieht man nun ein anderes Bild – mit der entsprechenden Anzahl an Katzen.


## Queries als Signal

Es kann Situationen geben, in denen wir aus einer übergeordneten Komponenten auf eine Kind-Komponente oder ein DOM-Element zugreifen möchten.
Seit jeher stehen uns hierfür eine Reihe von Dekoratoren zu Verfügung, um die entsprechenden Referenzen zu erhalten:

```ts
import { ViewChild, ElementRef} from '@angular/core';


export class AppComponent {

  @ViewChild(ChildComponent)
  testComponent: ChildComponent;

  // TODO

}
```

Die Funktionen `viewChild()`, `viewChildren()`, `contentChild()` und `contentChildren()` wurden in @angular/core hinzugefügt und geben uns moderne Signals zurück.

TODO

## Model inputs

TODO

```
@Component({
  selector: 'custom-checkbox',
  template: `
    <div class="cool-checkbox-treatment">
      <input type="checkbox" (click)="toggle()" [value]="checked()">
    </div>
  `
})
export class CustomCheckbox {
  protected checked = model(false);

  toggle() {
    this.checked.set(!this.checked());
  }
}
```

## Outputs als Funktion

Analog zur Funktion `input()` steht seit der Minor-Version Angular 17.3.0 eine Alternative zum `@Output()`-Dekorator bereit: die Funktion `output()`.
Dabei wurde auch die Typsicherheit verbessert: Wenn wir den Output typisieren, z. B. `output<string>()`, dann ist übergebene Payload bei `emit()` verpflichtend.
Beim bisherigen Weg mit `EventEmitter.emit` war der Payload hingegen immer optional.
(Lediglich die Methode `EventEmitter.next` hat einer strikte Typprüfung genügt.)
Wollen wir keinen Payload übergeben, müssen wir den Output nicht typisieren, und es wird automatisch der Typ `void` für den Payload angenommen.

```ts
select = output() // OutputEmitterRef<void>
textChange = output<string>() // OutputEmitterRef<string>

// ...
this.select.emit(); // OK
this.textChange.emit(); // Error: Expected 1 arguments, but got 0.
this.textChange.emit('Text'); // OK
```

Hier ein vollständiges Beispiel:

```ts
import {output} from '@angular/core';

@Component({
  ...
  selector: 'app-katzen',
  template: `
    <button (click)="wasMachenDieKatzen()">Klick mich</button>
  `
})
export class KatzenComponent {
  katzenGeraeusch = output<string>();

  wasMachenDieKatzen() {
    katzenGeraeusch.emit('Miau! 😸')
  }
}
```

Auf das Ereignis können wir nun wie bisher per Event-Binding reagieren:

```html
<app-katzen (katzenGeraeusch)="handleEvent($event)" />
```

Bitte beachten Sie, das die API aktuell noch im Status "Developer Preview" ist.
Wir erwarten aber bei dieser bereits sehr ausgereiften API allerdings keine fundamentalen Änderungen mehr. 

### Outputs von Observables

Zusätzlich zur neuen `output()`-Funktion bietet Angular die `outputFromObservable`-Funktion, welche einen nahtlos Übergang vom RxJS-Framework bereitstellt. Die neue Methode wurde vom Angular Team in einem [separaten Blogpost vorgestellt](https://blog.angular.dev/meet-angulars-new-output-api-253a41ffa13c). 

Wenn die Datenquelle eine Observable ist, kann man den Übergang zur neuen Output-API wie folgt durchführen:

```ts
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Component({…})
export class MyComp {
  onNameChange$ = new Observable<string>( … );
  onNameChange = outputFromObservable(this.onNameChange$);
}
```

Der umgekehrte Weg ist ebenso per `outputToObservable` möglich.
Benötigt man etwa die Ereignisse einer Kind-Komponente als Obervable, so kann man auf ein Output wie folgt wieder zu einem RxJS-Datenstrom umwandeln.

```ts
import {outputToObservable} from '@angular/core/rxjs-interop';

outputToObservable(this.myComp.instance.onNameChange)
  .pipe(…)
  .subscribe(…);
```

Dieser Befehl funktioniert sowohl mit den neue Output-API, als auch dem alten Output-Dekorator.

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 18!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Blumenwiese bei Västerås, Schweden. Foto von Ferdinand Malcher</small>
