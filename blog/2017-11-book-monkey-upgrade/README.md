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


## 2. Die generierten Dateien aktualisieren

Beim Update auf Angular 5 hilft der [Angular Update Guide](https://angular-update-guide.firebaseapp.com/).
Das Tool stellt eine Checkliste und die passenden Befehle für das Update per `npm install` bereit.
Das ist formal korrekt, die Angular-Pakete sind nach Anwendung des "Angular Update Guide" auf dem aktuellen Stand. Dies gilt jedoch nicht für die vielen Dateien, welche die Angular CLI beim Befehl `ng new` anlegt. Hier tut sich ständig etwas. Viele kleine Verbesserungen sind seit Frühjahr 2017 geschehen.
Leider gibt es hier kein automatisches Tooling. Es führt kein weg daran vorbei: Wir müssen eine Reihe von Dateien vergleichen und ersetzen, um das gesamte Projekt aufzufrischen.

An einfachsten hat man es, wenn das Projekt bereits unter Versionsverwaltung steht.
Das sollte aber sowieso bereits der Fall sein, Git und Co. gehören schließlich zum gute Ton.

Zunächst löschen wir die Datei `package.lock.json` aus dem BookMonkey-Verzeichnis - sofern diese vorhanden ist.

Wir erzeugen nun ein zweites Projekt, mit den selben Argumenten wie im Buch:

```bash
ng new BookMonkey -p bm -is --skip-install
``` 

Neu ist das Argument `--skip-install`. Wir benötigen keine fertige Installation mit einem vollen `node_modules` Order und auch nicht die Datei `package.lock.json`! Nun kopieren wir die frischen Blueprint-Dateien vom neuen Projekt in das alte hinüber. Im Falle des BookMonkeys sind dies folgende Dateien:

* `.angular-cli.json`
* `.gitignore`
* `karma.conf.js`
* `package.json`
* `protractor.conf.js`
* `src\main.ts`
* `src\polyfills.ts`
* `src\test.ts`
* `src\tsconfig.app.json`
* `src\tsconfig.spec.json`
* `tsconfig.json`
* `tslint.json`

Bei der `package.lock.json` sollten wir anschließend Zeilenweise die Änderungen rückgängig machen, welche ungewollt überschrieben wurden. Wir haben während der Entwicklung des BookMonkey in der `package.json` ein paar Einträge zu den `scripts` hinzugefügt und die Abhängigkeiten `angular-date-value-accessor` sowie `semantic-ui-css` eingeführt. Diese Erweiterungen wollen wir natürlich nicht verlieren. Das selbe gilt für die `.angular-cli.json`. Hier haben wir die abweichende Zeile `"../node_modules/semantic-ui-css/semantic.css"` im Styles-Array.
Auch hier müssen wir sorgsam prüfen. Der Rest der genannten Dateien kann getrost überschrieben werden. Unser Diff mit einem Angular-CLI 1.0.0 Projekt so aus:
* ** [Ausgewählte änderungen CLI 1.0 zu CLI 1.5](https://github.com/angular-buch/book-monkey2/commit/95fd2bd0ddb37427d0311a9eea56d629d7c3b686)**
Wenn Sie bereits einen neueren Stand der CLI hatten, so sind bei Ihnen weniger Änderungen sichtbar.
