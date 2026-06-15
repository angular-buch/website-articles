# Beispiel-App: SignalStore

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 3: SignalStore](../README.md)**.

Sie zeigt den kompletten `BookStore` aus dem Artikel in Aktion: Buchliste laden sowie Bücher anlegen, ändern (Bewertung erhöhen) und löschen (CRUD) mit `signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod` und `patchState` – inklusive Lade- und Fehleranzeige.

- **Angular** + **NgRx** (`@ngrx/signals`, `@ngrx/operators`) – die konkreten Versionen stehen in der `package.json`
- Der `BookApi` ist ein In-Memory-Stand-in für ein echtes HTTP-Backend, damit die App ohne Server läuft. Er wirft bei einer doppelten ISBN bewusst einen Fehler, sodass sich die Fehleranzeige auch ohne Server auslösen lässt.

> **Hinweis:** NgRx und Angular folgen demselben Major-Versionsschema. Kurz nach einem neuen Angular-Major passt die NgRx-Peer-Range noch nicht; damit `npm install` trotzdem durchläuft, liegt eine `.npmrc` mit `legacy-peer-deps=true` bei. Sie stört nicht, sobald die Versionen wieder zusammenpassen.

> **Projektstruktur:** Diese Demo ist eine abgeflachte Minimal-Reproduktion. Der Artikel beschreibt die Integration in den vollständigen BookManager (Feature-Ordner `books/…`); die Demo liegt dagegen flach unter `src/app/…`. Klassen-, Datei- und Selektornamen (Präfix `bm-`, keine `.component`/`.service`-Suffixe) folgen in beiden Fällen denselben Angular-Konventionen.

## Befehle

```bash
npm install
npm test     # Vitest: Store-Tests (Laden, CRUD, Fehler) + Komponente
npm start    # ng serve
npm run build
```

Die Tests beweisen den Store wie einen gewöhnlichen Service: Instanz beziehen, Methoden aufrufen, Signale auslesen – ganz ohne Store-Setup.
