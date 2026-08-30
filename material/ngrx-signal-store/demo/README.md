# Beispiel-App: SignalStore

Lauffähige Angular-Anwendung zum Artikel **[State Management mit NgRx – Teil 3: SignalStore](../README.md)**.

Sie zeigt den kompletten `BookSignalStore` aus dem Artikel in Aktion: Buchliste laden, Bücher anlegen und löschen (mit `signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod` und `patchState`) sowie Favoriten als reinen Client-State ohne `rxMethod` – inklusive Lade- und Fehleranzeige.

- **Angular** + **NgRx** (`@ngrx/signals`, `@ngrx/operators`)
- Der Datenservice `BookStore` spricht per `HttpClient` die echte BookManager-API unter `https://api1.angular-buch.com` an – die App braucht also kein eigenes Backend, aber eine Internetverbindung. Legt man ein Buch mit einer bereits vergebenen ISBN an, antwortet die API mit HTTP 409 und die Fehleranzeige erscheint.

> **Hinweis:** Die API ist eine öffentliche, geteilte Instanz – angelegte und gelöschte Bücher sehen also auch andere. Die Unit-Tests sprechen die API nicht an (`HttpTestingController` bzw. Service-Mocks).

> **Projektstruktur:** Diese Demo ist eine abgeflachte Minimal-Reproduktion. Der Artikel beschreibt die Integration in den vollständigen BookManager (Feature-Ordner `books/…`); die Demo liegt dagegen flach unter `src/app/…` (SignalStore: `src/app/book-signal-store.ts`). Klassen-, Datei- und Selektornamen folgen in beiden Fällen denselben Angular-Konventionen (keine `.component`/`.service`-Suffixe).

## Befehle

```bash
npm install
npm test     # Vitest: Store-Tests (Laden, Anlegen/Löschen, Favoriten, Fehler) + Service + Komponente
npm start    # ng serve
npm run build
```

Die Tests beweisen den Store wie einen gewöhnlichen Service: Instanz beziehen, Methoden aufrufen, Signale auslesen – ganz ohne Store-Setup.
