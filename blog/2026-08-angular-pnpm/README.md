---
title: 'Angular mit pnpm: Sichere Dependencies und Best Practices'
author: Danny Koppenhagen
mail: mail@k9n.dev
published: 2026-08-08
lastModified: 2026-08-08
keywords:
  - Angular
  - pnpm
  - Corepack
  - Supply Chain Security
  - Package Manager
  - npm
  - Security
  - Dependencies
  - minimumReleaseAge
  - Nx
language: de
header: angular-pnpm.jpg
---

Die Zeiten, in denen npm alternativlos war, sind längst vorbei.
Mit **pnpm** steht ein Package Manager zur Verfügung, der effizienter mit Speicherplatz umgeht, schneller installiert und moderne Sicherheitsmechanismen gegen Supply-Chain-Angriffe mitbringt.

In diesem Artikel richten wir ein Angular-Projekt mit pnpm ein, konfigurieren eine sichere Entwicklungsumgebung und schauen uns Best Practices an, die sich in professionellen Teams bewährt haben – von Supply-Chain-Security bis hin zu reproduzierbaren Builds.

## Inhalt

[[toc]]

## Warum überhaupt pnpm?

npm funktioniert, ist überall vorinstalliert und die meisten Tutorials verwenden es.
Warum also wechseln?
Die Antwort liegt in den architektonischen Entscheidungen, die pnpm anders trifft:

**Content-addressable Store:**
Jede Paketversion wird genau einmal in einem zentralen Store gespeichert.
Mehrere Projekte referenzieren dasselbe Paket per Hardlink – das spart erheblich Speicherplatz.

**Strikte `node_modules`-Struktur:**
pnpm erstellt keine flache `node_modules`-Struktur, sondern nutzt Symlinks, bei denen jedes Paket nur auf seine deklarierten Abhängigkeiten zugreifen kann.
Das verhindert das *Phantom-Dependency*-Problem: Code kann nicht versehentlich auf transitive Abhängigkeiten zugreifen.

**Schnellere Installationen:**
Durch den zentralen Store und Hardlinks sind Installationen deutlich schneller – insbesondere bei wiederholten Installationen und in CI-Pipelines.

**Monorepo-Unterstützung:**
pnpm bietet erstklassige Workspace-Unterstützung mit Catalogs (zentrale Versionsverwaltung), dem `workspace:`-Protokoll und effizienter Verwaltung mehrerer Pakete.

**Security by Default:**
Seit Version 10 blockiert pnpm standardmäßig Lifecycle-Scripts in Dependencies.
Damit wird eine ganze Kategorie von Supply-Chain-Angriffen von Haus aus verhindert.

| Merkmal | npm | pnpm |
|---------|-----|------|
| Speicherverbrauch | Hoch (jedes Projekt eigene Kopie) | Niedrig (Content-addressable Store) |
| Installationsgeschwindigkeit | Mittel | Schnell |
| Phantom Dependencies | Möglich (flache Struktur) | Ausgeschlossen (strikte Struktur) |
| Lifecycle Scripts | Werden ausgeführt | Standardmäßig blockiert (ab v10) |
| Monorepo-Support | Workspaces (basic) | Workspaces + Catalogs |
| minimumReleaseAge | Ab npm 11.10 (`min-release-age`) | Ab pnpm 10.16 |

## Neues Angular-Projekt mit pnpm erstellen

### pnpm installieren und Version fixieren

Corepack wird seit Node.js 16.13 mitgeliefert. Die globale npm-Installation ist daher keine zusätzliche pnpm-Installation: Sie aktualisiert Corepack auf die aktuelle Version. Das ist insbesondere wegen veralteter Signaturen in älteren Corepack-Versionen sinnvoll. Falls Corepack in deiner Node.js-Installation bereits aktuell ist, kannst du diesen Schritt überspringen. Anschließend aktivierst du pnpm:

```bash
npm install --global corepack@latest
corepack enable pnpm
```

### Projekt erzeugen

Beim Erstellen eines neuen Projekts muss der Package Manager explizit angegeben werden.
Ein einfaches `pnpm dlx @angular/cli@latest new book-monkey` reicht **nicht** – die CLI würde trotzdem npm verwenden, da sie den aufrufenden Package Manager nicht automatisch erkennt.

```bash
# Bei globaler Installation:
ng new book-monkey --package-manager pnpm

# Direkt ohne global installierte Angular CLI via npx:
npx @angular/cli@latest new book-monkey --package-manager pnpm

# Direkt mit pnpm dlx:
pnpm dlx @angular/cli@latest new book-monkey --package-manager pnpm
```

Nach der Erstellung wechselst du in den Projektordner und fixierst dort die verwendete Version:

```bash
cd book-monkey
corepack use pnpm@latest
```

Der Befehl ergänzt das `packageManager`-Feld in der `package.json` – Corepack aktiviert dann bei allen Teammitgliedern automatisch dieselbe pnpm-Version.

Das Flag `--package-manager pnpm` bewirkt zwei Dinge:

1. Die Pakete werden mit pnpm installiert
2. In der `angular.json` wird `"cli": { "packageManager": "pnpm" }` eingetragen

Dieser Eintrag teilt der Angular CLI mit, welchen Package Manager sie für alle zukünftigen Operationen (`ng add`, `ng update`, etc.) verwenden soll.
Die CLI delegiert dann alle Paketoperationen transparent an pnpm – z. B. `ng add @angular/cdk`, `ng update`, `ng generate` funktionieren unverändert.

> **Tipp:** Als zusätzliche Absicherung gegen versehentliches `npm install` empfiehlt sich ein `preinstall`-Script:
>
> ```json
> "scripts": {
>   "preinstall": "npx only-allow pnpm"
> }
> ```

## Projektstruktur und `node_modules`

Wenn du zum ersten Mal ein pnpm-Projekt öffnest, stellst du fest, dass `node_modules` anders aufgebaut ist:

```
node_modules/
├── .pnpm/           ← Virtueller Store mit allen Paketen
├── @angular/core    ← Symlink nach .pnpm/...
├── rxjs             ← Symlink nach .pnpm/...
└── ...
```

Jedes Paket in der obersten Ebene ist ein Symlink in den `.pnpm`-Ordner, der wiederum Hardlinks zum globalen Store enthält.
Die IDE-Unterstützung (TypeScript-Auflösung, Autocomplete) sowie Build-Tools (Vite, esbuild) funktionieren damit problemlos.

## Supply-Chain-Security mit pnpm

Dies ist der wichtigste Grund, warum pnpm heute nicht nur eine Performance-Optimierung ist, sondern eine bewusste Architekturentscheidung für die Sicherheit eines Projekts.

Supply-Chain-Attacken im npm-Ökosystem haben sich in den letzten Jahren dramatisch gehäuft.
Einige bekannte Vorfälle:

| Vorfall | Jahr | Auswirkung |
|---------|------|------------|
| ua-parser-js | 2021 | Kryptominer in 8-Mio-Downloads-Paket, 4h online |
| colors & faker | 2022 | Maintainer sabotierte eigene Pakete |
| node-ipc | 2022 | Politisch motivierte Datei-Überschreibung |
| eslint-config-prettier | 2025 | Phishing → gestohlener npm-Token → Malware via postinstall |
| @ctrl/tinycolor (Shai-Hulud) | 2025 | Erster wurmartiger Angriff im npm-Ökosystem, 100+ Pakete betroffen |

Alle diese Angriffe nutzen denselben Grundmechanismus: Ein vertrauenswürdiges Paket wird kompromittiert, und bei der nächsten Installation wird Schadcode über `postinstall`-Scripts ausgeführt.

pnpm adressiert diese Risiken mit konkreten, konfigurierbaren Mechanismen:

### pnpm-Features gegen Supply-Chain-Risiken

| Risiko | pnpm-Feature | Wirkung |
|--------|--------------|---------|
| Schadcode via postinstall | Lifecycle Scripts blockiert | Kein automatischer Code bei `pnpm install` |
| Kompromittiertes Release | `minimumReleaseAge` | Neue Versionen erst nach Wartezeit installierbar |
| Unbekannte Build Scripts | `onlyBuiltDependencies` | Nur explizit erlaubte Pakete dürfen Scripts ausführen |
| Git-Dependencies mit Schadcode | `blockExoticSubdeps` | Git-hosted Deps können keine `prepare`-Scripts ausführen |
| Nicht-reproduzierbare Builds | `pnpm-lock.yaml` + `--frozen-lockfile` | Exakt gleiche Installation in jedem Environment |

### Lifecycle Scripts kontrollieren

Seit pnpm 10 werden `preinstall`, `install` und `postinstall`-Scripts von Dependencies **nicht mehr automatisch ausgeführt** – der bedeutendste Sicherheitsunterschied zu npm.

Bei einem frischen Angular-Projekt sieht man nach `pnpm install` eine Meldung wie:

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @parcel/watcher@2.6.0, esbuild@0.28.1, lmdb@3.5.6, msgpackr-extract@3.0.4
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

Das ist kein Fehler – pnpm teilt mit, dass Pakete Build-Scripts mitbringen, die nicht ausgeführt wurden.
Ohne diese Scripts fehlen ggf. native Binaries (z.B. für `esbuild`).

Die Lösung: Bewusste Freigabe mit `pnpm approve-builds`.
Dieser Befehl zeigt interaktiv alle Pakete mit Build-Scripts an.
Genehmigte Pakete werden in der `pnpm-workspace.yaml` unter `onlyBuiltDependencies` gespeichert:

```yaml
onlyBuiltDependencies:
  - '@parcel/watcher'
  - esbuild
  - lmdb
  - msgpackr-extract

ignoredBuiltDependencies:
  - puppeteer
```

Wird später ein neues Paket mit Build-Scripts hinzugefügt, erscheint die Meldung erneut – du entscheidest bewusst über die Freigabe.

> **Hinweis beim Wechsel von npm:** Wenn du bisher `ignore-scripts=true` in der `.npmrc` verwendet hast, solltest du diese Einstellung bei pnpm 10+ **entfernen**.
> pnpm blockiert Lifecycle Scripts von Dependencies bereits standardmäßig – ohne `.npmrc`-Eintrag.
> Ein zusätzliches `ignore-scripts=true` würde auch die über `onlyBuiltDependencies` explizit freigegebenen Scripts blockieren und damit den granularen Freigabe-Mechanismus aushebeln.
> Native Binaries (z.B. für esbuild) könnten dann trotz Freigabe nicht gebaut werden.

### minimumReleaseAge: Quarantäne für neue Versionen

Die meisten kompromittierten Pakete werden innerhalb weniger Stunden erkannt und entfernt.
`minimumReleaseAge` nutzt dieses Zeitfenster als Schutz:

```yaml
minimumReleaseAge: 1440
```

Der Wert `1440` entspricht 24 Stunden (in Minuten).
pnpm installiert keine Paketversion, die weniger als 24 Stunden alt ist – weder direkt noch transitiv.

Zur Einordnung: Der [eslint-config-prettier-Angriff](https://socket.dev/blog/eslint-prettier-malware) (2025) war nach 6 Stunden bereinigt, der [Shai-Hulud-Wurm](https://socket.dev/blog/shai-hulud-npm-worm) (2025) nach 12 Stunden, die [ua-parser-js-Kompromittierung](https://github.com/nicedoc/nicedoc/issues/1) (2021) nach 4 Stunden.
Mit einer 24-Stunden-Quarantäne wären alle diese Angriffe ins Leere gelaufen.

> **Hinweis:** `minimumReleaseAge` schützt nicht vor allen Supply-Chain-Angriffen, reduziert aber effektiv das Risiko kurzfristig kompromittierter Releases – der mit Abstand häufigsten Angriffsform.

Seit pnpm 10.19 lässt sich mit `minimumReleaseAgeExclude` die Wartezeit für bestimmte Pakete (z.B. interne) deaktivieren:

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - '@my-company/*'
```

### blockExoticSubdeps: Git-Dependencies absichern

Seit pnpm 10.26 werden Dependencies von Git-Repositories daran gehindert, `prepare`-Scripts auszuführen – es sei denn, sie sind explizit in `onlyBuiltDependencies` gelistet:

```yaml
blockExoticSubdeps: true
```

### Lockfile und reproduzierbare Builds

Die `pnpm-lock.yaml` ist kein optionales Artefakt – sie ist eine Sicherheitsfunktion.
Sie stellt sicher, dass überall exakt dieselben Paketversionen installiert werden.

**Goldene Regeln:**

1. **Niemals löschen** – Die Lockfile gehört ins Repository
2. **`--frozen-lockfile` in CI** – Verhindert Lockfile-Aktualisierungen bei der Installation
3. **Reviewen bei PRs** – Änderungen an der Lockfile sollten bewusst geprüft werden

```bash
# In CI-Pipelines immer:
pnpm install --frozen-lockfile
```

Das Äquivalent zu `npm ci` mit `package-lock.json` – nur dass pnpm durch die Hardlink-basierte Installation auch in CI-Pipelines deutlich schneller ist.

## Empfohlene Konfiguration

Die folgende Konfiguration fasst alle besprochenen Best Practices zusammen.
Wichtig: `.npmrc` und `pnpm-workspace.yaml` gehören versioniert ins Repository – damit gelten Security-Policies automatisch für alle Teammitglieder und CI-Pipelines.

### `.npmrc`

```ini
# Strikte Peer-Dependencies – Konflikte werden als Fehler behandelt
strict-peer-dependencies=true

# Keine automatische Installation von Peer-Dependencies
auto-install-peers=false

# Integritätsprüfung des Stores
verify-store-integrity=true

# Höchste verfügbare Version bei der Auflösung bevorzugen
resolution-mode=highest
```

### `pnpm-workspace.yaml`

```yaml
packages: []

onlyBuiltDependencies:
  - '@parcel/watcher'
  - esbuild
  - lmdb
  - msgpackr-extract

minimumReleaseAge: 1440
```

### `package.json` (Auszug)

```json
{
  "name": "book-monkey",
  "version": "0.0.0",
  "packageManager": "pnpm@x.y.z",
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test"
  },
  "dependencies": {
    "@angular/core": "^22.0.0",
    "@angular/common": "^22.0.0",
    "@angular/compiler": "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "@angular/platform-browser-dynamic": "^22.0.0",
    "@angular/router": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "rxjs": "^7.8.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular/compiler-cli": "^22.0.0",
    "typescript": "~5.8.0"
  }
}
```

## Skalierung: Workspace und Monorepo

Wenn du mehrere Angular-Anwendungen oder eigene Libraries in einem Repository verwalten möchtest, kannst du das pnpm-Setup ohne Architekturbruch erweitern.
Für Monorepos empfiehlt sich **Nx** als Build-Orchestrierung – es arbeitet hervorragend mit pnpm-Workspaces zusammen und bringt Features wie Affected Builds, Computation Caching und den Project Graph mit.

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - libs/*
```

Zwischen Paketen im Workspace können `workspace:`-Referenzen verwendet werden:

```json
{
  "dependencies": {
    "@my-company/shared": "workspace:^"
  }
}
```

Das `workspace:`-Protokoll stellt sicher, dass die lokale Version verwendet wird – keine versehentlichen Downloads aus der Registry.

pnpm bietet zusätzlich **Catalogs** an: Dependency-Versionen werden zentral in der `pnpm-workspace.yaml` definiert und in den `package.json`-Dateien nur per `"catalog:"` referenziert.
Das sorgt für konsistente Versionen über alle Pakete hinweg.

> **Hinweis:** Die Angular CLI kann Catalogs aktuell nicht automatisch aktualisieren.
> `ng update` erkennt `catalog:`-Einträge und bricht mit einer Anleitung für manuelle Aktualisierung ab ([angular-cli#33566](https://github.com/angular/angular-cli/pull/33566)).
> Catalogs lohnen sich daher primär in Monorepo-Setups, in denen Konsistenz über viele Pakete den manuellen Aufwand bei Updates rechtfertigt – idealerweise in Kombination mit Nx, das eigene Update-Mechanismen mitbringt.

## Bestehende Anwendung auf pnpm umstellen

Wenn du bereits eine Angular-Anwendung wie betreibst, brauchst du kein neues Projekt zu erzeugen. Die Unterschiede zum neuen Setup beschränken sich auf die Übernahme der bestehenden Konfiguration und Lockfile:

1. **Arbeitsstand sichern:** Lege einen Git-Branch an und prüfe, dass die Anwendung vor der Migration funktioniert.
2. **pnpm-Version festlegen:** Führe im Projektverzeichnis `corepack use pnpm@latest` aus. Corepack ergänzt das `packageManager`-Feld in der vorhandenen `package.json` und trägt die konkret aufgelöste Version ein.
3. **Angular CLI konfigurieren:** Ergänze in der bestehenden `angular.json` unter `cli` die Eigenschaft `"packageManager": "pnpm"`. Andere Projekteinstellungen und der verwendete Builder bleiben unverändert:

   ```json
   {
     "cli": {
       "packageManager": "pnpm"
     }
   }
   ```

4. **Lockfile übernehmen:** Liegt eine `package-lock.json` oder `yarn.lock` vor, führe zunächst `pnpm import` aus. Dadurch entsteht die `pnpm-lock.yaml`. Lösche die alte Lockfile erst, nachdem du die neue geprüft hast.
5. **Abhängigkeiten neu installieren:** Entferne `node_modules` und installiere anschließend mit `pnpm install`:

   ```bash
   rm -rf node_modules
   pnpm install
   ```

6. **Automatisierung anpassen:** Ersetze in CI und lokalen Skripten `npm install` beziehungsweise `npm ci` durch `pnpm install` beziehungsweise `pnpm install --frozen-lockfile`. Prüfe außerdem direkte Aufrufe von `npx` und `npm`.
7. **Migration prüfen:** Führe Build, Tests und Entwicklungsserver aus. Bei blockierten Build-Scripts entscheidest du mit `pnpm approve-builds`, welche Abhängigkeiten diese ausführen dürfen.

Die ausführliche pnpm-Konfiguration aus den vorherigen Abschnitten – etwa `.npmrc`, `pnpm-workspace.yaml` und `onlyBuiltDependencies` – kannst du anschließend schrittweise übernehmen.

## Fazit

pnpm bietet mehr als einen schnellen Package Manager – es liefert Werkzeuge, um Dependency Management bewusst zu gestalten:

- **Security-Features** wie `minimumReleaseAge`, kontrollierte Build-Scripts und `blockExoticSubdeps` reduzieren Risiken in der Software Supply Chain
- **Strikte `node_modules`-Isolation** verhindert Phantom Dependencies
- **Reproduzierbare Installationen** via Lockfile und `--frozen-lockfile` sichern konsistente Builds

Dabei bleibt der gewohnte Angular-Workflow vollständig erhalten – die CLI delegiert Installationen transparent an pnpm.
Wenn du später mehrere Anwendungen oder Libraries verwalten möchtest, kannst du dieses Fundament ohne Architekturbruch um Workspaces, Catalogs und Nx erweitern.

## Weiterführende Links

- [pnpm Dokumentation](https://pnpm.io)
- [pnpm Supply-Chain-Security](https://pnpm.io/supply-chain-security)
- [pnpm Catalogs](https://pnpm.io/catalogs)
- [Nx mit pnpm](https://nx.dev/concepts/integrated-vs-package-based#package-based)
- [Angular CLI – Package Manager Konfiguration](https://angular.dev/tools/cli/setup-local)
- [Corepack Dokumentation](https://nodejs.org/api/corepack.html)
- [Socket.dev – Security-Analysen zu npm-Angriffen](https://socket.dev/blog)
