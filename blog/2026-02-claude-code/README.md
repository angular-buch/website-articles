---
title: 'Claude Code: Der AI-Agent für Angular-Entwickler'
author: Angular-Buch Team
mail: team@angular-buch.com
published: 2026-02-18
keywords:
  - Angular
  - Claude Code
  - AI
  - Artificial Intelligence
  - Künstliche Intelligenz
  - AI-Agent
  - Anthropic
  - CLI
  - Terminal
language: de
---

Claude Code ist ein AI-Agent, der direkt im Terminal läuft.
Er kann Dateien lesen und schreiben, Befehle ausführen und komplexe Aufgaben autonom planen.
**In diesem Artikel zeigen wir dir, wie du Claude Code für die Angular-Entwicklung einrichtest und effektiv nutzt.**

## Inhalt

[[toc]]

## Was ist Claude Code?

Claude Code ist die CLI-Version von Claude, dem AI-Modell von Anthropic.
Der entscheidende Unterschied zum Browser-Chat: Claude Code arbeitet direkt in deinem Projekt.
Es liest deinen Code, versteht den Kontext und kann Änderungen selbst umsetzen.

Stell es dir so vor: Der Browser-Chat gibt dir Ratschläge.
Claude Code setzt sich an deinen Schreibtisch und erledigt die Arbeit.

### Die Werkzeuge

Claude Code verfügt über verschiedene Werkzeuge, um Aufgaben zu erledigen:

| Werkzeug | Beschreibung |
|----------|--------------|
| **Read** | Liest Dateien aus deinem Projekt |
| **Write** | Erstellt neue Dateien |
| **Edit** | Bearbeitet bestehende Dateien (mit Diff-Ansicht) |
| **Bash** | Führt Shell-Befehle aus (z. B. `ng generate`, `npm test`) |
| **Glob** | Sucht nach Dateien anhand von Mustern |
| **Grep** | Durchsucht Dateiinhalte |
| **WebFetch** | Ruft Inhalte aus dem Web ab |
| **WebSearch** | Durchsucht das Web nach Informationen |

Der Agent entscheidet selbstständig, welche Werkzeuge er für eine Aufgabe benötigt.
Du siehst immer, welches Werkzeug gerade verwendet wird.

### Das Bestätigungssystem

Dabei behältst du die Kontrolle: Vor jeder Dateiänderung fragt Claude Code nach Bestätigung.
Du siehst einen Diff mit den geplanten Änderungen und hast mehrere Optionen:

- **y** (Yes): Änderung akzeptieren
- **n** (No): Änderung ablehnen
- **a** (Always): Alle weiteren Änderungen dieser Art automatisch akzeptieren
- **e** (Edit): Die Änderung vor dem Akzeptieren bearbeiten
- Oder du gibst direkt Feedback ein, was anders gemacht werden soll

Dieses System sorgt dafür, dass du nie die Kontrolle verlierst, auch wenn der Agent autonom arbeitet.

## Installation

Die Installation dauert etwa eine Minute.
Voraussetzung ist Node.js (ab Version 18).

**macOS / Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

Nach der Installation startest du Claude Code mit:

```bash
claude
```

Beim ersten Start wirst du aufgefordert, dich mit deinem Anthropic-Konto anzumelden.
Du benötigst ein Claude Pro-Abo (20 $/Monat) oder Max-Abo (100 $/Monat für intensivere Nutzung).

### Der erste Start

Wenn du `claude` zum ersten Mal ausführst, passiert Folgendes:

1. **Theme-Auswahl:** Dark Mode oder Light Mode?
2. **Login:** Ein Browser-Fenster öffnet sich zur Authentifizierung
3. **Fertig:** Du siehst den Claude Code Prompt und kannst loslegen

Falls etwas nicht klappt: Keine Sorge!
Du kannst buchstäblich Claude (im Browser unter claude.ai) fragen, wie du Claude Code installierst.
Mach einen Screenshot der Fehlermeldung und frag nach einer Lösung.

### Deine ersten Schritte

Bevor du an komplexe Angular-Aufgaben gehst, probiere etwas Einfaches:

```bash
cd ~/Documents
claude
```

Dann im Claude Code Prompt:

```
Liste alle Dateien in diesem Ordner auf und erkläre kurz, was sie sind.
```

Claude Code wird die Dateien analysieren und dir eine Übersicht geben.
So bekommst du ein Gefühl für den Workflow, bevor es ans Eingemachte geht.

Weitere einfache Einstiegsaufgaben:

- "Fasse den Inhalt der Datei notes.txt zusammen"
- "Finde alle PDF-Dateien in diesem Ordner"
- "Erstelle eine neue Textdatei mit einer Einkaufsliste"

### Updates

Claude Code aktualisiert sich in der Regel automatisch.
Falls nicht, kannst du manuell updaten:

```bash
claude update
```

Mit `/doctor` prüfst du, ob alles korrekt eingerichtet ist.

## Der Workflow

### Grundlegender Ablauf

Ein typischer Workflow mit Claude Code sieht so aus:

1. **Navigiere zum Projekt:** `cd mein-angular-projekt`
2. **Starte Claude Code:** `claude`
3. **Beschreibe die Aufgabe:** z. B. "Erstelle eine neue Komponente für die Benutzerregistrierung"
4. **Beobachte:** Claude Code liest relevante Dateien, plant die Umsetzung
5. **Review:** Du siehst die geplanten Änderungen als Diff
6. **Bestätigen oder Anpassen:** Du entscheidest, was übernommen wird
7. **Iteration:** Bei Bedarf gibst du weiteres Feedback

### Beispiel-Dialog

Hier ein konkretes Beispiel, wie eine Interaktion aussehen kann:

```
Du: Erstelle einen BookService, der Bücher über HTTP lädt.
    Verwende die Resource API und typisiere alles strikt.

Claude Code: Ich werde zunächst die bestehende Projektstruktur analysieren...
             [Read] src/app/app.config.ts
             [Read] src/app/shared/book.ts

             Ich sehe, dass du bereits ein Book-Interface hast.
             Ich erstelle jetzt den Service:

             [Write] src/app/books/book.service.ts
             + import { Injectable, resource } from '@angular/core';
             + import { Book } from '../shared/book';
             + ...

             Soll ich die Änderung übernehmen? [y/n/a/e]

Du: y

Claude Code: Datei erstellt. Soll ich auch Unit Tests generieren?

Du: Ja, mit Vitest.

Claude Code: [Write] src/app/books/book.service.spec.ts
             ...
```

### Nützliche Slash-Befehle

Im Claude Code Terminal stehen dir viele Befehle zur Verfügung:

| Befehl | Beschreibung |
|--------|--------------|
| `/help` | Zeigt alle verfügbaren Befehle |
| `/clear` | Löscht den Konversationsverlauf |
| `/compact` | Komprimiert den Kontext (nützlich bei langen Sessions) |
| `/context` | Zeigt die aktuelle Auslastung des Kontext-Fensters |
| `/cost` | Zeigt die API-Kosten der aktuellen Session |
| `/doctor` | Prüft die Installation auf Probleme |
| `/memory` | Zeigt gespeicherte Erinnerungen an |
| `/config` | Öffnet die Konfiguration |
| `/permissions` | Zeigt und verwaltet Berechtigungen |
| `/git` | Git-spezifische Befehle (commit, PR erstellen, etc.) |

### Tastenkürzel

| Kürzel | Aktion |
|--------|--------|
| `Esc` | Aktuelle Aktion abbrechen |
| `Esc` (2x) | Claude Code beenden |
| `Tab` | Autovervollständigung für Dateipfade |
| `Strg+C` | Laufende Operation abbrechen |

## Kontext ist alles

Die Qualität der Ergebnisse hängt stark davon ab, wie viel Kontext Claude Code hat.
Je besser der Agent dein Projekt versteht, desto besseren Code liefert er.

### Dateien referenzieren

Du kannst Dateien direkt in deiner Anfrage erwähnen:

```
Schau dir src/app/user/user.service.ts an und füge eine Methode
zum Löschen von Benutzern hinzu. Orientiere dich am Stil der
bestehenden Methoden.
```

Claude Code liest die Datei automatisch und versteht den bestehenden Code.
Du kannst auch mehrere Dateien referenzieren:

```
Vergleiche src/app/old/legacy.service.ts mit src/app/new/modern.service.ts.
Was sind die Hauptunterschiede? Migriere den Legacy-Service zum modernen Pattern.
```

### Bilder einbinden

Claude Code kann auch Bilder analysieren.
Ziehe einfach einen Screenshot oder ein Mockup ins Terminal:

```
[Bild hier einfügen per Drag & Drop]
Setze dieses Design als Angular-Komponente um.
Verwende Tailwind CSS für das Styling.
```

Das ist besonders nützlich für:
- UI-Mockups in Komponenten umsetzen
- Fehlermeldungen aus dem Browser analysieren
- Diagramme und Architekturbeschreibungen verstehen

### Kontext-Fenster beachten

Jedes AI-Modell hat ein begrenztes Kontext-Fenster (bei Claude: ca. 200.000 Tokens).
Bei langen Sessions kann es passieren, dass frühere Informationen "vergessen" werden.

Der Befehl `/context` zeigt dir die aktuelle Auslastung:

```
/context
───────────────────────────────────────
Context: 127k / 200k tokens (63%)
├── System Prompt:    15k
├── Memory Files:      3k
├── Messages:        109k
└── Free Space:       73k
───────────────────────────────────────
```

Wenn der Kontext voll wird:
- `/compact` komprimiert den bisherigen Verlauf durch Zusammenfassung
- `/clear` startet eine frische Konversation (bei neuen Aufgaben sinnvoll)

## Projekt-Konfiguration

### CLAUDE.md – Projektregeln

Du kannst Claude Code projektspezifisch konfigurieren.
Erstelle dazu eine Datei `.claude/CLAUDE.md` im Projektverzeichnis:

```markdown
# Projektregeln für BookMonkey

## Architektur
- Standalone Components (keine NgModules)
- State Management mit Signals
- Services für Datenzugriff, Resource API für HTTP
- Strikte Trennung: Components haben keine HTTP-Logik

## Dateistruktur
- Feature-Ordner unter src/app/
- Shared-Code unter src/app/shared/
- Ein Feature = ein Ordner mit Component, Service, Tests

## Konventionen
- Dateinamen: kebab-case
- Komponenten-Selektoren: app-*
- Strikte Typisierung, kein `any`
- Interfaces statt Classes für DTOs

## Tests
- Unit Tests mit Vitest
- Jede public Methode braucht Tests
- Mocking mit vi.fn() und vi.spyOn()

## Angular-Version
- Angular 21
- Neue Control Flow Syntax (@if, @for)
- Signal Inputs und Outputs
```

Diese Datei wird automatisch bei jedem Start geladen.
Claude Code befolgt diese Regeln bei allen Aufgaben.

### Speicherorte für CLAUDE.md

Es gibt mehrere Orte, an denen du Regeln hinterlegen kannst:

| Ort | Geltungsbereich |
|-----|-----------------|
| `~/.claude/CLAUDE.md` | Global für alle Projekte |
| `.claude/CLAUDE.md` | Für das aktuelle Projekt |
| `CLAUDE.md` (im Root) | Alternative für das Projekt |

Die Regeln werden kombiniert: Globale Regeln + Projektregeln.

### Memory – Was sich Claude Code merkt

Mit dem `/memory`-Befehl kannst du Informationen dauerhaft speichern:

```
/memory add Für dieses Projekt verwenden wir Vitest statt Karma.
```

Diese Erinnerungen bleiben über Sessions hinweg erhalten und werden automatisch geladen.
Du kannst sie auch über natürliche Sprache hinzufügen:

```
Merke dir: In diesem Projekt importieren wir RxJS-Operatoren
immer einzeln, nie das komplette 'rxjs'-Paket.
```

## Git-Integration

Claude Code kann Git-Operationen durchführen.
Das ist besonders praktisch für Commits und Pull Requests.

### Commits erstellen

```
Erstelle einen Commit für die aktuellen Änderungen.
```

Claude Code:
1. Führt `git status` und `git diff` aus
2. Analysiert alle Änderungen
3. Schlägt eine passende Commit-Message vor
4. Führt den Commit nach Bestätigung aus

### Pull Requests

```
Erstelle einen Pull Request für diesen Branch.
```

Claude Code erstellt einen PR mit:
- Aussagekräftigem Titel
- Zusammenfassung der Änderungen
- Test-Plan (was sollte getestet werden)

Voraussetzung ist die GitHub CLI (`gh`), die installiert und authentifiziert sein muss.

### Code Reviews

```
Analysiere die Änderungen im aktuellen Branch verglichen mit main.
Gibt es potenzielle Probleme?
```

## Angular MCP-Server

Für optimale Ergebnisse bei der Angular-Entwicklung empfehlen wir den MCP-Server der Angular CLI.
MCP (Model Context Protocol) ermöglicht es Claude Code, auf Angular-spezifische Dokumentation und Best Practices zuzugreifen.

### Einrichtung

Die Konfiguration erfolgt in der Datei `.claude/settings.json`:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

### Verfügbare Werkzeuge

Mit dieser Konfiguration stehen Claude Code zusätzliche Werkzeuge zur Verfügung:

| Werkzeug | Beschreibung |
|----------|--------------|
| `get_best_practices` | Aktuelle Angular-Coding-Guidelines |
| `search_documentation` | Durchsucht die offizielle Angular-Doku |
| `find_examples` | Code-Beispiele für moderne Features |
| `modernize` | Migriert zu modernen Patterns |
| `test` | Führt Unit Tests aus |
| `build` | Baut das Projekt |

### Beispiel: Best Practices abrufen

```
Frage den Angular MCP-Server nach Best Practices für Signal Forms.
```

Claude Code ruft dann aktuelle Informationen ab, die möglicherweise neuer sind als sein Trainingswissen.

Mehr Details zum MCP-Server findest du in unserem Artikel [Agentic Coding: AI-Unterstützung für Angular](../2026-02-agentic-coding).

## Dein erstes Angular-Projekt mit Claude Code

Lass uns ein konkretes Beispiel durchgehen: Du möchtest eine kleine Angular-App erstellen, die Bücher anzeigt.

### Schritt 1: Projekt erstellen

```bash
cd ~/projects
claude
```

```
Erstelle ein neues Angular-Projekt namens "book-app".
Verwende Standalone Components und Signals.
```

Claude Code führt `ng new book-app` aus und konfiguriert das Projekt.

### Schritt 2: Datenmodell anlegen

```
Erstelle ein Interface für Bücher mit Titel, Autor und ISBN.
Lege es unter src/app/shared/book.ts ab.
```

### Schritt 3: Service erstellen

```
Erstelle einen BookService, der Bücher von einer API lädt.
Verwende die Resource API.
Die API-URL ist https://api.angular.schule/books.
```

### Schritt 4: Komponente bauen

```
Erstelle eine BookListComponent, die alle Bücher anzeigt.
Nutze den BookService und zeige Loading-State.
Verwende die neue Control Flow Syntax (@if, @for).
```

### Schritt 5: Routing einrichten

```
Füge Routing hinzu. Die BookListComponent soll unter /books erreichbar sein.
Erstelle auch eine einfache Home-Komponente für die Startseite.
```

### Schritt 6: Testen

```
Starte den Dev-Server und prüfe, ob alles funktioniert.
```

In weniger als 10 Minuten hast du eine funktionsfähige Angular-App erstellt.
Das Beste: Du hast dabei die aktuellen Best Practices verwendet, ohne sie alle im Detail kennen zu müssen.

## Praktische Beispiele

### Neue Komponente mit allem Drum und Dran

```
Erstelle eine ProductDetailComponent:
- Zeigt Produktdetails basierend auf einer Route-ID
- Lädt Daten über einen ProductService (Resource API)
- Zeigt Loading-State und Fehlerbehandlung
- Responsive Design mit CSS Grid
- Unit Tests für alle Szenarien
```

### Fehler beheben mit Kontext

```
Der Build schlägt fehl:

Error: src/app/user/user.component.ts:15:5
Property 'users' does not exist on type 'UserComponent'.

Analysiere das Problem und behebe es.
```

Claude Code liest die betroffene Datei, versteht den Kontext und schlägt eine Lösung vor.

### Migration zu modernen Patterns

```
Migriere src/app/legacy/ von NgModules zu Standalone Components.
Behalte die bestehende Funktionalität bei.
Aktualisiere auch die Imports in app.config.ts.
```

### Code Review mit Verbesserungsvorschlägen

```
Reviewe src/app/cart/.
Prüfe auf:
- Performance-Probleme
- Angular Best Practices
- Potenzielle Bugs
- Verbesserungsmöglichkeiten

Liste die Probleme auf und behebe sie dann.
```

### Tests nachreichen

```
Die Datei src/app/auth/auth.service.ts hat keine Tests.
Generiere umfassende Unit Tests:
- Erfolgreiche Authentifizierung
- Fehlgeschlagene Authentifizierung
- Token-Refresh
- Logout
- Edge Cases
```

### Refactoring mit Resource API

```
Refaktoriere src/app/books/book.service.ts:
- Ersetze die manuellen HTTP-Calls durch die Resource API
- Verwende rxResource für reaktive Datenabfragen
- Behalte das Error-Handling bei
- Aktualisiere die Tests entsprechend
```

## Tipps für effektives Arbeiten

### Spezifisch sein

```
❌ Schlecht: "Erstelle einen Service"
✅ Besser: "Erstelle einen BookService mit CRUD-Methoden,
           der die Resource API verwendet und Bücher von
           /api/books lädt. Typisiere alles mit dem Book-Interface
           aus src/app/shared/book.ts."
```

### Kontext explizit geben

```
Schau dir erst src/app/shared/types.ts und
src/app/core/api.service.ts an, bevor du beginnst.
Der neue Service soll dem gleichen Muster folgen.
```

### Iterativ arbeiten

Erwarte nicht, dass das erste Ergebnis perfekt ist.
Der Workflow ist interaktiv:

```
Du: Erstelle eine Login-Komponente.
Claude: [erstellt Komponente]
Du: Gut, aber füge noch Validierung hinzu.
Claude: [erweitert um Validierung]
Du: Die Fehlermeldungen sollen auf Deutsch sein.
Claude: [passt Texte an]
```

### Den Agent reflektieren lassen

```
Schau dir den generierten Code nochmal an.
Gibt es etwas, das du verbessern würdest?
Folgt er den Angular Best Practices?
```

### Kritisch prüfen

Claude Code ist mächtig, aber nicht unfehlbar.
Achte besonders auf:

- **Typisierung:** Kein `any`! Fordere strikte Typen.
- **Tests:** Assertions wie `toBeTruthy()` sind oft zu schwach. Fordere `toEqual()` mit konkreten Werten.
- **Error Handling:** Wird es korrekt behandelt?
- **Performance:** Bei Listen: Wurde `trackBy` verwendet?

## VS Code Integration

Claude Code lässt sich auch in VS Code integrieren.
Die Extension heißt "Claude Code" und ist im Marketplace verfügbar.

Nach der Installation erscheint ein Claude-Icon in der Seitenleiste.
Du kannst Claude Code dann direkt in VS Code nutzen, ohne das Terminal separat zu öffnen.

Die Befehle und der Workflow bleiben identisch.

## Kosten im Blick

Claude Code verwendet die Anthropic API.
Mit dem Befehl `/cost` siehst du die Kosten der aktuellen Session:

```
/cost
───────────────────────────
Session cost: $1.23
├── Input tokens:   45,231
├── Output tokens:  12,847
└── Cache hits:     23,102
───────────────────────────
```

### Kostenmodelle

| Abo | Kosten | Nutzung |
|-----|--------|---------|
| Claude Pro | 20 $/Monat | Gut für Einsteiger und moderate Nutzung |
| Claude Max 5x | 100 $/Monat | Für intensive tägliche Nutzung |
| Claude Max 20x | 200 $/Monat | Für professionelle Entwickler |
| API (Pay-per-use) | variabel | Für Automatisierung und CI/CD |

Eine typische Entwicklungs-Session (1-2 Stunden) verbraucht etwa 0,50–3 $ an API-Kosten.
Bei intensiver Nutzung lohnt sich das Max-Abo.

## Troubleshooting

### "command not found: claude"

Die Installation hat nicht geklappt oder der PATH stimmt nicht.
Führe die Installation erneut aus oder starte ein neues Terminal-Fenster.

### Login funktioniert nicht

Prüfe, ob du ein aktives Claude Pro- oder Max-Abo hast.
Ohne Abo funktioniert Claude Code nicht.

### Claude Code antwortet nicht mehr

Drücke `Esc` oder `Strg+C`, um die aktuelle Operation abzubrechen.
Mit `/clear` startest du eine frische Session.

### Änderungen werden nicht übernommen

Hast du mit `y` bestätigt?
Prüfe auch, ob du Schreibrechte für die Dateien hast.

### Allgemeiner Tipp

Wenn du nicht weiterkommst: Frag Claude!
Entweder direkt in Claude Code oder im Browser unter claude.ai.
Mach einen Screenshot des Problems und beschreibe, was du erwartet hast.

## Was ist noch möglich?

Claude Code ist nicht nur für Angular-Entwicklung nützlich.
Hier ein paar Ideen, was du noch ausprobieren kannst:

- **Dokumentation schreiben:** "Erstelle eine README für dieses Projekt"
- **Legacy-Code verstehen:** "Erkläre mir, was diese Funktion macht"
- **Shell-Skripte erstellen:** "Schreibe ein Skript, das alle node_modules-Ordner findet und löscht"
- **Daten analysieren:** "Analysiere diese CSV-Datei und fasse die wichtigsten Erkenntnisse zusammen"
- **Refactoring planen:** "Wie würdest du dieses Modul umstrukturieren?"
- **Lernhilfe:** "Erkläre mir, wie RxJS Observables funktionieren – mit einfachen Beispielen"

Die Möglichkeiten sind nahezu unbegrenzt.
Probiere es einfach aus!

## Fazit

Claude Code ist ein mächtiges Werkzeug für die Angular-Entwicklung.
Mit der richtigen Konfiguration – projektspezifische Regeln in `.claude/CLAUDE.md` und der Angular MCP-Server – bekommst du Code, der aktuellen Best Practices entspricht.

Die wichtigsten Erfolgsfaktoren:

1. **Kontext geben:** Je mehr Claude Code über dein Projekt weiß, desto besser.
2. **Spezifisch sein:** Vage Anfragen führen zu vagen Ergebnissen.
3. **Iterativ arbeiten:** Verfeinere schrittweise.
4. **Kritisch prüfen:** Der Agent ist ein Werkzeug, kein Ersatz für Expertise.

Starte mit kleinen Aufgaben, lerne den Workflow kennen und steigere dich zu komplexeren Szenarien.
Die Lernkurve ist kurz, der Produktivitätsgewinn kann enorm sein.

<hr>

<small>**Titelbild:** ???</small>
