---
title: 'Direktiven in Angular'
published: 2026-04-20
lastModified: 2026-04-20
---

In diesem Artikel geht es um *Direktiven* in Angular.
Mit Direktiven können wir das Verhalten von DOM-Elementen steuern und erweitern.
Wir betrachten die Unterschiede zwischen Attribut- und Strukturdirektiven, lernen, wie wir eigene Direktiven entwickeln können, und schauen uns die Komposition mit Host-Direktiven an.

## Inhalt

[[toc]]

## Was sind Direktiven?

Direktiven ordnen einem DOM-Element eine zusätzliche Logik zu.
Zur Verdrahtung besitzt jede Direktive einen Selektor, mit dem sie an konkrete DOM-Elemente gebunden werden kann, z. B. durch ein Attribut eines Elements oder einen spezifischen Elementnamen.
Beinhaltet ein Template ein Element, das zu diesem Selektor passt, wird die Direktive darauf angewendet und steuert das Verhalten des Elements.
Ein solches Element, auf dem eine Direktive aktiv ist, nennt sich *Host-Element*.
Wir erweitern also mit Direktiven das Vokabular von HTML, indem wir eigene Namen einführen, die mit einer bestimmten Logik behaftet sind.

Dieses Prinzip kennen wir bereits von den Komponenten:
Sie besitzen einen Selektor, mit dem ausgewählt wird, in welchen DOM-Elementen eine Instanz der Komponente erzeugt wird.
Vom Prinzip her ist eine Komponente also auch eine Direktive mit einem *eigenen* Template.
Eine reine Direktive, wie wir sie in diesem Artikel behandeln, nutzt hingegen immer ein anderes existierendes Element.

Wir unterscheiden grundsätzlich zwei Arten von Direktiven:

- **Attributdirektiven**
- **Strukturdirektiven**

**Attributdirektiven** werden eingesetzt, um die „inneren" Eigenschaften eines DOM-Elements zu verändern, also z. B. das Aussehen oder das Verhalten.
Man nennt sie Attributdirektiven, weil sie in der Regel über ein HTML-Attribut getriggert werden und sich nur auf das Element selbst auswirken.
Ein bekanntes Beispiel ist die Direktive `NgOptimizedImage`, die wir im Buchkapitel *Bildoptimierung mit NgOptimizedImage* ausführlich behandeln.
Sie wird über das Attribut `ngSrc` auf einem `<img>`-Element aktiviert und optimiert automatisch den Ladevorgang von Bildern:

```html
<img ngSrc="/assets/cover.jpg" width="200" height="300">
```

**Strukturdirektiven** hingegen verändern die Struktur des DOM-Baums, indem sie Elemente hinzufügen oder entfernen.
Das eigene Verhalten des Elements ändert sich nicht, sondern es wird gesteuert, ob, wann, wo und wie oft ein Element überhaupt eingesetzt wird.
Wir können sie zum Beispiel zur Realisierung von Feature-Toggles, Berechtigungen oder verzögertes Rendering einsetzen.

## Eigene Direktiven entwickeln

Unabhängig davon, ob wir eine Attribut- oder Strukturdirektive bauen: Der Grundaufbau ist in beiden Fällen gleich.
Der Unterschied besteht nur in ihrer Implementierung: Steuert die Direktive das Verhalten des Host-Elements oder manipuliert sie den DOM-Baum?

Das Grundgerüst für eine Direktive können wir mithilfe der Angular CLI generieren:

```bash
ng g directive foo
```

Eine Direktive besteht aus einer TypeScript-Klasse, die mit dem Decorator `@Directive()` versehen wird.
Dort wird auch der Selektor der Direktive notiert.
Das funktioniert genauso wie bei Komponenten: Der Selektor wählt aus, an welches Element die Direktive gebunden werden soll.
Im Unterschied zu Komponenten wählen wir bei Direktiven allerdings das Host-Element meist anhand eines Attributs aus, nicht nach dem Elementnamen.
Wenn wir an ein Attribut binden wollen, müssen wir den Attributnamen immer in eckigen Klammern notieren, denn das ist der Weg, Attributnamen mit CSS-Selektoren zu matchen.

```typescript
import { Directive } from '@angular/core';

@Directive({
  selector: '[foo]'
})
export class FooDirective {}
```

Versehen wir ein DOM-Element mit dem Attribut, das zum festgelegten Selektor passt, wird die Direktive für das Element aktiv.
Dabei ist es egal, in welcher Notation wir die Direktive im Template verwenden.
Wenn der Selektor also z. B. auf `[foo]` festgelegt ist, haben wir mehrere Möglichkeiten, um die Direktive zu nutzen:

```html
<!-- Attributdirektive in Attribut-Schreibweise -->
<div foo>Angular</div>

<!-- Attributdirektive in Property-Schreibweise
mit passendem Input-Property -->
<div [foo]="bar()">Lorem ipsum</div>
```

### Werte an Direktiven übergeben

Wenn wir Daten an eine Direktive übergeben möchten, können wir das Attribut der Direktive direkt verwenden, um einen Wert oder Ausdruck zu übergeben:

```html
<div [foo]="expression()">Lorem ipsum</div>
<div foo="string value">Angular</div>
```

Wie bei Property Bindings beziehen sich die übergebenen Ausdrücke immer auf die zugehörige Komponentenklasse.
Stehen auf der linken Seite eckige Klammern, so wird rechts ein Ausdruck notiert.
Wollen wir einen String als Wert übergeben, müssen wir das Attribut ohne Klammern angeben, oder wir notieren das Literal als Ausdruck: `[foo]="'string value'"`.

Innerhalb der Direktive können wir den übergebenen Wert mit einem Input auslesen, wie wir es schon von den Komponenten kennen.
Das Input hört dabei auf den Namen der Direktive, denn so lautet ja auch der Name des Attributs, dessen Wert wir lesen wollen.
Technisch verwenden wir hier also ein Property Binding.

```typescript
import { Directive, input } from '@angular/core';

@Directive({ selector: '[foo]' })
export class FooDirective {
  readonly foo = input<string>();
}
```

Tatsächlich können wir auf diese Weise auch weitere Attribute und Propertys auf dem Host-Element auslesen, auch wenn sie nichts mit der Direktive zu tun haben.
Damit ist es möglich, weitere Daten in die Direktive hineinzugeben oder den Wert anderer Inputs oder nativer Propertys auszulesen:

```html
<div [foo]="expression()" anotherProp="loremipsum"></div>
```

```typescript
readonly foo = input<string>();
readonly anotherProp = input<string>();
```

## Attributdirektiven: Verhalten von Elementen ändern

Die wichtigste Eigenschaft einer Attributdirektive ist, dass sie ihr eigenes Host-Element verändert, auf dem sie eingesetzt wurde.
Dieses Element existiert also bereits, und wir müssen von der Direktive aus darauf zugreifen.
Dafür gibt es drei mögliche Wege:

- über *Host Bindings* und *Host Listener*
- mit Direktzugriff auf das Element mit der Klasse `ElementRef`
- mittels Dependency Injection

### Host Binding: Eigenschaften schreiben

Mit Host Bindings können wir Propertys auf dem Host-Element einer Direktive verändern.
Um ein Property zu schreiben, notieren wir normalerweise ein Property Binding von *außen* im Template auf einem Element.
Ein Host Binding hingegen wird von *innen* aus einer Komponente oder Direktive heraus verwendet.
Das Binding bezieht sich also auf das Host-Element der aktuellen Komponente oder Direktive.

Neben einem reinen Property Binding gibt es zwei Sonderformen: Style Bindings und Class Bindings.

| Binding | Art | Verwendung |
|---|---|---|
| `[foobar]` | Property Binding | Property des DOM-Elements mit einem Template-Ausdruck schreiben |
| `[style.color]` | Style Binding | CSS-Eigenschaft setzen |
| `[class.my-class]` | Class Binding | CSS-Klasse setzen |
| `[attr.colspan]` | Attribute Binding | Wert eines nativen Attributs schreiben |

#### Host Binding mit `host`-Metadaten

Der empfohlene Weg, um Host Bindings zu setzen, sind die `host`-Metadaten im Decorator von Direktiven und Komponenten.
In der Eigenschaft `host` können wir Propertys definieren, die auf dem Host-Element gesetzt werden sollen.

Der Vorteil an dieser Schreibweise ist, dass statische Werte sehr bequem notiert werden können.
Im folgenden Beispiel werden auf dem Host-Element der Direktive zwei Attribute mit statischen Werten gesetzt:

```typescript
@Directive({
  selector: '[foo]',
  host: {
    'role': 'menu',
    'title': 'My Title'
  }
})
export class FooDirective {}
```

Wenn wir diese Direktive auf z. B. einem `<div>` einsetzen, erhalten wir das folgende Ergebnis:

```html
<div foo role="menu" title="My Title"></div>
```

Wir können auf diesem Weg auch dynamische Werte an das Host-Element binden und so ein echtes Host Binding aufsetzen.
Dazu notieren wir den Schlüssel in eckigen Klammern, so wie wir es bei einem Property Binding auch tun würden.
Der rechts zugewiesene Wert wird dann nicht als Zeichenkette interpretiert, sondern als Referenz auf ein Property der Klasse:

```typescript
@Directive({
  selector: '[foo]',
  host: {
    '[class.active]': 'isActive()',
    '[style.color]': 'color()',
    '[title]': 'title()',
  }
})
export class FooDirective {
  readonly isActive = input(true);
  readonly color = input('red');
  readonly title = input('My Title');
}
```

### Host Listener: Events abonnieren

Man kann Attributdirektiven auch verwenden, um auf Ereignisse zu reagieren, die auf dem Host-Element auftreten.
Diese Events lassen sich mit dem `host`-Objekt im Decorator abfangen.
Dazu notieren wir den Eventnamen in runden Klammern als Schlüssel und referenzieren eine Methode der Klasse:

```typescript
@Directive({
  selector: '[foo]',
  host: {
    '(click)': 'myClickHandler()'
  }
})
export class FooDirective {
  myClickHandler() {
    // auf Klick reagieren
  }
}
```

Host Listener können selbstverständlich mit Host Bindings in einer Direktive kombiniert werden.
Abhängig von auftretenden Events können wir also bestimmte Eigenschaften des Host-Elements verändern.
Zum Beispiel können wir eine Direktive bauen, die beim Klick auf ein Element eine bestimmte CSS-Klasse setzt oder entfernt.

Wir benötigen dafür zunächst ein Host Binding, um die CSS-Klasse `active` auf dem Host-Element zu setzen.
Die zugehörige Klasseneigenschaft `isActive` initialisieren wir mit `false`, sodass die CSS-Klasse zunächst nicht angewendet wird.
Dann erstellen wir einen Host Listener, um auf das `click`-Event zu reagieren.
Bei jedem Klick wird das Property `isActive` invertiert, sodass die CSS-Klasse hinzugefügt oder entfernt wird:

```typescript
@Directive({
  selector: '[toggleOnClick]',
  host: {
    '[class.active]': 'isActive()',
    '(click)': 'handleClick()'
  }
})
export class ToggleOnClickDirective {
  private readonly #isActive = signal(false);

  handleClick() {
    this.#isActive.update((current) => !current);
  }
}
```

Die Direktive kann jetzt auf jedem beliebigen Element im Template eingesetzt werden.
Da sie keine Parameter benötigt, setzen wir lediglich den Attributnamen ein.
Beim Klick wird dem Element nun die CSS-Klasse `active` zugewiesen, beim nächsten Klick wird sie wieder entfernt:

```html
<div toggleOnClick>
  Hello World
</div>
```

### Direktzugriff auf das Element mit `ElementRef`

In den meisten Fällen reichen die Host Bindings aus, um die Eigenschaften des Host-Elements aus der Direktive heraus zu ändern.
Bindings erlauben allerdings keinen direkten Zugriff auf das DOM-Element.
Das kann z. B. notwendig sein, wenn Methoden auf dem Element aufgerufen werden sollen.

Hier hilft die Klasse `ElementRef`, die wir über `inject()` anfordern können.
Ihre Eigenschaft `nativeElement` ist eine Referenz auf das tatsächliche DOM-Element, auf dem die Direktive aktiv ist.
Wir erhalten direkten Zugriff auf das Host-Element und können es nach Belieben verwenden, z. B. Methoden aufrufen oder Eigenschaften setzen.

Das vorherige Beispiel der Toggle-Direktive könnten wir also wie folgt umbauen und dabei das native Property `classList` verwenden:

```typescript
import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[toggleOnClick]',
  host: {
    '(click)': 'toggleClass()'
  }
})
export class ToggleClassDirective {
  private readonly el = inject(ElementRef);
  private readonly #isActive = signal(false);

  toggleClass() {
    this.#isActive.update((current) => !current);

    if (this.#isActive()) {
      this.el.nativeElement.classList.add('active');
    } else {
      this.el.nativeElement.classList.remove('active');
    }
  }
}
```

Ein Host Binding ist diesem Weg deutlich vorzuziehen, denn der Weg über das `ElementRef` …

- hat Abhängigkeiten, die initialisiert werden müssen,
- ist länger und unübersichtlicher und
- greift direkt auf das DOM-Element zu, anstatt die Abstraktion von Angular zu nutzen. Dadurch ist die Anwendung nicht mehr plattformunabhängig.

Vermeide also, wenn möglich, das `ElementRef` und nutze die Schnittstellen von Angular.

### Komponenten und Direktiven anfordern

Wir können in einer Direktive oder Komponente eine beliebige andere Direktive oder Komponente anfordern, die weiter oben im Baum aktiv ist.
Wir erhalten so eine Instanz der Klasse und können darauf Methoden ausführen, Propertys lesen usw.

Man kann dieses Feature einsetzen, um eine Direktive zu bauen, die eine bestehende Komponente erweitert.
Dazu konstruieren wir ein Szenario:
Wir verwenden eine Tabellenkomponente aus einer Drittanbieterbibliothek, deren Implementierung wir nicht beeinflussen können.
Die Komponente besitzt ein Input-Property `data`, über das wir die anzuzeigenden Daten übergeben können.
Das Output `rowClick` gibt ein Event aus, sobald eine Tabellenzeile angeklickt wird.

```html
<mighty-table
  [data]="myData()"
  (rowClick)="handleClickedRow($event)"></mighty-table>
```

Die Beschaffung der Daten und das Handling für die angeklickte Tabellenzeile wollen wir in einem eigenen Service `MyDataService` durchführen.
Um die beiden Teile zu verbinden, müssen wir in unserer eigenen Komponente den Service injizieren, die Daten an die Tabelle übergeben und das Event abonnieren.
Diese Verdrahtung müssen wir immer wieder manuell vornehmen, wenn wir die Tabelle zusammen mit dem Service nutzen wollen.
Um die Verbindung wiederverwendbar zu machen, können wir deshalb eine Direktive entwickeln!
Wir setzen sie direkt auf dem Host-Element der Tabelle ein, und die Direktive verbindet den Service und die Komponente:

```html
<mighty-table tableAdapter></mighty-table>
```

Um mit der Tabelle zu kommunizieren, fordert die Direktive die Komponente an, auf deren Host-Element sie sich befindet.
Außerdem injiziert sie den Service, und nun können wir beide Welten miteinander verbinden:

```typescript
@Directive({ selector: '[tableAdapter]' })
export class TableAdapterDirective {
  private table = inject(MightyTableComponent);
  private service = inject(MyDataService);

  constructor() {
    // Daten an die Tabelle übergeben
    this.service.getData().subscribe(data => {
      this.table.data = data;
    });

    // Events aus der Tabelle verarbeiten
    this.table.rowClick.subscribe(row => {
      this.service.handleClickedRow(row);
    });
  }
}
```

Direktiven und Komponenten können also aus dem darüberliegenden Baum die Instanzen von anderen Direktiven und Komponenten anfordern.
Bitte verwende das Feature sparsam! Normalerweise sollten verwandte Komponenten über Bindings miteinander kommunizieren.
Der beschriebene Weg ist dann zu empfehlen, wenn wir die Funktionalität von existierenden Bausteinen erweitern wollen.

## Komposition mit Host-Direktiven

Um eine Direktive auf ein Element anzuwenden, nutzen wir üblicherweise im Template das HTML-Attribut, das zum Selektor der Direktive passt.
Mit der *Directive Composition API* gibt es zusätzlich die Möglichkeit, Direktiven „von innen" zu setzen:
Eine Direktive oder Komponente kann damit selbst deklarativ entscheiden, welche weiteren Direktiven auf ihrem Host-Element erzeugt werden.
Dadurch ist es möglich, einzelne Funktionalitäten in Direktiven auszulagern und diese dann in Komposition zu verwenden.
Die Eigenschaft `hostDirectives` steht sowohl in `@Directive()` als auch in `@Component()` zur Verfügung.

In den Metadaten von Direktiven und Komponenten wird dafür die Eigenschaft `hostDirectives` verwendet.
Erinnern wir uns an die `ToggleOnClickDirective` von weiter oben: Sie setzt beim Klick die CSS-Klasse `active` auf dem Host-Element.
Wenn wir eine neue Direktive bauen, die dieses Verhalten automatisch mitbringen soll, können wir die Direktive als Host-Direktive einsetzen:

```typescript
@Directive({
  selector: '[highlightCard]',
  hostDirectives: [ToggleOnClickDirective]
})
export class HighlightCardDirective {}
```

Das funktioniert so, als hätten wir die `ToggleOnClickDirective` im Template auf dasselbe Element gesetzt.
Angular erzeugt beim Rendern automatisch eine Instanz jeder Host-Direktive, und deren Host Bindings werden auf das Host-Element angewendet.
Jedes Element mit `highlightCard` reagiert also automatisch auf Klicks und toggelt die CSS-Klasse `active`, ohne dass die Konsumenten der Direktive etwas dafür tun müssen.

Dabei gelten einige Regeln:
- Host-Direktiven werden statisch zur Compile-Zeit angewendet. Es ist nicht möglich, Direktiven zur Laufzeit dynamisch hinzuzufügen.
- Der Selektor einer als Host-Direktive eingesetzten Direktive wird ignoriert. Nur die Deklaration in `hostDirectives` zählt.

Um mit den erzeugten Direktiven zu interagieren, können wir die Klassen mittels `inject()` anfordern.
Wir erhalten Zugriff auf die Instanzen und können dort die Propertys und Methoden direkt verwenden.

### Inputs und Outputs verfügbar machen

Standardmäßig sind die Inputs und Outputs einer Host-Direktive nicht Teil der öffentlichen API der Komponente.
Wir können sie aber explizit verfügbar machen, indem wir die Einträge in `hostDirectives` erweitern.

Dazu erweitern wir unser Beispiel: Wir bauen eine `TooltipDirective`, die einen Tooltip-Text als Input entgegennimmt und ein Output auslöst, wenn der Tooltip angezeigt wird:

```typescript
@Directive({ selector: '[tooltip]' })
export class TooltipDirective {
  tooltipText = input.required<string>();
  tooltipShown = output<void>();
}
```

In unserer `HighlightCardDirective` machen wir diese Schnittstelle nach außen verfügbar:

```typescript
@Directive({
  selector: '[highlightCard]',
  hostDirectives: [
    ToggleOnClickDirective,
    {
      directive: TooltipDirective,
      inputs: ['tooltipText'],
      outputs: ['tooltipShown']
    }
  ]
})
export class HighlightCardDirective {}
```

Die Propertys `tooltipText` und `tooltipShown` können danach so verwendet werden, als wären sie die Schnittstelle der `HighlightCardDirective` selbst.
Im Hintergrund werden die Daten an die erzeugte `TooltipDirective` weitergegeben:

```html
<div highlightCard tooltipText="Klick mich!" (tooltipShown)="onTooltip()">
  Inhalt der Karte
</div>
```

### Inputs und Outputs umbenennen

Manchmal passen die Namen der Inputs und Outputs einer Host-Direktive nicht zur API der Komponente, die sie einsetzt.
In diesem Fall können wir die Schnittstelle mit einem Alias umbenennen.
Die Syntax dafür ist `'originalName: alias'`:

```typescript
@Directive({
  selector: '[highlightCard]',
  hostDirectives: [
    {
      directive: TooltipDirective,
      inputs: ['tooltipText: hint'],
      outputs: ['tooltipShown: hintShown']
    }
  ]
})
export class HighlightCardDirective {}
```

Im Template verwenden wir dann die umbenannten Namen:

```html
<div highlightCard hint="Klick mich!" (hintShown)="onHint()">
  Inhalt der Karte
</div>
```

### Transitive Komposition

Host-Direktiven können nicht nur auf Komponenten, sondern auch auf andere Direktiven angewendet werden.
Dadurch lassen sich Verhaltensweisen transitiv aggregieren: Wir können mehrere kleine Direktiven zu einer größeren zusammensetzen und diese dann wiederum als Host-Direktive verwenden.

Nehmen wir an, wir wollen die `ToggleOnClickDirective` und die `TooltipDirective` häufig gemeinsam einsetzen.
Statt beide Direktiven jedes Mal einzeln zu verwenden, können wir sie in einer neuen Direktive bündeln:

```typescript
@Directive({
  selector: '[interactiveElement]',
  hostDirectives: [ToggleOnClickDirective, TooltipDirective]
})
export class InteractiveElementDirective {}
```

Diese zusammengesetzte Direktive können wir nun in den Template unserer Komponenten verwenden oder auch wiederum als Host-Direktive einsetzen:

```typescript
@Directive({
  selector: '[highlightCard]',
  hostDirectives: [InteractiveElementDirective]
})
export class HighlightCardDirective {}
```

Wenn `HighlightCardDirective` im Template verwendet wird, erzeugt Angular Instanzen von `ToggleOnClickDirective`, `TooltipDirective` und `InteractiveElementDirective`.
Alle Host Bindings dieser Direktiven werden auf das Host-Element angewendet.
So können wir Verhalten Schicht für Schicht aufbauen, ohne dass die Konsumenten der Direktive etwas davon mitbekommen.

### Ausführungsreihenfolge

Host-Direktiven durchlaufen denselben Lebenszyklus wie Komponenten und Direktiven, die direkt im Template verwendet werden.
Dabei gilt eine wichtige Regel: Host-Direktiven führen ihren Konstruktor, ihre Lifecycle Hooks und ihre Bindings immer *vor* der Komponente oder Direktive aus, auf der sie angewendet wurden.

Für unser Beispiel mit `HighlightCardDirective` und `ToggleOnClickDirective` ergibt sich folgende Reihenfolge:

1. `ToggleOnClickDirective` wird instanziiert
2. `HighlightCardDirective` wird instanziiert
3. `ToggleOnClickDirective` erhält Inputs (`ngOnInit`)
4. `HighlightCardDirective` erhält Inputs (`ngOnInit`)
5. `ToggleOnClickDirective` wendet Host Bindings an
6. `HighlightCardDirective` wendet Host Bindings an

Das bedeutet, dass die äußere Direktive die Host Bindings einer Host-Direktive überschreiben kann, falls es zu Konflikten kommt.
Bei verschachtelten Host-Direktiven (wie bei der transitiven Komposition) setzt sich dieses Prinzip fort: Die innerste Direktive wird zuerst instanziiert, die äußerste zuletzt.

### Dependency Injection

Eine Komponente oder Direktive, die `hostDirectives` verwendet, kann die Instanzen ihrer Host-Direktiven per `inject()` anfordern, und umgekehrt.
Das ermöglicht eine direkte Kommunikation zwischen der Komponente und ihren Host-Direktiven.

Wenn sowohl die Komponente als auch eine Host-Direktive denselben Injection Token bereitstellen, hat der Provider der Komponente (also der Klasse mit `hostDirectives`) Vorrang vor dem Provider der Host-Direktive.

Im Gegensatz zur Vererbung können wir mit Host-Direktiven auch mehrere Direktiven gleichzeitig auf dem Host-Element instanziieren.
Dadurch ergeben sich vielfältige Möglichkeiten zur Komposition, die mit klassischer Vererbung nicht möglich wären.

## Strukturdirektiven: Elemente hinzufügen und entfernen

Attributdirektiven, wie wir sie bisher kennengelernt haben, ändern immer das Verhalten eines existierenden Elements.
Im Gegensatz dazu sorgen Strukturdirektiven dafür, dass die Struktur des DOM verändert wird, indem Elemente hinzugefügt oder entfernt werden.
Das Element selbst bleibt dabei unverändert.

Strukturdirektiven sind immer dann sinnvoll, wenn Elemente in Abhängigkeit von bestimmten Faktoren ein- und ausgeblendet werden sollen.
Die Möglichkeiten sind sehr vielfältig: Denke beispielsweise an Feature-Toggles, zeitliche Verzögerung oder Sichtbarkeit abhängig von Berechtigungen:

```html
<div *featureToggle="'books'">Bücher</div>
<p *delay="500">Ich bin verzögert</p>
<button *hasRole="'admin'">Do admin stuff</button>
```

All diese Strukturdirektiven aus dem Beispiel existieren natürlich nicht, solange wir sie nicht selbst entwickeln — sie sollen aber die praktischen Möglichkeiten aufzeigen.

### Kurz- und Langform

Strukturdirektiven werden immer mit dem Stern-Symbol (`*`) eingeleitet.
Diese Syntax hat einen technischen Hintergrund:
Angular wandelt die Kurzschreibweise in eine Langform um und verwendet dabei das Element `<ng-template>`.

Wir sehen uns beide Schreibweisen einmal im Vergleich an.
Nehmen wir an, wir haben eine Strukturdirektive `hasRole`, die ein Element nur anzeigt, wenn die nutzende Person eine bestimmte Rolle besitzt:

```html
<!-- Kurzform -->
<button *hasRole="'admin'">Löschen</button>

<!-- Langform -->
<ng-template [hasRole]="'admin'">
  <button>Löschen</button>
</ng-template>
```

Die Syntax mit dem Stern (`*hasRole`) wird umgewandelt in ein `<ng-template>`, das die Attributdirektive `[hasRole]` trägt.
In diesem Template-Element befindet sich das eigentliche HTML-Element, auf dem vorher die Strukturdirektive zu finden war.

Das `<ng-template>` wird von Angular zunächst nicht gerendert.
Doch keine Angst, das Template ist nicht endgültig verschwunden, sondern wir können es mithilfe einer Strukturdirektive wieder anzeigen.

> **Entfernen vs. Ausblenden:**
> Strukturdirektiven können Elemente aus dem DOM entfernen.
> Macht es nun einen Unterschied, ob wir ein Element mit CSS-Eigenschaften unsichtbar machen oder es tatsächlich aus dem DOM entfernen?
> Beide Varianten sorgen dafür, dass ein Element im Browser nicht mehr sichtbar ist.
> Blenden wir Elemente jedoch lediglich aus, so sind sie tatsächlich noch vorhanden und werden verarbeitet.
> Es werden also auftretende Events behandelt, Bindings aktualisiert, und die Change Detection von Angular ist aktiv, um Änderungen in den Daten festzustellen.
> Bei größeren Datenmengen oder vielen Kindkomponenten und Abhängigkeiten kann das zu Einbußen in der Performance führen.
> Wird ein Element hingegen aus dem DOM entfernt, so ist es tatsächlich nicht vorhanden und muss auch nicht gerendert werden.

### Eigene Strukturdirektiven entwickeln

Strukturdirektiven haben denselben Grundaufbau wie Attributdirektiven.
Der wichtige Unterschied ist, dass Strukturdirektiven immer auf ein Template-Element angewendet werden und ihr Host-Element demnach immer dieses Template ist.

Jedes Element besitzt einen sogenannten *View Container*, in den Templates eingebettet werden können.
Mit Strukturdirektiven können wir den View Container steuern und Templates anzeigen.
Dadurch können wir selbst entscheiden, unter welchen Umständen wir das Element darstellen möchten.

Angular bietet uns zwei Schnittstellen, um Templates und View Container verwalten zu können: `ViewContainerRef` liefert eine Referenz auf den View Container des Host-Elements, `TemplateRef` ermöglicht den Zugriff auf das Template, auf dem die Direktive liegt.

Wir wollen die Konzepte an einem praxisnahen Beispiel erläutern und dafür die `HasRoleDirective` implementieren.
Sie soll ein Element nur dann anzeigen, wenn die nutzende Person eine bestimmte Rolle besitzt.
Dieses Muster greift das Beispiel `*hasRole="'admin'"` von weiter oben auf.

Das Grundgerüst der Direktive ist genauso wie für eine Attributdirektive.
Wir injizieren zunächst die Klassen `ViewContainerRef` und `TemplateRef`.
Da die Direktive für jedes Template funktionieren soll, geben wir für den Inhalt des Templates den Typ `unknown` an.

Außerdem müssen wir den Wert auslesen, der als Rollenname an die Direktive übergeben wird: Dafür erstellen wir das Input `hasRole`.
In der Direktive prüfen wir mithilfe eines `AuthService`, ob die nutzende Person die angegebene Rolle besitzt.
Wenn ja, soll das Template angezeigt werden, wenn nicht, wird es entfernt.
Dazu verwenden wir einen `effect()`, der bei jeder Änderung des Inputs ausgeführt wird.

Die Klasse `ViewContainerRef` verfügt über die Methode `createEmbeddedView()`.
Damit können wir ein Template in den View Container einbetten.
Das Gegenstück ist die Methode `clear()`, mit der der Container geleert und das Template entfernt wird.

```typescript
import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({ selector: '[hasRole]' })
export class HasRoleDirective {
  readonly hasRole = input.required<string>();

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      if (this.authService.hasRole(this.hasRole())) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
```

Die Direktive kann jetzt im Template eingesetzt werden.
Nur wenn die nutzende Person die Rolle `admin` besitzt, wird der Button angezeigt:

```html
<button *hasRole="'admin'">Löschen</button>
```

Damit haben wir eine praxisnahe Strukturdirektive entwickelt, die domänenspezifische Logik kapselt.
Dieses Muster lässt sich auf viele Anwendungsfälle übertragen: Feature-Toggles, A/B-Tests, zeitliche Verzögerung oder Sichtbarkeit abhängig von Konfigurationen.

> **Mehrere Strukturdirektiven auf einem Element:**
> Wir können grundsätzlich mehrere Attributdirektiven auf einem Element verwenden.
> Bei Strukturdirektiven verhält sich das anders: Es ist nur eine einzige Strukturdirektive pro Element gültig.
> HTML-Attribute haben keine Reihenfolge.
> Angular kann also nicht wissen, in welcher Reihenfolge die Direktiven ausgeführt werden sollen.
> Möchten wir eine Hierarchie einführen, müssen wir mehrere Elemente verschachteln.
> Dafür eignet sich das Element `<ng-container>` sehr gut:
>
> ```html
> <ng-container *hasRole="'admin'">
>   <div *featureToggle="'books'">Bücher</div>
> </ng-container>
> ```
>
> `<ng-container>` ist ein Hilfselement von Angular und ist im Browser nicht sichtbar, sondern nur sein Inhalt wird angezeigt.

## Fazit

In diesem Artikel haben wir gelernt, wie wir mit Attributdirektiven das Verhalten von Elementen verändern können.
Wir haben gesehen, wie Host Bindings und Host Listener über die `host`-Metadaten im Decorator eingesetzt werden, und wie wir mit `ElementRef` direkt auf das DOM-Element zugreifen können.
Mit der Directive Composition API können wir Direktiven „von innen" auf dem Host-Element instanziieren und so Funktionalitäten elegant kombinieren.
Außerdem haben wir Strukturdirektiven kennengelernt, mit denen wir Templates in den View Container eines Elements einbetten oder daraus entfernen können.

Direktiven sind ein vielseitiges Werkzeug, um wiederverwendbare Logik zu kapseln und das Verhalten von DOM-Elementen zu erweitern.
**Wir wünschen viel Spaß beim Ausprobieren!**
