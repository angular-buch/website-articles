---
title: 'Angular 21 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2025-11-19
lastModified: 2025-11-20
keywords:
  - Angular
  - Angular 21
  - MCP-Server
  - ARIA
  - Zoneless
  - Signal Forms
  - Vitest
  - Karma
language: de
header: angular21.jpg
sticky: true
isUpdatePost: true
---

Bevor wir uns in den Trubel zum Jahresende stürzen, gibt es Neuigkeiten aus der Angular-Welt:
Am **19. November 2025** wurde **Angular 21** veröffentlicht!
Die wichtigsten Neuigkeiten: Signal Forms, Zoneless Apps, Testing mit Vitest, das neue Paket `@angular/aria` und mehr Unterstützung für AI-Assistenten.

Die offiziellen Release-Informationen findest du wie immer im [Angular-Blog](https://blog.angular.dev/announcing-angular-v21-57946c34f14b).
Die Migration eines bestehenden Projekts auf Angular 21 kann mit dem Befehl `ng update` durchgeführt werden.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).

> **🇬🇧 This article is available in English language here: [Angular 21 is here!](https://angular.schule/blog/2025-11-angular21)**

## Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 21 notwendig:

- TypeScript: >=5.9.0 <6.0.0
- Node.js: ^20.19.0 || ^22.12.0 || ^24.0.0

Ausführliche Infos zu den unterstützten Versionen findest du in der [Angular-Dokumentation](https://angular.dev/reference/versions).

## Zoneless Change Detection: der neue Standard

Schon seit einiger Zeit unterstützt Angular die zonenlose Change Detection.
Früher wurde die Bibliothek Zone.js verwendet, um Änderungen an Daten zu ermitteln.
Mit Signals als neuem Grundbaustein hat sich das Vorgehen deutlich geändert: Signals teilen explizit mit, dass sich ein Wert geändert hat.
Wir haben darüber ausführlich im [Blogpost zu Angular 18](/blog/2024-05-angular18) berichtet.

Nun gibt es zu dem Thema großartige Neuigkeiten: Zoneless Change Detection ist der neue Standard!
Neue Anwendungen mit Angular 21 setzen also per Default auf den neuen Mechanismus.
Beim Anlegen einer Anwendung mit `ng new` müssen wir nicht mehr die Option `--zoneless` verwenden.
Es ist auch nicht mehr notwendig, die Funktion `provideZonelessChangeDetection()` in der `app.config.ts` aufzurufen.

Möchte man aus Kompatibilitätsgründen doch noch die alte Umsetzung mit Zone.js verwenden, lässt sich die Change Detection in der `app.config.ts` konfigurieren.
Zusätzlich muss Zone.js installiert sein und unter `polyfills` in der `angular.json` eingetragen werden – so wie es früher in allen Anwendungen der Fall war.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    // VERALTETE Change Detection mit Zone.js aktivieren
    provideZoneChangeDetection({ eventCoalescing: true }),
};
```



## Signal-based Forms

Die aktuellen Ansätze für Formularverarbeitung in Angular sind nicht für das Zusammenspiel mit Signals ausgelegt.
Nun wurde ein neuer experimenteller Ansatz vorgestellt: *Signal Forms*.
Diese Variante integriert nicht nur breitflächig Signals, sondern soll die Erstellung und Verwaltung von Formularen grundlegend vereinfachen.

Die Grundidee: Die Daten liegen in einem einfachen Signal vor, das von uns verwaltet wird.
Angular leitet aus den Daten die Struktur des Formulars ab.
Die Regeln zur Validierung werden in Form eines Schemas definiert, das als Code notiert wird.

```ts
import { schema, form, Field } from '@angular/forms/signals';

export const bookFormSchema = schema<Book>(fieldPath => {
  required(fieldPath.isbn);
  minLength(fieldPath.isbn, 10);
  maxLength(fieldPath.isbn, 13);
  required(fieldPath.title);
});

@Component({
  // ...
  imports: [Field]
})
export class MyForm {
  protected readonly bookData = signal<Book>({
    isbn: '',
    title: ''
  });

  protected readonly bookForm = form(this.bookData, bookFormSchema);
}
```

Im Template erstellen wir die Datenbindungen mithilfe einer einzigen Direktive:

```html
<form>
  <input [field]="bookForm.isbn" />
  <input [field]="bookForm.title" />
</form>
```

Wir haben ausführliche Blogposts in englischer Sprache zu Signal Forms veröffentlicht:

- [**Part 1: Getting Started with the Basics**](https://angular-buch.com/blog/2025-10-signal-forms-part1)
- [**Part 2: Advanced Validation and Schema Patterns**](https://angular-buch.com/blog/2025-10-signal-forms-part2)
- [**Part 3: Child Forms and Custom UI Controls**](https://angular-buch.com/blog/2025-10-signal-forms-part3)

Perspektivisch könnten mit dem neuen Ansatz die älteren Varianten *Reactive Forms* und *Template-Driven Forms* verdrängt werden.
Das Angular-Team legt außerdem großen Wert auf Abwärtskompatibilität, sodass die Migration auf ein Signal-basiertes Formular kein großes Problem sein sollte.
Noch ist der neue Ansatz aber experimentell, sodass sich die Schnittstellen und Konzepte noch ändern können.


## Vitest: der neue Test-Runner

Mit Angular 21 gibt es einen der größten Umbrüche im Testing seit vielen Jahren: 
[Vitest](https://vitest.dev) ersetzt "offiziell" Karma und Jasmine als Standard-Test-Runner. 
Vitest wurde bereits mit [Angular 20 (Mai 2025) als experimenteller Test-Runner eingeführt](https://angular-buch.com/blog/2025-05-angular20#experimenteller-test-builder-f%C3%BCr-vitest).
Mit Angular 21 ist Vitest nun offiziell stabil und nicht mehr als experimentell gekennzeichnet.

Vitest wurde damit gleichzeitig für neue Projekte mit `ng new` zur Voreinstellung.
Für neue Projekte führt der Weg also klar zu Vitest, du kannst auf Wunsch aber weiterhin Karma/Jasmine wählen:

```bash
# Projekt mit Vitest als Testrunner anlegen
ng new my-project

# Projekt mit Karma als Testrunner anlegen
ng new my-project --test-runner=karma
```

Vitest bringt spürbare Vorteile: deutlich schnellere Testausführung, moderne APIs, eine Jest‑ähnliche Expect‑Syntax, flexible Fake‑Timer, und bei Bedarf sogar einen echten Browser-Modus.
Der Browser-Modus ist ähnlich wie zuvor unter Karma und ideal für realitätsnahe UI-Tests.
Die meisten Specs sollten weiterhin unverändert funktionieren, da Angulars `TestBed` und `ComponentFixture` vollständig gleich bleiben.
Anpassungen betreffen hauptsächlich Jasmine-spezifische Matcher oder Spys.

Die eigentliche Umstellung erfolgt zunächst über den neuen Builder `unit-test` in der `angular.json`.
Danach kannst du für bestehende Tests ein experimentelles Schematic verwenden, das viele Jasmine-Patterns automatisch nach Vitest überführt:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

Gleichzeitig hat das Angular-Team die Unterstützung für die Test-Runner Jest und Web Test Runner als **deprecated** markiert.
Eine ausführliche Anleitung zur Migration, inklusive praktischer Beispiele zu Fake-Timern, Matchern und async/await, haben wir hier zusammengestellt:
- **[Vitest in Angular 21: Was ist neu und wie kann man migrieren?](/blog/2025-11-zu-vitest-migrieren)**



## @angular/aria: barrierefreie Komponenten leicht gemacht

Mit Angular 21 wurde das neue Package [`@angular/aria`](https://angular.dev/guide/aria/overview) eingeführt: eine Sammlung von Direktiven, die gängige [WAI-ARIA-Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) implementieren.
Das Package übernimmt die komplexe Arbeit der Barrierefreiheit, insbesondere für komplexere, häufig verwendete Patterns, die über die Standard-HTML-Elemente hinausgehen.
Tastaturinteraktionen, ARIA-Attribute, Fokus-Management und Screen-Reader-Unterstützung werden unter der Haube der Direktiven berücksichtigt.

Die Installation des neuen Pakets erfolgt wie gewohnt über die Angular CLI:

```bash
ng add @angular/aria
```

In der ersten Version bietet `@angular/aria` Direktiven für die folgenden interaktiven Patterns:

| Komponente       | Beschreibung                                                                    |
|------------------|---------------------------------------------------------------------------------|
| **Accordion**    | Aufklappbereiche (Akkordeon), die einzeln oder exklusiv erweitert werden können |
| **Autocomplete** | Texteingabe mit gefilterten Vorschlägen während der Eingabe                     |
| **Combobox**     | Kombination aus Textfeld und Popup mit Suchergebnissen                          |
| **Grid**         | Zweidimensionale Datenanzeige mit zellenweiser Tastaturnavigation               |
| **Listbox**      | Ein- oder Mehrfachauswahl-Optionslisten mit Tastaturnavigation                  |
| **Menu**         | Dropdown-Menüs mit verschachtelten Untermenüs und Tastaturkürzeln               |
| **Multiselect**  | Mehrfachauswahl-Dropdown-Pattern mit kompakter Anzeige                          |
| **Select**       | Einfachauswahl-Dropdown-Pattern mit Tastaturnavigation                          |
| **Tabs**         | Tab-Interfaces mit automatischen oder manuellen Aktivierungsmodi                |
| **Toolbar**      | Gruppierte Steuerelemente mit logischer Tastaturnavigation                      |
| **Tree**         | Hierarchische Listen mit Erweitern/Einklappen-Funktionalität                    |

Das neue Package eignet sich insbesondere dann, wenn wir komplexe Komponenten entwickeln und nicht auf bestehende barrierefreie Komponentenbibliotheken zurückgreifen können, z. B. weil sich diese zum Beispiel hinsichtlich ihres Stylings nicht anpassen lassen.
Die Direktiven bringen keinerlei Visualität mit sich, sorgen aber für ein konsistentes Verhalten sowie eine barrierefreie Tastaturnavigation, Fokus-Handling und Screenreader-Optimierung.

In der Angular-Dokumentation findest du weitere Infos zu den neuen Direktiven: [Angular Aria Guide](https://angular.dev/guide/aria/overview)

> Einige der Bausteine gab es schon zuvor in ähnlicher Form im [Component Development Kit (CDK)](https://material.angular.dev/cdk/dialog/overview) von Angular. Das CDK war der Unterbau der Komponentenbibliothek Angular Material.
> Mit `@angular/aria` bringt das Angular-Team den Kern dieser Sammlung ein Stück näher an die Angular-Basis und stärkt das Thema Barrierefreiheit.


## Providers für `HttpClient`

Mit Angular 21 werden die Providers für den `HttpClient` automatisch eingebunden.
Es ist also nicht mehr zwingend notwendig, in der `app.config.ts` die Funktion `provideHttpClient()` aufzurufen.

Wollen wir die HTTP-Integration konfigurieren, z. B. mit Interceptors oder der Funktion `withFetch()`, müssen wir die Funktion allerdings weiterhin verwenden:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(
      withFetch(),
      withInterceptors([ /* ... */ ])
    )
  ]
};
```

## Angulars Unterstützung für AI-Assistenten

Beim Anlegen einer neuen Anwendung (`ng new`) fragt der interaktive Prompt jetzt nach, ob du eine Config für ein bestimmtes KI-Werkzeug generieren möchtest (Kommandozeilenoption `--ai-config`). 
Dadurch wird eine Datei erzeugt, die als _Custom Prompt_ automatisch in AI-Assistenten wie Claude Code, GitHub Copilot, Cursor und vielen weiteren eingelesen wird und diese mit aktuellen Angular Best Practices versorgt:

```bash
? Which AI tools do you want to configure with Angular best practices? https://angular.dev/ai/develop-with-ai
 ◉ None
 ◯ Agents.md      [ https://agents.md/                                               ]
❯◯ Claude         [ https://docs.anthropic.com/en/docs/claude-code/memory            ]
 ◯ Cursor         [ https://docs.cursor.com/en/context/rules                         ]
 ◯ Gemini         [ https://ai.google.dev/gemini-api/docs                            ]
 ◯ GitHub Copilot [ https://code.visualstudio.com/docs/copilot/copilot-customization ]
 ◯ JetBrains AI   [ https://www.jetbrains.com/help/junie/customize-guidelines.html   ]

↑↓ navigate • space select • a all • i invert • ⏎ submit
```

Je nach ausgewähltem Tool variiert der Dateiname und der Speicherort, etwa `.claude/CLAUDE.md` für Claude, `.gemini/GEMINI.md` für Gemini oder `AGENTS.md` nach dem [neuen Standard](https://agents.md/) sowie optional ein Frontmatter.
Der eigentliche Inhalt mit den Angular Best Practices bleibt identisch.

Allerdings gibt es auch Herausforderungen: Custom Prompts werden bei längeren Sessions häufig vergessen, und das begrenzte Kontextfenster führt zu inkonsistenten Ergebnissen.
Um dieses Problem besser zu beherrschen, bietet Angular zusätzlich einen eigenen MCP-Server an, der mit Angular 21 nun stabil ist. 
Der Server ermöglicht AI-Agenten strukturierten Zugriff auf sieben Tools.
Damit wird die "Wissenslücke" zwischen dem trainierten Modell und den aktuellen Best Practices geschlossen: 
LLMs können so auch brandneue Features wie Signal Forms und Angular Aria nutzen, obwohl sie zum Zeitpunkt des Trainings noch nicht existierten.

Der MCP-Server bietet aktuell sieben Tools an:

1. Mit einem interaktiven KI-Tutor Angular kennenlernen (`ai_tutor`). Siehe auch die Dokumentation unter ["Angular AI Tutor"](https://angular.dev/ai/ai-tutor).
2. Moderne Angular-Pattern-Beispiele finden (`find_examples`).
3. Best Practices bereitstellen (`get_best_practices`).
4. Alle Projekte im Workspace auflisten (`list_projects`).
5. Die Anwendung auf Zoneless Change Detection migrieren (`onpush_zoneless_migration`).
6. Die Dokumentation durchsuchen (`search_documentation`).
7. Code-Migrationen mit Schematics durchführen (`modernize`, **experimentell**).

<!-- Mehr Details zu `AGENTS.md`, MCP und praktischen Erfahrungen findest du in unserem ausführlichen Artikel über [Vibe-Coding mit Angular](/blog/2025-11-ai-mcp-vibe-coding). -->


## Migrationsskripte

Es wird nicht mehr empfohlen, die Direktive `ngClass` zu verwenden. 
Wir haben darüber schon vor einem Jahr [in einem Blogpost berichtet](https://angular.schule/blog/2024-11-ngclass-ngstyle).
Zur Umstellung auf direkte Class Bindings mit `[class]` bietet Angular ein Migrationsskript an:

```bash
ng generate @angular/core:ngclass-to-class
```

Das `RouterTestingModule` für Unit-Tests wird ebenfalls nicht mehr unterstützt.
Ein Migrationsskript kann die Tests auf das neuere `provideRouterTesting()` umstellen, siehe [Commit](https://github.com/angular/angular/commit/861cee34e0e9b5562cfe70d245f30b7ddea7d8fd).

```bash
ng generate @angular/core:router-testing-module-migration
```


## Sonstiges

Alle Details zu den Neuerungen findest du immer im Changelog von [Angular](https://github.com/angular/angular/releases) und der [Angular CLI](https://github.com/angular/angular-cli/releases).
Einige interessante Aspekte haben wir hier zusammengetragen:

- **Bindings für ARIA-Attribute:** Bisher mussten wir für ARIA-Attribute immer ein Attribute Binding verwenden: `[attr.aria-label]="myLabel"`. Die Attribute können nun auch direkt gebunden werden: `[aria-label]="myLabel"`.
- **Reguläre Ausdrücke in Templates:** Angular unterstützt jetzt reguläre Ausdrücke direkt in Templates (siehe [PR](https://github.com/angular/angular/pull/63857)).
- **Tailwind-Support für `ng new`:** Angular unterstützt schon länger direkt TailwindCSS. Nun kann das Framework auch direkt beim Anlegen einer Anwendung konfiguriert werden: `ng new --style=tailwind` (siehe [Commit](https://github.com/angular/angular-cli/commit/4912f39906b11a3212f11d5a00d577e2a0bacab4)).

<hr>


Wir wünschen dir viel Spaß beim Entwickeln mit Angular 21!
Hast du Fragen zur neuen Version von Angular oder zu unserem Buch? Schreibe uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Drei Zinnen, Dolomiten, Italien. Foto von Ferdinand Malcher</small>
