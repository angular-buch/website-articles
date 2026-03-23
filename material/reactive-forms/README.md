---
title: 'Formulare mit Reactive Forms'
published: 2026-03-23
lastModified: 2026-03-23
hidden: true
---

In diesem Artikel geht es um **Reactive Forms** – einen der Ansätze von Angular, um Formulare zu verarbeiten.
Die Lösung existiert seit den frühen Versionen von Angular und wird breitflächig in vielen produktiven Anwendungen eingesetzt.

## Formulare in Angular

Angular bietet insgesamt drei Ansätze für die Formularverarbeitung an: **Template-Driven Forms**, **Reactive Forms** und **Signal Forms**.
Signal Forms ist die moderne Lösung, die Ende 2025 mit Angular 21 als Experimental-Version eingeführt wurde.
Im Angular-Buch findest du dazu drei ausführliche Kapitel.

Template-Driven Forms sind der älteste Ansatz, der vor allem für kleine Formulare lohnenswert war.

Reactive Forms gelten noch immer als Standard für die Formularverarbeitung in Angular und werden in vielen Projekten eingesetzt.
Wir gehen allerdings davon aus, dass die neuen Signal Forms diesen Platz einnehmen werden, sobald das Paket offiziell veröffentlicht wird.


## Reactive Forms

Mit Reactive Forms speichern wir in der Komponentenklasse ein Formularmodell.
Es beschreibt alles, was Angular rund um das Formular weiß: Daten, Validierungsregeln und Zustände.
Dieses Formularmodell verknüpfen wir dann mit den Feldern im HTML, indem wir Direktiven verwenden.
Mit Reactive Forms wird also ein großer Teil der Formularlogik in der TypeScript-Klasse erledigt, während im HTML nur die Datenbindungen hergestellt werden.

Um Reactive Forms verwenden zu können, benötigen wir das `ReactiveFormsModule` aus `@angular/forms` als Komponentenimport.
Das Modul enthält die notwendigen Direktiven, die wir im Template verwenden werden.

```typescript
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  // ...
  imports: [ReactiveFormsModule]
})
export class MyComponent { }
```

## Formularmodell in der Komponente

Die Grundidee der Reactive Forms ist, dass das komplette Modell des Formulars in der Komponentenklasse angesiedelt wird.
Dazu gehören neben den reinen Eingabedaten auch die gesamten logischen Controls mit ihren Zuständen, Validierungsregeln und Werten.

Im ersten Schritt müssen wir uns dazu überlegen, wie das Formular strukturiert ist, um ein entsprechendes Formularmodell aufzubauen.
Dazu stehen uns vier Bausteine zur Verfügung: `FormControl`, `FormGroup`, `FormArray` und `FormRecord`.

### FormControl

Jedes Feld unseres Formulars erhält zunächst eine Instanz von `FormControl`.
Dabei ist es vollkommen egal, ob es sich um ein Textfeld, ein Dropdown, eine Checkbox oder ein anderes Eingabefeld handelt – jedes unserer Formularfelder wird durch ein `FormControl` repräsentiert.
Bei der Initialisierung geben wir direkt einen Startwert für das Control an.
Der Typ des Controls wird automatisch aus diesem Startwert ermittelt.
Ist kein Wert gegeben, wird das Feld mit `null` initialisiert.
In der Praxis sollten wir immer einen Startwert übergeben, damit der Typ sicher bekannt ist. Für ein Textfeld kann das z. B. ein leerer String sein.

```typescript
new FormControl('');    // FormControl<string | null>
new FormControl(5);     // FormControl<number | null>
new FormControl(true);  // FormControl<boolean | null>
```

Der Wert des Controls kann immer `null` annehmen, auch wenn ein Startwert gegeben ist.
Der Hintergrund: Ein Control kann mithilfe der Methode `reset()` zurückgesetzt werden.
Beim Zurücksetzen wird traditionell der Wert `null` verwendet – und ist deshalb immer auch im Typ des Controls enthalten.

In vielen Fällen wird dieses Verhalten nicht mit den tatsächlich zu erfassenden Daten übereinstimmen.
Ein einfaches Input-Feld erzeugt zum Beispiel stets einen String.
Der Wert `null` beschäftigt uns hier also tatsächlich nur beim Zurücksetzen des Formulars.

Wir können das Standardverhalten deshalb mithilfe der Option `nonNullable` ändern:
Beim Zurücksetzen wird dann nicht `null` verwendet, sondern der ursprünglich definierte Startwert.
Damit entfällt der Typ `null`, und das `FormControl` besitzt nur noch den Typ `string`:

```typescript
new FormControl('', { nonNullable: true });
// FormControl<string>
```

Falls der Typ für ein `FormControl` nicht automatisch inferiert werden kann, weil der Startwert explizit auf `null` gesetzt wird, können wir mithilfe des generischen Typparameters nachhelfen:

```typescript
new FormControl<string | null>(null);
// FormControl<string | null>
```

Wir empfehlen, die Option `nonNullable` für jedes Control auf `true` zu setzen.
Das vereinfacht die Arbeit mit den erzeugten Daten, weil die Typen den tatsächlichen Eingabewert widerspiegeln.

### FormGroup

Da ein Formular nur selten aus einem einzigen Feld besteht, können wir eine Menge von `FormControl`s in einem *Objekt* zusammenfassen: einer `FormGroup`.
Bei der Initialisierung übergeben wir an die `FormGroup` ein Objekt mit mehreren Controls.

Das können nicht nur `FormControl`s sein, sondern auch weitere `FormGroup`s (und `FormArray`s und `FormRecord`s).
Wir können das Formular also hierarchisch aufbauen – so wie es für den Anwendungsfall notwendig ist.
Die Blätter dieses Baums sind allerdings immer einzelne `FormControl`s.

Der Typ der `FormGroup` wird anhand der enthaltenen `FormControl`s ermittelt.

```typescript
new FormGroup({
  username: new FormControl('', { nonNullable: true }),
  password: new FormGroup({
    pw: new FormControl('', { nonNullable: true }),
    pwConfirm: new FormControl('', { nonNullable: true }),
  }),
});

// Typ der erfassten Daten:
// {
//   username: string;
//   password: {
//     pw: string;
//     pwConfirm: string;
//   };
// }
```

Grundsätzlich kann ein Formular so jede Struktur annehmen.
Praktisch besteht es auf oberster Ebene aber meist aus einer `FormGroup`, in der sich die Felder aufspannen.

### FormRecord

Da die `FormGroup` strikt typisiert ist, können wir zur Laufzeit keine Felder mit anderen Namen oder Typen hinzufügen.
Das schränkt die Verwendung ein, denn manche Formulare sollen gezielt dynamisch verändert werden.
Der Baustein `FormRecord` löst dieses Problem.
Technisch ist dieses Objekt auch eine `FormGroup`, alle darin enthaltenen Controls müssen aber denselben Typ besitzen.
Das ist besonders dann sinnvoll, wenn Controls zur Laufzeit hinzugefügt oder entfernt werden sollen:

```typescript
new FormRecord({
  acceptAGB: new FormControl(false, { nonNullable: true }),
  acceptDSGVO: new FormControl(false, { nonNullable: true })
});
```

Bei der Typisierung kommt TypeScript allerdings an seine Grenzen: Die Namen der Felder können nicht statisch ermittelt werden und sind deshalb generisch mit `string` typisiert:

```typescript
{ [key: string]: boolean; }
```

Wollen wir also z. B. ein Control anhand seines Namens abrufen, kann der eingegebene Key nicht von TypeScript geprüft werden.
Ein `FormRecord` sollte deshalb gezielt eingesetzt werden, wenn eine `FormGroup` oder ein `FormArray` nicht die gewünschten Anforderungen erfüllen.

### FormArray

Der vierte Baustein für Reactive Forms ist das `FormArray`.
Damit können wir mehrere Teile des Formulars in einer *Liste* zusammenfassen.
Ein solches Array ist sinnvoll, um eine unbestimmte Anzahl von Einträgen zu erfassen, z. B. Produkte einer Bestellung, Stichwörter oder mehrere Autoren zu einem Buch.
In einem `FormArray` können nicht nur `FormControl`s zusammengefasst werden, sondern jedes beliebige Control wie `FormGroup`, `FormArray` oder `FormRecord`.

Das `FormArray` besitzt Methoden, die denen eines echten Arrays aus JavaScript nachempfunden sind.
Zum Beispiel können wir mit der Methode `push()` weitere Controls am Ende anfügen.
Außerdem existieren die Methoden `removeAt()` und `insert()` zum Entfernen bzw. Einfügen von Controls an einer bestimmten Position.

```typescript
const emails = new FormArray([
  new FormControl('mail@example.org', { nonNullable: true })
]);

// Neues Control hinzufügen
emails.push(new FormControl('other@example.org', { nonNullable: true }));

// Control an Position 0 entfernen
emails.removeAt(0);

// Control an Position 1 einfügen
emails.insert(1, new FormControl('third@example.org', { nonNullable: true }));
```

Mit dem Property `length` können wir die Anzahl der Elemente herausfinden, das Property `controls` liefert uns ein Array mit allen Controls, über das du nach Belieben mit den bekannten Bordmitteln wie `@for` iterieren kannst.
Damit ist es also ebenfalls möglich, dynamische Formulare zu entwickeln, bei denen wir zur Laufzeit Controls hinzufügen und entfernen können.

### Die Oberklasse AbstractControl

Die Klasse `AbstractControl` ist die Oberklasse für `FormControl`, `FormGroup`, `FormRecord` und `FormArray`.
Neben den spezifischen Schnittstellen besitzen also alle vier Bausteine die gleichen Eigenschaften und Methoden, um das Formular zu verwalten.

| Eigenschaft oder Methode | Beschreibung |
|--------------------------|--------------|
| `value` | Wert des Controls (nur aktivierte Felder) |
| `getRawValue()` | Wert des Controls (alle Felder, auch deaktivierte) |
| `enable()` | Control aktivieren |
| `disable()` | Control deaktivieren |
| `touched`, `untouched`, `dirty`, `pristine`, `valid`, `invalid` | Zustände des Controls |
| `errors` | Objekt mit allen Fehlern |
| `getError(e)` | liefert den Fehler mit dem Namen `e` |
| `hasError(e)` | prüft, ob ein Fehler mit dem Namen `e` existiert (Boolean) |
| `reset()` | Control zurücksetzen |
| `setValue(v)` | gesamten Wert des Controls setzen |
| `patchValue(v)` | Teile des Control-Werts setzen (für `FormGroup`, `FormRecord` und `FormArray`) |
| `valueChanges` | Änderungen am Wert überwachen (Observable) |
| `statusChanges` | Status des Controls überwachen (Observable) |

Bitte beachte, dass diese Eigenschaften keine Signals sind, sondern einfache Propertys.


### Komplexes Formularmodell

Mit den vier Bausteinen können wir in der Komponente ein komplexes Formularmodell definieren.

So können wir z. B. ein Formular für die Registrierung erstellen:

- Den Anmeldenamen können wir als einfaches Textfeld abbilden.
- Das Passwort und die Bestätigung des Passworts können wir zusammenhängend in einer Gruppe abfragen.
- Mehrere E-Mail-Adressen können wir in einer Liste erfassen.

Die Reise beginnt aber zunächst mit einer `FormGroup`, unter der sich das gesamte Formular aufspannt.
Diese `FormGroup` legen wir direkt in einem Property der Komponentenklasse ab.
Wir empfehlen dir, für jedes Feld die Option `nonNullable` zu setzen.

```typescript
protected readonly registerForm = new FormGroup({
  username: new FormControl('', { nonNullable: true }),
  password: new FormGroup({
    pw: new FormControl('', { nonNullable: true }),
    pwConfirm: new FormControl('', { nonNullable: true })
  }),
  emails: new FormArray([
    new FormControl('', { nonNullable: true })
  ])
});
```

In der `FormGroup` können wir ein einfaches Feld für `username` direkt mit einem `FormControl` anlegen.
Für die Passworteingabe erzeugen wir eine verschachtelte `FormGroup`, die zwei separate Controls für das Passwort und die Bestätigung des Passworts beinhaltet. Diese Gruppierung hat den Vorteil, dass wir die Controls später zusammen validieren können.
Die E-Mail-Adressen sollen in einer Liste abgefragt werden.
Wir fassen also mehrere `FormControl`s in einem `FormArray` zusammen.

## Template mit dem Modell verknüpfen

Im Template der Komponente entwickeln wir das passende Markup für unser Formular.
Anschließend müssen wir die Formularfelder aus dem Template mit den Controls aus dem Modell verknüpfen.

Im ersten Schritt definieren wir auf dem umschließenden `<form>`-Element, für welche `FormGroup` dieses Formular verantwortlich ist.
Dafür existiert die Direktive `formGroup`, an die wir direkt unser gesamtes Formularmodell übergeben können.
Seit Angular 21.0 gibt es außerdem die Direktive `formArray`, um ein einzelnes `FormArray` mit der Wurzel des Formulars zu verknüpfen.

```html
<form [formGroup]="registerForm">
  <!-- Formularfelder -->
</form>

<!-- Ab Angular 21.0 auch möglich: -->
<form [formArray]="myFormArray">
  <!-- Formularfelder -->
</form>
```

Nun müssen wir die einzelnen Formularfelder im Template mit dem zugehörigen `FormControl` aus dem Modell verknüpfen.
Dafür existieren zwei Ansätze.

### Ansatz 1: formControlName mit Control-Namen

Alle Inhalte innerhalb von `<form>` befinden sich im Kontext des Modells `registerForm`.
Zur Verknüpfung der einzelnen Felder können wir deshalb den Namen des Controls verwenden:
Dazu setzen wir die Direktive `formControlName` ein und übergeben den Namen als String.
Unsere `FormGroup` besitzt das Feld `username`, also können wir das HTML wie folgt aufbauen:

```html
<form [formGroup]="registerForm">
  <label for="username">Username</label>
  <input id="username" formControlName="username">
</form>
```

> **`formControlName`:** Binde dieses Input-Feld an das Control mit dem Namen `username` aus der `FormGroup` im Property `registerForm`.

Dieser Weg wird in der Dokumentation von Angular beschrieben, er hat aber einen entscheidenden Nachteil:
Zur Verknüpfung notieren wir den Namen des Controls nur als losen String.
Ob aber überhaupt ein Control mit diesem Namen existiert, wird erst zur Laufzeit geprüft.
Geben wir hier einen falschen Namen an, erhalten wir keine Fehlermeldung im Editor.

Wir empfehlen deshalb, die typsichere zweite Variante mit der Direktive `formControl` zu verwenden.

### Ansatz 2: formControl mit Control-Referenz

Um mehr Typsicherheit zu erreichen, können wir eine Referenz auf das Control an das Input-Feld übergeben.
Zum Zugriff auf die einzelnen `FormControl`-Objekte verwenden wir die Eigenschaft `controls` auf der `FormGroup`.
Um ein Control direkt an ein Input-Feld zu binden, setzen wir schließlich die Direktive `formControl` ein.
Diese Referenz wird direkt im Editor ausgewertet. Beim Tippen profitieren wir von der Autovervollständigung, und Fehler werden sofort vom Compiler erkannt.
Wir empfehlen diese typsichere Variante ganz klar gegenüber der losen Kopplung mit dem Control-Namen.

```html
<form [formGroup]="registerForm">
  <label for="username">Username</label>
  <input id="username" [formControl]="registerForm.controls.username">
</form>
```

> **`formControl`:** Binde dieses Input-Feld an das Control aus `registerForm.controls.username`.

Die verschachtelte `FormGroup` für die doppelte Passworteingabe verknüpfen wir erneut mit der Direktive `formGroup` auf einem umschließenden Element (z. B. `<fieldset>`).
Innerhalb dieses Elements sprechen wir mit `formControl` die Controls aus dieser verschachtelten `FormGroup` an.
Die hierarchische Struktur des Formularmodells findet sich auch in der Hierarchie des Templates wieder.
Um die Ausdrücke im Template kurz und lesbar zu halten, können wir eine lokale Variable mit `@let` verwenden.

```html
<form [formGroup]="registerForm">
  <!-- ... -->
  <fieldset [formGroup]="registerForm.controls.password">
    @let pwGroup = registerForm.controls.password;

    <label for="pw">Password</label>
    <input id="pw" type="password" [formControl]="pwGroup.controls.pw">

    <label for="pwConfirm">Confirm Password</label>
    <input id="pwConfirm" type="password" [formControl]="pwGroup.controls.pwConfirm">
  </fieldset>
</form>
```

Für die Liste der E-Mail-Adressen wird es etwas aufwendiger.
Zunächst benötigen wir ein umschließendes Element (hier wieder `<fieldset>`), mit dem wir auf das `FormArray` zugreifen können.
Dazu setzen wir die Direktive `formArray` ein.
Damit das Formular dynamisch erweiterbar bleibt, legen wir die passenden Input-Felder allerdings nicht von Hand an.
Stattdessen nutzen wir `@for` und iterieren über die Controls aus dem `FormArray`, um stets die passende Anzahl Formularfelder zu erstellen.
Auf dem `FormArray` liefert das Property `controls` schließlich ein Array mit allen enthaltenen Controls.

```html
@let emailsArray = registerForm.controls.emails;
<fieldset [formArray]="emailsArray">
  @for (emailCtrl of emailsArray.controls; track $index) {
    <label [attr.for]="'email-' + $index">E-Mail {{ $index + 1 }}</label>
    <input [id]="'email-' + $index" type="email" [formControl]="emailCtrl">
  }
</fieldset>
```

Du siehst hier, dass wir bereits den Weg geebnet haben für ein hochdynamisches Formular.
Mit der Methode `push()` auf dem `FormArray` könnten wir nun zur Laufzeit weitere E-Mail-Felder hinzufügen – das Template wird dank `@for` automatisch aktualisiert.

## Eingebaute Validatoren nutzen

Angular stellt für Reactive Forms einige grundlegende Funktionen bereit, um die Formulareingaben zu validieren.
Diese eingebauten Validatoren sind in der Klasse `Validators` untergebracht.
Wir müssen sie in die Formularkomponente importieren:

```typescript
import { Validators } from '@angular/forms';
```

| Validator | Beschreibung |
|-----------|--------------|
| `required` | Das Feld muss ausgefüllt sein. |
| `requiredTrue` | Der Wert muss `true` sein (z. B. eine Checkbox, die angekreuzt sein muss). |
| `min(5)` | Die eingegebene Zahl muss größer oder gleich 5 sein. |
| `max(10)` | Die eingegebene Zahl muss kleiner oder gleich 10 sein. |
| `minLength(5)` | Es müssen mindestens 5 Zeichen angegeben werden. |
| `maxLength(10)` | Es dürfen höchstens 10 Zeichen angegeben werden. |
| `pattern('[a-z]*')` | Der Wert des Eingabefelds wird auf den angegebenen regulären Ausdruck geprüft. |
| `email` | Das Feld muss eine gültige E-Mail-Adresse beinhalten. |

Um die Controls mit den Validatoren zu verknüpfen, können wir sie bei der Erzeugung von `FormControl` notieren.
Dafür gibt es zwei Möglichkeiten:

- im zweiten Argument von `FormControl`
- in den Optionen des Controls

Das zweite Argument von `FormControl` kann entweder Validatoren oder das uns schon bekannte Objekt mit Optionen entgegennehmen.
Welchen der beiden Wege wir verwenden, hängt davon ab, ob wir andere Optionen setzen wollen, z. B. `nonNullable`.
In beiden Fällen können wir entweder einen einzigen Validator angeben oder ein Array von Validatorfunktionen notieren.

Bitte beachte, dass die Validatoren `required` und `email` direkt auf die Validatorfunktion referenzieren und deshalb ohne Funktionsklammern angegeben werden.
`minLength` und `maxLength` hingegen sind Factory-Funktionen, die erst beim Aufruf eine Validatorfunktion zurückgeben.
Das klingt kompliziert, macht es aber erst möglich, Argumente an einen Validator zu übergeben.

```typescript
// Ein Validator als zweites Argument
new FormControl('', Validators.required);

// Mehrere Validatoren als Array
new FormControl('', [Validators.required, Validators.minLength(3)]);

// Validatoren in den Optionen
new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(3)]
});
```

Geben wir mehrere Validatoren an, werden sie in dieser Reihenfolge ausgeführt.
Trotzdem generieren nicht immer alle Validatoren einen Fehler: `minLength` und `maxLength` ignorieren beispielsweise einen leeren Eingabewert.
`minLength` wird also erst dann aktiv, wenn überhaupt ein Wert eingegeben wurde und `required` nicht mehr anschlägt.

## Formularzustand verarbeiten

Ein Formularfeld kann unterschiedliche Zustände besitzen, die sich nach drei Fragestellungen richten:

| Zustand | ja | nein |
|---------|-----|------|
| Wurde das Control bedient? | `touched` | `untouched` |
| Wurde der Wert verändert? | `dirty` | `pristine` |
| Ist der Wert gültig? | `valid` | `invalid` |

Zusätzlich drückt der Zustand `pending` aus, dass eine asynchrone Validierung noch nicht abgeschlossen ist.

Die Zustände werden automatisch als CSS-Klassen auf die Formularfelder im Template angewendet.
Wir können diese Klassen also nutzen, um die Felder passend zu ihrem Zustand zu stylen.
Im folgenden Beispiel erhalten die Felder einen roten Rand, wenn das Control gleichzeitig `invalid` und `touched` ist.
Diese Kombination ist sinnvoll, damit der Fehlerzustand erst angezeigt wird, nachdem wir mit dem Formular interagiert haben.
Bitte beachte im Sinne der Barrierefreiheit, dass wir zusätzlich zur farblichen Unterscheidung noch andere visuelle Elemente verwenden sollten, um den Fehler hervorzuheben.

```css
input.ng-invalid.ng-touched {
  border-color: red;
}

input.ng-valid.ng-touched {
  border-color: green;
}
```

Um den Formularzustand programmatisch zu verarbeiten, benötigen wir Zugriff auf das `FormControl`.
Um z. B. im Template eine Meldung abhängig vom Zustand anzuzeigen, können wir so vorgehen:

```html
@let usernameControl = registerForm.controls.username;
@if (usernameControl.invalid && usernameControl.touched) {
  <div class="error">Username is required.</div>
}
```

Übrigens werden alle diese Zustände auch auf `FormGroup` und `FormArray` zur Verfügung gestellt.
Wie in einer guten Familie kennen also die Elternelemente immer den Zustand ihrer Kinder, und der Zustand wird nach oben vererbt.
Ist z. B. ein einzelnes `FormControl` im Zustand `invalid`, so ist auch die gesamte umgebende `FormGroup` ungültig.

## Formular abschicken

Um das Formular abzuschicken, benötigen wir zunächst einen Button vom Typ `submit`.
Er muss sich innerhalb des `<form>`-Elements befinden.
Wird das Formular schließlich in der Oberfläche abgeschickt, so wird ein passendes Event ausgelöst: `ngSubmit`.
Dieses Event können wir abonnieren und eine Methode ausführen:

```html
<form [formGroup]="registerForm" (ngSubmit)="submitForm()">
  <!-- Formularfelder -->
  <button type="submit">Submit</button>
</form>
```

In der Komponentenklasse müssen wir die Eingabewerte aus dem Formular weiterverarbeiten.
Die Klasse `AbstractControl` – und damit auch jede `FormGroup`, `FormArray` und `FormControl` – bietet dazu zwei Möglichkeiten.

Das Property `value` beinhaltet die Werte des Formulars, bei einer `FormGroup` ist das ein Objekt mit allen erfassten Daten.
Dabei sind allerdings nur die aktivierten Controls enthalten:
Verwenden wir die Methode `disable()`, um ein Control zu deaktivieren, kann das Formularfeld nicht mehr bedient werden.
Das führt auch dazu, dass der Wert in `value` nicht mehr enthalten ist.
Da theoretisch jedes Control zur Laufzeit deaktiviert werden kann, ist der Typ von `value` mit `Partial` definiert: `Partial` lockert die Typisierung eines Objekts, indem alle Eigenschaften optional gesetzt werden.

Arbeiten wir mit einem festgelegten Datenmodell wie einem `Book`, ist es unpraktisch, dass alle Felder optional sind. Der erfasste Formularwert ist so nicht mit dem Datenmodell kompatibel.
Deshalb liefert die Methode `getRawValue()` die Werte *aller* Felder – auch wenn sie deaktiviert sind.

```typescript
submitForm() {
  const formValue = this.registerForm.getRawValue();
  console.log(formValue);
  // Daten weiterverarbeiten, z. B. zum Server schicken
}
```

In der Praxis empfehlen wir dir, `getRawValue()` zu verwenden.
Falls du Controls zur Laufzeit deaktivieren möchtest, kann es sinnvoll sein, `value` zu nutzen, um die deaktivierten Felder nicht zu berücksichtigen.


## Absenden verhindern

Das Formular lässt sich immer absenden, auch wenn es ungültig ist.
So lassen sich also ungültige Eingaben speichern – und das ist möglicherweise nicht gewollt.

In unserem Blogartikel ["Barrierefreiheit in Formularen: Daten versenden"](https://angular-buch.com/blog/2026-03-form-submit-a11y) diskutieren wir verschiedene Aspekte rund um das Absenden von Formularen.
Dabei betonen wir vor allem, dass ein Submit-Button nicht deaktiviert werden sollte, um das Absenden zu verhindern.
Ein deaktivierter Button gibt keine Auskunft darüber, warum er nicht geklickt werden kann.
Das ist schlecht für die Usability und baut Bedienungsbarrieren auf.

Stattdessen gilt es als gute Praxis, den Zustand beim Absenden zu überprüfen.
Ist das Formular ungültig, brechen wir den Vorgang ab.
Außerdem können wir dann alle Felder als `touched` markieren, sodass die zugehörigen Fehlermeldungen sichtbar werden.

```typescript
submitForm() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  // Absenden ausführen …
}
```


## Formular zurücksetzen

Nachdem das Formular erfolgreich abgeschickt wurde, können wir alle Felder auf ihren Ausgangszustand zurücksetzen.
Das betrifft nicht nur die Formularwerte, sondern auch die Zustände des Formulars.
Alle Controls besitzen dazu eine passende Methode `reset()`.

Rufen wir `reset()` ohne Argument auf, werden die Felder entweder auf ihren definierten Startwert zurückgesetzt (falls `nonNullable` aktiviert ist) oder auf den Wert `null`.
Alternativ können wir im Argument einen neuen Wert angeben, auf den das Formular zurückgesetzt werden soll.

```typescript
// Formular auf Startwerte zurücksetzen
this.registerForm.reset();

// Formular auf bestimmte Werte zurücksetzen
this.registerForm.reset({
  username: 'default',
  password: { pw: '', pwConfirm: '' },
  emails: ['']
});
```

## Formularwerte setzen

Um die Werte unseres Formulars programmatisch zu überschreiben, besitzen alle Controls zwei passende Methoden: `setValue()` und `patchValue()`.
Diese beiden Hilfsmittel klingen zunächst ähnlich, haben aber einen subtilen Unterschied.

Mit `setValue()` können wir die Werte des *gesamten* Controls neu setzen.
Wenden wir diese Methode auf einer `FormGroup` oder einem `FormArray` an, so müssen wir als Argument immer die exakte und vollständige Struktur übergeben – andernfalls wird ein Fehler geworfen.
Das klingt sehr strikt, sorgt aber dafür, dass wirklich alle Felder neu gesetzt werden.

Möchten wir nicht das gesamte Formular überschreiben, sondern nur *einzelne* Felder, ist die Methode `patchValue()` die richtige Wahl.
Das übergebene Objekt kann eine Auswahl von Feldern enthalten, deren Werte im Formular überschrieben werden.

```typescript
// Alle Felder setzen (muss vollständig sein)
this.registerForm.setValue({
  username: 'newuser',
  password: { pw: 'secret', pwConfirm: 'secret' },
  emails: ['mail@example.org']
});

// Nur einzelne Felder setzen
this.registerForm.patchValue({
  username: 'newuser'
});
```

Wollen wir den Wert für ein einzelnes `FormControl` setzen, das nur einen String erfasst, ist die Bedeutung der beiden Methoden gleich. Wir empfehlen dir, in diesem Fall `setValue()` zu verwenden.
Der Unterschied ist nur bei `FormGroup`, `FormArray` und `FormRecord` interessant.

## Änderungen überwachen

Stell dir einmal einen komplexen Anwendungsfall vor:
Du möchtest anhand der Formulareingaben Berechnungen durchführen und die Ergebnisse live anzeigen.
Abstrakt formuliert möchtest du also Änderungen an den Formularwerten überwachen und mit Aktionen darauf reagieren.
Die Bezeichnung *Reactive Forms* kommt nicht von ungefähr: Die reaktive Denkweise versteckt sich auch in unseren Formularelementen und erlaubt es uns, flexibel mit den Eingaben umzugehen.

Jedes Control besitzt dafür zwei besondere Propertys: `valueChanges` und `statusChanges`.
Dahinter verstecken sich Observables, die immer dann ein Element ausgeben, wenn sich der Formularwert (`valueChanges`) oder der Zustand (`statusChanges`) ändert.
Der Zustand wird als Zeichenkette vom Typ `FormControlStatus` repräsentiert, die einen der folgenden Werte annimmt: `VALID`, `INVALID`, `PENDING`, `DISABLED`.
Wie bei jedem Observable können wir diese Änderungen abonnieren und weiterverarbeiten.
Mit den Möglichkeiten von RxJS lassen sich so komplexe Anwendungsfälle umsetzen.

```typescript
this.registerForm.controls.username.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(value => {
  console.log('Username changed:', value);
});

this.registerForm.statusChanges.subscribe(status => {
  console.log('Form status:', status);
});
```

Ein praktischer Anwendungsfall ist die Typeahead-Suche, bei der die Formulareingaben zunächst entprellt werden, sodass nicht zu viele Elemente kurz nacheinander im Datenstrom ausgegeben werden.

## Zusammenfassung

- Um Reactive Forms zu verwenden, müssen wir das `ReactiveFormsModule` importieren.
- Das Formularmodell wird in der Komponentenklasse erstellt. Wir verwenden dazu die Bausteine `FormControl`, `FormGroup`, `FormArray` und `FormRecord`.
- Die Bausteine können verschachtelt werden. Am Anfang steht fast immer eine `FormGroup`, jedes logische Formularfeld erhält ein `FormControl`.
- Der Typ eines Controls wird durch den eingegebenen Startwert ermittelt. Zusätzlich ist immer `null` als möglicher Wert enthalten.
- Ein `FormControl` kann mit der Option `nonNullable` erstellt werden. Dadurch wird der Typ `null` verboten. Wir empfehlen, `nonNullable` immer auf `true` zu setzen.
- Um das Template mit dem Formularmodell zu verknüpfen, setzen wir die Direktive `[formGroup]="myForm"` bzw. `[formArray]="myForm"` ein.
- Die Direktive `[formControl]` stellt eine typsichere Verknüpfung zu einem Control her. Wir empfehlen diesen Ansatz gegenüber `formControlName`.
- Validatoren werden bei der Initialisierung der Controls angegeben.
- Die Klasse `Validators` stellt einige eingebaute Validatoren bereit: `required`, `requiredTrue`, `min`, `max`, `minLength`, `maxLength`, `pattern` und `email`.
- Die Propertys `valueChanges` und `statusChanges` auf jedem Control geben Auskunft über Wert- und Statusänderungen.
- Um Controls zu deaktivieren, nutzen wir nicht das Attribut `disabled` im Template, sondern die Methoden `disable()` und `enable()` auf den Controls.

## Empfehlung: Signal Forms

Reactive Forms sind eine gute Wahl für komplexe Formulare mit dynamischen Anforderungen oder verschachtelten Daten.
Gleichzeitig ist dieser Ansatz aber nicht kompatibel mit Signals und integriert sich so nicht mehr gut in die modernen Strukturen von Angular.
Wir empfehlen deshalb, den neuen Ansatz **Signal Forms** zu verwenden.

Reactive Forms wird allerdings noch einige Jahre Bestand haben: Viele Projekte setzen auf dieses Modell, und es wird noch einige Zeit dauern, bis die letzte Anwendung zu Signal Forms migriert wurde.
Reactive Forms ist deshalb ein lohnenswerter Ansatz für Projekte, die noch mit einer älteren Angular-Version (vor Angular 22) arbeiten, oder wenn eine Migration auf Signal Forms (noch) nicht möglich ist.
