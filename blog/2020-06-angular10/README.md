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
language: de
thumbnail: ./angular10.jpg
sticky: false
---

Am 24. Juni 2020 wurde die neue Major-Version **Angular 10.0** veröffentlicht! Wir werden Ihnen in diesem Artikel die wichtigsten Neuerungen vorstellen.

Da sich das vorherige [Major-Release von Angular 9](/blog/2020-02-angular9) verzögert hatte, wurde Angular 10 nach nur vier Monaten Entwicklungszeit statt der üblichen sechs Monate herausgegeben.

Es gibt auch wieder kleinere Breaking Changes, doch das Update auf die neue Version geht dank der Angular CLI und den Schematics leicht von der Hand.

Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular Blog](https://blog.angular.io/version-10-of-angular-now-available-78960babd41).

**Inhalt**



## Update auf Angular 10

Das Update zur neuen Angular-Version ist schnell erledigt.
Falls Ihr Projekt noch nicht in der letzten Version von Angular 9 vorliegt, sollten Sie zunächst das folgende Update erledigen:

```bash
ng update @angular/cli@9 @angular/core@9
```

Anschließend können Sie ihr Projekt ganz einfach auf Angular 10 aktualisieren:

```bash
ng update @angular/cli @angular/core
```

Die Angular CLI führt automatisch alle nötigen Anpassungen am Code der Anwendung durch, sofern notwendig.

Auf [update.angular.io](https://update.angular.io/#9.0:10.0) können Sie übrigens wie üblich alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Update der TypeScript Umgebung

### TypeScript 3.9

Mit Angular 10 unterstützt Angular nun [TypeScript in der Version 3.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html).

### tslib 2.0.0

Weiterhin wurde die Abhängigkeit zur TypeScript Bibliothek _tslib_ auf die Version _2.0.0_ angehoben.
Sofern Sie ein existierendes Angular Projekt mit abhängigen Packages haben, die eine `peerDependency` von tslib 1.x.x erfordern, werden Sie bei der Ausführung von `ng update` wahrscheinlich folgende Fehlermeldung erhalten:

```
Package "my-package" has an incompatible peer dependency to "tslib" (requires "^1.10.0", would install "2.0.0").
✖ Migration failed: Incompatible peer dependencies found.
Peer dependency warnings when installing dependencies means that those dependencies might not work correctly together.
You can use the '--force' option to ignore incompatible peer dependencies and instead address these warnings later.
```

Um dieses Problem zu beheben können Sie in vielen Fällen die Fehlermeldung ignorieren und einfach `ng update` mit dem Flag `--force` ausführen.
Hinterher sollten Sie jedoch zur Sicherheit noch einmal genauestens prüfen, ob ihre Anwendung und ihrer Tests korrekt funktionieren.

Ist Ihnen dieser Weg zu risikoreich, empfehlen wir Ihnen noch etwas zu warten, bis die zu nutzende Bibliothek `tslib` 2.0.0 unterstützt.
Prüfen Sie ggf. beim Provider der Bibliothek ob bereits ein Issue zu diesem Thema eröffnet wurde oder stellen Sie ein entsprechendes Issue für die Unterstützung von Angular 10 / tslib 2.0.0 ein.

### TSLint 6.0.0

Ab Angular 10 wird TSLint in der Version 6.0.0 unterstützt.
Sämtliche Änderungen an der Datei `tslint.json` führen die Angular Schematics bei der Ausführung von `ng update` automatisch durch.


## Browserslist

Mit Angular 10 wurde die Standardkonfiguration für unterstütze Browser etwas aufgeräumt.
Weiterhin hat sich der Dateiname von `browserslist` zu `.browserslistrc` geändert.

Standardmäßig wird nun vor allem die letzte oder die letzten beiden Version der meist genutzten Browser unterstützt.
Wenn Sie das tool `browserslist` über `npx` ausführen, erhalten Sie eine detaillierte Auflistung der unterstützten Browser bei der aktuellen Konfiguration der Datei `.browserslistrc`.

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
Wollen Sie beispielweise den Internet Explorer 11 unterstützen, fügen Sie einfach `IE 11` zur Datei hinzu.
Angular berücksichtigt die Einstellungen beim Build und erstellt beispielsweise Bundles mit ES5 Unterstützung, sofern sich ein Browser unter den Zielen befindet, die einen neueren JavaScript-Standard nicht unterstützen.

## TypeScript Konfiguration `tsconfig.base.json`

Die Projektstruktur mit den verschiedenen TypeScript Konfigurationsdateien `tsconfig.*.json` wurde etwas angepasst.
Neu ist hier die Datei `tsconfig.base.json`.

Die Datei `tsconfig.json` bildet nun den [mit TypeScript 3.9 eingeführten _Solution Style_](https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig) ab.
Sie sorgt dafür, dass IDEs und Build Tools Typen- und Package-Konfigurationen besser finden und auflösen können.
In ihr werden die genutzten TypeScript-Konfigurationen referenziert.
Zu Vermeidung von doppelten und gleichen Konfigurationseinstellungen in den einzelnen `tsconfig.*.json` Dateien, existiert die Basiskonfigurationsdatei `tsconfig.base.json`.
Alle anderen `tsconfig.*.json` laden die Basiseinstellungen über `extends` von dieser Basiskonfiguration.

## Warnung bei CommonJS Imports

Wenn in ihrem Projekt eine Abhänigkeit zu einem Package existiert, dass auf das CommonJS Format setzt, erscheint ab sofort eine Warnung beim Build der Anwendung.
Die Warnung besagt, dass die Nutzung von CommonJS die [Bundle-Size der resultierenden Anwendung erheblich vergrößert](https://web.dev/commonjs-larger-bundles/).
Um die Warbnung zu beheben, prüfen Sie am besten, ob sie das abhängige Package in einem anderen Format beziehen können oder stellen Sie ein Issue beim Provider des Packages ein.

## Setup mit strikten Compiler-Optionen

Setzen Sie ein neues Projekt mit Angular auf, so können Sie bereits beim Setup eine striktere Typenprüfung erwirken.
Hierfür nutzen Sie die Option `--strict`:

```bash
ng new my-app --strict
```

Die Option bewirkt folgende Änderun gen im Vergleich zum herkömmlichen Setup:

- Die [Compiler-Option `strict` für TypeScript](https://dev.to/briwa/how-strict-is-typescript-s-strict-mode-311a) wird gesetzt.
- [Striktere Templateprüfungen](https://angular.io/guide/template-typecheck#strict-mode) werden aktiv.
- Die Überprüfung der maximale Bundle-Größe über den Abschnitt `budgets` in der Datei `angular.json` wird um ca. 75% heruntergestezt.
- TSLint wird derart konfiguriert, dass jegliche Nutzung von `any` zu einem Fehler führt.
- Angular stellt in der [Webpack Konfiguration](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) ein, dass die Anwendung frei von Seiteneffekten ist. Somit kann beim Build der Anwendung ungenutzter Code sicher entfernt werden.

Eine detaillierte Beschreibung aller Einstellungen bei Nutzung von `--strict` finden Sie in den offiziellen [Angular Docs](https://angular.io/guide/strict-mode)

## Weitere Verbesserungen

Natürlich gab es im Zuge der Enwircklung von Angular 10 auch wieder eine Vielzahl von kleineren Verbesserungen und Bug Fixings.
Eine detaillierte Liste aller Änderungen kann dem offiziellen [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md#1000-2020-06-24) und dem [Changelog der Angular CLI](https://github.com/angular/angular-cli/releases/tag/v10.0.0) entnommen werden.

<hr>

Wir wünschen Ihnen viel Spaß mit Angular 10!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** TODO @ferdi</small>
