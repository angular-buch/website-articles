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
Die Website die jetzt die einzige offizielle Dokumentationswebsite für Angular ist und bietet eine intuitive, praxisorientierte Einstieg sowie viele hervorragende Artikel. Die alte Website [angular.io](https://angular.io/) wird nicht mehr weiterentwickelt und leitet jetzt auf die neue Domain um.

![Screenshot von angular.dev](angular_dev.gif)



## Zoneless Change Detection (experimentell)

Seit dem Beginn von Angular ist die Bibliothek [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) für das Auslösen der Änderungsüberprüfung (Change Detection) in Angular verantwortlich.
Zone.js hat den Umgang mit Angular massiv geprägt:
Änderungen an den angezeigten Daten werden scheinbar wie durch Magie erkannt.
Aber leider hat diese Magie auch Reihe von technischen Nachteilen mit sich gebracht.
Vor allem die Performance und die Handhabung beim Debugging werden so schon lange kritisiert, wie es die Integration von zone.js gibt.

Das Angular Team hat nun mehrere Jahre daran gearbeitet, eine Möglichkeit zu finden, Angular ohne zone.js zu verwenden. Endlich ist es soweit und wir können mit dieser neuen API experimentieren, indem folgendes Statement zur Datei `main.ts` hinzugefügt:

```ts
bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
});
```

Anschließend kann `zone.js` aus dem Polyfills-Eintrag in der Datei `angular.json` entfernt werden.

Das Angular-Team verspricht folgende Vorteile durch die Zoneless Change Detection:

* Verbesserte Kombinierbarkeit für Micro-Frontends und Interoperabilität mit anderen Frameworks
* Schnellere Initialisierung und Laufzeit der Angular-App
* Kleinere Bundle-Größe und schnellere Seitenladezeiten
* Lesbarere Stack-Traces
* Einfacheres Debugging

Allerdings bekommen wir all diese Vorteile nicht einfach umsonst.
Der "alte Angular-Stil", bei dem direkt Properties an den Komponenten abändert kann, ist mit dem zonenlosen Ansatz nicht direkt kompatibel.
Im Kern geht es darum, auf die neuen _Signals_ umzusteigen, die seit [Angular 16](https://angular-buch.com/blog/2023-05-angular16#reaktivit%C3%A4t-mit-signals) verfügbar sind. 
Wir haben über diesen modernen Ansatz in unserem letzten Blogpost berichtet:
[Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm)

Diese simple Komponente...
```ts
// Alter Stil
@Component({
  // ...
  template: `
    <h1>Hallo von {{ name }}!</h1>
    <button (click)="handleClick()">Mit zone.js</button>
  `,
})
export class App {
  name = 'Angular';

  handleClick() {
    this.name = 'Klassisches Angular';
  }
}
```

... würden wir jetzt mit Signals folgendermaßen umsetzen:

```ts
// Neuer Stil mit Signals
@Component({
  // ...
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

Im obigen Beispiel wird beim Klicken auf den Button das _Signal_ mit der Bezeichnung `name` aktualisiert und anschließend die Oberfläche aktualisiert.
Dies funktioniert genauso zuverlässig wie bei einer Anwendung mit zone.js, jedoch begrenzt Angular die internen Überprüfungen auf ganz wenige Auslöser - wie den Aktualisierungen der Signals.
Die Performance ist hierbei deutlich höher.

### Auf "zoneless" updaten

Angular entwickelt sich stetig weiter, und "zoneless" ist ein zentraler Bestandteil davon.
Während das Framework weiterentwickelt wird, stellt das Angular Team selbstverständlich sicher, dass der klassische Stil weiterhin wie erwartet funktioniert.
Der zukünftige Fokus des Angular-Teams ist allerdings eindeutig.
Aber es ist an der Zeit, bei der Entwicklung auf Signals zu setzen!
Wir empfehlen, neue Angular-Anwendungen definitiv mit den Signals umzusetzen.
Der klassische Stil wird weiterhin unterstützt werden, aber hier wird es keine neuen Innovationen mehr geben.

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
Sollten Sie eine Bibliothek von einem anderen Hersteller bzw. von einem anderen Open-Source Projekt verwenden, so prüfen Sie am besten, ob die Bibliothek bereits "zoneless Angular" unterstützt.
Ist dem nicht so, werden sich nach einer Umstellung diverse Stellen in der Anwendung nicht mehr korrekt aktualisieren.



# Neue Signal-APIs

In den letzten Monaten wurden mit Angular 17.1, 17.2 und 17.3 bereits eine Reihe von spannenden APIs rund um die Signals als **Developer Preview** veröffentlicht. Wir haben diese in unserem Blogpost [Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm) bereits vorgestellt. Da Angular 18 die erste größere Version ist, die die APIs enthält, stellen wir die neuen Funktionen der Vollständigkeit halber noch einmal vor.
Auch in Angular 18 sind diese APIs allesamt im Status  **Developer Preview** - sie könnten sich also noch bei der Verwendung oder im Verhalten ändern. 


## Inputs als Signal

Mit dem Minor-Release von Angular 17.1 wurden [Signal inputs](https://angular.dev/guide/signals/inputs) eingeführt.
Sie stellen eine Alternative zum bisherigen `@Input()`-Dekorator dar.
Das Angular-Team misst diesen neuen Signals eine große Bedeutung bei, und hat diese in einem dedizierten [Blogpost](https://blog.angular.io/signal-inputs-available-in-developer-preview-6a7ff1941823) vorgestellt.
Nutzen wir die neue Funktion `input()`, wird der übergebene Wert eines Komponenten-Inputs direkt als Signal erfasst:

```ts
anzahl = input();                  // InputSignal<unknown>
anzahl = input<number>();          // InputSignal<number | undefined>
anzahl = input.required();         // InputSignal<unknown>
anzahl = input.required<number>(); // InputSignal<number>
anzahl = input(5);                 // InputSignal<number>
```

Hier ein Beispiel, bei dem eine Kind-Komponente über ein Input aktualisiert wird.
Zunächst der klassische Stil, bei dem wir den `@Input()` Dekorator einsetzen:


```ts
import { Input } from '@angular/core';

// Alter Stil mit Dekorator
@Component({
  // ...
  selector: 'app-katzen',
  template: `
    @if (anzahl) {
      <img src="{{ imageUrl() }}">
    }
  `
})
export class KatzenComponent {
  @Input() anzahl?: number;

  imageUrl() {
    return `https://api.angular.schule/avatar/${this.anzahl}`;
  }
}
```

Um vollständig in der Signals-Welt zu bleiben, können stattdessen jetzt folgende Syntax verwenden:


```ts
import { input } from '@angular/core';

// Neuer Stil mit Signals
@Component({
  // ...
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
Dank des Inputs können wir nun mit folgender Syntax einen Wert an die Kind-Komponente übergeben.
Am Einsatz von Property-Bindings ändert sich nichts, daher funktioniert die Verwendung in beiden Beispielen gleich:

```html
<app-katzen [anzahl]="5" />
```

Je nach übergebener Zahl sieht man nun ein anderes Bild – mit der entsprechenden Anzahl an Katzen.


## Queries als Signal

Es kann Situationen geben, in denen wir aus einer übergeordneten Komponente auf eine Kind-Komponente/Kind-Direktive oder ein DOM-Element zugreifen möchten, bzw. auf den Inhalt von `<ng-content></ng-content>` zugreifen wollen.
Seit jeher stehen uns hierfür die Dekoratoren [`@ViewChild()`](https://v17.angular.io/api/core/ViewChild), [`@ViewChildren()`](https://v17.angular.io/api/core/ViewChildren), [`@ContentChild()`](https://v17.angular.io/api/core/ContentChild) sowie [`@ContentChildren()`](https://v17.angular.io/api/core/ContentChildren) zu Verfügung, um die entsprechenden Referenzen zu erhalten:

```ts
import { ViewChild, ViewChildren, ElementRef } from '@angular/core';

// Alter Stil mit Dekoratoren
@Component({
  // ...
  template: `
    <div #el></div>
    <div #el></div>

    <app-child />
    <app-child />
  `
})
export class AppComponent {

  // liefert ein Kind
  @ViewChild('el') element!: ElementRef;
  @ViewChild(ChildComponent) child!: ChildComponent;

  // liefert alle Kinder
  @ViewChildren('el') elements!: QueryList<ElementRef>;
  @ViewChildren(ChildComponent) children!: QueryList<ChildComponent>;
}
```

Die äquivalenten [Signal queries](https://angular.dev/guide/signals/queries) `viewChild()`, `viewChildren()`, `contentChild()` und `contentChildren()` wurden mit Angular 17.2 hinzugefügt und geben uns moderne Signals zurück.

```ts
import { viewChild, viewChildren, ElementRef } from '@angular/core';

// Neuer Stil mit Signals
@Component({
  // ...
  template: `
    <div #el></div>
    <div #el></div>

    <app-child />
    <app-child />
  `
})
export class AppComponent {

   // liefert ein Kind (oder `undefined`, falls keines gefunden wurde)
  element = viewChild<ElementRef>('el'); // Signal<ElementRef | undefined>
  child   = viewChild(ChildComponent);   // Signal<ChildComponent|undefined>

   // liefert ein Kind (oder einen Runtime error, falls keines gefunden wurde)
  elementRequired = viewChild.required<ElementRef>('el'); // Signal<ElementRef>
  childRequired   = viewChild.required(ChildComponent);   // Signal<MyComponent>

  // liefert alle Kinder (oder eine leere Liste)
  elements = viewChild<ElementRef>('el'); // Signal<ReadonlyArray<ElementRef>>
  childs   = viewChild(ChildComponent);   // Signal<ReadonlyArray<ChildComponent>>
}
```

Neu hinzugekommen ist die Möglichkeit, das Vorhandensein eines einzelnen Kindes per [`viewChild.required`](https://angular.dev/guide/signals/queries#required-child-queries) typsicher zu erzwingen.
Sollte das Element doch nicht im Template vorhanden sein – weil es z. B. per `@if` versteckt wurde, so wirft Angular einen Laufzeitfehler ("Runtime error: result marked as required by not available!").

## Model inputs

Die weiter oben vorgestellen Signal Inputs sind schreibgeschützt.
Dies stellt sicher, das wir nicht versehentlich das Signal im Code setzen – was kein schöner Stil wäre.

Um einen gemeinsamen Zustand zwischen einer Eltern- und einer Kindkomponente elegant zu teilen,
wären aber ggf. beschreibbare Signale sehr, und genau diese Lücke füllen die [Model inputs](https://angular.dev/guide/signals/model).
Mit diesen können wir dann Two-Way-Bindings realisieren:


```ts
// Alter Stil mit Dekoratoren
@Component({
  selector: 'app-pager',
  template: `
    Aktuelle Seite: {{ page }}
    <button (click)="goToNextPage()">Nächste Seite</button>
  `
})
export class PagerComponent {

  @Input({ required: true }) page!: number;
  @Output() pageChange = new EventEmitter<number>();

  goToNextPage() {
    this.page = this.page + 1;
    this.pageChange.emit(this.page);
  }
}
```

Und hier der neue Stil, bei dem wir ein beschreibbares Signal verwenden.
Der Code wird deutlich kürzer und übersichtlicher:

```ts
// Neuer Stil mit Signal
@Component({
  selector: 'app-pager',
  template: `
    Aktuelle Seite: {{ page() }}
    <button (click)="goToNextPage()">Nächste Seite</button>
  `
})
export class PagerComponent {
  page = model.required<number>();

  goToNextPage() {
    this.page.set(this.page() + 1);
  }
}
```

In beiden Fällen kann unsere Komponente nun mit einem Two-Way-Binding verwendet werden.
Der Wert für das Two-Way-Binding kann wie gehabt [ein Property mit einem Wert](https://angular.dev/guide/signals/model#two-way-binding-with-plain-properties) sein:

```ts
@Component({
  // ...
  template: '<app-pager [(page)]="currentPage" />',
})
export class ParentComponent {
  protected currentPage = 1;
}
```

Allerdings wollen wir ja idealerweise in der gesamten Applikation auf Signals setzen.
Daher ist ebenso möglich, [Signals mit einem Two-Way-Binding](https://angular.dev/guide/signals/model#two-way-binding-with-signals) zu kombinieren:

```ts
@Component({
  // ...
  template: '<app-pager [(page)]="currentPage" />',
})
export class ParentComponent {
  protected currentPage = signal(1);
}
```

## Outputs als Funktion

Analog zur Funktion `input()` steht seit Angular 17.3 eine Alternative zum `@Output()`-Dekorator bereit: die Funktion `output()`.
Dabei wurde auch die Typsicherheit verbessert: 
Wenn wir den Output typisieren, z. B. `output<string>()`, dann ist übergebene Payload bei `emit()` verpflichtend.
Beim bisherigen Weg mit `EventEmitter.emit` war der Payload hingegen immer optional.
(Lediglich die Methode `EventEmitter.next` hat einer strikten Typprüfung genügt.)
Wollen wir keinen Payload übergeben, müssen wir den Output nicht typisieren, und es wird automatisch der Typ `void` für den Payload angenommen.

```ts
select = output(); // OutputEmitterRef<void>
textChange = output<string>(); // OutputEmitterRef<string>

// ...
this.select.emit(); // OK
this.textChange.emit(); // Error: Expected 1 arguments, but got 0.
this.textChange.emit('Text'); // OK
```

Gerne zeigen wir auch hier ein vollständiges Beispiel.
Zunächst erneut der klassische Stil.

```ts
import { Output, EventEmitter } from '@angular/core';

// Alter Stil mit Dekorator
@Component({
  // ...
  selector: 'app-katzen',
  template: `
    <button (click)="wasMachenDieKatzen()">Klick mich</button>
  `
})
export class KatzenComponent {
  @Output() katzenGeraeusch = new EventEmitter<string>();

  wasMachenDieKatzen() {
    katzenGeraeusch.emit('Miau! 😸');

    // aber auch folgende Zeile kompiliert
    katzenGeraeusch.emit(undefined);
  }
}
```


```ts
import { output } from '@angular/core';

// Neuer Stil mit Signal
@Component({
  // ...
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

Auf das Ereignis können wir wie bisher per Event-Binding reagieren:

```html
<app-katzen (katzenGeraeusch)="handleEvent($event)" />
```

Bitte beachten Sie noch einmal, dass die API aktuell noch im Status **Developer Preview** ist.
Wir erwarten aber bei dieser bereits sehr ausgereiften API allerdings keine fundamentalen Änderungen mehr. 

### Outputs von Observables

Zusätzlich zur neuen `output()`-Funktion bietet Angular die [`outputFromObservable`](https://angular.dev/guide/signals/rxjs-interop#outputfromobservable)-Funktion, welche einen nahtlos Übergang vom RxJS-Framework bereitstellt. Die neue Methode wurde vom Angular Team in einem [separaten Blogpost vorgestellt](https://blog.angular.dev/meet-angulars-new-output-api-253a41ffa13c). 

Wenn die Datenquelle eine Observable ist, kann man den Übergang zur neuen Output-API wie folgt durchführen:

```ts
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Component({…})
export class MyComp {
  onNameChange$ = new Observable<string>( … );
  onNameChange = outputFromObservable(this.onNameChange$);
}
```

Der umgekehrte Weg ist ebenso per [`outputToObservable`](https://angular.dev/guide/signals/rxjs-interop#outputtoobservable) möglich.
Benötigt man etwa die Ereignisse einer Kind-Komponente als Obervable, so kann man auf ein Output wie folgt wieder zu einem RxJS-Datenstrom umwandeln.

```ts
import { outputToObservable } from '@angular/core/rxjs-interop';

outputToObservable(this.myComp.instance.onNameChange)
  .pipe(…)
  .subscribe(…);
```

Der Befehl `outputToObservable` funktioniert übrigen nicht nur mit den neue Output-API, sondern auch dem alten Output-Dekorator.

<hr>


Wir wünschen Ihnen viel Spaß mit Angular 18!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Blumenwiese bei Västerås, Schweden. Foto von Ferdinand Malcher</small>
