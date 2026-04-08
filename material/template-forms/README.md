---
title: 'Formulare mit Template-Driven Forms'
published: 2026-04-08
lastModified: 2026-04-08
---

Formulare gehören zu den zentralen Bausteinen jeder Webanwendung.
Mit den älteren **Template-Driven Forms** bietet Angular einen Ansatz, bei dem die Formularlogik direkt im Template definiert wird.
Dieser Artikel stellt den Ansatz im Detail vor.

## Inhalt

[[toc]]

## Formulare in Angular

Angular bietet insgesamt drei Ansätze für die Formularverarbeitung an: **Template-Driven Forms**, **Reactive Forms** und **Signal Forms**.
Signal Forms ist die moderne Lösung, die Ende 2025 mit Angular 21 als Experimental-Version eingeführt wurde.
Im Angular-Buch findest du zu den modernen Signal Forms mehrere ausführliche Kapitel.

Template-Driven Forms sind der älteste der drei Ansätze.
Sie eignen sich vor allem für überschaubare Formulare, bei denen die gesamte Formularlogik bequem im Template mit der Direktive `ngModel` abgebildet werden kann.

Reactive Forms waren lange der De-facto-Standard für Formulare in Angular.
Wenn du dich für diesen Ansatz interessierst, schau dir unseren [Artikel zu Reactive Forms](/reactive-forms) an.

## Template-Driven Forms einrichten

Damit wir Template-Driven Forms in der Anwendung einsetzen können, müssen wir alle nötigen Bausteine an Bord holen.
Angular bündelt sie in einem Modul mit dem Namen `FormsModule`.
Darin befinden sich unter anderem die Direktiven, die wir später in den Templates einsetzen.
Wir importieren das `FormsModule` in der Komponente, in der sich unser Formular befinden soll.

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  // ...
  imports: [FormsModule],
})
export class MyForm { }
```

## Datenmodell in der Komponente

Bevor wir das HTML-Markup für das Formular bauen, planen wir zunächst, welche Daten erfasst werden müssen.
Diese Daten müssen in der Komponentenklasse vorliegen, am besten als zusammenhängendes Objekt in einem Signal.
Das Objekt enthält immer konkrete Daten: Bei der Initialisierung sind das die Default-Werte; sobald etwas eingetippt wurde, finden wir diese Eingaben in dem Objekt.

```typescript
@Component({ /* ... */ })
export class MyForm {
  protected formData = signal({
    username: '',
    password: ''
  });
}
```

## Template mit Two-Way Binding und ngModel

Im Template der Komponente legen wir uns nun ein HTML-Formular mit einem `<form>`-Tag an.
Darin befinden sich die Formularfelder, z. B. einfache oder mehrzeilige Textfelder, Checkboxen, Dropdowns oder Passwortfelder.
Diese Formularfelder sollten zu dem Datenmodell aus der Komponente passen.

Jedes Formularfeld muss ein `name`-Attribut besitzen, damit Angular die Felder identifizieren kann.

Im folgenden Beispiel haben wir außerdem Labels für die Felder platziert. Dafür haben wir jedes Formularfeld mit einer eindeutigen ID versehen und diese ID im Attribut `for` auf dem Label referenziert.
Dadurch werden Label und Feld semantisch miteinander verbunden.

```html
<form>
  <label for="username">Username</label>
  <input type="text" id="username" name="username">

  <label for="password">Password</label>
  <input type="password" id="password" name="password">

  <button type="submit">Submit</button>
</form>
```

Jetzt kommt der interessante Schritt: Wir verknüpfen die Formularfelder mit dem Datenmodell aus der Komponente.
Dabei helfen uns die Direktive `ngModel` und ein Two-Way Binding.
Dieses Binding ist eine Kombination von zwei "alten Bekannten": Property Binding und Event Binding.
Geben wir etwas in das Formular ein, werden die Eingaben über ein Event in die Komponente gesendet.
Ändern sich die Daten in der Komponente, werden die Formularfelder automatisch aktualisiert.
Die Datenflüsse laufen also in zwei Richtungen.

Auch wenn das zunächst etwas kompliziert klingt, ist die Verwendung sehr einfach:
Wir setzen `ngModel` ein und verknüpfen jedes unserer Formularfelder im Template mit einer Eigenschaft unseres Datenmodells.

```html
<form>
  <label for="username">Username</label>
  <input type="text" id="username" name="username" [(ngModel)]="formData().username">

  <label for="password">Password</label>
  <input type="password" id="password" name="password" [(ngModel)]="formData().password">

  <button type="submit">Submit</button>
</form>
```

Die Daten zwischen Formularfeldern und Komponente werden nun stets synchronisiert.
Zum Ausprobieren können wir den Wert des Signals `formData` im Template anzeigen, indem wir die `JsonPipe` verwenden:

```html
<pre>{{ formData() | json }}</pre>
```

## Eingaben validieren

Damit wir sofort Feedback in der Oberfläche darüber erhalten, ob die Eingaben gültig sind oder nicht, können wir die Formulareingaben validieren.
Dafür stellt uns Angular eine Reihe von eingebauten Validatoren zur Verfügung, die wir direkt im Template verwenden können.
Sie werden als Attribute auf den Formularfeldern eingesetzt.

| Attribut | Prüfung |
|----------|---------|
| `required` | Das Feld muss ausgefüllt sein. |
| `min="5"` | Die eingegebene Zahl muss größer oder gleich 5 sein. |
| `max="10"` | Die eingegebene Zahl muss kleiner oder gleich 10 sein. |
| `minlength="5"` | Es müssen mindestens 5 Zeichen angegeben werden. |
| `maxlength="10"` | Es dürfen höchstens 10 Zeichen angegeben werden. |
| `pattern="[a-z]*"` | Der Wert des Eingabefelds wird auf den angegebenen regulären Ausdruck geprüft. In diesem Fall werden nur Eingaben von Kleinbuchstaben (a–z) akzeptiert. |
| `email` | Das Feld muss eine gültige E-Mail-Adresse beinhalten. |

Setzen wir diese Validatoren ein, kümmert sich Angular automatisch im Hintergrund darum, den eingegebenen Wert gegen diese Regeln zu prüfen.
Die Zustände des Formulars werden stets aktualisiert, sodass wir sofort ein visuelles Feedback zur Eingabe anzeigen können.

Das Passwortfeld aus unserem Beispiel könnte die folgenden Regeln besitzen:

- muss ausgefüllt sein
- muss mindestens 8 Zeichen enthalten
- muss mindestens eine Zahl enthalten

Im Code lassen sich diese Anforderungen wie folgt umsetzen:

```html
<input
  type="password"
  id="password"
  name="password"
  [(ngModel)]="formData().password"
  required
  minlength="8"
  pattern=".*[0-9].*">
```

## Formularzustand verarbeiten

Wir haben auf jedem Formularfeld die Direktive `ngModel` verwendet.
Was trivial aussieht, erledigt im Hintergrund eine Menge wichtiger Schritte, um das Formular zu verwalten.
Für jedes Feld wird automatisch ein Objekt initialisiert, das den Zustand der Formularfelder kontrolliert.

Den Zustand können wir über verschiedene Zustandsflags auslesen:

| Zustand | ja | nein |
|---------|-----|------|
| Das Control wurde bedient. | `touched` | `untouched` |
| Der Wert wurde verändert. | `dirty` | `pristine` |
| Der Wert ist gültig. | `valid` | `invalid` |

Hinzu kommt noch der Zustand `pending` für asynchrone Validierungen, die noch nicht abgeschlossen sind.
Außerdem wird der Zustand `submitted` auf dem gesamten `<form>`-Tag gesetzt, nachdem das Formular abgeschickt wurde.

Für alle genannten Zustände werden automatisch passende CSS-Klassen auf dem zugehörigen DOM-Element gesetzt.
Diese Klassen tragen das Präfix `ng-`, also z. B. `ng-touched`.
Wir können die CSS-Klassen nutzen, um die Eingabefelder passend zu ihrem Zustand zu stylen.
Zum Beispiel können wir die Felder rot hervorheben, wenn kein Wert eingegeben wurde, oder ein Feld grün unterlegen, sobald der Wert gültig ist.

```css
input.ng-invalid.ng-touched {
  border-color: red;
}

input.ng-valid.ng-touched {
  border-color: green;
}
```

Für komplexere Auswertungen können wir direkt auf den Zustand zugreifen.
Dazu verwenden wir im Template eine Elementreferenz, die auf die Instanz von `ngModel` verweist.
Dieses Objekt besitzt alle Zustände als Propertys, die jeweils ein Boolean beinhalten.
So können wir z. B. eine Meldung abhängig vom Formularzustand anzeigen.

```html
<input
  type="text"
  id="username"
  name="username"
  [(ngModel)]="formData().username"
  required
  #usernameInput="ngModel">

@if (usernameInput.invalid && usernameInput.touched) {
  <div class="error">Username is required</div>
}
```

## Formular abschicken

Sobald das Formular mit dem Submit-Button abgeschickt wird, wollen wir die Eingaben verarbeiten und z. B. zum Server schicken.

Dazu benötigen wir als Erstes eine Methode in der Komponente, die ausgeführt wird, sobald das Formular abgeschickt wird.
Hier können wir auf das Signal `formData` zugreifen und diese Werte weiterverarbeiten, denn Angular hat durch das Two-Way Binding stets das Formular und das Datenmodell synchron gehalten.

```typescript
@Component({ /* ... */ })
export class MyForm {
  protected formData = signal({
    username: '',
    password: ''
  });

  submitForm() {
    console.log(this.formData());
    // Daten weiterverarbeiten, z. B. zum Server schicken
  }
}
```

Weil eine Methode allein noch nichts tut, müssen wir im zweiten Schritt das Formular mit dieser Methode verknüpfen.
Dazu bietet Angular das passende Event `ngSubmit` an, das wir direkt auf dem Formularelement mit einem Event Binding abonnieren können.
Sobald das Formular abgeschickt wird, z. B. durch einen Klick auf den Submit-Button, wird das Event ausgelöst, und unsere Methode wird aufgerufen.

```html
<form (ngSubmit)="submitForm()">
  <!-- Formularfelder -->
  <button type="submit">Submit</button>
</form>
```

## Formular zurücksetzen

Nachdem die Daten abgeschickt wurden, besitzt das Formular noch immer die letzten Daten und Zustände.
Wenn das Formular direkt verwendet werden soll, um weitere Daten zu erfassen, fehlt noch ein wichtiger Schritt:
Wir müssen alle Zustände und Werte zurücksetzen.

Verwenden wir Template-Driven Forms, initialisiert Angular auf jedem `<form>`-Tag eine Direktive mit dem Namen `NgForm`.
Das passiert vollautomatisch, ohne dass wir im Template zusätzlichen Code schreiben müssen.
Zugriff auf dieses `NgForm` erhalten wir wieder mit einer Elementreferenz:

```html
<form (ngSubmit)="submitForm()" #form="ngForm">
  <!-- Formularfelder -->
  <button type="submit">Submit</button>
</form>
```

Auf diesem Objekt existiert unter anderem die Methode `reset()`.
Damit wir diese Methode aufrufen können, benötigen wir allerdings in der Komponentenklasse Zugriff auf diese Elementreferenz.
Dafür können wir die Funktion `viewChild()` einsetzen:
Von der Komponentenklasse aus greifen wir auf eine Elementreferenz im Template zu.
Den Wert erhalten wir als Signal.

Das Argument der Funktion ist dabei der Name der Elementreferenz aus dem Template.
In unserem Fall verwenden wir außerdem den Typ `NgForm`, damit TypeScript mit der Referenz korrekt umgehen kann.
Mit dieser Instanz von `NgForm` in der Hand können wir schließlich die Methode `reset()` aufrufen, nachdem das Formular abgeschickt wurde.

```typescript
import { /* ... */, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({ /* ... */ })
export class MyForm {
  readonly form = viewChild<NgForm>('form');

  protected formData = signal({
    username: '',
    password: ''
  });

  submitForm() {
    console.log(this.formData());
    // Daten weiterverarbeiten

    // Formular zurücksetzen
    this.form().reset();
    this.formData.set({ username: '', password: '' });
  }
}
```

Bitte bedenke, dass auch die Daten zurückgesetzt werden müssen.
Das Signal, in dem der Formularwert steht, muss also mit dem Startzustand überschrieben werden, damit die Inhalte zurückgesetzt werden.

Das `NgForm`-Objekt können wir übrigens für viele weitere Zwecke verwenden.
Beispielsweise kennt das Objekt immer alle Zustände seiner Formularfelder, sodass wir komplexere Validierungsregeln umsetzen können.

## Zusammenfassung

- Template-Driven Forms ist einer von drei Ansätzen zur Formularverarbeitung in Angular.
- Zur Verwendung müssen wir das `FormsModule` importieren.
- Das Two-Way Binding mit `[(ngModel)]` bindet ein Formularfeld an ein Property der Komponente. Die Daten werden in beide Richtungen synchronisiert.
- Wird das Formular mit einem Submit-Button abgeschickt, wird das Event `ngSubmit` ausgelöst. Wir können das Event auf dem `<form>`-Element abonnieren: `(ngSubmit)="submitForm()"`.
- Angular bringt einige eingebaute Validatoren mit: `required`, `min`, `max`, `minlength`, `maxlength`, `pattern` und `email`. Sie werden als Attribute auf den Formularfeldern eingesetzt.
- Für die Zustände eines Formularfelds werden automatisch CSS-Klassen mit dem Präfix `ng-` gesetzt.
- Mit Elementreferenzen können wir auf die Instanzen von `ngModel` und `ngForm` zugreifen, um die Zustände direkt auszulesen.
- Mit `viewChild('form')` können wir in der Komponentenklasse auf eine Elementreferenz im Template zugreifen. Damit können wir z. B. ein Formular zurücksetzen oder die Zustände auslesen.

## Empfehlung

Template-Driven Forms werden nach wie vor vollständig vom Framework unterstützt.
Sie eignen sich besonders für einfache Formulare, bei denen die Logik überschaubar bleibt.
Für komplexere Szenarien empfehlen wir [Reactive Forms](/reactive-forms) oder – sobald die API stabil ist – die modernen **Signal Forms**, die wir im Angular-Buch ausführlich behandeln.
