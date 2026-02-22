---
title: "Errata zur 4. Auflage (2023)"
published: 2023-04-27
lastModified: 2024-03-22
hidden: true
---

Für die 4. Auflage haben wir das Buch vollständig überarbeitet und viele Fehler beseitigt.
Das war durch wertvolle Hinweise unserer Leserinnen und Leser möglich. Dennoch: Ein gedrucktes Buch ist niemals fehlerfrei, und natürlich hat sich auch in der 4. Auflage der Fehlerteufel eingeschlichen.

**Haben Sie Fragen oder Hinweise, oder haben Sie einen Fehler im Buch gefunden?
Bitte zögern Sie nicht, und schreiben Sie uns eine E-Mail: team@angular-buch.com**

> **Dies ist das Errata-Verzeichnis für die 4. Auflage (2023). Wenn Sie die ältere 3. Auflage besitzen, lesen Sie bitte die [Errata zur 3. Auflage](/material/errata-3a).**

------


### 5.2 Projekt anlegen

Zum Beginn des Buchs legen wir gemeinsam das Beispielprojekt mithilfe des Befehls `ng new` an.
Seit Angular 17 werden neue Anwendungen standardmäßig mit Standalone Components generiert.
Das Beispielprojekt setzt jedoch zunächst auf NgModules und wird erst später auf Standalone Components migriert.

Damit die Beispiele im Buch weiterhin mit dem generierten Code übereinstimmen, müssen Sie die Option `standalone` beim Erzeugen des Projekts explizit deaktivieren:

```sh
ng new book-monkey --routing --style=css --prefix=bm --standalone=false
```

Die interaktive Abfrage für Server-Side Rendering können Sie mit dem Default `N` (No) beantworten – wir benötigen SSR zunächst nicht.
Übrigens: Die Option `routing` ist seit Angular 17 per Default aktiviert, sie muss also nicht mehr manuell mit angegeben werden.


### 5.3 Statische Assets einbinden

Im Abschnitt 5.3 auf Seite 64 erläutern wir, dass statische Assets aus dem Ordner `src/assets` automatisch eingebunden werden.
In neu angelegten Projekten existiert dieser Ordner nicht mehr. Stattdessen werden statische Dateien, die beim Build mit ausgeliefert werden sollen, im neuen Ordner `public` abgelegt.
Wenn wir diese Dateien einbinden, muss der Ordnerpfad **nicht** mehr angegeben werden. Legen wir die Datei `icon.png` in den Ordner `public`, wird sie aus der Anwendung heraus wie folgt eingebunden:

```html
<img src="icon.png" alt="Icon">
```

### 5.5 `@import` in SCSS ist deprecated

In Abschnitt 5.5 binden wir das Paket `book-monkey5-styles` ein, um die globalen Stylesheets zu nutzen.
Dafür verwenden wir das Statement `@import` in der Datei `styles.css`.

Wir haben im BookMonkey zwar reines CSS eingesetzt, für die Praxis empfehlen wir aber eher, auf den Präprozessor SCSS zu setzen.
Dort funktioniert `@import` grundlegend auch – das Statement wurde allerdings als *deprecated* markiert. `@import` verweist in SCSS nur noch auf reine CSS-Imports.
Arbeiten wir mit SCSS, wird `@use` empfohlen, um andere Dateien einzubinden.

```scss
// styles.scss (!)
@use 'book-monkey5-styles/index.css';
```

Nutzen wir nur reines CSS für das Styling der Anwendung, ist `@import` weiterhin möglich – Sie müssen für die Arbeit mit dem Buch hier also zunächst nichts ändern.


### 5.6 Warnungen von ESLint

Bei der Ausführung von ESLint mit dem Befehl `ng lint` erhalten wir die folgende Warnung:

```
error  Components, Directives and Pipes should not opt out of standalone  @angular-eslint/prefer-standalone
```

Eine ausführliche Erklärung dafür finden Sie im nächsten Abschnitt (**6 Komponenten mit Flag `standalone: false`**).
Wir arbeiten in diesem Buch mit modulbasierten Komponenten. Deshalb empfehlen wir, die ESLint-Regel zu deaktivieren:


```js
// eslint.config.js
rules: {
  "@angular-eslint/prefer-standalone": "off",
  // ...
}
```

### 6 Komponenten mit Flag `standalone: false`

Wir arbeiten im Buch mit modulbasierten Komponenten. Seit Angular 17 generiert Angular automatisch Standalone Components, die ohne Module funktionieren.
Wir haben dieses Thema in Kapitel 25 ausführlich behandelt.
Damit das Buch auch mit neueren Versionen von Angular kompatibel ist, haben wir beim Anlegen des Projekts die Option `--standalone` auf `false` gesetzt – so erhalten wir eine modulbasierte Anwendung.

Seit Angular 19 sind Komponenten per Default standalone, und es ist nicht mehr notwendig, Standalone Components explizit als solche zu markieren.
Stattdessen muss für modulbasierte Komponenten die Einstellung `standalone` im Kopf der Komponenten explizit auf `false` gesetzt werden.

**Alle Komponenten im BookMonkey tragen seit Angular 19 automatisch das Flag `standalone: false`, das nicht im Buch abgedruckt ist.**


### 14.1 `HttpClientModule` ist deprecated

Wir verwenden das `HttpClientModule`, um den `HttpClient` von Angular anschließend injecten zu können.
Dieses Modul ist deprecated und sollte nicht mehr verwendet werden.
Stattdessen nutzen wir die neue Funktion `provideHttpClient()` unter `providers`:

```ts
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
// ...

@NgModule({
  // ...
  imports: [
    // ...
    // HttpClientModule // WEG!
  ],
  providers: [
    // NEU
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }
```



### 20.4 Asynchroner Validator und Methode `checkAvailable()`

Im Abschnitt 20.4 entwickeln wir auf den Seiten 395 und 396 einen asynchronen Validator.
Die Validatormethode haben wir im Listing 20-12 `usernameAvailable()` genannt.
Bei der Verwendung im darauf folgenden Listing 20-13 auf Seite 396 haben wir aber fälschlicherweise den Namen `checkAvailable()` genutzt.

Korrekt muss das Listing 20-13 also lauten:

```ts
form = new FormGroup({
  username: new FormControl('', {
    validators: [Validators.required],
    asyncValidators: [
      inject(UsernameValidatorService).usernameAvailable()
    ]
  })
});
```


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


### 32.3.11 NgRx Effects mit `inject()`

In der Effects-Klasse in NgRx nutzen wir die Constructor Injection, um die Services `Actions` und `BookStoreService` anzufordern.
Beide Objekte werden dann im Effect verwendet, der direkt im Property initialisiert wird.

Wir müssen deshalb die Funktion `inject()` verwenden, um die Services anzufordern:

```ts
@Injectable()
export class BookEffects {

  private actions$ = inject(Actions);
  private service = inject(BookStoreService);

  loadBooks$ = /* ... */
}
```


### 33 Server-Side Rendering und Pre-Rendering mit Angular 17

Mit Angular 17 wurde der Build-Prozess für Server-Side Rendering und Pre-Rendering angepasst.
Ab sofort wird das neue Paket `@angular/ssr` verwendet, um SSR in der Anwendung einzurichten.
Der Build für alle drei Aspekte (Browser, Server, Pre-Rendering) wird nun in einem Schritt vom neuen Application Builder ausgeführt.

Die Unterschiede zum gedruckten Buch haben wir in einem separaten Blogartikel zusammengefasst:

**[Book Monkey v5: Server-Side Rendering mit Angular 17](/blog/2023-11-ssr-bm)**

