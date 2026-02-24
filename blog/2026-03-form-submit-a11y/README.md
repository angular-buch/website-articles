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

## Inhalt

[[toc]]

## Ausgangslage

Wir verwenden als Grundlage ein einfaches Registrierungsformular mit Signal Forms.
Die Fehlermeldungen werden mit Standard-HTML und Angular Control Flow (`@if`) umgesetzt.
Für die Barrierefreiheit nutzen wir `aria-invalid`, `aria-describedby` und `role="alert"`.

Die folgende Komponente zeigt das Grundgerüst.
Wri wollen das Beispiel einfach halten und zu jedem Eingabefeld immer einen kurzen Hinweis anzeigen, welche Eingabe erwartet wird.
Dieser unterstützt uns sowohl initial beim ausfüllen des Formulars als auch im Fehlerfall.
Wir verknüpfen ihn über das `aria-describedby`Attribut mit dem Eingabefeld.
So wissen auch Screenreader-Nutzende sofort, was erwartet wird, da die Information angesagt wird, sobald das Eingabefeld betreten wird.

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
  required(path.username, { message: 'Benutzername ist erforderlich.' });
  minLength(path.username, 3, { message: 'Mindestens 3 Zeichen.' });
  required(path.email, { message: 'E-Mail ist erforderlich.' });
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
        aria-describedby="username-hint"
        [formField]="registrationForm.username"
        [aria-invalid]="ariaInvalidState(registrationForm.username)"
      />
      <p id="username-hint">
        Der Benutzername muss mindestens 3 Zeichen haben.
      </p>

      <label for="field-email">E-Mail</label>
      <input
        type="email"
        id="field-email"
        aria-describedby="email-hint"
        [formField]="registrationForm.email"
        [aria-invalid]="ariaInvalidState(registrationForm.email)"
      />
      <p id="email-hint">
        Die E-Mail-Adresse muss angegeben werden.
      </p>

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

  protected ariaInvalidState(field: FieldTree<unknown>): boolean | undefined {
    return field().touched() && !field().pending()
      ? field().errors().length > 0
      : undefined;
  }
}
```

Die Hilfsmethode `ariaInvalidState()` liefert `true`, wenn das Feld berührt wurde und Fehler enthält, `false` wenn es berührt und gültig ist, und `undefined` wenn es noch nicht berührt wurde.
Durch `undefined` wird das Attribut `aria-invalid` gar nicht erst gesetzt – Screenreader melden also kein Feld als ungültig, bevor es berührt wurde.

Die zentrale Frage lautet: **Was passiert, wenn Nutzende versuchen auf "Register" zu klicken und das Formular ungültig ist?**

Dafür gibt es mehrere Strategien, die wir im Folgenden detailliert betrachten.

## Variante 1: Submit-Button deaktivieren (`disabled`)

Die einfachste Variante ist, den Submit-Button zu deaktivieren, solange das Formular ungültig ist.
So kann das Formular gar nicht erst abgesendet werden, wenn Fehler vorliegen.

```html
<button type="submit" [disabled]="!registrationForm().valid()">
  Register
</button>
```

**Vorteile:**

- Einfach zu implementieren.
- Verhindert ungültige Absendungen zuverlässig.

**Nachteile:**

- **Schlechte Barrierefreiheit:** Nutzende erhalten kein Feedback darüber, *warum* der Button deaktiviert ist. Besonders für Screenreader-Nutzende ist ein deaktivierter Button ohne Erklärung frustrierend.
- **Schlechte UX bei komplexen Formularen:** Bei vielen Feldern ist nicht sofort ersichtlich, welches Feld den Fehler verursacht. Nutzende müssen selbst suchen.
- **Probleme mit Tastaturnavigation:** Deaktivierte Buttons werden in manchen Browsern nicht fokussiert, sodass Tastaturnutzende den Button gar nicht erst erreichen.
- **Kein Feedback bei Erstbefüllung:** Wenn das Formular initial leer ist, ist der Button sofort deaktiviert. Nutzende können nicht in jedem Fall sofort den Grund dafür erkennen.

> **Empfehlung:** Diese Variante ist nicht empfehlenswert und wir wollen hiervon abraten. Die [WCAG-Richtlinien](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html) fordern, dass Fehler identifiziert und beschrieben werden. Ein deaktivierter Button allein erfüllt diese Anforderung nicht.

## Variante 2: Deaktivierter Button mit `aria-describedby`

Falls man sich für einen deaktivierten Button entscheidet, sollte man zumindest einen Hinweis geben, warum der Button nicht klickbar ist.
Das geht mit `aria-describedby`:

```html
<button type="submit"
  [disabled]="!registrationForm().valid()"
  [attr.aria-describedby]="!registrationForm().valid() ? 'submit-hint' : null"
>
  Register
</button>

@if (!registrationForm().valid()) {
  <p id="submit-hint" class="hint">
    Bitte fülle alle Pflichtfelder korrekt aus, um das Formular abzusenden.
  </p>
}
```

**Vorteile:**

- Screenreader lesen den Hinweis vor, wenn der Button fokussiert wird.
- Sehende Nutzende sehen den Hinweistext.

**Nachteile:**

- Der Button ist weiterhin deaktiviert – die grundsätzlichen Probleme aus Variante 1 bleiben bestehen.
- Nutzende erfahren nicht, *welche* Felder fehlerhaft sind.

> Diese Variante ist eine Verbesserung gegenüber Variante 1, löst aber das Grundproblem nicht: Nutzende werden nicht aktiv zu den fehlerhaften Feldern geführt.
> Die Variante ist für sehr simple Formular mit wenigen und klar erkenntlichen Eingabefeldern unter Umständen akzeptabel (z. B. Login mit Benutzername / Passwort).

## Variante 3: Fehlerzusammenfassung (Error Summary)

Eine besonders barrierefreie Variante ist die Anzeige einer Fehlerzusammenfassung oberhalb des Formulars.
Diese Zusammenfassung listet alle Fehler auf und verlinkt sie mit den jeweiligen Feldern.
Dieses Muster wird u. a. vom [GOV.UK Design System](https://design-system.service.gov.uk/components/error-summary/) empfohlen und ist ein bewährtes Pattern für barrierefreie Formulare.

Bei dieser Variante bleibt der Submit-Button immer aktiv.
Nutzende können jederzeit versuchen, das Formular abzusenden.
Erst beim Klick auf "Register" wird geprüft, ob das Formular gültig ist.
Nach einem fehlgeschlagenen Submit wird eine Zusammenfassung aller Fehler angezeigt.
Jeder Eintrag ist ein einfacher `<a href="#field-id">`-Link, der auf die `id` des zugehörigen Eingabefelds verweist.
Da `<input>`-Elemente von Natur aus fokussierbar sind, scrollt der Browser beim Klick auf den Link automatisch zum Feld und setzt den Fokus – ganz ohne zusätzliches JavaScript.

Die Fehlerzusammenfassung wird direkt im Template der Formular-Komponente umgesetzt.
Über `errorSummary()` erhalten wir die Liste aller aktuellen Fehler:

```html
<form [formRoot]="registrationForm">
  <label for="field-username">Username</label>
  <input
    type="text"
    id="field-username"
    aria-describedby="username-hint"
    [formField]="registrationForm.username"
    [aria-invalid]="ariaInvalidState(registrationForm.username)"
  />
  <p id="username-hint">
    Der Benutzername muss mindestens 3 Zeichen haben.
  </p>

  <!-- ... weitere Felder ... -->

  <button type="submit">Register</button>
</form>

<div role="alert">
  @if (registrationForm().errorSummary().length) {
    <h2>Es gibt Fehler im Formular</h2>
    <ul>
      @for (error of registrationForm().errorSummary(); track $index) {
        <li>
          <a href="#{{ error.fieldTree().boundControl()?.id }}">
            {{ error.message }}
          </a>
        </li>
      }
    </ul>
  }
</div>
```

Damit die Links funktionieren, muss jedes Eingabefeld eine `id` besitzen (z. B. `id="field-username"`).
Der Link `<a href="#field-username">` scrollt dann zum Feld und fokussiert es.
Da die Zusammenfassung mit `role="alert"` ausgezeichnet ist, wird sie von Screenreadern sofort vorgelesen, sobald sie im DOM erscheint.

**Vorteile:**

- **Vollständiger Überblick:** Nutzende sehen alle Fehler auf einen Blick.
- **Navigation per Link:** Ein Klick auf einen Fehler scrollt zum Feld und setzt den Fokus – ohne JavaScript.
- **Screenreader-freundlich:** Durch `role="alert"` wird die Zusammenfassung sofort vorgelesen.
- **Bewährtes Pattern:** Dieses Muster wird von vielen Accessibility-Richtlinien empfohlen.

**Nachteile:**

- Etwas mehr Template-Code.
- Die Zusammenfassung wird erst nach dem Submit-Versuch angezeigt, nicht bei jeder Feldänderung.

## Variante 4: Fokussieren des ersten ungültigen Feldes

Diese Variante nutzt den `onInvalid`-Callback der Submission-Konfiguration von Signal Forms.
Wenn das Formular ungültig ist, wird der Fokus automatisch auf das erste fehlerhafte Feld gesetzt.
Gleichzeitig werden alle Felder als `touched` markiert, sodass die Fehlermeldungen sichtbar werden.

Auch hier bleibt der Submit-Button immer aktiv.

```typescript
protected readonly registrationForm = form(
  this.registrationModel,
  formSchema,
  {
    submission: {
      action: async (form) => {
        // ... Absende-Logik
      },
      onInvalid: (form) => {
        const errors = form().errorSummary();
        errors.at(0)?.fieldTree().focusBoundControl();
      }
    },
  }
);
```

Der Ablauf ist nun folgender:

1. Nutzende klicken auf "Register".
2. Signal Forms erkennt, dass das Formular ungültig ist, und ruft `onInvalid` auf.
3. Alle Felder werden automatisch als `touched` markiert – die Fehlermeldungen erscheinen.
4. `errorSummary()` liefert eine Liste aller aktuellen Fehler über das gesamte Formular.
5. `focusBoundControl()` setzt den Browserfokus auf das Eingabefeld des ersten Fehlers.
6. Da das Feld über `aria-describedby` mit der Fehlermeldung verknüpft ist, liest der Screenreader die Fehlermeldung automatisch vor.

**Vorteile:**

- Nutzende werden direkt zum Problem geführt.
- Screenreader lesen die Fehlermeldung des fokussierten Felds vor.
- Der Submit-Button bleibt immer aktiv – Nutzende können jederzeit versuchen abzusenden.
- Wenig Implementierungsaufwand.

**Nachteile:**

- Nutzende sehen nur den *ersten* Fehler im Fokus. Weitere Fehler sind zwar sichtbar (weil alle Felder `touched` sind), aber es gibt keinen Überblick.
- Bei langen Formularen kann es verwirrend sein, wenn der Fokus plötzlich an eine andere Stelle springt.

> Gerade bei komplexen oder langen Formularen kann sich auch eine Kombination beider Ansätze lohnen: Die Fehlerzusammenfassung gibt den Überblick, und zusätzlich wird das erste fehlerhafte Feld fokussiert. Über die Links in der Zusammenfassung können Nutzende dann gezielt zu den einzelnen Feldern navigieren.

## Vergleich der Varianten

| Variante                           | Screenreader-Feedback              | Fehlerüberblick                 | Aufwand        | Empfehlung                       |
| ---------------------------------- | ---------------------------------- | ------------------------------- | -------------- | -------------------------------- |
| 1: `disabled`                      | ❌ Kein Feedback                   | ❌ Kein Überblick               | ⭐ Gering      | Nur für einfache Formulare       |
| 2: `disabled` + `aria-describedby` | ⚠️ Nur allgemeiner Hinweis        | ❌ Kein Überblick               | ⭐⭐ Gering    | Besser als Variante 1            |
| 3: Fehlerzusammenfassung           | ✅ Zusammenfassung wird vorgelesen | ✅ Alle Fehler sichtbar + Links | ⭐⭐⭐ Mittel  | ✅ Empfohlen                     |
| 4: Fokus auf erstes Feld           | ✅ Fehlermeldung wird vorgelesen   | ⚠️ Nur erstes Feld im Fokus    | ⭐⭐ Mittel    | ✅ Empfohlen                     |

## Zusammenfassung und Empfehlung

Für barrierefreie Formulare empfehlen wir die Varianten 3 oder 4:

1. **Den Submit-Button nicht dauerhaft deaktivieren.** Nutzende sollten jederzeit versuchen können, das Formular abzusenden.
2. **Den `onInvalid`-Callback nutzen**, um auf ungültige Absendeversuche zu reagieren.
3. **Den Fokus auf das erste fehlerhafte Feld setzen** (Variante 4) – das ist mit Signal Forms in wenigen Zeilen umgesetzt und eine gute Standardlösung.
4. **Eine Fehlerzusammenfassung anzeigen** (Variante 3), die alle Fehler auflistet und mit den Feldern verlinkt – besonders bei Formularen mit vielen Feldern.
5. **Bei komplexen oder langen Formularen beide Ansätze kombinieren:** Die Fehlerzusammenfassung gibt den Überblick, der Fokus auf das erste Feld führt Nutzende direkt zum Problem.
6. **ARIA-Attribute konsequent einsetzen** – `aria-describedby` verknüpft Felder mit ihren Hinweisen, `aria-invalid` markiert fehlerhafte Felder, `role="alert"` sorgt dafür, dass Screenreader Änderungen sofort vorlesen.

Die Kombination aus `onInvalid`, `errorSummary()`, `focusBoundControl()` und einfachen ARIA-Attributen macht Signal Forms zu einem starken Werkzeug für barrierefreie Formulare in Angular.
