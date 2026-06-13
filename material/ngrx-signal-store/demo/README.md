# Beispiel-App: SignalStore

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 3: SignalStore](../README.md)**.

Sie zeigt den kompletten `BookStore` aus dem Artikel in Aktion: Buchliste laden sowie Bücher anlegen, ändern und löschen (CRUD) mit `signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod` und `patchState`, inklusive Fehler-State.

- **Angular 22** + **NgRx 21** (`@ngrx/signals`, `@ngrx/operators`)
- Der `BookStoreService` ist ein In-Memory-Stand-in für ein echtes HTTP-Backend, damit die App ohne Server läuft.

> **Hinweis:** NgRx 21 gibt als Peer-Range noch `@angular/core: ^21.0.0` an, läuft aber problemlos unter Angular 22. Damit `npm install` nicht an dieser Range scheitert, liegt im Projekt eine `.npmrc` mit `legacy-peer-deps=true`.

## Befehle

```bash
npm install
npm test     # Vitest: Store-Tests (Laden, CRUD, Fehler) + Komponente
npm start    # ng serve
npm run build
```

Die Tests beweisen den Store wie einen gewöhnlichen Service: Instanz beziehen, Methoden aufrufen, Signale auslesen – ganz ohne Store-Setup.
