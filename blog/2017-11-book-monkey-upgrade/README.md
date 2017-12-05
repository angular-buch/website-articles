---
title: "Angular 5: Den Book-Monkey upgraden"
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
published: 2017-11-23
keywords:
  - Angular
  - Angular 5
  - Angular-CLI
language: de
thumbnail: ../angular5.png
hidden: true
---

Dank der Angular CLI ist es ziemlich einfach, eine neue Anwendung mit dem der aktuellen Version von Angular zu erstellen. Doch was ist zu tun, wenn wir ein bestehendes Projekt auf dem neuesten Stand bringen wollen?

Im konkreten Fall werden wir in diesem Artikel das Beispielprojekt "Book Monkey 2" aktualisieren.
Ich gehe davon aus, dass Sie den Anleitungen aus dem Buch gefolgt sind und Sie nun den BookMonkey mit Angular 4.x und einer Version der Angular CLI unter 1.5 vorliegen haben. Selbstverständlich werden die meisten Schritte auch für jede andere Angular-Anwendung anwendbar sein. 


## 1. Globale Installationen aktualisieren

Falls nicht bereits geschehen, so sollten sie unbedingt auf NPM 5.x aktualisieren. NPM 5 ist ab Node.js 8 mit an Board. Das Angular-Buch geht noch von NPM 4 aus. Die wichtigste Neuerung sind die automatisch erzeugten Lock-Dateien (`package.json.lock`). Ohne großes Zutun hat damit der recht unglückliche Umgang mit Versionsnummern ein Ende. Erscheint bei Eingabe von `npm -v` eine Versionsnummer 5.x, so ist alles perfekt.  

Die globale Installation von der Angular CLI aktualisieren wir wie folgt:

```bash
npm i @angular/cli -g
ng -v
```


## 2. Generierten Dateien aktualisieren

Beim Update auf Angular 5 hilft der [Angular Update Guide](https://angular-update-guide.firebaseapp.com/).
Das Tool stellt eine Checkliste und die passenden Befehle für das Update per `npm install` bereit.
Das ist formal korrekt, die Angular-Pakete sind nach Anwendung des "Angular Update Guide" auf dem aktuellen Stand. Dies gilt jedoch nicht für die vielen Dateien, welche die Angular CLI beim Befehl `ng new` anlegt. Hier tut sich ständig etwas. Viele kleine Verbesserungen sind seit Frühjahr 2017 geschehen.
Leider gibt es hier kein automatisches Tooling. Es führt kein weg daran vorbei: Wir müssen eine Reihe von Dateien vergleichen und ersetzen, um das gesamte Projekt aufzufrischen.

Zunächst löschen wir die Datei `package.lock.json` aus dem BookMonkey-Verzeichnis - sofern diese vorhanden ist.

Wir erzeugen nun ein zweites Projekt, mit den selben Argumenten wie im Buch:

```bash
ng new BookMonkey -p bm -is --skip-install
``` 

Neu ist das Argument `--skip-install`. Wir benötigen keine fertige Installation mit einem vollen `node_modules` Order und auch nicht die Datei `package.lock.json`! Nun kopieren wir die frischen Blueprint-Dateien vom neuen Projekt in das alte hinüber. Im Falle des BookMonkeys sind dies folgende Dateien:

* `.angular-cli.json` - __Vorsicht!__
* `.gitignore`
* `karma.conf.js`
* `package.json` - __Vorsicht!__
* `protractor.conf.js`
* `src\main.ts`
* `src\polyfills.ts`
* `src\test.ts`
* `src\tsconfig.app.json`
* `src\tsconfig.spec.json`
* `tsconfig.json`
* `tslint.json`

Vorsichtig müssen wir bei den Dateien `.angular-cli.json` und `package.json` sein.
Hier sollten wir nicht die Dateien komplett überschreiben, denn wir haben während der Entwicklung des BookMonkey einige Zeilen hinzugefügt. Für die Einbindung des CSS-Frameworks haben wir in der Datei `.angular-cli.json` die Zeile `"../node_modules/semantic-ui-css/semantic.css"` im Styles-Array hinzugefügt. Bei der Datei `package.json` haben wir ein paar Einträge zu den `scripts` hinzugefügt und die Abhängigkeiten `angular-date-value-accessor` sowie `semantic-ui-css` eingeführt (`npm i angular-date-value-accessor` sowie `npm i semantic-ui-css`). Am leichtesten übernimmt man die neuen Zeilen mit einem Diff-Tool. Der Rest der genannten Dateien kann getrost überschrieben werden. Unser Diff mit einem Angular-CLI 1.0.0 Projekt so aus:

* __[Update CLI project to 1.5.4](https://github.com/book-monkey2-build/iteration-1-components/commit/c0a611a7b2947758fd3009691e3b8365ecc67cf4)__

Wenn Sie bereits einen neueren Stand der CLI haben, so sind bei Ihnen weniger Änderungen sichtbar.


## 3. i18n-Kommentare ersetzen

Zum Abschluss der Reise mit dem BookMonkey hatten wir die Anwendung internationalisiert.
In zwei Dateien haben wir einen Text zu übersetzen, der nicht direkt von einem HTML-Element umschlossen wird. Wir haben hierfür HTML-Kommentare verwendet. Diese magischen Kommentare sind jetzt "deprecated" und sollten durch den `ng-container` ersetzt werden (siehe [#18998](https://github.com/angular/angular/pull/18998)).

Aus
```html
<!--i18n: @@BookDetailsComponent:book delete -->Buch löschen<!--/i18n-->
```

wird:
```html
<ng-container i18n="@@BookDetailsComponent:book delete">Buch löschen</ng-container>
```

Die Änderungen sind schnell gemacht, die Änderungen sind in folgendem Diff zusammen gefasst:

* __[Use ng-container over i18n comments](https://github.com/angular-buch/book-monkey2/commit/e6ff2047fcf7f718c3930b4550a26f1fc4bb78b0)__

