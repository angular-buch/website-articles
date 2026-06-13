# Beispiel-App: Global Store mit NgRx

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 2: Global Store](../README.md)**.

Sie zeigt den kompletten Code aus dem Artikel in Aktion: Buchliste laden sowie Bücher anlegen, ändern und löschen (CRUD) mit Actions, Reducer, Selektoren und Effects, inklusive Fehler-State.

- **Angular 21** + **NgRx 21** (`@ngrx/store`, `@ngrx/effects`)
- Der `BookStoreService` ist ein In-Memory-Stand-in für ein echtes HTTP-Backend, damit die App ohne Server läuft.

## Befehle

```bash
npm install
npm test     # Vitest: Reducer-, Selektor- und Effect-Tests
npm start    # ng serve
npm run build
```

Die Tests beweisen das State Management isoliert (Reducer als Pure Functions, Effects mit `provideMockActions`, Selektoren, Komponente mit `provideMockStore`).
