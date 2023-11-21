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


### 5.2 Projekt anlegen

Zum Beginn des Buchs legen wir gemeinsam das Beispielprojekt mithilfe des Befehls `ng new` an.
Seit Angular 17 werden neue Anwendungen standardmäßig mit Standalone Components generiert.
Das Beispielprojekt setzt jedoch zunächst auf NgModules und wird erst später auf Standalone Components migriert.

Damit die Beispiele im Buch weiterhin mit dem generierten Code übereinstimmen, müssen Sie die Option `standalone` beim Erzeugen des Projekts explizit deaktivieren:

```sh
ng new book-monkey --routing --style=css --prefix=bm --standalone=false
```

Übrigens: Die Option `routing` ist seit Angular 17 per Default aktiviert, sie muss also nicht mehr manuell mit angegeben werden.


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


### 32.3.5 NgRx: Feature anlegen

Der im Buch abgedruckte Befehl, um ein Feature mithilfe der Schematics von NgRx anzulegen, erzeugt den folgenden Fehler:

```
Specified module path /src/app/books/store/books/books does not exist
```

Der Hintergrund: In den neueren Versionen der Feature-Schematics ist die Option `entity` per Default aktiviert.
Das führt dazu, dass ein `EntityAdapter` für das Feature generiert wird, wie wir es weiter hinten im Buch in Abschnitt 32.5.3 beschrieben haben.
In dieser Konstellation kann das Skript den verschachtelten Feature-Namen nicht korrekt auswerten.

Um das Problem zu lösen, muss die Option `entity` expliziert deaktiviert werden.
Das erzeugte Ergebnis entspricht dann dem Code, der im Buch abgedruckt ist.

**Neuer Befehl:**

```sh
ng g feature books/store/book --module books/books --api --entity=false --defaults
```



### 33 Server-Side Rendering und Pre-Rendering mit Angular 17

Mit Angular 17 wurde der Build-Prozess für Server-Side Rendering und Pre-Rendering angepasst.
Ab sofort wird das neue Paket `@angular/ssr` verwendet, um SSR in der Anwendung einzurichten.
Der Build für alle drei Aspekte (Browser, Server, Pre-Rendering) wird nun in einem Schritt vom neuen Application Builder ausgeführt.

Die Unterschiede zum gedruckten Buch haben wir in einem separaten Blogartikel zusammengefasst:

**[Book Monkey v5: Server-Side Rendering mit Angular 17](/blog/2023-11-ssr-bm)**

