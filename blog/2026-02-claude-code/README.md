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

Doch wie funktioniert das konkret? Claude Code verfügt über verschiedene Werkzeuge:

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
Du siehst dabei immer, welches Werkzeug gerade verwendet wird – und genau hier kommt ein wichtiger Aspekt ins Spiel: die Kontrolle.

Vor jeder Dateiänderung fragt Claude Code nach Bestätigung.
Du siehst einen Diff mit den geplanten Änderungen und hast mehrere Optionen:

- **y** (Yes): Änderung akzeptieren
- **n** (No): Änderung ablehnen
- **a** (Always): Alle weiteren Änderungen dieser Art automatisch akzeptieren
- **e** (Edit): Die Änderung vor dem Akzeptieren bearbeiten
- Oder du gibst direkt Feedback ein, was anders gemacht werden soll

Dieses System sorgt dafür, dass du nie die Kontrolle verlierst, auch wenn der Agent autonom arbeitet.

## Warum ein Terminal?

Auf den ersten Blick wirkt die Entscheidung für ein Terminal-Interface anachronistisch.
Warum keine schicke GUI mit Buttons und Menüs?
Warum kein Plugin für VS Code mit integriertem Panel?

Die Antwort liegt in einer interessanten Designentscheidung: Das Terminal zwingt zu radikaler Einfachheit.
Wenn dein Interface nur aus Text besteht, musst du jede Funktionalität entweder automatisieren oder über Slash-Befehle und Tastenkürzel zugänglich machen.
Es gibt keine Ausweichmöglichkeit in Form von "hier noch ein Button, dort noch ein Dropdown".

Diese Einschränkung ist gleichzeitig eine Stärke.
Anthropic muss sich bei jeder Funktion fragen: Kann der Agent das selbst erkennen und erledigen?
Oder ist es so häufig gebraucht, dass es einen kurzen Befehl verdient?
Das Ergebnis ist ein Interface, das überraschend gut funktioniert – gerade weil es so reduziert ist.

Natürlich gibt es auch eine VS Code-Extension (dazu später mehr).
Aber die eigentliche Magie passiert im Terminal: ein Chat-Interface, Text rein, Aktionen raus.
Kein Schnickschnack, nur Produktivität.

Klingt vielversprechend? Dann lass uns mit der Installation beginnen.

## Installation

Die gute Nachricht: Die Installation dauert etwa eine Minute.
Voraussetzung ist lediglich Node.js (ab Version 18).

**macOS / Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

Nach der Installation startest du Claude Code einfach mit:

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

Falls bei der Installation etwas nicht klappt: Keine Sorge!
Du kannst buchstäblich Claude (im Browser unter claude.ai) fragen, wie du Claude Code installierst.
Mach einen Screenshot der Fehlermeldung und frag nach einer Lösung – das ist keine Ironie, sondern ein praktikabler Ansatz.

### Die ersten Gehversuche

Bevor du dich an komplexe Angular-Aufgaben wagst, empfehlen wir, mit etwas Einfachem zu beginnen.
So bekommst du ein Gefühl für den Workflow:

```bash
cd ~/Documents
claude
```

Dann im Claude Code Prompt:

```
Liste alle Dateien in diesem Ordner auf und erkläre kurz, was sie sind.
```

Claude Code wird die Dateien analysieren und dir eine Übersicht geben.
Probiere ruhig noch ein paar weitere einfache Aufgaben aus:

- "Fasse den Inhalt der Datei notes.txt zusammen"
- "Finde alle PDF-Dateien in diesem Ordner"
- "Erstelle eine neue Textdatei mit einer Einkaufsliste"

Sobald du dich mit der grundlegenden Interaktion vertraut gemacht hast, bist du bereit für den eigentlichen Workflow.

### Updates

Übrigens: Claude Code aktualisiert sich in der Regel automatisch.
Falls nicht, kannst du manuell mit `claude update` aktualisieren.
Und mit dem Befehl `/doctor` prüfst du, ob alles korrekt eingerichtet ist.

## Der Workflow

Jetzt wird es konkret: Wie sieht die tägliche Arbeit mit Claude Code aus?
Ein typischer Workflow folgt diesem Muster:

1. **Navigiere zum Projekt:** `cd mein-angular-projekt`
2. **Starte Claude Code:** `claude`
3. **Beschreibe die Aufgabe:** z. B. "Erstelle eine neue Komponente für die Benutzerregistrierung"
4. **Beobachte:** Claude Code liest relevante Dateien und plant die Umsetzung
5. **Review:** Du siehst die geplanten Änderungen als Diff
6. **Bestätigen oder Anpassen:** Du entscheidest, was übernommen wird
7. **Iteration:** Bei Bedarf gibst du weiteres Feedback

Das klingt abstrakt – deshalb hier ein konkretes Beispiel, wie so eine Interaktion aussehen kann:

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

Wie du siehst, ist der Dialog iterativ: Du gibst eine Aufgabe, Claude Code arbeitet, und du steuerst nach.
Dabei helfen dir einige Slash-Befehle, die direkt im Claude Code Prompt verfügbar sind:

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

Zusätzlich gibt es einige Tastenkürzel, die du kennen solltest:

| Kürzel | Aktion |
|--------|--------|
| `Esc` | Aktuelle Aktion abbrechen |
| `Esc` (2x) | Claude Code beenden |
| `Tab` | Autovervollständigung für Dateipfade |
| `Strg+C` | Laufende Operation abbrechen |

Der Workflow ist also schnell erlernt.
Doch die Qualität der Ergebnisse hängt von einem entscheidenden Faktor ab: dem Kontext.

## Kontext ist alles

Je mehr Claude Code über dein Projekt weiß, desto besseren Code liefert es.
Das klingt offensichtlich, ist aber der wichtigste Erfolgsfaktor beim Arbeiten mit AI-Agenten.

### Dateien referenzieren

Der einfachste Weg, Kontext zu geben, ist das Referenzieren von Dateien.
Du kannst sie direkt in deiner Anfrage erwähnen:

```
Schau dir src/app/user/user.service.ts an und füge eine Methode
zum Löschen von Benutzern hinzu. Orientiere dich am Stil der
bestehenden Methoden.
```

Claude Code liest die Datei automatisch und versteht den bestehenden Code.
Du kannst auch mehrere Dateien referenzieren, um Vergleiche anzustellen oder Muster zu übertragen:

```
Vergleiche src/app/old/legacy.service.ts mit src/app/new/modern.service.ts.
Was sind die Hauptunterschiede? Migriere den Legacy-Service zum modernen Pattern.
```

### Bilder einbinden

Eine besonders praktische Funktion: Claude Code kann auch Bilder analysieren.
Ziehe einfach einen Screenshot oder ein Mockup per Drag & Drop ins Terminal:

```
[Bild hier einfügen per Drag & Drop]
Setze dieses Design als Angular-Komponente um.
Verwende Tailwind CSS für das Styling.
```

Das ist besonders nützlich, wenn du UI-Mockups in Komponenten umsetzen, Fehlermeldungen aus dem Browser analysieren oder Diagramme und Architekturbeschreibungen verstehen möchtest.

### Das Kontext-Fenster

Es gibt allerdings eine technische Einschränkung: Jedes AI-Modell hat ein begrenztes Kontext-Fenster.
Bei Claude sind das etwa 200.000 Tokens – eine Menge, aber bei langen Sessions kann es passieren, dass frühere Informationen "vergessen" werden.

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

Wenn der Kontext voll wird, hast du zwei Möglichkeiten:
Mit `/compact` komprimierst du den bisherigen Verlauf durch eine Zusammenfassung.
Mit `/clear` startest du eine komplett frische Konversation – das ist sinnvoll, wenn du ohnehin zu einer neuen Aufgabe wechselst.

Doch Kontext muss nicht nur spontan gegeben werden.
Viel eleganter ist es, projektspezifische Regeln dauerhaft zu hinterlegen.

## Projekt-Konfiguration

Claude Code lässt sich projektspezifisch konfigurieren, sodass es von Anfang an weiß, wie dein Projekt strukturiert ist und welchen Konventionen es folgen soll.
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

Diese Datei wird automatisch bei jedem Start geladen, und Claude Code befolgt diese Regeln bei allen Aufgaben.

Es gibt übrigens mehrere Orte, an denen du solche Regeln hinterlegen kannst:

| Ort | Geltungsbereich |
|-----|-----------------|
| `~/.claude/CLAUDE.md` | Global für alle Projekte |
| `.claude/CLAUDE.md` | Für das aktuelle Projekt |
| `CLAUDE.md` (im Root) | Alternative für das Projekt |

Die Regeln werden kombiniert: Globale Regeln plus projektspezifische Regeln.

### Memory – langfristige Erinnerungen

Neben der CLAUDE.md gibt es noch eine weitere Möglichkeit, Wissen dauerhaft zu speichern: das Memory-Feature.
Mit dem `/memory`-Befehl kannst du Informationen hinterlegen, die über Sessions hinweg erhalten bleiben:

```
/memory add Für dieses Projekt verwenden wir Vitest statt Karma.
```

Du kannst Erinnerungen auch in natürlicher Sprache hinzufügen:

```
Merke dir: In diesem Projekt importieren wir RxJS-Operatoren
immer einzeln, nie das komplette 'rxjs'-Paket.
```

Diese Erinnerungen werden automatisch geladen und beeinflussen das Verhalten von Claude Code.
Damit hast du eine flexible Möglichkeit, projektspezifisches Wissen anzureichern, ohne die CLAUDE.md zu bearbeiten.

## Git-Integration

Ein weiterer Bereich, in dem Claude Code glänzt, ist die Arbeit mit Git.
Du musst keine Commit-Messages mehr formulieren oder PR-Beschreibungen schreiben – Claude Code kann das für dich übernehmen.

### Commits erstellen

Gib einfach an, dass du einen Commit erstellen möchtest:

```
Erstelle einen Commit für die aktuellen Änderungen.
```

Claude Code führt dann automatisch `git status` und `git diff` aus, analysiert alle Änderungen, schlägt eine passende Commit-Message vor und führt den Commit nach deiner Bestätigung aus.

### Pull Requests

Auch Pull Requests lassen sich so erstellen:

```
Erstelle einen Pull Request für diesen Branch.
```

Claude Code generiert einen PR mit aussagekräftigem Titel, einer Zusammenfassung der Änderungen und einem Test-Plan.
Voraussetzung ist die GitHub CLI (`gh`), die installiert und authentifiziert sein muss.

### Code Reviews

Und wenn du wissen möchtest, ob deine Änderungen Probleme verursachen könnten:

```
Analysiere die Änderungen im aktuellen Branch verglichen mit main.
Gibt es potenzielle Probleme?
```

Die Git-Integration spart Zeit bei Routineaufgaben und sorgt für konsistente, aussagekräftige Commit-Messages.
Doch für die Angular-Entwicklung gibt es noch ein weiteres Feature, das besonders wertvoll ist.

## Angular MCP-Server

Eines der größten Probleme bei AI-Modellen ist veraltetes Trainingswissen.
Angular entwickelt sich schnell, und was vor einem Jahr Best Practice war, kann heute überholt sein.
Der MCP-Server (Model Context Protocol) der Angular CLI löst dieses Problem elegant.

MCP ermöglicht es Claude Code, auf aktuelle Angular-Dokumentation und Best Practices zuzugreifen – frisch und direkt von der Quelle.

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

Du kannst diese Werkzeuge explizit anfordern:

```
Frage den Angular MCP-Server nach Best Practices für Signal Forms.
```

Claude Code ruft dann aktuelle Informationen ab, die möglicherweise neuer sind als sein Trainingswissen.
Mehr Details zum MCP-Server und warum er so wichtig ist, findest du in unserem Artikel [Agentic Coding: AI-Unterstützung für Angular](../2026-02-agentic-coding).

Genug Theorie – lass uns ein konkretes Projekt umsetzen.

## Dein erstes Angular-Projekt mit Claude Code

Um das Gelernte anzuwenden, gehen wir ein konkretes Beispiel durch: eine kleine Angular-App, die Bücher anzeigt.
Du wirst sehen, wie schnell du mit Claude Code zu einem funktionierenden Ergebnis kommst.

### Schritt 1: Projekt erstellen

Starte Claude Code in einem Verzeichnis deiner Wahl:

```bash
cd ~/projects
claude
```

Dann gibst du die erste Aufgabe:

```
Erstelle ein neues Angular-Projekt namens "book-app".
Verwende Standalone Components und Signals.
```

Claude Code führt `ng new book-app` aus und konfiguriert das Projekt entsprechend.

### Schritt 2: Datenmodell anlegen

Als Nächstes benötigen wir ein Datenmodell:

```
Erstelle ein Interface für Bücher mit Titel, Autor und ISBN.
Lege es unter src/app/shared/book.ts ab.
```

### Schritt 3: Service erstellen

Jetzt der Service, der die Daten lädt:

```
Erstelle einen BookService, der Bücher von einer API lädt.
Verwende die Resource API.
Die API-URL ist https://api.angular.schule/books.
```

### Schritt 4: Komponente bauen

Zeit für die UI:

```
Erstelle eine BookListComponent, die alle Bücher anzeigt.
Nutze den BookService und zeige Loading-State.
Verwende die neue Control Flow Syntax (@if, @for).
```

### Schritt 5: Routing einrichten

Damit die Komponente erreichbar ist:

```
Füge Routing hinzu. Die BookListComponent soll unter /books erreichbar sein.
Erstelle auch eine einfache Home-Komponente für die Startseite.
```

### Schritt 6: Testen

Zum Abschluss prüfen wir, ob alles funktioniert:

```
Starte den Dev-Server und prüfe, ob alles funktioniert.
```

In weniger als 10 Minuten hast du eine funktionsfähige Angular-App erstellt.
Das Beste daran: Du hast dabei aktuelle Best Practices verwendet, ohne sie alle im Detail kennen zu müssen.

## Praktische Beispiele

Nach dem Einstiegsprojekt fragst du dich vielleicht, welche anderen Aufgaben sich mit Claude Code lösen lassen.
Hier einige Beispiele aus dem Entwickleralltag.

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

Wenn der Build fehlschlägt, kannst du die Fehlermeldung direkt an Claude Code weitergeben:

```
Der Build schlägt fehl:

Error: src/app/user/user.component.ts:15:5
Property 'users' does not exist on type 'UserComponent'.

Analysiere das Problem und behebe es.
```

Claude Code liest die betroffene Datei, versteht den Kontext und schlägt eine Lösung vor.

### Migration zu modernen Patterns

Legacy-Code modernisieren ist eine Stärke von Claude Code:

```
Migriere src/app/legacy/ von NgModules zu Standalone Components.
Behalte die bestehende Funktionalität bei.
Aktualisiere auch die Imports in app.config.ts.
```

### Code Review mit Verbesserungsvorschlägen

Claude Code kann auch als Reviewer fungieren:

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

Fehlende Tests sind ein häufiges Problem, das Claude Code lösen kann:

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

Und wenn du HTTP-Calls modernisieren möchtest:

```
Refaktoriere src/app/books/book.service.ts:
- Ersetze die manuellen HTTP-Calls durch die Resource API
- Verwende rxResource für reaktive Datenabfragen
- Behalte das Error-Handling bei
- Aktualisiere die Tests entsprechend
```

Diese Beispiele zeigen die Bandbreite der Möglichkeiten.
Doch unabhängig von der konkreten Aufgabe gibt es einige Prinzipien, die für effektives Arbeiten entscheidend sind.

## Tipps für effektives Arbeiten

Nach einiger Zeit mit Claude Code wirst du Muster erkennen, die zu besseren Ergebnissen führen.
Hier die wichtigsten Erkenntnisse aus unserer Praxis.

### Spezifisch sein

Vage Anfragen führen zu vagen Ergebnissen. Vergleiche:

```
❌ Schlecht: "Erstelle einen Service"
✅ Besser: "Erstelle einen BookService mit CRUD-Methoden,
           der die Resource API verwendet und Bücher von
           /api/books lädt. Typisiere alles mit dem Book-Interface
           aus src/app/shared/book.ts."
```

### Kontext explizit geben

Referenziere bestehende Dateien, damit Claude Code Muster übernehmen kann:

```
Schau dir erst src/app/shared/types.ts und
src/app/core/api.service.ts an, bevor du beginnst.
Der neue Service soll dem gleichen Muster folgen.
```

### Iterativ arbeiten

Erwarte nicht, dass das erste Ergebnis perfekt ist.
Der Workflow ist interaktiv – und das ist eine Stärke, keine Schwäche:

```
Du: Erstelle eine Login-Komponente.
Claude: [erstellt Komponente]
Du: Gut, aber füge noch Validierung hinzu.
Claude: [erweitert um Validierung]
Du: Die Fehlermeldungen sollen auf Deutsch sein.
Claude: [passt Texte an]
```

### Den Agent reflektieren lassen

Ein oft unterschätzter Trick: Lass Claude Code seine eigene Arbeit überprüfen.

```
Schau dir den generierten Code nochmal an.
Gibt es etwas, das du verbessern würdest?
Folgt er den Angular Best Practices?
```

### Kritisch prüfen

So mächtig Claude Code ist – es ist nicht unfehlbar.
Achte besonders auf diese Punkte:

- **Typisierung:** Kein `any`! Fordere strikte Typen.
- **Tests:** Assertions wie `toBeTruthy()` sind oft zu schwach. Fordere `toEqual()` mit konkreten Werten.
- **Error Handling:** Wird es korrekt behandelt?
- **Performance:** Bei Listen: Wurde `trackBy` verwendet?

Mit diesen Tipps im Hinterkopf wirst du schnell produktiv.
Doch es gibt noch einige praktische Aspekte, die du kennen solltest.

## VS Code Integration

Wenn du lieber in einer IDE arbeitest statt im Terminal, gibt es gute Nachrichten: Claude Code lässt sich auch in VS Code integrieren.
Die Extension heißt "Claude Code" und ist im Marketplace verfügbar.

Nach der Installation erscheint ein Claude-Icon in der Seitenleiste.
Du kannst Claude Code dann direkt in VS Code nutzen, ohne das Terminal separat zu öffnen.
Die Befehle und der Workflow bleiben dabei identisch.

## Kosten im Blick

Ein wichtiges Thema: Claude Code verwendet die Anthropic API, und die ist nicht kostenlos.
Mit dem Befehl `/cost` siehst du jederzeit die Kosten der aktuellen Session:

```
/cost
───────────────────────────
Session cost: $1.23
├── Input tokens:   45,231
├── Output tokens:  12,847
└── Cache hits:     23,102
───────────────────────────
```

Die Kosten hängen davon ab, wie intensiv du Claude Code nutzt:

| Abo | Kosten | Nutzung |
|-----|--------|---------|
| Claude Pro | 20 $/Monat | Gut für Einsteiger und moderate Nutzung |
| Claude Max 5x | 100 $/Monat | Für intensive tägliche Nutzung |
| Claude Max 20x | 200 $/Monat | Für professionelle Entwickler |
| API (Pay-per-use) | variabel | Für Automatisierung und CI/CD |

Eine typische Entwicklungs-Session (1-2 Stunden) verbraucht etwa 0,50–3 $ an API-Kosten.
Bei intensiver Nutzung lohnt sich das Max-Abo, da es unbegrenzte Nutzung bietet.

## Troubleshooting

Manchmal läuft nicht alles glatt.
Hier die häufigsten Probleme und ihre Lösungen.

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
Das klingt zirkulär, funktioniert aber erstaunlich gut.
Entweder direkt in Claude Code oder im Browser unter claude.ai – mach einen Screenshot des Problems und beschreibe, was du erwartet hast.

## Was ist noch möglich?

Wir haben uns in diesem Artikel auf Angular konzentriert, aber Claude Code ist universell einsetzbar.
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

Die wichtigsten Erfolgsfaktoren lassen sich in vier Punkte zusammenfassen:

1. **Kontext geben:** Je mehr Claude Code über dein Projekt weiß, desto besser die Ergebnisse.
2. **Spezifisch sein:** Vage Anfragen führen zu vagen Ergebnissen.
3. **Iterativ arbeiten:** Der Dialog ist interaktiv – nutze das.
4. **Kritisch prüfen:** Der Agent ist ein Werkzeug, kein Ersatz für Expertise.

Starte mit kleinen Aufgaben, lerne den Workflow kennen und steigere dich zu komplexeren Szenarien.
Die Lernkurve ist kurz, der Produktivitätsgewinn kann enorm sein.

<hr>

<small>**Titelbild:** ???</small>
