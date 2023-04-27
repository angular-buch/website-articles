---
title: "Errata zur 4. Auflage"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2023-04-27
lastModified: 2023-04-27
keywords:
  - Angular
  - Errata
  - Fehlerverzeichnis
  - 4. Auflage
language: de
---

Für die 4. Auflage haben wir das Buch vollständig überarbeitet und viele Fehler beseitigt.
Das war durch wertvolle Hinweise unserer Leserinnen und Leser möglich. Dennoch: Ein gedrucktes Buch ist niemals fehlerfrei, und natürlich hat sich auch in der 4. Auflage der Fehlerteufel eingeschlichen.

**Haben Sie Fragen oder Hinweise, oder haben Sie einen Fehler im Buch gefunden?
Bitte zögern Sie nicht, und schreiben Sie uns eine E-Mail: team@angular-buch.com**

> **Dies ist das Errata-Verzeichnis für die 4. Auflage (2023). Wenn Sie die ältere 3. Auflage besitzen, lesen Sie bitte die [Errata zur 3. Auflage](/blog/errata-3a).**

------

### 26.7 Fehlerhafte Cypress-Tests

#### Test 1: `should not show the administration form when not logged in`

In diesem Test selektieren wir den Login-/Logout-Button in der Navigation.
Wir haben diesen Button allerdings in ein `div`-Element geschachtelt, deshalb funktioniert der abgedruckte Selektor `div > nav` nicht.

Stattdessen sollten wir den Test so formulieren:

```ts
cy.get('nav button')
  .as('loginLogoutBtn')
  // ...
```

#### Test 2: `should not open the results box on server errors`

Dieser Test soll nachweisen, dass die Suchergebnisbox nicht geöffnet wird, wenn der Server einen Fehler liefert – der Test schlägt allerdings fehl.
Grund dafür ist die Implementierung im `BookStoreService`: In Abschnitt 15.15 haben wir hier den RxJS-Operator `catchError` verwendet, um Fehler abzufangen:

```ts
getAllSearch(term: string): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/books/search/${term}`).pipe(
    catchError(err => {
      console.error(err);
      return of([]);
    })
  );
}
```

Die Komponente erhält also bei einem Serverfehler ein leeres Array mit Suchergebnissen.
Die Ergebnisbox ist dann trotzdem sichtbar, und der Cypress-Test schlägt fehl.

Wir empfehlen Ihnen, das `catchError` in der Methode `getAllSearch()` wieder zu entfernen.
Dann verhält sich die Komponente so, wie wir es im Test beschrieben haben.






