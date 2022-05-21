---
title: 'Angular 10 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2020-06-29
lastModified: 2020-06-29
keywords:
  - Angular
  - Angular 10
  - TypeScript
  - TSLint
  - Browserslist
  - tsconfig
  - CommonJS
language: de
thumbnail: ./angular10.jpg
sticky: false
---


Nach nur vier Monaten Entwicklungszeit wurde am 24. Juni 2020 die neue Major-Version **Angular 10.0** veröffentlicht!
Da sich das vorherige [Major-Release von Angular 9](/blog/2020-02-angular9) um einige Monate verzögert hatte, wurde Angular 10 bereits jetzt herausgegeben, um den üblichen Release-Zyklus von sechs Monaten einzuhalten.

Wir werden Ihnen in diesem Artikel die wichtigsten Neuerungen vorstellen.
Es gibt auch wieder kleinere Breaking Changes, doch das Update auf die neue Version geht dank der Angular CLI und den Schematics leicht von der Hand.
Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular-Blog](https://blog.angular.io/version-10-of-angular-now-available-78960babd41).

> **Die Update-Infos für neuere Versionen von Angular finden Sie in separaten Blogartikeln. Wenn Sie das Update durchführen möchten, lesen Sie bitte alle Artikel in der gegebenen Reihenfolge.**
> * [Angular 11 ist da!](/blog/2020-11-angular11)
> * [Angular 12 ist da!](/blog/2021-05-angular12)
> * [Angular 13 ist da!](/blog/2021-11-angular13)
> * [Angular 14 ist da!](/blog/2022-06-angular14)


## Update auf Angular 10

Das Update zur neuen Angular-Version ist schnell erledigt.
Führen Sie dazu die folgenden Befehle in Ihrem Projekt mit Angular 9 aus:

```bash
ng update @angular/cli @angular/core
```

Die Angular CLI führt automatisch alle nötigen Anpassungen am Code der Anwendung durch, sofern notwendig.

Im *Angular Update Guide* unter [update.angular.io](https://update.angular.io/#9.0:10.0) können Sie übrigens wie üblich alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Update der TypeScript-Umgebung

### TypeScript 3.9 und tslib 2.0.0

Mit Angular 10 unterstützt Angular nun [TypeScript in der Version 3.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html).
Weiterhin wurde die Abhängigkeit zur Bibliothek _tslib_ auf die Version _2.0.0_ angehoben.
Sofern Sie ein existierendes Angular-Projekt mit abhängigen Paketen haben, die eine `peerDependency` auf tslib 1.x.x besitzen, werden Sie bei der Ausführung von `ng update` wahrscheinlich folgende Fehlermeldung erhalten:

```
Package "my-package" has an incompatible peer dependency to "tslib" (requires "^1.10.0", would install "2.0.0").
✖ Migration failed: Incompatible peer dependencies found.
Peer dependency warnings when installing dependencies means that those dependencies might not work correctly together.
You can use the '--force' option to ignore incompatible peer dependencies and instead address these warnings later.
```

Um dieses Problem zu beheben, können Sie in vielen Fällen die Fehlermeldung ignorieren und `ng update` mit dem Flag `--force` ausführen.
Hinterher sollten Sie jedoch zur Sicherheit noch einmal genau prüfen, ob Ihre Anwendung und Ihre Tests korrekt funktionieren.

Ist Ihnen dieser Weg zu riskant, empfehlen wir Ihnen, noch etwas zu warten, bis die zu nutzende Bibliothek `tslib` in Version 2.0.0 unterstützt.
Prüfen Sie ggf. im Repository der Bibliothek, ob bereits ein Issue zu diesem Thema eröffnet wurde, oder stellen Sie ein entsprechendes Issue für die Unterstützung von Angular 10 und tslib 2.0.0 ein. 👍

### TSLint 6.0.0

Ab Angular 10 wird TSLint in der Version 6.0.0 verwendet.
Sämtliche Änderungen an der Datei `tslint.json` werden bei der Ausführung von `ng update` automatisch durchgeführt.


## Browserslist

Mit Angular 10 wurde die Standardkonfiguration für unterstütze Browser ein wenig aufgeräumt.
Dabei wurde auch der Dateiname von `browserslist` zu `.browserslistrc` geändert.

Die Voreinstellungen in der Datei sind nun anders gesetzt: Standardmäßig werden jetzt die neueste oder die letzten beiden Versionen der wichtigsten Browser unterstützt.
Wenn Sie das Tool `browserslist` ausführen, erhalten Sie eine detaillierte Auflistung der unterstützten Browser, die in der aktuellen Konfiguration der Datei `.browserslistrc` inbegriffen sind:

```bash
$ npx browserslist
chrome 83
edge 83
edge 81
firefox 77
firefox 68
ios_saf 13.4-13.5
ios_saf 13.3
ios_saf 13.2
ios_saf 13.0-13.1
ios_saf 12.2-12.4
ios_saf 12.0-12.1
safari 13.1
safari 13
safari 12.1
safari 12
```

Sie können die [Werte hier selbstverständlich anpassen](https://github.com/browserslist/browserslist).
Möchten Sie beispielweise den Internet Explorer 11 unterstützen, fügen Sie den Eintrag `IE 11` zur Datei hinzu.
Angular berücksichtigt die Einstellungen beim Build und erstellt beispielsweise Bundles mit ES5-Unterstützung, sofern sich ein Browser unter den Zielen befindet, der einen neueren JavaScript-Standard nicht unterstützt.

## TypeScript-Konfiguration `tsconfig.base.json`

Die Projektstruktur mit den verschiedenen TypeScript-Konfigurationsdateien `tsconfig.*.json` wurde geändert.
Neu ist hier die Datei `tsconfig.base.json`.

Die Datei `tsconfig.json` bildet nun den [mit TypeScript 3.9 eingeführten _Solution Style_](https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig) ab.
Dieses Format sorgt dafür, dass IDEs und Build Tools die Typ- und Package-Konfigurationen besser lokalisieren und auflösen können.
In der Datei `tsconfig.json` werden daher nur die genutzten TypeScript-Konfigurationen referenziert.
Zu Vermeidung von doppelten und gleichen Konfigurationseinstellungen in den einzelnen Config-Dateien existiert nun zusätzlich die Basiskonfiguration `tsconfig.base.json`.
Alle anderen `tsconfig.*.json` laden die Einstellungen von dieser Basiskonfiguration mithilfe von `extends`.

## Warnung bei CommonJS-Imports

Wenn in Ihrem Projekt eine Abhängigkeit zu einem Paket existiert, das auf das CommonJS-Format setzt, erscheint ab sofort eine Warnung beim Build der Anwendung.
Die Warnung besagt, dass die Nutzung von CommonJS die [Bundle-Size der resultierenden Anwendung erheblich vergrößert](https://web.dev/commonjs-larger-bundles/).
Um die Warnung zu beheben, prüfen Sie am besten, ob Sie das abhängige Paket in einem anderen Format beziehen können, oder stellen Sie auch hier ein Issue im Repository des Projekts ein.

## Setup mit strikten Compiler-Optionen

Setzen Sie ein neues Projekt mit Angular auf, so können Sie bereits beim Setup eine striktere Typprüfung erwirken.
Hierfür nutzen Sie die Option `--strict`:

```bash
ng new my-app --strict
```

Die Option bewirkt folgende Änderungen im Vergleich zum herkömmlichen Setup:

- Die [Compiler-Option `strict` für TypeScript](https://dev.to/briwa/how-strict-is-typescript-s-strict-mode-311a) wird gesetzt.
- [Striktere Template-Prüfungen](https://angular.io/guide/template-typecheck#strict-mode) werden aktiv.
- Die Überprüfung der maximale Bundle-Größe über den Abschnitt `budgets` in der Datei `angular.json` wird um ca. 75% heruntergesetzt.
- TSLint wird so konfiguriert, dass jegliche Nutzung von `any` zu einem Fehler führt.
- Angular stellt in der [Webpack-Konfiguration](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) ein, dass die Anwendung frei von Seiteneffekten ist. So kann beim Build der Anwendung ungenutzter Code sicher entfernt werden.

Eine detaillierte Beschreibung aller Einstellungen bei Nutzung von `--strict` finden Sie in der offiziellen [Angular-Dokumentation](https://angular.io/guide/strict-mode).

## Weitere Verbesserungen

Natürlich gab es im Zuge der Entwicklung von Angular 10 auch wieder eine Vielzahl von kleineren Verbesserungen und Fehlerbehebungen.
Eine detaillierte Liste aller Änderungen können Sie dem offiziellen [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md#1000-2020-06-24) und dem [Changelog der Angular CLI](https://github.com/angular/angular-cli/releases/tag/v10.0.0) entnehmen.

## Angular-Buch in der 3. Auflage

Die dritte Auflage des deutschsprachigen Angular-Buchs erschien im Oktober 2020 im Handel.
Wir haben das Buch vollständig **auf Angular 10 aktualisiert** und haben dabei auch neue Themen aufgenommen.

<hr>

Wir wünschen Ihnen viel Spaß mit Angular 10!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** Nationalpark Sächsische Schweiz, Juli 2017. Foto von Ferdinand Malcher</small>
