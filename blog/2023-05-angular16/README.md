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
Im englischsprachigen [Angular-Blog](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d) finden Sie außerdem die offizielle Mitteilung des Angular-Teams.
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

Bitte beachten Sie, dass die Implementierung noch nicht vollständig ist und mit Angular 16 nur die ersten Aspekte des Konzepts veröffentlicht wurden.
Die Schnittstellen und Ideen werden sich in den nächsten Monaten formen und entwickeln.
Wir empfehlen Ihnen, die RFC-Dokumente ausführlich zu lesen, und sich so in das Thema aktiv einzuarbeiten.




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
