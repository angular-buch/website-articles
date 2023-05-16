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

### Standalone Components

Bereits mit dem [letzten Major-Release von Angular 15](/blog/2022-11-angular15) sind die Standalone Components stabiler Bestandteil des Angular Frameworks.
Das Angular-Team hat hier mit Angular 16 weitere Features geliefert, die den Umstieg und Einstieg in die Standalone API vereinfachen.

### Schematics zur Migration

Um auch bestehenden Projekten den Umstieg auf die Standalone Components zu ermöglichen und die Migration zu erleichtern,
hat das Angular Team zu diesem Zweck ein Schematic bereitgestellt, welches die notwendigen Anpassungen am Quellcode vornimmt.
Es markiert die entsprechenden Komponenten als `standalone`, entfernt unnötige `NgModule`'s und stellt das Bootstrapping auf die Standalone API um.

```bash
ng generate @angular/core:standalone
```

### Neue Projekte im Standalone-Flavor

Weiterhin lassen sich neue Angular-Projekte direkt so erzeugen, dass sie die Standalone-APIs nutzen.
Hierfür muss lediglich das `--standalone` flag gesetzt werden:

```bash
ng new <project> --standalone
```

## ESBuild und Vite

Ein weiteres neues Feature, welches zunächst als _Developer Preview_ ausgeliefert wird, ist der Support von [ESBuild](https://esbuild.github.io/) als Bundler.
ESBuild ist im Vergleich zu Webpack um ein vielfaches schneller, da es direkt vom Browser verarbeitet wird.
Zur Auslieferung während der Entwicklung wird hier unter der Haube [Vite](https://vitejs.dev/) genutzt.

Um den neuen Build auszuprobieren, muss dieser lediglich in der Datei `angular.json` aktiviert werden:

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

Eine bekannte Einschränkung ist zur Zeit noch der Support für Internationalisierung, dieser wird vom Angular Builder für ESBuild bisher noch nicht unterstützt.

## Jest Test Runner

Weiterhin hat das Angular-Team an die Integration des Jest Test-Runners gearbeitet.
Bisher ist das Feature noch experimentell.
Somit wird Jest künftig Out-of-the-Box unterstützt.

Um Jest nutzen zu können, müssen wir lediglich die dependency mit `npm i -D jest` installieren und im Anschluss den Build für das Test-Target in der Datei `angular.json` konfigurieren:

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

## Required Inputs


## Developer Experience Verbesserungen

### Auto-Vervollständigungen für Imports (VSCode)

Die neueste Version des Angular Language Service für Visual Studio Code ermöglicht es uns ebenfalls automatisch die notwendigen `imports` für Angular-Komponenten automatisch zu importieren, sobald wir diese im Komponenten-Template verwenden.

### Self-Closing-Tags


<!-- ## Neue Auflage des Angular-Buchs

Wir haben in den letzten Monaten intensiv an einer Neuauflage des deutschsprachigen Angular-Buchs gearbeitet! Das neue Buch erscheint im Februar 2023 in allen Buchhandlungen und Onlineshops.

Wir haben das Buch neu strukturiert und alle Beispiele neu entwickelt.
Die neuen Features von Angular 15 werden ebenfalls ausführlich behandelt.
[Bestellen Sie das neue Angular-Buch](/kaufen) am besten direkt!

<div style="text-align: center">
<img src="https://angular-buch.com/assets/img/book-cover-multiple-v4.png" alt="Buchcover 4. Auflage" style="width:500px">
</div> -->


<hr>


Wir wünschen Ihnen viel Spaß mit Angular 16!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<!-- <small>**Titelbild:** XXX. Foto von Ferdinand Malcher</small> -->
