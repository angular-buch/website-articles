# Beispiel-App: Global Store mit NgRx

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 2: Global Store](../README.md)**.

Sie zeigt den kompletten Code aus dem Artikel in Aktion: Buchliste laden, Bücher anlegen und löschen (mit Actions, Reducer, Selektoren und Effects) sowie Favoriten als reinen Client-State ohne Effect – inklusive Lade- und Fehleranzeige.

- **Angular** + **NgRx** (`@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`)
- Der Datenservice `BookStore` spricht per `HttpClient` die echte BookManager-API unter `https://api1.angular-buch.com` an – die App braucht also kein eigenes Backend, aber eine Internetverbindung. Legt man ein Buch mit einer bereits vergebenen ISBN an, antwortet die API mit HTTP 409 und die Fehleranzeige erscheint.
- Der Store ist mit `provideStoreDevtools()` instrumentiert: Mit installierter [Redux-DevTools-Extension](https://github.com/reduxjs/redux-devtools) lassen sich alle Actions und der State live beobachten (siehe Artikel).

> **Hinweis:** Die API ist eine öffentliche, geteilte Instanz – angelegte und gelöschte Bücher sehen also auch andere. Die Unit-Tests sprechen die API nicht an (`HttpTestingController`).

> **Projektstruktur:** Diese Demo ist eine abgeflachte Minimal-Reproduktion. Der Artikel beschreibt die Integration in den vollständigen BookManager (Feature-Ordner `books/store/…`); die Demo liegt dagegen flach unter `src/app/store/…`. Klassen-, Datei- und Selektornamen folgen in beiden Fällen denselben Angular-Konventionen (keine `.component`/`.service`-Suffixe).

## Befehle

```bash
npm install
npm test     # Vitest: Reducer-, Selektor-, Effect-, Service- und Komponententests
npm start    # ng serve
npm run build
```

Die Tests beweisen das State Management isoliert: Reducer als Pure Functions, Selektoren, Effects mit `provideMockActions`, der `BookStore`-Service mit `HttpTestingController` und die Komponente mit `provideMockStore`.
