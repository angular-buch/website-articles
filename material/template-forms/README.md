---
title: 'Formulare mit Template-Driven Forms'
published: 2026-02-10
hidden: true
---

> **Hinweis:** Dieser Artikel ist ein Zusatzmaterial zum [Angular-Buch](https://angular-buch.com).
> Im Buch behandeln wir **Signal Forms** – den neuesten Ansatz zur Formularverarbeitung in Angular.
> Template-Driven Forms und Reactive Forms sind weiterhin vollständig unterstützt und in vielen Projekten im Einsatz.
>
> Dieser Artikel behandelt **Template-Driven Forms**.
> Wenn du dich für den modellbasierten Ansatz interessierst, schau dir unseren Artikel zu [Reactive Forms](/reactive-forms) an.

---

Angular bietet drei Ansätze für die Formularverarbeitung: **Template-Driven Forms**, **Reactive Forms** und **Signal Forms**.
Template-Driven Forms sind der älteste Ansatz und eignen sich besonders für einfache Formulare - insbesondere in Anwendungen, die noch mit einer älteren Angular Version (vor Angular 22) arbeiten.
Die Formularlogik wird dabei vollständig im Template mit der Direktive `ngModel` abgebildet.

## Template-Driven Forms einrichten

Damit wir Template-Driven Forms in der Anwendung einsetzen können, müssen wir alle nötigen Bausteine an Bord holen.
Angular bündelt sie in einem Modul mit dem Namen `FormsModule`.
Darin befinden sich unter anderem die Direktiven, die wir später in den Templates einsetzen.
Wir importieren das `FormsModule` in der Komponente, in dem sich unser Formular befinden soll.

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
Diese Daten müssen in der Komponentenklasse vorliegen, am besten als zusammenhängendes Objekt in einem Property der Klasse.
Das Objekt enthält immer konkrete Daten: Bei der Initialisierung sind das die Default-Werte; sobald etwas eingetippt wurde, finden wir diese Eingaben in dem Objekt.

```typescript
@Component({ /* ... */ })
export class SimpleFormComponent {
  protected formData = signal({
    username: '',
    password: ''
  });
}
```

## Template mit Two-Way Binding und ngModel

Im Template der Komponente legen wir uns nun ein HTML-Formular mit einem `<form>`-Tag an.
Darin befinden sich die Formularfelder, z. B. einfache oder mehrzeilige Textfelder, Checkboxen, Dropdowns oder Passwortfelder.
Diese Formularfelder sollten natürlich zu dem Datenmodell aus der Komponente passen.
Außerdem sollten wir einen Submit-Button anlegen, um das Formular abzusenden.

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

Wenn die Regeln für die Validierung komplexer sind, lassen sie sich nicht mit einem einzigen Validator abdecken.
Deshalb können wir beliebig viele Validatoren auf ein Control setzen.
Das Passwortfeld aus unserem Beispiel kann beispielsweise folgende Regeln besitzen:

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

Ein Feld kann sechs unterschiedliche Zustände besitzen, die sich nach drei Fragestellungen richten:

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
Hier können wir auf das Objekt `formData` zugreifen und diese Werte weiterverarbeiten, denn Angular hat durch das Two-Way Binding stets das Formular und das Datenmodell synchron gehalten.

```typescript
@Component({ /* ... */ })
export class SimpleFormComponent {
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

Angular initialisiert auf jedem `<form>`-Tag eine Direktive mit dem Namen `NgForm`.
Das passiert vollautomatisch, ohne dass wir im Template zusätzlichen Code schreiben müssen.
Zugriff auf dieses `NgForm` erhalten wir wieder mit einer Elementreferenz, die diesmal allerdings auf `ngForm` verweist.

```html
<form (ngSubmit)="submitForm()" #form="ngForm">
  <!-- Formularfelder -->
  <button type="submit">Submit</button>
</form>
```

Auf diesem Objekt existiert unter anderem die Methode `reset()`.
Damit wir diese Methode aufrufen können, benötigen wir allerdings in der Komponentenklasse Zugriff auf diese Elementreferenz.
An dieser Stelle können wir eine weitere Funktion von Angular nutzen `viewChild()`.
Damit können wir aus der Komponentenklasse heraus auf eine Elementreferenz im Template zugreifen.
Den Wert erhalten wir als Signal.

Das Argument der Funktion ist dabei der Name der Elementreferenz aus dem Template.
In unserem Fall verwenden wir außerdem den Typ `NgForm`, damit TypeScript mit der Referenz korrekt umgehen kann.
Mit dieser Instanz von `NgForm` in der Hand können wir schließlich die Methode `reset()` aufrufen, nachdem das Formular abgeschickt wurde.

```typescript
import { /* ... */, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({ /* ... */ })
export class SimpleFormComponent {
  readonly form = viewChild<NgForm>('form');

  protected formData = signal({
    username: '',
    password: ''
  });

  submitForm() {
    console.log(this.formData);
    // Daten weiterverarbeiten

    // Formular zurücksetzen
    this.form().reset();
    this.formData.set({ username: '', password: '' });
  }
}
```

Bitte bedenke, dass auch die Daten zurückgesetzt werden müssen.
Das Signal, in dem der Formularwert steht (im vorherigen Beispiel: `formData()`), muss also mit dem Startzustand überschrieben werden, damit die Inhalte zurückgesetzt werden.

Das `NgForm`-Objekt können wir übrigens für viele weitere Zwecke verwenden.
Beispielsweise kennt das Objekt immer alle Zustände seiner Formularfelder, sodass wir komplexere Validierungsregeln umsetzen können.

## Zusammenfassung

- Template-Driven Forms ist einer von drei Ansätzen zur Formularverarbeitung in Angular.
- Zur Verwendung müssen wir das `FormsModule` importieren.
- Das Two-Way Binding mit `[(ngModel)]` bindet ein Formularfeld an ein Property der Komponente. Die Daten werden in beide Richtungen synchronisiert.
- Wird das Formular mit einem Submit-Button abgeschickt, wird das Event `ngSubmit` ausgelöst. Wir können das Event auf dem `<form>`-Element abonnieren: `(ngSubmit)="submitForm()"`.
- Angular bringt einige eingebaute Validatoren mit: `required`, `min`, `max`, `minlength`, `maxlength`, `pattern` und `email`. Sie werden als Attribute auf den Formularfeldern eingesetzt.
- Für die sechs Zustände eines Formulars werden automatisch CSS-Klassen gesetzt.
- Mit Elementreferenzen können wir auf die Instanzen von `ngModel` und `ngForm` zugreifen, um die Zustände direkt auszulesen.
- Mit `viewChild('myForm')` können wir in der Komponentenklasse auf eine Elementreferenz im Template zugreifen. Damit können wir z. B. ein Formular zurücksetzen oder die Zustände auslesen.

## Empfehlung

Wir empfehlen nach Möglichkeit in modernen Angular Anwendungen stets auf Signal Forms zu setzen wie du sie im Buch kennengelernt hast. Template Driven Forms solltest du nur in Projekten einzusetzen, in denen eine Migration auf eine moderne Angular Version ab Angular 22 (noch) nicht möglich ist und wo kein komplexes Eingabeformular benötigt wird.
