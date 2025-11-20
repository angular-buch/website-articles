---
title: 'Vibe-Coding mit Angular 21'
author: Johannes Hoppe
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
sticky: false
---

Auf der Google I/O 2025 hat das Angular-Team die neue Ressource [angular.dev/ai](https://angular.dev/ai) vorgestellt.
Sie bietet umfassende Anleitungen und Beispiele für die Entwicklung von KI-gestützten Anwendungen mit Angular.
Dazu gehören etwa Chatbots, KI-Editoren oder agentenbasierte Workflows.
Die Seite zeigt konkrete Integrationsmöglichkeiten mit Genkit, Firebase AI Logic und der Gemini API, inklusive Starter-Kits und Best Practices für sichere API-Nutzung und Fehlerbehandlung.

Bei der Diskussion sollte man immer unterscheiden zwischen: "AI in Apps einbauen" vs. "AI hilft beim Coden".
Beide Richtungen sind spannend.
Als Angular-Buch-Team interessiert uns jedoch natürlich besonders, wie AI-Assistenten uns beim Schreiben von Angular-Code unterstützen können.

Angular bietet hierfür zwei konkrete Ansätze: die `AGENTS.md`-Dateien mit Coding-Richtlinien und den MCP-Server für strukturierten Zugriff auf aktuelle Best Practices und Dokumentation.

### AGENTS.md: Best Practices für AI-Tools

Beim Anlegen einer neuen Anwendung fragt der interaktive Prompt jetzt, ob du eine Config für ein bestimmtes KI-Werkzeug generieren möchtest.
Die zugehörige Komandozeilenoption lautet `--ai-config`:

```
--ai-config     Specifies which AI tools to generate
                configuration files for. These file are used to
                improve the outputs of AI tools by following the
                best practices.
  [array] [choices: "agents", "claude", "copilot", "cursor",
                "gemini", "jetbrains", "none", "windsurf"]
```

Dadurch eine dedizierte Markdown-Datei generiert, die eine kleine Sammlung von Regeln und Best Practices für Ihren KI-Agenten enthält. 
Diese Datei dient als Leitfaden, um sicherzustellen, dass AI-Tools konsistent hochwertigen Code erzeugen, der den aktuellen Angular-Standards entspricht.
Je nach ausgewähltem Tool variiert der Dateiname und der Speicherort, etwa `.claude/CLAUDE.md` für Claude, `.gemini/GEMINI.md` für Gemini oder `AGENTS.md` nach dem [neuen Standard](https://agents.md/).
Diese Datei dient als Custom Prompt, der ohne Zutun der Entwickler*innen sehr früh in die Session eingelesen wird.
Der Inhalt bleibt jedoch über alle Varianten hinweg identisch und ist in klare Abschnitte unterteilt, wie TypeScript Best Practices, Angular Best Practices, Components, State Management, Templates und Services.
[Hier](https://github.com/angular/angular/blob/890414245ff313841c30759cbd193f72f3a89297/packages/core/resources/best-practices.md) kannst du den aktuellen Text der `AGENTS.md` nachlesen:

```md
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).
- Do not write Regular expressions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
```

Dieser Text ist auch auf der Seite [LLM prompts and AI IDE setup](https://angular.dev/ai/develop-with-ai)
zu finden.
Je nachdem, wie optimiert das Modell ist, wie viele Inputs es verarbeiten kann, wie groß sein Kontextfenster ist, ob es über ausgeprägte Fähigkeiten zum logischen Schlussfolgern (Reasoning) verfügt und vor allem, wie aktuell seine Trainingsdaten sind, wird es mehr oder weniger brauchbare Ergebnisse liefern.
Ein schwächeres Modell wird höchstwahrscheinlich hilflos raten und dabei selbstbewusst völlig falsche Informationen halluzinieren.

Ein starkes Modell hingegen kann die Instruktionen präzise interpretieren und tatsächlich fundierte Vorschläge machen.
Unserer Meinung nach ist die erzeugte Datei ein guter Anfang, sie müsste aber deutlich mehr konkrete und kontextspezifische Anweisungen beinhalten. Ein Weg, solche Informationen bereitzustellen, ist der MCP-Server (siehe unten), der im Kern eine Sammlung strukturierter Prompts und aktueller Best Practices enthält.


Übrigens, ein Beispiel dafür, wie schnell sich die Arbeit mit Agenten überholt, ist der Hinweis "*Do not write regular expressions in templates (they are not supported).*".
Dieser ist bereits veraltet (siehe unten), denn Angular unterstützt jetzt reguläre Ausdrücke im Template, sodass sich dieser Ratschlag sogar kontraproduktiv auswirken kann.
Das zeigt: Selbst präzise formulierte Guidelines müssen regelmäßig überprüft und an den aktuellen Stand der Technik angepasst werden, um Missverständnisse und veraltete Empfehlungen zu vermeiden.
Wir haben bereits einen [Pull Request (#65416)](https://github.com/angular/angular/pull/65416) erstellt.


### MCP-Server: Strukturiertes Wissen für AI-Agenten

Angular bietet einen eigenen [MCP-Server](https://angular.dev/ai/mcp) an, der in AI-Agenten integriert werden kann.
Die Unterstützung  wurde bereits in Angular 20.2 als experimentelles Feature eingeführt und ist mit Angular 21 nun stabil.
Der MCP-Server kann mit verschiedenen Agenten genutzt werden, darunter Claude Desktop, Claude Code, GitHub Copilot (VS Code), Cursor und viele mehr.

Damit wird die "Wissenslücke" zwischen dem trainierten Modell und den aktuellen Best Practices geschlossen: 
LLMs können so auch brandneue Features wie Signal Forms und Angular Aria nutzen, obwohl sie zum Zeitpunkt des Trainings noch nicht existierten.

Die Kommunikation erfolgt über das standardisierte Model Context Protocol (MCP), welches ein Protokoll auf Basis von JSON-RPC 2.0 ist. Der Server wird in der Regel lokal auf dem eigenen Rechnter gestartet (z. B. mit `npx @angular/cli mcp`) und stellt seine Funktionen in Form sogenannter "Tools" bereit.
Der MCP-Server bietet aktuell sieben Tools an:

1. Mit einem interaktiven KI-Tutor Angular kennenlernen (`ai_tutor`). Siehe auch die Dokumentation unter ["Angular AI Tutor"](https://angular.dev/ai/ai-tutor).
2. Moderne Angular-Pattern-Beispiele finden (`find_examples`).
3. Best Practices bereitstellen (`get_best_practices`).
4. Alle Projekte im Workspace auflisten (`list_projects`).
5. Die Anwendung auf Zoneless Change Detection migrieren (`onpush_zoneless_migration`).
6. Die Dokumentation durchsuchen (`search_documentation`).
7. Code-Migrationen mit Schematics durchführen (`modernize`, **experimentell**).

Der MCP-Server wird kontinuierlich weiterentwickelt, um noch bessere Unterstützung bei der Entwicklung zu ermöglichen.

**Wie funktioniert das konkret?** Am Beispiel des [`get_best_practices`](https://github.com/angular/angular-cli/blob/26719451c35288c0b5342eceda3460ed24bd3171/packages/angular/cli/src/commands/mcp/tools/best-practices.ts#L11)-Tools wird das Zusammenspiel deutlich:
Ein*e Entwickler*in möchte eine neue Funktionalität zur Anwendung hinzufügen, zum Beispiel ein reaktives Formular mit Validierung.
Die Person beschreibt dem AI-Assistenten die gewünschte Funktionalität.
Die KI analysiert die Anfrage, erkennt, dass Angular-Code geschrieben werden muss, und führt **autonom** einen Aufruf des `get_best_practices`-Tools vom MCP-Server durch.
So werden die aktuellen Coding-Richtlinien abgerufen und fließen direkt in die Code-Generierung ein.
Die Person erhält Code, der den neuesten Standards entspricht.
Je nach Agent werden die Tool-Aufrufe transparent in Statusmeldungen angezeigt oder laufen vollständig im Hintergrund ab.
Es gibt keine spezielle Syntax zum manuellen Aufrufen der Tools.
Die KI entscheidet vollständig eigenständig, wann welches Tool hilfreich ist.

Wichtig ist: Der MCP-Server liefert Inhalte, trifft aber **keine kontextabhängige Auswahl**. Die Integration und Nutzung dieser Inhalte obliegt dem jeweiligen AI-Agenten. Dieser kann den Server lokal starten, per JSON-RPC abfragen und bei Bedarf passende Informationen aus den verfügbaren Tools gezielt in den eigenen Prompt einfügen.

Damit diese Kommunikation funktioniert, muss der MCP-Server jedoch erst korrekt im jeweiligen Agenten konfiguriert werden. Dies geschieht zum Beispiel durch eine Datei wie `mcp.json`. Angular generiert solche Konfigurationsdateien (leider) nicht automatisch. Sie müssen aktuell manuell angelegt werden.

Wird der übermittelte Text vom MCP-Server zu umfangreich, kann er das Kontextfenster des Modells überschreiten.
**Dies ist aktuell einer der größten Schmerzpunkte bei der Entwicklung mit AI-Assistenten:**
Die Limitierung tritt schnell bei längeren Sessions auf, insbesondere bei umfangreichen Projekten oder komplexen Fragestellungen.
In der Praxis bedeutet das: Der AI-Agent verliert den Überblick über frühere Teile der Konversation, kann nicht mehr auf alle relevanten Informationen zugreifen oder muss wichtige Best Practices weglassen, weil der verfügbare Platz erschöpft ist.
Ein Phänomen, das sicherlich jeder schon einmal erlebt hat: Die AI scheint alles zu "vergessen", und man muss alle wichtigen Informationen noch einmal vorkauen.
Das führt zu inkonsistenten Antworten, veralteten Code-Vorschlägen oder der Notwendigkeit, Konversationen neu zu starten und den Kontext manuell wiederherzustellen.

**Hinzu kommt:** Viele AI-Agenten tendieren dazu, Custom Prompts wie die AGENTS.md im Laufe der Konversation zu vergessen und nur noch auf den ursprünglichen System-Prompt zurückzufallen.
Das führt zu einer kompromittierten Konversation, über die man als Entwickler*in keinen Einfluss hat.

Ein möglicher Ansatz zur Lösung dieses Problems ist der Einsatz von Vektordatenbanken, die projektbezogenes Wissen semantisch indizieren.
Solche Systeme sind aktuell noch nicht Teil der Angular-Toolchain, zeigen aber die Richtung, in die sich die Integration von strukturiertem Wissen und generativer KI entwickeln könnte.

**Das ist allerdings noch Zukunftsmusik.** Wir sind gespannt, wie das Angular-Team es in zukünftigen Versionen schaffen wird, möglichst präzise und kontextsensitive Instruktionen bereitzustellen – idealerweise dynamisch, skalierbar und abgestimmt auf die jeweiligen Werkzeuge.

