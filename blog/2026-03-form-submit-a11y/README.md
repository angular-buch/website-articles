---
title: 'Barrierefreiheit in Formularen -- Daten versenden'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2026-03-01
lastModified: 2026-03-01
keywords:
  - Angular
  - Signals
  - Forms
  - Signal Forms
  - ARIA
  - a11y
  - accessibility
  - Focus Handling
language: de
header: todo.jpg
sticky: false
---

Wenn Nutzende ein Formular absenden, das noch Fehler enthält, entscheidet die Reaktion der Anwendung über die Benutzerfreundlichkeit.
Gerade für Menschen, die auf Screenreader oder Tastaturnavigation angewiesen sind, ist ein durchdachtes Verhalten beim Absenden essenziell.
In diesem Artikel betrachten wir verschiedene Varianten, wie wir bei der Nutzung von Angular Signal Forms auf ein ungültiges Absenden reagieren können.

> ⚠️ **Experimentelles Feature:** Signal Forms sind aktuell ein experimentelles Feature in Angular. Die API kann sich in zukünftigen Releases noch ändern.

<!-- Playground: https://stackblitz.com/edit/angular-signal-forms-submit-a11y -->

## Inhalt

[[toc]]

## Ausgangslage

Wir verwenden als Grundlage ein einfaches Registrierungsformular mit Signal Forms.
Die Fehlermeldungen werden mit Standard-HTML und Angular Control Flow (`@if`) umgesetzt.
Für die Barrierefreiheit nutzen wir die Attribute `aria-invalid` und `aria-describedby`.

Die folgende Komponente zeigt das Grundgerüst.
Zu jedem Eingabefeld zeigen wir eine Fehlermeldung an, die beschreibt, welche Eingabe erwartet wird.
Diese Meldung wird erst sichtbar, nachdem das Feld berührt wurde – also wenn Nutzende es betreten und wieder verlassen haben oder wenn ein Submit-Versuch stattgefunden hat.
Wir verknüpfen die Meldung mit dem Eingabefeld, indem wir das Attribut `aria-describedby` verwenden.
So liest der Screenreader die Fehlermeldung automatisch vor, sobald das Eingabefeld fokussiert wird.

```typescript
import { Component, signal } from '@angular/core';
import {
  form, schema, required, minLength,
  FormField, FormRoot, FieldTree,
} from '@angular/forms/signals';

interface RegisterFormData {
  username: string;
  email: string;
}

const formSchema = schema<RegisterFormData>((path) => {
  required(path.username, { message: 'Username is required.' });
  minLength(path.username, 3, {
    message: 'Username must have at least 3 characters.',
  });
  required(path.email, { message: 'Email address is required.' });
  email(path.email, {
    message: 'Email address must be valid (e. g. user@exmaple.org).',
  });
});

@Component({
  selector: 'app-registration-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="registrationForm">
      <label for="field-username">Username</label>
      <input
        type="text"
        id="field-username"
        [formField]="registrationForm.username"
        [aria-invalid]="ariaInvalidState(registrationForm.username)"
        [aria-describedby]="displayError(registrationForm.username) ? 'username-hint' : null"
      />
      @let usernameError = displayError(registrationForm.username);
      @if (usernameError) {
        <small id="username-hint">{{ usernameError }}</small>
      }

      <label for="field-email">E-Mail</label>
      <input
        type="email"
        id="field-email"
        [formField]="registrationForm.email"
        [aria-invalid]="ariaInvalidState(registrationForm.email)"
        [aria-describedby]="displayError(registrationForm.email) ? 'email-hint' : null"
      />
      @let emailError = displayError(registrationForm.email);
      @if (emailError) {
        <small id="email-hint">{{ emailError }}</small>
      }

      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationForm {
  protected registrationModel = signal<RegisterFormData>({
    username: '',
    email: '',
  });

  protected readonly registrationForm = form(
    this.registrationModel,
    formSchema,
  );

  protected displayError(field: FieldTree<unknown>) {
    return (field().touched() && field().errors().at(0)?.message) || '';
  }

  protected ariaInvalidState(field: FieldTree<unknown>): boolean | undefined {
    return field().touched() && !field().pending()
      ? field().errors().length > 0
      : undefined;
  }
}
```

Die Hilfsmethode `ariaInvalidState()` liefert `true`, wenn das Feld berührt wurde und Fehler enthält, `false` wenn es berührt und gültig ist, und `undefined` wenn es noch nicht berührt wurde.
Durch den Wert `undefined` wird das Attribut `aria-invalid` gar nicht erst gesetzt – Screenreader melden also kein Feld als ungültig, bevor es berührt wurde.
Die zweite Methode `displayError()` ermittelt, ob die Fehlermeldung im Template angezeigt wird.
Sie liefert `true`, sobald das Feld berührt wurde und Fehler vorliegen.
Dadurch sehen Nutzende die Fehlermeldungen erst, nachdem sie ein Feld betreten und wieder verlassen haben – oder nachdem ein Submit-Versuch alle Felder als `touched` markiert hat.
Auch das Attribut `aria-describedby` wird erst dann gesetzt, damit der Screenreader die Fehlermeldung nur vorliest, wenn sie tatsächlich sichtbar ist.

Die zentrale Frage lautet: **Was passiert, wenn Nutzende versuchen auf "Register" zu klicken und das Formular ungültig ist?**

Dafür gibt es mehrere Strategien, die wir im Folgenden detailliert betrachten.

## Variante 1: Submit-Button deaktivieren (`disabled`)

Die einfachste Variante ist, den Submit-Button zu deaktivieren, solange das Formular ungültig ist.
So kann das Formular gar nicht erst abgesendet werden, wenn Fehler vorliegen.
Dafür können wir den Zustand `invalid()` verwenden, der auf dem `FieldState` des obersten Formularknotens bereitgestellt wird.

```html
<button type="submit" [disabled]="registrationForm().invalid()">
  Register
</button>
```

> 💡 Die Zustände `valid` und `invalid` sind keine exakten Gegenteile. `invalid()` liefert `true`, sobald Validierungsfehler vorliegen, unabhängig davon, ob noch asynchrone Validierungen ausstehen. `valid()` liefert hingegen nur `true`, wenn keine Fehler vorliegen *und* keine Validierung mehr aussteht (`pending`). Während einer laufenden asynchronen Validierung ist also `invalid()` bereits `false` (keine Fehler bekannt), aber `valid()` ebenfalls noch `false` (weil noch Ergebnisse ausstehen). In unserem Beispiel verwenden wir keine asynchrone Validierung, sodass wir diesen Sonderfall hier vernachlässigen können.

Die Implementierung ist zwar denkbar einfach und verhindert ungültige Absendungen zuverlässig, bringt aber erhebliche Nachteile mit sich.
Nutzende erhalten keinerlei Feedback darüber, *warum* der Button deaktiviert ist – besonders für Screenreader-Nutzende ist das frustrierend.
Bei komplexen Formularen mit vielen Feldern ist nicht ersichtlich, welches Feld den Fehler verursacht, und Nutzende müssen selbst suchen.
Deaktivierte Buttons werden in den meisten Browsern nicht fokussiert, sodass Tastaturnutzende den Button gar nicht erst erreichen.
Wenn das Formular initial leer ist, ist der Button sofort deaktiviert, ohne dass der Grund dafür erkennbar ist.

> **Empfehlung:** Diese Variante ist nicht zu empfehlen! Die [WCAG-Richtlinien](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html) fordern, dass Fehler identifiziert und beschrieben werden. Ein deaktivierter Button allein erfüllt diese Anforderung nicht.

## Variante 2: deaktivierter Button mit `aria-describedby`

Falls man sich dennoch für einen deaktivierten Button entscheidet, sollte man zumindest einen Hinweis geben, warum der Button nicht klickbar ist.
Das kann mit dem Attribut `aria-describedby` umgesetzt werden: Es gibt an, durch welche anderen HTML-Elemente das Element genauer beschrieben wird.

```html
@let isFormInvalid = registrationForm().invalid();
<button type="submit"
  [disabled]="isFormInvalid"
  [aria-describedby]="isFormInvalid ? 'submit-hint' : null"
>
  Register
</button>

@if (isFormInvalid) {
  <p id="submit-hint" class="hint">
    Please fill in all required fields correctly to submit the form.
  </p>
}
```

Der Vorteil: Screenreader lesen den Hinweis vor, wenn der Button angesteuert wird, und auch sehende Nutzende erkennen den Hinweistext.
Allerdings bleibt der Button weiterhin deaktiviert, sodass die grundsätzlichen Probleme aus Variante 1 bestehen bleiben.
Nutzende erfahren außerdem nicht, *welche* Felder konkret fehlerhaft sind.

> Diese Variante ist eine Verbesserung gegenüber Variante 1, löst aber das Grundproblem nicht: Nutzende werden nicht aktiv zu den fehlerhaften Feldern geführt.
> Die Variante ist für sehr simple Formulare mit wenigen und klar erkenntlichen Eingabefeldern unter Umständen akzeptabel (z. B. Login mit Anmeldename und Passwort).

## Variante 3: Fehlerzusammenfassung (Error Summary)

Eine besonders barrierefreie Variante ist die Anzeige einer Fehlerzusammenfassung.
Diese Zusammenfassung listet alle Fehler auf und verlinkt sie mit den jeweiligen Feldern.
Dieses Muster wird u. a. vom [GOV.UK Design System](https://design-system.service.gov.uk/components/error-summary/) empfohlen und ist ein bewährtes Pattern für barrierefreie Formulare.

Bei dieser Variante bleibt der Submit-Button immer aktiv.
Nutzende können jederzeit versuchen, das Formular abzusenden.
Erst beim Klick auf "Register" wird geprüft, ob das Formular gültig ist.
Nach einem fehlgeschlagenen Submit wird eine Zusammenfassung aller Fehler angezeigt.
Jeder Eintrag ist ein einfacher Link `<a href="#field-id">`, der auf die `id` des zugehörigen Eingabefelds verweist.
Da `<input>`-Elemente von Natur aus fokussierbar sind, scrollt der Browser beim Klick auf den Link automatisch zum Feld und setzt den Fokus – ganz ohne zusätzliches JavaScript.

Die Fehlerzusammenfassung wird direkt im Template der Formular-Komponente umgesetzt.
Über `errorSummary()` erhalten wir die Liste aller aktuellen Fehler und können mit `@for` darüber iterieren:

```html
<form [formRoot]="registrationForm">
  <label for="field-username">Username</label>
  <input
    type="text"
    id="field-username"
    [formField]="registrationForm.username"
    [aria-invalid]="ariaInvalidState(registrationForm.username)"
    [aria-describedby]="displayError(registrationForm.username) ? 'username-hint' : null"
  />
  @if (displayError(registrationForm.username)) {
    <p id="username-hint">
      Username with at least 3 characters is required.
    </p>
  }

  <!-- ... more fields ... -->

  <button type="submit">Register</button>
</form>

<div role="alert">
  @if (registrationForm().errorSummary().length) {
    <ul>
      @for (error of registrationForm().errorSummary(); track $index) {
        <li>
          <a href="#{{ error.fieldTree().formFieldBindings()[0].element.id }}">
            {{ error.message }}
          </a>
        </li>
      }
    </ul>
  }
</div>
```

Damit die Links funktionieren, muss jedes Eingabefeld eine `id` besitzen (z. B. `id="field-username"`).
Der Ausdruck `error.fieldTree().formFieldBindings()[0].element.id` greift dabei auf das erste gebundene DOM-Element des fehlerhaften Felds zu und liest dessen `id` aus – so wird der Link dynamisch auf das richtige Eingabefeld gesetzt.
Der Link `<a href="#field-username">` scrollt dann zum Feld und fokussiert es.
Da die Zusammenfassung mit `role="alert"` ausgezeichnet ist, wird sie von Screenreadern sofort vorgelesen, sobald sie im DOM erscheint.
Nutzende erhalten so einen vollständigen Überblick über alle Fehler und können per Klick direkt zum jeweiligen Feld navigieren.
Der einzige Nachteil ist etwas mehr Template-Code.
Außerdem wird die Zusammenfassung erst nach dem Submit-Versuch angezeigt, nicht bei jeder Feldänderung.

## Variante 4: Fokussieren des ersten ungültigen Felds

Diese Variante nutzt das `onInvalid`-Callback in der Submission-Konfiguration von Signal Forms.
Die Funktion wird ausgeführt, wenn das Formular ungültig abgeschickt wird.
Außerdem werden alle Felder automatisch als `touched` markiert, sodass die Fehlermeldungen sichtbar werden.

Wir verwenden `onInvalid`, um den Fokus auf das erste fehlerhafte Feld zu setzen.

Auch hier bleibt der Submit-Button immer aktiv.

```typescript
protected readonly registrationForm = form(
  this.registrationModel,
  formSchema,
  {
    submission: {
      action: async (form) => {
        // ... submit logic
      },
      onInvalid: (form) => {
        const errors = form().errorSummary();
        errors.at(0)?.fieldTree().focusBoundControl();
      }
    },
  }
);
```

Wenn Nutzende auf "Register" klicken und das Formular ungültig ist, wird das `onInvalid`-Callback aufgerufen.
Dabei werden alle Felder automatisch als `touched` markiert, sodass `displayError()` für fehlerhafte Felder `true` liefert und die Fehlermeldungen im Template erscheinen.
Über `errorSummary()` erhalten wir die Liste aller aktuellen Fehler über das gesamte Formular.
Die Methode `focusBoundControl()` setzt den Browserfokus auf das erste gebundene DOM-Element in DOM-Reihenfolge.
Wird sie auf einem übergeordneten `FieldState` aufgerufen, etwa auf dem gesamten Formular statt auf einem einzelnen Feld, fokussiert sie das erste Kindelement in DOM-Reihenfolge – das ist besonders bei verschachtelten Formularstrukturen nützlich.

Der große Vorteil: Nutzende werden direkt zum Problem geführt, und der Screenreader liest die Fehlermeldung des fokussierten Felds automatisch vor, denn das fokussierte Feld ist über `aria-describedby` mit seiner Fehlermeldung verknüpft.
Der Submit-Button bleibt immer aktiv, und der Implementierungsaufwand ist gering.
Allerdings sehen Nutzende nur den *ersten* Fehler im Fokus. Weitere Fehler sind zwar sichtbar (weil alle Felder als `touched` markiert werden), aber es gibt keinen zusammenfassenden Überblick.
Dieses Problem lässt sich jedoch abmildern: Wenn die Fehlermeldungen der einzelnen Felder mit `role="alert"` als ARIA-Live-Regionen ausgezeichnet werden, sagt der Screenreader auch die übrigen Fehlermeldungen an, sobald sie im DOM erscheinen – obwohl nur das erste Feld fokussiert wird.
Außerdem erreichen Nutzende die weiteren fehlerhaften Felder vom fokussierten Feld aus im normalen Ablauffluss per Tab-Taste, sofern nicht explizit woanders hingesprungen wird.

> Gerade bei komplexen oder langen Formularen kann sich auch eine Kombination beider Ansätze lohnen: Die Fehlerzusammenfassung gibt den Überblick, und zusätzlich wird das erste fehlerhafte Feld fokussiert. Über die Links in der Zusammenfassung können Nutzende dann gezielt zu den einzelnen Feldern navigieren.

## Vergleich der Varianten

| Variante                           | Screenreader-Feedback              | Fehlerüberblick                 | Aufwand        | Empfehlung                       |
| ---------------------------------- | ---------------------------------- | ------------------------------- | -------------- | -------------------------------- |
| 1: `disabled`                      | ❌ Kein Feedback                   | ❌ Kein Überblick               | ⭐ Gering      | ❌ Niemals       |
| 2: `disabled` + `aria-describedby` | ⚠️ Nur allgemeiner Hinweis        | ❌ Kein Überblick               | ⭐⭐ Gering    | ⚠️ Nur für sehr einfache Formulare            |
| 3: Fehlerzusammenfassung           | ✅ Zusammenfassung wird vorgelesen | ✅ Alle Fehler sichtbar + Links | ⭐⭐⭐ Mittel  | ✅ Empfohlen                     |
| 4: Fokus auf erstes Feld           | ✅ Fehlermeldung wird vorgelesen   | ⚠️ Nur erstes Feld im Fokus    | ⭐⭐ Mittel    | ✅ Empfohlen                     |

## Zusammenfassung und Empfehlung

Für barrierefreie Formulare empfehlen wir die Varianten 3 oder 4.
Der Submit-Button sollte nicht dauerhaft deaktiviert werden, damit Nutzende jederzeit versuchen können, das Formular abzusenden.
Über das Callback `onInvalid` lässt sich gezielt auf ungültige Absendeversuche reagieren.
Variante 4 – den Fokus auf das erste fehlerhafte Feld setzen – ist mit Signal Forms in wenigen Zeilen umgesetzt und eine gute Standardlösung.
Bei Formularen mit vielen Feldern lohnt sich zusätzlich eine Fehlerzusammenfassung (Variante 3), die alle Fehler auflistet und mit den Feldern verlinkt.
Gerade bei komplexen oder langen Formularen empfiehlt es sich, beide Ansätze zu kombinieren: Die Fehlerzusammenfassung gibt den Überblick, der Fokus auf das erste Feld führt Nutzende direkt zum Problem.
ARIA-Attribute sollten konsequent eingesetzt werden: `aria-describedby` verknüpft Felder mit ihren Hinweisen, `aria-invalid` markiert fehlerhafte Felder, und `role="alert"` sorgt dafür, dass Screenreader Änderungen sofort vorlesen.

Die Kombination aus `onInvalid`, `errorSummary()`, `focusBoundControl()` und einfachen ARIA-Attributen macht Signal Forms zu einem starken Werkzeug für barrierefreie Formulare in Angular.
