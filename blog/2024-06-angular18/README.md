---
title: 'Angular 18 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2024-06-13
lastModified: 2024-06-13
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

Das Angular Team hat mit Angular 17 die neue Website [angular.dev](https://angular.dev/) veröffentlicht und damit die "Angular Renaissance" aufgerufen.
Die Website ist die neue offizielle Dokumentationsseite für Angular und bietet einen intuitiven, praxisorientierten Einstieg sowie viele hervorragende Artikel. Die alte Website [angular.io](https://angular.io/) wird nicht mehr weiterentwickelt und leitet jetzt auf die neue Domain um.

![Screenshot von angular.dev](angular_dev.gif)



## Zoneless Change Detection (experimentell)

Seit dem Beginn von Angular ist die Bibliothek [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) für das Auslösen der Änderungsüberprüfung (Change Detection) in Angular verantwortlich.
Zone.js hat den Umgang mit Angular massiv geprägt:
Änderungen an den angezeigten Daten werden scheinbar wie durch Magie erkannt.
Aber leider hat diese Magie auch eine Reihe von technischen Nachteilen mit sich gebracht.
Vor allem die Performance und die Handhabung beim Debugging werden schon seit der Integration von zone.js kritisiert.

Angular v18 führt eine neue Methode zur Auslösung der Änderungsüberprüfung ein. 
Anstatt sich auf ausschließlich auf zone.js zu verlassen, 
um zu erkennen, wann sich etwas möglicherweise geändert hat, 
kann Angular jetzt selbst eine Änderungsüberprüfung planen.

### Die Standardeinstellung: beide Scheduler sind aktiv

Dazu wurde dem Framework ein neuer Scheduler hinzugefügt (genannt `ChangeDetectionScheduler`), 
und dieser Scheduler wird intern verwendet, um die Änderungsüberprüfung auszulösen. 
Langfristiges Ziel ist es, sich schrittweise von zone.js zu entfernen und ausschließlich den neuen Scheduler einzusetzen.

Dieser neue Scheduler ist in v18 standardmäßig aktiviert, auch wenn Sie zone.js verwenden.
So sieht die Datei `app.config.ts` aus, wenn mit der Angular CLI v18 eine neue Anwendung generiert wird.
Beide Scheduler sind hier aktiv:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // beide Scheduler sind aktiv
    provideZoneChangeDetection({ eventCoalescing: true }),
};
```

Die Option `eventCoalescing` ist ebenso neu hinzugekommen.
Diese verhindert, das in bestimmten Fällen mehrfach unnötig eine Change Detection durchgeführt wird.
Das genaue Verhalten ist [hier](https://angular.dev/api/core/NgZoneOptions#eventCoalescing) beschrieben. 

### Abmeldung vom neuen Scheduler

Der neue Scheduler ist somit in v18 standardmäßig aktiviert. 
Das bedeutet, dass Angular potenzielle Änderungen sowohl von zone.js (wie bisher) als auch vom neuen Scheduler (wenn ein Signal gesetzt wird, eine async-Pipe einen neuen Wert erhält usw.) benachrichtigt wird. 
Diese Änderung sollte Ihre Anwendung nicht negativ beeinflussen, 
da Angular die Change Detection nur einmal durchführt, 
auch wenn es von mehreren Quellen eine Benachrichtigung gibt.

Wenn Sie sich dennoch vom neuen Scheduler abmelden möchten, 
können Sie hierzu bei der Option`provideZoneChangeDetection()` den Wert von `ignoreChangesOutsideZone` auf `true` setzen:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // dies stellt das Verhalten von Angular vor v18 wieder her
    // und ignoriert die Benachrichtigungen des neuen Schedulers
    provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
};
```
Die Option `eventCoalescing` haben wir hier nicht erneut aufgeführt, da diese Einstellung unabhängig von `ignoreChangesOutsideZone` ist.

### Experimentelle zonenlose Änderungsüberprüfung

Sie können auch versuchen, sich nur auf den neuen Scheduler zu verlassen und nicht mehr auf zone.js, um die Änderungsüberprüfung auszulösen.
Dies ist eine experimentelle Funktion, die Sie aktivieren können, indem Sie die Provider-Funktion provideExperimentalZonelessChangeDetection() in Ihrer Anwendung verwenden:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ausschließlich der neue Scheduler ist aktiv
    provideExperimentalZonelessChangeDetection()
};
```

Wenn Sie dies tun, wird sich Angular nicht mehr auf zone.js verlassen, 
um die Änderungsüberprüfung auszulösen. 
Sie können nun  `zone.js` aus Ihrer Anwendung entfernen um die Größe des Bundles zu verringern – sofern keine Abhängigkeiten davon abhängen.
Hierzu muss der Polyfills-Eintrag in der Datei `angular.json` entfernt werden:

```json
// vorher
"polyfills": [
  "zone.js"
],

// nachher
"polyfills": [],
```

Die Anwendung sollte weiterhin funktionieren,
wenn alle Ihre Komponenten bereits mit der `OnPush`-Strategie kompatibel sind und/oder überall Signals eingesetzt werden! 

### Vorteile durch die zonenlose Änderungsüberprüfung

Das Angular-Team verspricht folgende Vorteile durch die Zoneless Change Detection:

* Verbesserte Kombinierbarkeit für Micro-Frontends und Interoperabilität mit anderen Frameworks
* Schnellere Initialisierung und Laufzeit der Angular-App
* Kleinere Bundle-Größe und schnellere Seitenladezeiten
* Lesbarere Stack-Traces
* Einfacheres Debugging

Allerdings bekommen wir all diese Vorteile nicht einfach umsonst.
Der "alte Angular-Stil" mit der Default Change Detection, bei dem prinzipiell alle Objekte direkt verändert (mutiert) werden können, ist mit dem zonenlosen Ansatz nicht direkt kompatibel.
Im Kern geht es darum, nach Möglichkeit auf die neuen Signals umzusteigen, die seit [Angular 16](https://angular-buch.com/blog/2023-05-angular16#reaktivit%C3%A4t-mit-signals) verfügbar sind. 
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

### Natives `async/await` für zonenlose Apps

Zone.js fängt viele APIs im Browser ab, um die bisherige Change Detection von Angular zu realisieren.
Leider gehört `async/await` zu den APIs, die zone.js nicht patchen kann. 
Als Workaround wird bisher von der Angular CLI jede Verwendung der beiden Schlüsselwörter auf Promises heruntergestuft – denn Promises kann zone.js patchen. 
Das ist suboptimal, da alle modernen Browser `async/await` unterstützen und optimieren können.

Wenn zone.js nicht in den Polyfills der Anwendung enthalten ist, dann findet die Entfernung von `async/await` nicht mehr statt.
Dies verbessert das Debugging und verkleinert die Bundles.


### Zonenlose Unterstützung in bestehenden Komponenten

[Angular Material](https://material.angular.io/) 3 ist jetzt stabil.
Das Angular Team hat mit der neuen Version auch gleich die zonenlose Unterstützung aktiviert. Ebenso kann man nun auch das [Angular CDK](https://material.angular.io/cdk/) vollständig ohne zone.js verwenden.

Wenn Sie also auf die Komponentensammlung Angular Material setzen, können Sie prinzipiell direkt auf eine zonenlose App umsteigen.
Sollten Sie eine Bibliothek von einem anderen Hersteller bzw. von einem anderen Open-Source Projekt verwenden, so prüfen Sie am besten, ob die Bibliothek bereits "zoneless Angular" unterstützt.
Ist dem nicht so, werden sich nach einer Umstellung diverse Stellen in der Anwendung nicht mehr korrekt aktualisieren.



## Neue Signal-APIs

In den letzten Monaten wurden mit Angular 17.1, 17.2 und 17.3 bereits eine Reihe von spannenden APIs rund um die Signals als **Developer Preview** veröffentlicht. Wir haben diese in unserem Blogpost [Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm) bereits vorgestellt. Da Angular 18 die erste größere Version ist, die die APIs enthält, stellen wir diese hier gerne noch einmal im Detail vor.
Auch in Angular 18 sind diese APIs allesamt im Status  **Developer Preview** - sie könnten sich also noch bei der Verwendung oder im Verhalten ändern. 


### Inputs als Signal

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

Um vollständig in der Signals-Welt zu bleiben, können stattdessen jetzt folgende Syntax verwenden.
Eine massive Erleichterung stellt `input.reqired` dar.
Beim alten Stil musste man immer auch `undefined` als möglichen Wert berücksichtigen.
Dies ist nun nicht mehr notwendig, da `input.reqired` entweder einen gesetzten Wert hat oder eine Ausnahme wirft, wenn es keinen Wert gibt.
Die bisherige leidige Prüfung auf `undefined` entfällt damit endlich.
Allein hierfür lohnt sich bereits der Umstieg auf Signals:


```ts
import { input } from '@angular/core';

// Neuer Stil mit Signals
@Component({
  // ...
  selector: 'app-katzen',
  template: `
    <img src="{{ imageUrl() }}">
  `
})
export class KatzenComponent {
  anzahl = input.reqired<number>();
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


### Queries als Signal

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

### Model inputs

Die weiter oben vorgestellten Signal Inputs sind schreibgeschützt.
Dies stellt sicher, das wir nicht versehentlich das Signal im Code setzen – was kein schöner Stil wäre.

Um einen gemeinsamen Zustand zwischen einer Eltern- und einer Kindkomponente elegant zu teilen,
sind aber beschreibbare Signals sehr praktisch.
Genau diese Lücke füllen die [Model inputs](https://angular.dev/guide/signals/model).
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
  currentPage = 1;
}
```

Allerdings wollen wir ja idealerweise in der gesamten Applikation auf Signals setzen.
Daher ist es ebenso möglich, [schreibbare Signals mit einem Two-Way-Binding](https://angular.dev/guide/signals/model#two-way-binding-with-signals) zu kombinieren:

```ts
@Component({
  // ...
  template: '<app-pager [(page)]="currentPage" />',
})
export class ParentComponent {
  currentPage = signal(1);
}
```

### Outputs als Funktion

Analog zur Funktion `input()` steht seit Angular 17.3 eine Alternative zum `@Output()`-Dekorator bereit: die Funktion `output()`.
Dabei wurde auch die Typsicherheit verbessert: 
Wenn wir den Output typisieren, z. B. `output<string>()`, dann ist übergebene Payload bei `emit()` verpflichtend.
Beim bisherigen Weg mit `EventEmitter.emit` war der Payload hingegen immer optional.
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

Der Umstieg auf Signals geht hier schnell voran - wir müssen nur eine Zeile austauschen und den Import aktualisieren:

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

Bitte beachten Sie noch einmal, dass alle drei neuen Signal-APIs aktuell noch im Status **Developer Preview** sind.
Wir erwarten aber bei dieser bereits sehr ausgereiften API allerdings keine fundamentalen Änderungen mehr. 

### Outputs von Observables

Zusätzlich zur neuen `output()`-Funktion bietet Angular die [`outputFromObservable`](https://angular.dev/guide/signals/rxjs-interop#outputfromobservable)-Funktion, welche einen nahtlosen Übergang vom RxJS-Framework bereitstellt.
Die neue Methode wurde vom Angular Team in einem [separaten Blogpost vorgestellt](https://blog.angular.dev/meet-angulars-new-output-api-253a41ffa13c). 

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
Benötigt man etwa die Ereignisse einer Kind-Komponente als Observable, so kann man auf ein Output wie folgt wieder zu einem RxJS-Datenstrom umwandeln.

```ts
import { outputToObservable } from '@angular/core/rxjs-interop';

outputToObservable(this.myComp.instance.onNameChange)
  .pipe(…)
  .subscribe(…);
```

Der Befehl `outputToObservable` funktioniert übrigens nicht nur mit den neue Output-API, sondern auch dem alten Output-Dekorator.


## Stabile APIs

Mit dem aktuellen Realease sind viele Developer Previews als stabil markiert worden:

* Das Framework [Angular Material](https://material.angular.io/) 3 ist jetzt stabil.
* Die [Deferrable views](https://angular-buch.com/blog/2023-11-angular17#deferrable-views-mit-defer) (`@defer`) sind jetzt stabil
* Der [Built-in control flow](https://angular-buch.com/blog/2023-11-angular17#neuer-control-flow-if-for-switch) (`@if`, `@for` und `@switch`) ist ebenso als stabil markiert worden

## Automatische Migration auf den neuen `application`-Builder

Im Blogpost zu Angular 17 haben wir bereits den neuen [Application Builder auf Basis von ESBuild](https://angular-buch.com/blog/2023-11-angular17) vorgestellt.
Zu dem Zeitpunkt musste mussten man die Umstellung noch manuell durchführen.
Dies ist nun nicht mehr notwendig, da folgender Befehl die Anwendung automatisch umstellt:

```sh
ng update @angular/cli --name use-application-builder
```


## Neuer `public` Ordner statt `assets`

Wenn Sie eine neue Anwendung mit `ng new` generieren, werden Sie bemerken, dass der Ordner `assets` nicht mehr vorhanden ist.
Dieser wurde zugunsten des neuen `public`-Ordners ersetzt.

Vor Angular 18 wurde standardmäßig ein leerer der Assets-Ordner bereitgestellt.
Die `favicon.ico` befand sich an einem anderen Ort:
* `name-der-app/src/assets`
* `name-der-app/src/favicon.ico`

Es wird also der gesamte Ordner `assets` berücksichtigt sowie die einzelne Datei `favicon.ico`.
Die bisherige Konfiguration in der `angular.json` sieht so aus:

```json
{
  "projects": {
    "name-der-app": {
      "architect": {
        "build": {
          "assets": [
            "src/favicon.ico",
            "src/assets"
          ]
        }
      }
    }
  }
}
```

Speichern wir bei dieser Konfiguration ein Bild in den `assets`-Ordner, so lässt sich das Bild so einbinden:

```html
<img src="/assets/bild.png">
```

Mit Angular 18 finden wir nur noch folgende Datei:
* `name-der-app/public/favicon.ico`

Die neue Konfiguration in der `angular.json` sieht hierbei so aus:

```json
{
  "projects": {
    "name-der-app": {
      "architect": {
        "build": {
          "assets": [
            {
              "glob": "**/*",
              "input": "public"
            }
          ]
        }
      }
    }
  }
}
```

Legen wir bei dieser Konfiguration ein Bild in den `public`-Ordner ab, so lässt sich das Bild so einbinden:

```html
<img src="/bild.png">
```

Wollen wir weiterhin das Bild per `<img src="/assets/bild.png">` einbinden, so muss die vollständige Ordnerstruktur so aussehen:

* `name-der-app/public/assets/bild.png`


Für bestehende Anwendungen ändert sich nichts, die geänderte Ordnerstruktur wird nur bei neuen Apps erzeugt.

## Fazit

Mit Angular 18 steht uns eine solide neue Version zur Verfügung, 
die sich auf die Stabilisierung zuvor eingeführter APIs, 
zahlreiche Detailverbesserungen und Bugfixes sowie eine Reihe äußerst hilfreicher APIs für den Umgang mit Signals konzentriert.

Das Angular Team hat wieder einmal gezeigt, 
wie kontinuierliche Innovation und die Berücksichtigung des Feedbacks aus der Community zu einem leistungsstarken und nutzungsfreundlichen Framework führen.

Wir freuen uns darauf, diese neuen Features in unseren Projekten zu nutzen. 
Ob Sie auf die verbesserte Zoneless Change Detection, 
die stabilen APIs für Material 3, 
die Deferrable Views oder den neuen Built-in Control Flow zugreifen – Angular 18 bietet zahlreiche Werkzeuge, 
um moderne und elegante Anwendungen zu erstellen.


<hr>


Wir wünschen Ihnen viel Spaß mit Angular 18!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Blumenwiese bei Västerås, Schweden. Foto von Ferdinand Malcher</small>
