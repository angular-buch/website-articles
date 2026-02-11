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

Dabei behältst du die Kontrolle: Vor jeder Dateiänderung fragt Claude Code nach Bestätigung.
Du siehst einen Diff mit den geplanten Änderungen und entscheidest, ob sie übernommen werden sollen.

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

## Der Workflow

Ein typischer Workflow mit Claude Code sieht so aus:

1. **Navigiere zum Projekt:** `cd mein-angular-projekt`
2. **Starte Claude Code:** `claude`
3. **Beschreibe die Aufgabe:** z. B. "Erstelle eine neue Komponente für die Benutzerregistrierung"
4. **Review:** Claude Code zeigt dir die geplanten Änderungen als Diff
5. **Bestätigen oder Anpassen:** Du entscheidest, was übernommen wird

### Nützliche Befehle

Im Claude Code Terminal stehen dir einige Befehle zur Verfügung:

| Befehl | Beschreibung |
|--------|--------------|
| `/help` | Zeigt alle verfügbaren Befehle |
| `/clear` | Löscht den Konversationsverlauf |
| `/compact` | Komprimiert den Kontext (nützlich bei langen Sessions) |
| `/cost` | Zeigt die API-Kosten der aktuellen Session |
| `/doctor` | Prüft die Installation auf Probleme |

### Tastenkürzel

| Kürzel | Aktion |
|--------|--------|
| `Esc` | Aktuelle Aktion abbrechen |
| `Esc` (2x) | Aus Claude Code springen (wie Vim) |
| `Tab` | Autovervollständigung für Dateipfade |

## Kontext ist alles

Die Qualität der Ergebnisse hängt stark davon ab, wie viel Kontext Claude Code hat.
Je besser der Agent dein Projekt versteht, desto besseren Code liefert er.

### Dateien referenzieren

Du kannst Dateien direkt in deiner Anfrage erwähnen:

```
Schau dir src/app/user/user.service.ts an und füge eine Methode
zum Löschen von Benutzern hinzu.
```

Claude Code liest die Datei automatisch und versteht den bestehenden Code.

### Bilder einbinden

Claude Code kann auch Bilder analysieren.
Ziehe einfach einen Screenshot oder ein Mockup ins Terminal:

```
[Bild hier einfügen]
Setze dieses Design als Angular-Komponente um.
```

### Kontext-Fenster beachten

Jedes AI-Modell hat ein begrenztes Kontext-Fenster.
Bei langen Sessions kann es passieren, dass frühere Informationen "vergessen" werden.
Mit `/compact` komprimierst du den bisherigen Verlauf.
Mit `/clear` startest du eine frische Konversation.

Der Befehl `/context` zeigt dir die aktuelle Auslastung des Kontext-Fensters.

## Projekt-Konfiguration

Du kannst Claude Code projektspezifisch konfigurieren.
Erstelle dazu eine Datei `.claude/CLAUDE.md` im Projektverzeichnis:

```markdown
# Projektregeln

## Architektur
- Wir verwenden Standalone Components
- State Management mit Signals
- Services für Datenzugriff

## Konventionen
- Dateinamen: kebab-case
- Komponenten-Selektoren: app-*
- Strikte Typisierung, kein `any`

## Tests
- Unit Tests mit Vitest
- Mindestens ein Test pro public Methode
```

Diese Datei wird automatisch geladen und gibt Claude Code wichtige Hinweise für dein Projekt.
Hier kannst du Architekturentscheidungen, Coding-Konventionen und projektspezifische Regeln hinterlegen.

## Angular MCP-Server

Für optimale Ergebnisse bei der Angular-Entwicklung empfehlen wir den MCP-Server der Angular CLI.
MCP (Model Context Protocol) ermöglicht es Claude Code, auf Angular-spezifische Dokumentation und Best Practices zuzugreifen.

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

Mit dieser Konfiguration stehen Claude Code zusätzliche Werkzeuge zur Verfügung:

- `get_best_practices`: Aktuelle Angular-Coding-Guidelines
- `search_documentation`: Durchsucht die offizielle Angular-Dokumentation
- `find_examples`: Liefert Code-Beispiele für moderne Angular-Features
- `modernize`: Unterstützt Migrationen zu modernen Patterns

Mehr Details zum MCP-Server findest du in unserem Artikel [Agentic Coding: AI-Unterstützung für Angular](/blog/2026-02-agentic-coding).

## Praktische Beispiele

### Komponente generieren

```
Erstelle eine ProductListComponent, die eine Liste von Produkten anzeigt.
Verwende Signals für den State und hole die Daten über einen ProductService.
Schreibe auch Unit Tests.
```

### Fehler beheben

```
Der Build schlägt fehl mit folgendem Fehler:
[Fehlermeldung einfügen]
Analysiere das Problem und behebe es.
```

### Code Review

```
Schau dir die Datei src/app/cart/cart.component.ts an.
Gibt es Verbesserungspotenzial bezüglich Performance oder Best Practices?
```

### Refactoring

```
Refaktoriere den BookService, um die Resource API zu verwenden.
Behalte die bestehende Funktionalität bei.
```

### Tests generieren

```
Generiere Unit Tests für die UserComponent.
Mocke den UserService und teste alle wichtigen Szenarien.
```

## Tipps für effektives Arbeiten

- **Sei spezifisch:** "Erstelle einen Service" ist zu vage. "Erstelle einen BookService mit CRUD-Methoden, der die Resource API verwendet" ist besser.

- **Iterativ arbeiten:** Erwarte nicht, dass das erste Ergebnis perfekt ist. Verfeinere schrittweise.

- **Kontext geben:** Referenziere bestehende Dateien, Interfaces oder Konventionen in deinem Projekt.

- **Lass Tests generieren:** Das Erstellen von TestBed-Konfigurationen und Mocks ist eine Stärke von AI-Agenten.

- **Fehler erklären lassen:** Wenn ein Fehler auftritt, lass Claude Code die Fehlermeldung analysieren und Lösungen vorschlagen.

- **Kritisch prüfen:** Überprüfe generierten Code immer. Achte besonders auf strikte Typisierung (kein `any`!) und sinnvolle Assertions in Tests.

## Kosten im Blick

Claude Code verwendet die Anthropic API.
Mit dem Befehl `/cost` siehst du, wie viel die aktuelle Session gekostet hat.

Eine typische Entwicklungs-Session verbraucht etwa 0,50–2 $ an API-Kosten.
Bei intensiver Nutzung lohnt sich das Claude Max-Abo, das unbegrenzte Nutzung bietet.

## Fazit

Claude Code ist ein mächtiges Werkzeug für die Angular-Entwicklung.
Mit der richtigen Konfiguration – projektspezifische Regeln in `.claude/CLAUDE.md` und der Angular MCP-Server – bekommst du Code, der aktuellen Best Practices entspricht.

Der Schlüssel liegt im Kontext: Je besser Claude Code dein Projekt versteht, desto bessere Ergebnisse liefert es.
Starte mit kleinen Aufgaben, lerne den Workflow kennen und steigere dich zu komplexeren Szenarien.

<hr>

<small>**Titelbild:** ???</small>
