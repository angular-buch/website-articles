# Beispiel-App: Global Store mit NgRx

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 2: Global Store](../README.md)**.

Sie zeigt den kompletten Code aus dem Artikel in Aktion: Buchliste laden sowie Bücher anlegen, ändern (Bewertung erhöhen) und löschen (CRUD) mit Actions, Reducer, Selektoren und Effects – inklusive Lade- und Fehleranzeige.

- **Angular 22** + **NgRx 21** (`@ngrx/store`, `@ngrx/effects`)
- Der `BookApi` ist ein In-Memory-Stand-in für ein echtes HTTP-Backend, damit die App ohne Server läuft. Er wirft bei einer doppelten ISBN bewusst einen Fehler, sodass sich die Fehleranzeige auch ohne Server auslösen lässt.

> **Hinweis:** NgRx 21 gibt als Peer-Range noch `@angular/core: ^21.0.0` an, läuft aber problemlos unter Angular 22. Damit `npm install` nicht an dieser Range scheitert, liegt im Projekt eine `.npmrc` mit `legacy-peer-deps=true`.

> **Projektstruktur:** Diese Demo ist eine abgeflachte Minimal-Reproduktion. Der Artikel beschreibt die Integration in den vollständigen BookManager (Feature-Ordner `books/store/…`); die Demo liegt dagegen flach unter `src/app/store/…`. Klassen-, Datei- und Selektornamen (Präfix `bm-`, keine `.component`/`.service`-Suffixe) folgen in beiden Fällen denselben Angular-Konventionen.

## Befehle

```bash
npm install
npm test     # Vitest: Reducer-, Selektor-, Effect- und Komponententests
npm start    # ng serve
npm run build
```

Die Tests beweisen das State Management isoliert: Reducer als Pure Functions, Selektoren, Effects mit `provideMockActions` und die Komponente mit `provideMockStore`.
