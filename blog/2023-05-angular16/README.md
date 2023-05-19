---
title: 'Angular 16 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2023-05-05
lastModified: 2023-05-05
keywords:
  - Angular
  - Angular 16
  - Update
language: de
thumbnail: angular16.jpg
sticky: true
---

Am 4. Mai 2023 erschien die neue Major-Version von Angular: **Angular 16**!
Im Fokus des neuen Releases standen vor allem diese Themen:

-
-
-

In diesem Blogpost fassen wir wieder die wichtigsten Neuigkeiten zusammen.
Im englischsprachigen [Angular-Blog](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d) finden Sie außerdem die offiziellen Informationen des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md).


## Projekt updaten

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=15.0-16.0).
Der Befehl `ng update` liefert außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 16 aktualisieren
ng update @angular/core@16 @angular/cli@16
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.


## Reaktivität mit Signals

Die Change Detection von Angular ist dafür verantwortlich, die angezeigten Daten in der View stets aktuell zu halten.
Dieser Prozess ist aufwendig: Angular erfasst mithilfe der Bibliothek Zone.js alle Ereignisse, die im Browser stattfinden, z. B. DOM-Events, HTTP-Responses, Timer, usw.
Bei jedem dieser Ereignisse werden alle Bindings in allen Komponenten neu evaluiert.
Angular kann nicht ermitteln, *welche* Daten sich geändert haben, sondern nur, *dass* etwas passiert ist.
Die aktuelle Implementierung der Change Detection funktioniert gut, arbeitet aber nicht gezielt.

Ab Angular 16 sind die sogenannten *Signals* als Developer Preview verfügbar!
Ein Signal ist eine "reactive Primitive", also ein neuer Grundbaustein für Angular-Apps.
Es ist ein Objekt, das einen Wert besitzt.
Im Gegensatz zu einer Variable informiert das Signal alle Interessierten darüber, dass sich der Wert geändert hat.
Auf diese Weise wird es möglich sein, eine gezielte Change Detection an den Stellen durchzuführen, an denen sich *tatsächlich* Daten geändert haben.

Signals sind keine vollständig neue Erfindung von Angular, sondern sind in ähnlicher Form auch in anderen Frameworks wie Vue.js oder Solid.js zu finden.
Das Design der neuen Signals in Angular wird durch [eine Reihe komplexer RFCs](https://github.com/angular/angular/discussions/49685) begleitet.

Um ein Signal zu erstellen, verwenden wir die Funktion `signal()`.
Es muss immer ein Startwert übergeben werden:

```ts
@Component({ /* ... */ })
export class MyComponent {
  myCounter = signal(0);
}
```

Um den Wert im Template zu lesen, muss das Signal wie eine Funktion aufgerufen werden.
Es gbt dann synchron den Wert zur Anzeige zurück:

```html
<div>Counter: {{ myCounter() }}</div>
```

Um den Wert zu aktualisieren, bietet das Signal-Objekt die Methoden `set()` und `update()` an.
Mit `set()` kann der Wert direkt überschrieben werden.
`update()` führt eine Aktualisierung auf Basis des aktuellen Werts durch.

```ts
this.myCounter.set(1); // 1
this.myCounter.update(c => c + 1); // 2
```

Eine Besonderheit dieses neuen Ansatzes sind sogenannte *Computed Properties*:
Damit können wir einen Zustand auf der Basis anderer Signals berechnen.
Ändern sich die Eingabewerte, wird die Berechnung automatisch erneut angestoßen.
Im folgenden Beispiel wird der Wet für `seconds` also nur neu berechnet, wenn das Signal `milliSeconds` seinen Wert ändert.


```ts
export class MyComponent {
  milliSeconds = signal(Date.now());
  seconds = computed(() => this.milliSeconds / 1000);

  updateTime() {
    this.milliSeconds.set(Date.now());
  }
}
```

Neben diesen Grundbausteinen soll es später auch möglich sein, Input-Propertys und die Kommunikation mit der Direktive `ngModel` mit Signals abzubilden.
Außerdem bieten Signals sogenannte *Effects* an, mit denen wir auf die Aktualisierung der Werte reagieren können, um Seiteneffekte auszuführen.

Signals sind außerdem kompatibel mit den bereits etablierten Observables.
Ganz bewusst hat das Angular-Team sich dagegen entschieden, das Framework RxJS fest in den Framework-Kern einzubauen.
Signals und Observables können allerdings ineinander umgewandelt werden.
mithilfe von `toSignal()` werden also die emittierten Werte eines Observables in ein Signal verpackt. Mit `toObservable()` können wir die Wertänderungen eines Signals als Observable-Datenstrom ausgeben.

```ts
books = toSignal(inject(BookStoreService).getAllBooks());

myCounter = signal(0);
myCounter$ = toObservable(this.myCounter);

// ...
this.myCounter$.subscribe( /* ... */ );
```


Bitte beachten Sie, dass die Implementierung von Signals noch nicht vollständig ist und mit Angular 16 nur die ersten Aspekte des Konzepts veröffentlicht wurden.
Die Schnittstellen und Ideen werden sich in den nächsten Monaten formen und entwickeln.
Wir empfehlen Ihnen, die RFC-Dokumente ausführlich zu lesen, und sich so in das Thema aktiv einzuarbeiten.


## Non-Destructive Hydration

Angular bietet mit dem Paket *Angular Universal* die Möglichkeit, die Anwendung auf dem Server zu rendern.
Dabei erzeugt ein Serverprozess das HTML der angefragten Seite und liefert es an den Browser aus.
Die Seite wird also schon sichtbar, ohne dass Angular im Browser gestartet werden muss.

Damit die Anwendung interaktiv wird, muss Angular die bereits angezeigte Seite anschließend "übernehmen".
Bisher funktioniert dieser Prozess destruktiv, das bedeutet:
Das HTML vom Server wird gerendert, danach erzeugt Angular im Client alle Elemente erneut!
Dieser Ablauf führt zu einem Flackern (die Seite wird schließlich zweimal geladen) und ist vergleichsweise unperformant.

Mit Angular 16 gibt es ein neues Konzept zur *Non-Desteructive Hydration*. Anstatt die Anwendung vollständig neu zu rendern, übernimmt Angular die bereits sichtbaren DOM-Elemente und fügt nur noch die nötige Interaktivität hinzu, z. B. Event Listener oder Bindings.
Die servergerenderte Seite bleibt also bestehen und wird nach dem Start nur noch erweitert, ohne komplett neu erzeugt zu werden.

Um die Hydration zu aktivieren, muss die passende Funktion in den Providers der Anwendung registriert werden:

```ts
// main.ts
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [provideClientHydration()]
});
```

## Standalone Components

Bereits mit dem [letzten Major-Release von Angular 15](/blog/2022-11-angular15) sind die Standalone Components ein stabiler Bestandteil von Angular.
Seit Angular 16 können neue Projekte vollständig standalone generiert werden.
Das Projekt besitzt dann kein `AppModule`, sondern in der Datei `main.ts` wird direkt die Root-Komponente `AppComponent` gebootstrappt.

```bash
ng new <project> --standalone
```

Wir empfehlen Ihnen, neue Anwendungen und neue Features bestehender Anwendungen mit Standalone Components zu entwickeln.



### Schematics zur Migration

Für eine vereinfachte Migration von modulbasierten Anwendungen zu Standalone Components bietet Angular ein Migrationsskript an.

```bash
ng generate @angular/core:standalone
```

Das Skript migriert die Komponenten im Projekt automatisch, indem alle notwendigen Abhängigkeiten aus dem Template importiert werden.
Außerdem ist es möglich, unnötige Module automatisch zu entfernen und die gesamte Anwendung mithilfe der Standalone-APIs zu bootstrappen.


### Auto-Vervollständigungen für Imports (VSCode)

Verwenden wir Standalone Components, müssen wir alle Komponenten, Pipes und Direktiven einzeln importieren, die wir im Template verwenden möchten.
Die neueste Version des *Angular Language Service* für Visual Studio Code unterstützt uns dabei: Sie importiert auf Wunsch automatisch die notwendigen Klassen, sobald wir sie im Komponenten-Template verwenden.



## Required Inputs

Inputs von Komponenten und Direktiven waren seit jeher optional:
Setzt man eine Komponente im Template ein, war es niemals verpflichtend, Daten mittels Property Bindings zu übergeben.

```html
<app-book></app-book>
<app-book [book]="myBook"></app-book>
```

Das führte dazu, dass wir die benötigten Daten stets in der Komponente zur Laufzeit überprüfen mussten.
Es war niemals sicher, dass tatsächlich Daten übergeben wurden.
Die Vereinbarung, welche Daten vorhanden sein müssen, konnte nur durch Konventionen, Dokumentation oder aufwendige Prüfungen getroffen werden.
Eine solche Laufzeitprüfung kann beispielsweise so aussehen:

```ts
@Component({ /* ... */ })
export class BookComponent {
  @Input() book?: Book;
  
  constructor() {
    if (!this.book) {
      console.error('Book Input is required!')
    }
  }
}
```


Mit Angular 16 wurde ein lang ersehntes Feature in Angular umgesetzt: Required Inputs.
Damit können wir angeben, dass ein Input beim Start der Komponente verpflichtend von außen durch ein Propertya Binding gesetzt werden muss.

```ts
@Input({ required: true }) book?: Book;
```

Verwenden wir die Komponente nun, ohne das Property Binding zu benutzen, wird ein Compile-Fehler geworfen.
Damit vermeiden wir unnötigen Code für Laufzeitprüfungen, und wir erhalten schnelles Feedback während der Entwicklung.

```html
<!-- Required input 'book' from component BookComponent must be specified -->
<app-book></app-book>
```

Bitte beachten Sie, dass die Inputs weiterhin im Lifecycle der Komponente aufgelöst werden.
Das bedeutet, dass die übergebenen Daten im Konstruktor noch nicht zur Verfügung stehen!
Die Initialisierung der Inputs erfolgt erst nach dem Konstruktor.
Wollen wir auf die Initialisierung und Änderung der Input-Propertys reagieren, hilft der Lifecycle-Hook `ngOnChanges()`.

```ts
@Component({ /* ... */ })
export class BookComponent implements OnChanges {
  @Input({ required: true }) book?: Book;

  constructor() {
    // ⚠️ Ergebnis: undefined
    console.log(this.book);
  }

  ngOnChanges() {
    // wird ausgeführt, wenn Input von initialisiert oder geändert wird
  }
}
```

Für die Behandlung von Klassen-Propertys gelten die gleichen Regeln wie bisher:
Standardmäßig sollte jedes Property direkt mit einem Startwert initialisiert werden.

```ts
@Input({ required: true }) isActive = false;
```

Ist das nicht möglich oder sind die Daten tatsächlich optional, sollte das Property optional gesetzt werden. Damit wird auch `undefined` ein gültiger Wert für das Property.

```ts
@Input({ required: true }) book?: Book; // Book | undefined
```

Die Non-Null Assertion (`!`) sollten wir im Regelfall nicht verwenden!
Das Problem: Der Compiler nimmt an, dass *immer* ein Wert vom Typ `Book` vorhanden sei. Da die Inputs aber erst nach dem Konstruktor initialisiert werden, entsteht hier eine potenzielle Fehlerquelle. Versuchen wir, die Daten im Konstruktor zu lesen, fällt der Fehler erst zur Laufzeit auf.

```ts
@Input() book!: Book; // Achtung: nicht verwenden!
```

## Routen-Paramater als Component Inputs

TODO



## Operator `takeUntilDestroyed`

Bei der Arbeit mit Observables müssen wir stets darauf achten, die aufgebauten Subscriptions auch wieder sauber zu entfernen.
Tun wir das nicht, können Memory Leaks entstehen.

In der Regel verwenden wir in Angular die `AsyncPipe` direkt im Template: Sie kümmert sich automatisch um Aufräumarbeiten, sobald die Komponente zerstört wird.

Erstellen wir die Susbcription hingegen direkt in der TypeScript-Klasse, müssen wir das Subscription Handling selbst implementieren.
Dafür hat sich das folgende Pattern etabliert:
Wir nutzen den Operator `takeUntil()`, um den Datenstrom zu beenden, wenn der übergebene *Notifier* uns dies signalisiert.
Als Notifier erstellen wir ein Subject, das wir beim Beenden der Komponente (`ngOnDestroy()`) einmalig auslösen:

```ts
@Component({ /* ... */ })
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {
    myObservable$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(/* ... */);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
```

Der Aufwand ist hier vergleichsweise hoch.
Angular bietet deshalb seit Angular 16 einen eigenen Operator `takeUntilDestroyed` an.
Er beendet den gegebenen Datenstrom automatisch, sobald die Komponente zerstört wird.
Das Beispiel kann also elegant verkürzt werden:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ /* ... */ })
export class MyComponent {

  constructor() {
    myObservable$.pipe(
      takeUntilDestroyed()
    ).subscribe(/* ... */);
  }
}
```

Bitte beachten Sie, dass der Operator nur in einem *Injection Context* funktioniert, also bei der Property-Initialisierung oder im Konstruktor.
Es ist nicht möglich, den Operator in einer anderen Methode der Komponente zu nutzen.



## ESBuild und Vite

Unter der Haube des Build-Prozesses von Angular wird seit vielen Jahren das Tool Webpack verwendet, um die kompilierte Anwendung zu bündeln.
Die Landschaft der Bundling-Tools ist jedoch gewachsen, und so erforscht auch das Angular-Team, wie der Build mit alternativen Werkzeugen beschleunigt werden kann.

Mit Angular 16 wurde ein experimenteller Builder für [ESBuild](https://esbuild.github.io/) bereitgestellt.
Zur Auslieferung während der Entwicklung wird hier unter der Haube [Vite](https://vitejs.dev/) genutzt.
ESBuild ist im Vergleich zu Webpack um ein Vielfaches schneller.

Um den neuen Build auszuprobieren, können wir den neuen Builder in der Datei `angular.json` aktivieren:

```json
{
  // ...
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser-esbuild",
    }
  }
}
```

Bitte beachten Sie, dass das Feature derzeit als *Developer Preview* veröffentlicht wird.
Die Entwicklung ist also noch nicht ausgereift, und es werden nicht alle Features von Angular vollständig unterstützt.
Beispielsweise wird das Tooling zur Internationalisierung bisher noch nicht unterstützt.

## Jest Test Runner

Für Unit-Testing setzen neue Angular-Projekte standardmäßig auf den Test-Runner *Karma*.
Eine sinnvolle Alternative ist das Framework *Jest*.
Mit Angular 16 wird Jest erstmals nativ und out-of-the-box unterstützt.

Dazu müssen wir Jest zunächst im Projekt installieren:

```
npm i -D jest
```

Anschließend konfigurieren wir in der Datei `angular.json` das Test-Target, sodass der neue offizielle Builder für jest verwendet wird:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular-devkit/build-angular:jest",
          "options": {
            "tsConfig": "tsconfig.spec.json",
            "polyfills": ["zone.js", "zone.js/testing"]
          }
        }
      }
    }
  }
}
```







<hr>


Wir wünschen Ihnen viel Spaß mit Angular 16!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<!-- <small>**Titelbild:** XXX. Foto von Ferdinand Malcher</small> -->
