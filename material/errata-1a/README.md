---
title: "Errata zur 1. Auflage (2026)"
published: 2026-03-13
lastModified: 2026-03-13
hidden: true
---

Trotz größter Sorgfalt ist ein gedrucktes Buch niemals fehlerfrei.
Auch in der 1. Auflage (erschienen im Mai 2026) hat sich der Fehlerteufel eingeschlichen.

**Hast du Fragen oder Hinweise, oder hast du einen Fehler im Buch gefunden?
Bitte zögere nicht, und schreib uns eine E-Mail: [team@angular-buch.com](mailto:team@angular-buch.com)**

> **Dies ist das Errata-Verzeichnis für die 1. Auflage (2026). Wenn du eine ältere Ausgabe besitzt, schau bitte in die Materialien zu den Vorausgaben.**

------


### 22.3 HttpResource testen: `useFactory` nicht notwendig

In Abschnitt 22.3 beschreiben wir, wie HTTP-Requests mit `httpResource()` getestet werden können.
Im darunter liegenden Unterabschnitt "Resource mocken" erläutern wir: Um ein Resource-Objekt im Test zu erzeugen, müssen wir `useFactory` einsetzen, denn die Resource benötigt einen Injection Context.
Tatsächlich funktioniert das inzwischen aber auch mit `useValue`, sodass wir nicht zwingend zu `useFactory` wechseln müssen.

Die abgedruckte Variante mit `useFactory` ist dennoch nicht falsch und kann weiterhin so genutzt werden – nur die Erklärung ist nicht korrekt.

```ts
// books-overview-page.spec.ts
// Variante mit `usefactory` (Code im Buch)
// ...
{
  provide: BookStore,
  useFactory: () => ({
    getAll: () => resource({
      loader: () => Promise.resolve(mockBooks),
    })
  })
}
// ...
```

```ts
// books-overview-page.spec.ts
// Variante mit `useValue`
// ...
{
  provide: BookStore,
  useValue: {
    getAll: () => resource({
      loader: () => Promise.resolve(mockBooks),
    })
  }
}
// ...
```


