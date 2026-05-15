---
title: 'Updates zu Signal Forms'
published: 2026-05-06
lastModified: 2026-05-15
hidden: true
---

Im Angular-Buch behandeln wir ausführlich Angulars neuesten Ansatz zur Formularverarbeitung: Signal Forms.
Dabei berichten wir über experimentelle Schnittstellen.

**Die gute Nachricht: Signal Forms wurden mit Angular 22 als *stable* markiert. Es gibt gegenüber dem gedruckten Stand im Buch keine gravierenden Änderungen.**

Signal Forms können also heute produktiv eingesetzt werden, um Formulare in Angular zu verarbeiten.
Wir empfehlen, neue Formulare sofort mit Signal Forms zu entwickeln.
Für die Kompatibilität mit Reactive Forms bietet Angular mehrere Schnittstellen an, sodass Controls aus beiden Welten im selben Formular eingesetzt werden können.

In unserer englischsprachigen Artikelserie zu Signal Forms gehen wir auch auf Aspekte ein, die wir im Buch nicht abdecken:

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- [Part 3: Child Forms, Custom UI Controls and SignalFormsConfig](/blog/2025-10-signal-forms-part3)
- [Part 4: Metadata and Accessibility Handling](/blog/2025-12-signal-forms-part4)

**In diesem Artikel sammeln wir dennoch einige kleinere Aspekte, die sich nach dem Release des Angular-Buchs geändert haben.**


## 25.5.8 Logik für Schema-Funktionen mit `when`

Im Buch erläutern wir die Funktionen `disabled()`, `hidden()` und `readonly()`.
Dabei erklären wir auch, dass im zweiten Argument eine Logikfunktion übergeben werden kann.

Die Signatur der Schemafunktionen wurde kurz vor dem finalen Release von Angular 22 noch einmal angepasst.
Die Logik wird nun in der Option `when` notiert.
Diese Änderung ist sinnvoll, weil andere Schemafunktionen ebenfalls ein `when`-Callback unterstützen.
Im Buch ist allerdings noch die alte Schnittstelle abgedruckt.

```ts
// ❌ VORHER (im Buch abgedruckt)
disabled(path.password, (ctx) => !ctx.valueOf(path.username));
disabled(path.password, (ctx) => !ctx.valueOf(path.username) ? 'Username is empty.' : false);

// ✅ NACHHER
disabled(path.password, { when: (ctx) => !ctx.valueOf(path.username) });
disabled(path.password, {
  when: (ctx) => !ctx.valueOf(path.username) ? 'Username is empty.' : false
});
```