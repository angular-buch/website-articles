---
title: "Errata zur 1. Auflage (2026)"
published: 2026-03-13
lastModified: 2026-05-15
hidden: true
---

Trotz größter Sorgfalt ist ein gedrucktes Buch niemals fehlerfrei.
Auch in der 1. Auflage (erschienen im Mai 2026) hat sich der Fehlerteufel eingeschlichen.

**Hast du Fragen oder Hinweise, oder hast du einen Fehler im Buch gefunden?
Bitte zögere nicht, und schreib uns eine E-Mail: [team@angular-buch.com](mailto:team@angular-buch.com)**

> **Dies ist das Errata-Verzeichnis für die 1. Auflage (2026). Wenn du eine ältere Ausgabe besitzt, schau bitte in die Materialien zu den Vorausgaben.**

------


## 11 ff. Services: Decorator `@Service()` statt `@Injectable()`

Mit Angular 22 wurde der neue Decorator `@Service()` eingeführt.
Er ist die moderne und ergonomische Alternative zum etablierten Decorator `@Injectable()` mit der Einstellung `providedIn: 'root'`.
Der Aufruf kann also direkt ersetzt werden:

```ts
// VORHER (im Buch abgedruckt)
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookStore {}
```

```ts
// NACHHER
import { Service } from '@angular/core';

@Service()
export class BookStore {}
```

Die Angular CLI generiert Services mit `ng generate service` nun ebenfalls mit dem neuen Decorator.
Im Buch ist jedoch noch der ältere Decorator `@Injectable()` abgedruckt. Den [Code auf GitHub](https://github.com/angular-buch/book-manager1) haben wir entsprechend aktualisiert.

Um beim Generieren den älteren Decorator zu erhalten, können wir das Flag `--injectable` verwenden.
Der Decorator `@Injectable()` wird also zunächst nicht abgeschafft, sodass bestehende Anwendungen nicht sofort migriert werden müssen.

```bash
# mit Decorator `@Injectable()`
ng g service book-store --injectable

# mit Decorator `@Service()`
ng g service book-store
```




## 22.3 HttpResource testen: `useFactory` nicht notwendig

In Abschnitt 22.3 beschreiben wir, wie HTTP-Requests mit `httpResource()` getestet werden können.
Im darunter liegenden Unterabschnitt "Resource mocken" erläutern wir: Um ein Resource-Objekt im Test zu erzeugen, müssen wir `useFactory` einsetzen, denn die Resource benötigt einen Injection Context.
Das Beispiel funktioniert allerdings auch mit `useValue`, sodass wir nicht zwingend zu `useFactory` wechseln müssen.
Der Grund: Die Resource wird in der Methode `getAll()` erzeugt, die von der Komponente in einem Injection Context aufgerufen wird.

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

Wenn die Resource hingegen im Test direkt erzeugt wird (ohne Funktion), ist `useFactory` notwendig, um einen Injection Context herzustellen:

```ts
// Hier ist `usefactory` notwendig:
// Die Resource wird direkt im Test erzeugt.
// ...
{
  provide: BookStore,
  useFactory: () => ({
    booksResource: resource({
      loader: () => Promise.resolve(mockBooks),
    })
  })
}
// ...
```


## 25.5.8 Logik für Schema-Funktionen

Im Theoriekapitel zu Signal Forms erläutern wir die Funktionen `disabled()`, `hidden()` und `readonly()`.
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