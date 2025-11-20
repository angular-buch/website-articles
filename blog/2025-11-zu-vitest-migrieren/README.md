---
title: 'Vitest in Angular 21: Was ist neu und wie kann man migrieren?'
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
published: 2025-11-18
lastModified: 2025-11-20
keywords:
  - Angular
  - Angular 21
  - Vitest
  - Karma
  - Jasmine
language: de
header: angular-vitest.jpg
---

Mit Angular 21 gibt es eine bedeutende Änderung beim Unit-Testing:
Vitest ist jetzt der Standard, die bisherige Standardkombination aus Karma und Jasmine wird abgelöst.
Beim Erzeugen eines neuen Projekts mit `ng new` verwendet Angular 21 nun standardmäßig **Vitest** als Test-Runner.
Vitest verspricht deutlich kürzere Startzeiten, moderne Features und eine einfache Jest-kompatible API.
In diesem Artikel zeigen wir, was Vitest für dich bedeutet, wie du bestehende Angular-Projekte migrieren kannst und welche Vorteile Vitest bietet.

> **🇬🇧 This article is available in English language here: [Vitest in Angular 21: What's new and how to migrate?](https://angular.schule/blog/2025-11-migrate-to-vitest)**

## Inhalt

- [Warum Angular Karma und Jasmine ersetzt](/blog/2025-11-zu-vitest-migrieren#warum-angular-karma-und-jasmine-ersetzt)
- [Migrationsleitfaden: Von Karma/Jasmine zu Vitest](/blog/2025-11-zu-vitest-migrieren#migrationsleitfaden-von-karmajasmine-zu-vitest)
  - [Manuelle Migrationsschritte](/blog/2025-11-zu-vitest-migrieren#manuelle-migrationsschritte)
    - [1. Abhängigkeiten installieren](/blog/2025-11-zu-vitest-migrieren#1-abhängigkeiten-installieren)
    - [2. `angular.json` aktualisieren](/blog/2025-11-zu-vitest-migrieren#2-angularjson-aktualisieren)
    - [3. Eigene `karma.conf.js`‑Konfiguration berücksichtigen](/blog/2025-11-zu-vitest-migrieren#3-eigene-karmaconfjskonfiguration-berücksichtigen)
    - [4. Karma- und `test.ts`‑Dateien entfernen](/blog/2025-11-zu-vitest-migrieren#4-karma--und-testtsdateien-entfernen)
    - [5. Browser‑Modus konfigurieren (optional)](/blog/2025-11-zu-vitest-migrieren#5-browsermodus-konfigurieren-optional)
  - [Automatisches Test‑Refactoring per Schematic](/blog/2025-11-zu-vitest-migrieren#automatisches-testrefactoring-per-schematic)
    - [1. Überblick](/blog/2025-11-zu-vitest-migrieren#1-überblick)
    - [2. Schematic ausführen](/blog/2025-11-zu-vitest-migrieren#2-schematic-ausführen)
    - [3. Nach der Migration](/blog/2025-11-zu-vitest-migrieren#3-nach-der-migration)
    - [4. Benutzerdefinierte Konfiguration (optional)](/blog/2025-11-zu-vitest-migrieren#4-benutzerdefinierte-konfiguration-optional)
- [Die neue Syntax und APIs](/blog/2025-11-zu-vitest-migrieren#die-neue-syntax-und-apis)
  - [Globale Funktionen](/blog/2025-11-zu-vitest-migrieren#globale-funktionen)
  - [Matcher](/blog/2025-11-zu-vitest-migrieren#matcher)
  - [Spies und Mocks](/blog/2025-11-zu-vitest-migrieren#spies-und-mocks)
  - [Asynchronität ohne Zone.js aber mit Vitest Timer](/blog/2025-11-zu-vitest-migrieren#asynchronität-ohne-zonejs-aber-mit-vitest-timer)
  - [TestBed und ComponentFixture](/blog/2025-11-zu-vitest-migrieren#testbed-und-componentfixture)
- [Bekannte Einschränkungen und Fallstricke](/blog/2025-11-zu-vitest-migrieren#bekannte-einschränkungen-und-fallstricke)
- [Fazit](/blog/2025-11-zu-vitest-migrieren#fazit)


## Warum Angular Karma und Jasmine ersetzt

_Karma und Jasmine_ haben für Angular lange Jahre gute Dienste geleistet, vor allem wegen der Ausführung in einem echten Browser.
Es gab aber Nachteile: die Ausführungsgeschwindigkeit war nie optimal und das Ökosystem ist veraltet ([Karma ist seit 2023 deprecated](https://github.com/karma-runner/karma#karma-is-deprecated-and-is-not-accepting-new-features-or-general-bug-fixes)). 
Über mehrere Jahre prüfte das Angular-Team Alternativen (Jest, Web Test Runner usw.), ohne einen klaren Gewinner zu finden.
[Vitest](https://vitest.dev/) wurde inzwischen äußerst populär und erwies sich als passende Lösung.

Vitest passte besonders gut, da es einen echten Browser-Modus bietet.
Wie zuvor bei Karma können Tests in einem realen Browser mit "echtem" DOM und echten Ereignissen ausgeführt werden.
Der Browser-Modus wurde erst kürzlich mit Vitest 4 im Oktober 2025 [als stabil deklariert](https://vitest.dev/blog/vitest-4.html#browser-mode-is-stable).
Gleichzeitig ist Vitest schnell und modern: Es baut auf [Vite](https://vite.dev/) auf, ist ESM- und TypeScript-first und sorgt für äußerst kurze Start- und Wiederholungszeiten.
Dazu kommt eine sehr mächtige API mit Snapshot-Tests, flexiblen [Fake-Timern](https://vitest.dev/guide/mocking/timers.html), dem wirklich nützlichen Helfer [`expect.poll`](https://vitest.dev/api/expect.html#poll), [Test-Fixtures](https://vitest.dev/guide/test-context) und Jest-kompatiblen Matchern.
Nicht zuletzt ist Vitest im gesamten Frontend-Ökosystem weit verbreitet, wodurch vorhandenes Know-how gut übertragen werden kann.
Kurz gesagt: Der Wechsel sorgt für Tempo, eine deutlich bessere Developer Experience und Zukunftssicherheit und hält dabei weiterhin die Möglichkeit echter Browser-Tests offen.


## Migrationsleitfaden: Von Karma/Jasmine zu Vitest

<!-- Quelle: https://github.com/angular/angular/blob/6178e3ebfbc69a2afa04dd19ea4d6d8b1bfb0649/adev/src/content/guide/testing/migrating-to-vitest.md -->

Wenn du ein **neues Projekt** mit Angular 21 erzeugen möchtest, nutzt die Angular CLI standardmäßig den neuen Test-Runner Vitest.
Die Wahl kannst du über die Option `--test-runner` beeinflussen:
Mit `--test-runner=vitest` erhältst du die neue, schnellere und modernere Standardlösung. 
Möchtest du dagegen weiterhin bei der bewährten Karma/Jasmine-Kombination bleiben, verwende die Option `--test-runner=karma`.
Ohne explizite Angabe der Option wird automatisch Vitest verwendet.

Um ein **bestehendes Projekt** auf Angular 21 und Vitest zu migrieren, musst du zunächst das Projekt mittels `ng update` auf Version 21 aktualisieren.
Beachte dabei, dass die Migration bestehender Projekte zu Vitest aktuell noch **experimentell** ist.
Außerdem setzt dieser Prozess das `application`-Buildsystem von Angular voraus, das bei neu erstellten Projekten standardmäßig aktiviert ist.
Nachdem dein Projekt auf Version 21 aktualisiert wurde, kannst du mit den folgenden Schritten fortfahren.


### Manuelle Migrationsschritte

Bevor du das automatische Refactoring‑Schematic verwendest, musst du dein Projekt manuell so anpassen, dass Vitest als Test‑Runner verwendet wird.

#### 1. Abhängigkeiten installieren

Installiere `vitest` sowie eine DOM‑Emulationsbibliothek. 
Obwohl Tests weiterhin im Browser ausgeführt werden können (siehe Schritt 5), verwendet Vitest standardmäßig eine DOM‑Emulation, um eine Browserumgebung in Node.js zu simulieren und Tests schneller auszuführen. 
Die CLI erkennt automatisch `happy-dom`, falls es installiert ist; ansonsten greift sie auf `jsdom` zurück. 
Eines der beiden Pakete muss vorhanden sein.

```bash
npm install --save-dev vitest jsdom
```

#### 2. `angular.json` aktualisieren

Suche in der Datei `angular.json` das `test`-Target deines Projekts und setze den `builder` auf `@angular/build:unit-test`.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

Der `unit-test`‑Builder verwendet standardmäßig `"tsConfig": "tsconfig.spec.json"` und `"buildTarget": "::development"`. 
Falls dein Projekt andere Werte benötigt, etwa weil die `development`-Konfiguration fehlt oder spezielle Test‑Einstellungen nötig sind, kannst du eine eigene Build-Konfiguration anlegen und zuweisen, z. B. `testing`.

Der vorherige Builder `@angular/build:karma` erlaubte es, Build‑Optionen (wie `polyfills`, `assets`, `styles`) direkt im `test`-Target zu definieren. Der neue Builder `@angular/build:unit-test` unterstützt das nicht. 
Falls sich deine Test‑Build‑Optionen von der `development`-Konfiguration unterscheiden, musst du diese Optionen in eine eigene Build-Konfiguration verschieben. 
Stimmen sie bereits mit `development` überein, ist kein weiterer Schritt notwendig.

> **Tipp:** Alternativ kannst du einfach ein neues Projekt mittels `ng new` erzeugen und die relevanten Abschnitte aus der neu generierten `angular.json` in dein bestehendes Projekt übernehmen. 
> So erhältst du automatisch eine saubere Vorlage für die Vitest-Konfiguration.


#### 3. Eigene `karma.conf.js`‑Konfiguration berücksichtigen

Eigene Einstellungen aus der Datei `karma.conf.js` werden nicht automatisch migriert. 
Prüfe diese Datei, bevor du sie löschst, und übertrage relevante Optionen manuell.
Viele Karma‑Optionen besitzen Vitest‑Entsprechungen, die du in einer `vitest.config.ts` definieren kannst und dann über `runnerConfig` in der `angular.json` einbindest.

Typische Migrationspfade:

* **Reporter:** Karma‑Reporter müssen durch Vitest‑kompatible Reporter ersetzt werden. Viele davon können direkt in `angular.json` unter `test.options.reporters` konfiguriert werden. Für komplexere Fälle nutze `vitest.config.ts`.
* **Plugins:** Karma‑Plugins erfordern passende Vitest‑Alternativen. Beachte, dass Code‑Coverage in der Angular CLI bereits integriert ist und über `ng test --coverage` aktiviert werden kann.
* **Eigene Browser‑Launcher:** Diese werden durch die Option `browsers` in der `angular.json` und die Installation eines Browser‑Providers wie `@vitest/browser-playwright` ersetzt.

Weitere Einstellungen findest du in der offiziellen [Vitest‑Dokumentation](https://vitest.dev/config/).

#### 4. Karma- und `test.ts`‑Dateien entfernen

Du kannst nun die Dateien `karma.conf.js` sowie `src/test.ts` löschen und alle Karma‑bezogenen Pakete deinstallieren. 
Die folgenden Befehle entsprechen einem Standard‑Angular‑Projekt.
In deinem Projekt können weitere Pakete vorhanden sein.

```bash
npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
```

#### 5. Browser‑Modus konfigurieren (optional)

Falls du Tests in einem echten Browser ausführen möchtest, musst du einen Browser-Provider installieren und die `angular.json` anpassen.
Wähle je nach Bedarf:

* **Playwright:** `@vitest/browser-playwright` für Chromium, Firefox und WebKit
* **WebdriverIO:** `@vitest/browser-webdriverio` für Chrome, Firefox, Safari und Edge
* **Preview:** `@vitest/browser-preview` für WebContainer-Umgebungen wie StackBlitz

```bash
npm install --save-dev @vitest/browser-playwright
```

Danach musst du noch die `angular.json` erweitern.
Füge im `test`-Target die Option `browsers` hinzu.
Der Browsername hängt vom verwendeten Provider ab (z. B. `chromium` bei Playwright).

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "browsers": ["chromium"]
          }
        }
      }
    }
  }
}
```

Der Headless‑Modus wird automatisch aktiviert, wenn die Umgebungsvariable `CI` gesetzt ist oder der Browsername "Headless" enthält (z. B. `ChromeHeadless`). 
Andernfalls läuft der Browser sichtbar.

### Automatisches Test‑Refactoring per Schematic

Das Angular CLI stellt ein Schematic bereit, das deine Jasmine‑Tests automatisch auf Vitest umstellt.

**WICHTIG:** Das Schematic `refactor-jasmine-vitest` ist experimentell und deckt nicht alle Patterns ab.
Überprüfe die Änderungen immer manuell.

#### 1. Überblick

Derzeit führt das Schematic folgende Umwandlungen in Dateien mit der Endung `.spec.ts` durch:

* `fit`/`fdescribe` → `it.only`/`describe.only`
* `xit`/`xdescribe` → `it.skip`/`describe.skip`
* `spyOn` → `vi.spyOn`
* `jasmine.objectContaining` → `expect.objectContaining`
* `jasmine.any` → `expect.any`
* `jasmine.createSpy` → `vi.fn`
* Umstellung der Lifecycle‑Hooks (`beforeAll`, `beforeEach`, etc.) auf Vitest‑Varianten
* `fail()` → `vi.fail()`
* Anpassung von Matchern an die Vitest‑API
* [TODO-Kommentare](https://github.com/angular/angular-cli/pull/31469) für nicht automatisch konvertierbare Stellen
* Tests mit `done`-Callback werden in `async`/`await`-Tests umgeschrieben
<!--(siehe PR https://github.com/angular/angular-cli/pull/31435 und folgende -->

Das Schematic führt bestimmte Aufgaben bewusst nicht durch.
Es installiert weder Vitest noch andere erforderliche Abhängigkeiten.
Außerdem nimmt es keine Änderungen an der `angular.json` vor, um den Vitest‑Builder zu aktivieren.
Ebenso entfernt es keine Karma‑Dateien aus dem Projekt.
Schließlich konvertiert das Schematic auch keine komplexen Spy‑Szenarien, die daher weiterhin manuell überarbeitet werden müssen.
Die manuelle Umstellung (wie oben beschrieben) bleibt uns leider nicht erspart.


#### 2. Schematic ausführen

Wenn dein Projekt für Vitest konfiguriert ist, kannst du das automatische Refactoring starten:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

Das Schematic bietet eine Reihe von zusätzlichen Optionen:

| Option             | Beschreibung                                                          |
| ------------------ | --------------------------------------------------------------------- |
| `--project <name>` | Wählt ein bestimmtes Projekt in einem Workspace aus.                  |
| `--include <path>` | Beschränkt das Refactoring auf eine Datei oder ein Verzeichnis.       |
| `--file-suffix`    | Legt eine andere Dateiendung für Testdateien fest.                    |
| `--add-imports`    | Fügt explizite Vitest-Im­porte hinzu.                                  |
| `--verbose`        | Aktiviert detailliertes Logging der durchgeführten Änderungen.        |

#### 3. Nach der Migration

1. **Tests ausführen:** Nutze `ng test`, um sicherzustellen, dass alle Tests weiterhin funktionieren.
2. **Änderungen prüfen:** Sieh dir die Anpassungen an, besonders bei komplexen Spys oder asynchronen Tests.

`ng test` führt Tests im **Watch‑Modus** aus, sofern das Terminal interaktiv ist.
In CI-Umgebungen führt der Test-Runner die Tests automatisch im Single-Run-Modus aus.

#### 4. Benutzerdefinierte Konfiguration (optional)

Die Angular CLI erzeugt die Vitest‑Konfiguration im Hintergrund basierend auf den Optionen in `angular.json`.

Wem die vorgesehenen Optionen nicht ausreichen, der kann eine benutzerdefinierte Konfiguration verwenden.
Damit werden zwar erweiterte Optionen verfügbar, das Angular-Team bietet jedoch keinen direkten Support für die spezifischen Inhalte der Konfigurationsdatei oder darin verwendete Plugins von Drittanbietern.
Die CLI überschreibt außerdem bestimmte Eigenschaften (`test.projects`, `test.include`), um einen ordnungsgemäßen Betrieb sicherzustellen.

Du kannst bei Bedarf eine eigene Vitest-Konfigurationsdatei (`vitest.config.ts`) einbinden, um weitergehende Anpassungen vorzunehmen, die über die Standardoptionen hinausgehen.
Dabei gibt es zwei mögliche Wege: Entweder verweist du direkt auf eine bestimmte Konfigurationsdatei, indem du den exakten Pfad in der `angular.json` angibst:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runnerConfig": "vitest.config.ts"
          }
        }
      }
    }
  }
}
```

Alternativ kannst du die Angular CLI automatisch suchen lassen.
Bei automatischer Suche setzt du `"runnerConfig": true` in der `angular.json`. 
Der Builder sucht dann selbstständig nach einer Datei namens `vitest-base.config.*`, zunächst im Projektverzeichnis und anschließend im Workspace-Root. 
So kannst du beispielsweise gemeinsame Einstellungen zentral definieren und bequem wiederverwenden.



## Die neue Syntax und APIs

Die meisten Specs laufen unverändert, denn **TestBed, ComponentFixture & Co.** bleiben bestehen.
Bei der Migration von Jasmine zu Vitest bleiben viele Testmuster vertraut, gleichzeitig ändert sich an einigen Stellen die konkrete API.
Neu lernen musst du vor allem Jasmine‑spezifische Stellen.

### Globale Funktionen

Die bekannten globalen Testfunktionen wie `describe`, `it` bzw. `test`, `beforeEach`, `afterEach` und `expect` bleiben in Vitest unverändert erhalten. 
Sie stehen ohne weitere Importe zur Verfügung, sofern in deiner `tsconfig.spec.json` der Eintrag `types: ["vitest/globals"]` gesetzt ist. 
Trotzdem empfehlen wir, diese Funktionen explizit zu importieren.
Dadurch vermeidest du mögliche Namenskollisionen, etwa mit gleichnamigen Funktionen aus Cypress, was in der Vergangenheit regelmäßig zu verwirrenden Problemen geführt hat.

### Matcher

Die üblichen Matcher wie `toBe`, `toEqual`, `toContain` oder `toHaveBeenCalledWith` stehen in Vitest weiterhin zur Verfügung. Wenn du in Jasmine `jasmine.any(...)` verwendet hast, nutzt du in Vitest `expect.any(...)`.
Wichtig: Vitest hat nicht das Ziel, eine mit Jasmine kompatible API zu schaffen.
Stattdessen bietet Vitest eine möglichst [**Jest‑kompatible** Expect-API](https://vitest.dev/api/expect.html) auf Basis von Chai an.
Das Testframework Jest hat wiederum das Ziel, einigermaßen kompatibel zu Jasmine zu sein.
Weil aber Vitest nur mit Jest kompatibel sein will, ergeben sich folgende Herausforderungen, da einige Matcher schlicht fehlen:

#### 1) `toBeTrue()` / `toBeFalse()` gibt es in Jest/Vitest nicht

Jasmine bringt die strikten Bool‑Matcher `toBeTrue()` und `toBeFalse()` mit.
In Jest (und damit Vitest) existieren sie nicht.
Du kannst stattdessen einfach den Matcher [`toBe(true)`](https://vitest.dev/api/expect.html#tobe) bzw. `toBe(false)` verwenden.

```ts
// Jasmine
expect(result).toBeTrue();
expect(flag).toBeFalse();

// Vitest
expect(result).toBe(true);
expect(flag).toBe(false);
```

#### 2) `toHaveBeenCalledOnceWith()` gibt es in Jest/Vitest nicht

Jasmine hat einen praktischen Matcher für einen Spy mit der Prüfung auf "genau einmal und genau mit diesen Argumenten". 
Als Ersatz verwendest du einfach [`toHaveBeenCalledExactlyOnceWith()`](https://vitest.dev/api/expect.html#tohavebeencalledexactlyoncewith):

```ts
var book = {};

// Jasmine
expect(spy).toHaveBeenCalledOnceWith(book);

// Vitest
expect(spy).toHaveBeenCalledExactlyOnceWith(book);
```

#### 3) Asynchrone Matchers: `expectAsync(...)` (Jasmine) vs. `.resolves/.rejects` (Jest/Vitest)

Jasmine hat eine [eigene Async-API](https://jasmine.github.io/api/5.12/async-matchers): `await expectAsync(promise).toBeResolved() / toBeRejectedWith(...)`. 
Jest/Vitest nutzen stattdessen das Muster [`await expect(promise).resolves/...`](https://vitest.dev/api/expect.html#resolves) bzw. [`.rejects/...`](https://vitest.dev/api/expect.html#rejects). 
Beim Umstieg müssen diese Expectations umgeschrieben werden.

```ts
// Jasmine
await expectAsync(doWork()).toBeResolved();
await expectAsync(doWork()).toBeResolvedTo('OK');
await expectAsync(doWork()).toBeRejectedWithError('Boom');

// Jest/Vitest
await expect(doWork()).resolves.toBeDefined();
await expect(doWork()).resolves.toBe('OK');
await expect(doWork()).rejects.toThrow('Boom');
```

Vitest zielt also bei den Matchern auf Jest‑Kompatibilität ab. 
Kompatibilität mit Jasmine steht hingegen überhaupt nicht im Fokus. 
In der Praxis ist der Anpassungsaufwand meist gering (vor allem bei `toBeTrue`/`toBeFalse` und `toHaveBeenCalledOnceWith`), aber er existiert. 
Bei asynchronen Erwartungen unterscheidet sich das Pattern sogar deutlich. 
Aber keine Sorge: Die Wahrscheinlichkeit, dass dein Projekt `expectAsync` verwendet, ist sehr gering, da in der Angular-Dokumentation stattdessen immer Angular-spezifische Hilfsfunktionen gezeigt wurden.
Daher dürfte in den meisten Projekten hier wahrscheinlich gar keine zusätzliche Arbeit anfallen.

### Spys und Mocks

Das Spying-Konzept funktioniert nahezu identisch wie bei Jasmine, wird jedoch über das [`vi`‑Objekt bereitgestellt](https://vitest.dev/api/vi.html#vi-spyon):

```ts
// Jasmine
spyOn(service, 'loadData').and.returnValue(of([]));

// Vitest
vi.spyOn(service, 'loadData').mockReturnValue(of([]));
```

Für Spys, die bei Jasmine mit `jasmine.createSpy()` erzeugt wurden, verwendest du in Vitest jetzt einfach [`vi.fn()`](https://vitest.dev/api/vi.html#vi-fn):

```ts
// Jasmine
const onItem = jasmine.createSpy().and.returnValue(true);

// Vitest
const onItem = vi.fn().mockReturnValue(true);
```

In Jasmine kann man mit dem ersten Argument einen Namen für den Spy vergeben.
Dies dient dazu, in Fehlermeldungen und Reports aussagekräftigere Texte anzuzeigen (siehe [Doku](https://jasmine.github.io/api/5.12/jasmine#.createSpy)).
Falls du in Vitest ebenfalls einem Spy einen sprechenden Namen geben möchtest, kannst du dies mit `.mockName('onItem')` tun.

```ts
// Jasmine - mit Name
const onItem = jasmine.createSpy('onItem').and.returnValue(true);

// Vitest - mit Name
const onItem = vi.fn().mockName('onItem').mockReturnValue(true);
```

### Asynchronität ohne Zone.js mit Vitest Timer

Seit Angular 21 laufen Unit-Tests standardmäßig zoneless. 
Das bedeutet: Die früheren Angular-Hilfsfunktionen `waitForAsync()` und `fakeAsync()`/`tick()` funktionieren nicht mehr automatisch, weil sie auf Zone.js basieren. 
Entscheidend ist: Das hat nichts mit Vitest zu tun.
Auch unter Jasmine hätte man in einer zonenlosen Umgebung auf diese Utilitys verzichten müssen.

Für einfache asynchrone Tests ersetzt man `waitForAsync()` daher durch ganz normales `async/await`, das seit vielen Jahren auch mit Jasmine möglich ist.
Folgendes Update funktioniert also unabhängig vom Test-Runner:

```ts
// FRÜHER: waitsForAsync + Zone.js
it('should load data', waitForAsync(() => {
  service.getData().then(result => {
    expect(result.title).toContain('Hello');
  });
}));

// MODERN: zoneless + async/await
it('should load data', async () => {
  const result = await service.getData();
  expect(result.title).toContain('Hello');
});
```

Ggf. muss der Service für dieses Beispiel "ausgemockt" werden, damit es funktioniert.
Hier bleibt alles unverändert.
Modern ist nur die Schreibweise, bei der es zwischen Jasmine und Vitest keinen Unterschied gibt.

Der zweite Angular-Klassiker [`fakeAsync()`](https://angular.dev/api/core/testing/fakeAsync) und [`tick()`](https://angular.dev/api/core/testing/tick) braucht hingegen einen echten Ersatz.
(Hinweis: Diese beiden Helfer sind nicht Bestandteil von Jasmine, sondern kommen aus `@angular/core/testing`.)
Vitest bringt ein eigenes [Fake-Timer-System](https://vitest.dev/api/vi.html#fake-timers) mit.
Die Nutzung erfordert etwas Einarbeitung, denn nicht alle Timer funktionieren gleich und nicht jeder Test braucht dieselben Werkzeuge. 
Beginnen wir mit einem einfachen zeitbasierten Beispiel. 
Die folgende Funktion erhöht einen Counter nach genau fünf Sekunden:

```ts
export function startFiveSecondTimer(counter: { value: number }) {
  setTimeout(() => {
    counter.value++;
  }, 5000);
}
```

Für solche Fälle ist `vi.advanceTimersByTime()` ideal, denn man kann gezielt simulieren, dass exakt eine bestimmte Zeit verstrichen ist. Ganz ähnlich wie früher `tick(5000)`, aber ohne `fakeAsync()`-Zone:

```ts
import { describe, it, expect, vi } from 'vitest';
import { startFiveSecondTimer } from './timer-basic';

describe('startFiveSecondTimer', () => {
  it('erhöht den Counter nach exakt 5 Sekunden', () => {
    vi.useFakeTimers();

    const counter = { value: 0 };
    startFiveSecondTimer(counter);

    // simuliert das Vergehen von 5 Sekunden
    vi.advanceTimersByTime(5000);

    expect(counter.value).toBe(1);

    vi.useRealTimers();
  });
});
```

`advanceTimersByTime()` ist damit der unmittelbare Ersatz für `tick()`.
Es eignet sich besonders gut, wenn du eine ganz bestimmte Zeitspanne simulieren oder mehrere Timer in korrekt getakteter Reihenfolge ablaufen lassen möchtest.


Doch nicht alle Timer sind so einfach. 
Manchmal besteht der Code nur aus timerbasierten Aktionen, aber ohne zusätzliche Promises. Das folgende Beispiel inkrementiert einen Counter mehrfach, indem es ausschließlich Timeouts und Intervals nutzt:

```ts
export function startSyncSequence(counter: { value: number }) {
  setTimeout(() => { counter.value++; }, 300);
  const interval = setInterval(() => {
    counter.value++;
    if (counter.value === 3) {
      clearInterval(interval);
    }
  }, 200);
}
```

In Fällen, in denen du *alle* Timer der Reihe nach abarbeiten willst, ohne manuell Zeit vorzuspulen, nutzt du `vi.runAllTimers()`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { startSyncSequence } from './timer-sync';

describe('startSyncSequence', () => {
  it('führt alle synchronen Timer vollständig aus', () => {
    vi.useFakeTimers();

    const counter = { value: 0 };
    startSyncSequence(counter);

    // führt alle Timer und Intervals aus, bis die Timer-Queue leer ist
    vi.runAllTimers();

    expect(counter.value).toBe(3);

    vi.useRealTimers();
  });
});
```

Hier wäre `advanceTimersByTime()` zwar möglich, aber unnötig kompliziert. `runAllTimers()` löst einfach jedes Timeout und jedes Interval aus, bis nichts mehr übrig ist.

Noch interessanter wird es, wenn Timer-Callbacks selbst wieder asynchron arbeiten, beispielsweise durch ein `await` oder Promise-Ketten.
Dann reicht `runAllTimers()` nicht mehr aus. Das folgende Beispiel zeigt ein typisches Muster aus realen Anwendungen:

```ts
export function startAsyncJob(): Promise<string> {
  return new Promise(resolve => {
    setTimeout(async () => {
      const data = await Promise.resolve('done'); // asynchroner Schritt im Callback
      resolve(data);
    }, 100);
  });
}
```

Damit der Test nicht nur den Timeout, sondern auch das `await` im Callback vollständig abarbeitet, bietet Vitest `runAllTimersAsync()` an:

```ts
import { describe, it, expect, vi } from 'vitest';
import { startAsyncJob } from './timer-async';

describe('startAsyncJob', () => {
  it('führt Timer und async-Callbacks vollständig aus', async () => {
    vi.useFakeTimers();

    const promise = startAsyncJob();

    // führt Timer UND asynchrone Logik innerhalb der Timer-Callbacks aus
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('done');

    vi.useRealTimers();
  });
});
```

`runAllTimersAsync()` ist damit ein guter Ersatz für Tests, bei denen bisher `fakeAsync()` und `tick()` in Kombination mit Microtask-Flushing verwendet wurden. 

### TestBed und ComponentFixture

Nach all den kleinen, aber subtilen Unterschieden zwischen Jasmine und Vitest gibt es hier gute Nachrichten: 
Die Verwendung von `TestBed` und `ComponentFixture` bleibt vollständig unverändert, da dies kein Thema ist, das Vitest berührt. 
Du erzeugst weiterhin deine Komponenten oder Services mithilfe von `TestBed`.
Auch der explizite Aufruf von `fixture.detectChanges()` ist unverändert notwendig, um die Change Detection manuell anzustoßen.


## Bekannte Einschränkungen und Fallstricke

Spezielle Karma-Anwendungsfälle wie eigene Karma-Plugins oder individuelle Browser‑Launcher lassen sich erwartungsgemäß nicht direkt auf Vitest übertragen.
Du wirst im Vitest-Ökosystem nach Alternativen suchen müssen.

Bei der Umstellung auf Vitest kann eine kurze Gewöhnungsphase im Team nötig sein, da bestimmte neue API-Konzepte wie `vi.spyOn`, `vi.fn` oder Strategien zum Zurücksetzen von Mocks zwar leicht zu erlernen sind, sich aber dennoch von Jasmine unterscheiden. 
Achte deshalb darauf, dass deine Tests mögliche Manipulationen an globalen Objekten vollständig aufräumen und verwende dafür idealerweise Methoden wie [`afterEach`](https://vitest.dev/api/#aftereach) mit [`vi.restoreAllMocks()`](https://vitest.dev/api/vi.html#vi-restoreallmocks).


## Fazit

Mit Vitest als Standard in Angular 21 wird das Testen deutlich moderner und schneller. 
Die Umstellung ist meist unkompliziert, die Migrations‑Schematics helfen beim Einstieg. 
Wo früher `fakeAsync` und Zone.js‑Magie nötig waren, reichen heute `async/await` und flexible Fake‑Timer. 
Und wenn es realistisch sein muss, steht dir der Browser‑Modus zur Verfügung.
Insgesamt bedeutet das: kürzere Feedback‑Schleifen, robustere Tests und weniger Reibung im Alltag. Viel Spaß beim Testen!

<hr>

<small>Vielen Dank an Ferdinand Malcher und Danny Koppenhagen für das Review und das wertvolle Feedback!</small>
