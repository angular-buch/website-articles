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

Mit der Angular CLI ist es ziemlich einfach, eine neue Anwendung mit dem der aktuellen Version von Angular zu erstellen. Doch was ist zu tun, wenn wir ein bestehendes Projekt auf dem neuesten Stand bringen wollen?

Im konkreten Fall werden wir in diesem Artikel das Beispielprojekt "Book Monkey 2" aktualisieren.
Ich gehe davon aus, dass Sie den Anleitungen aus dem Buch gefolgt sind und Sie nun den Book Monkey mit Angular 4.x und einer Version der Angular CLI unter 1.5 vorliegen haben. Selbstverständlich werden die meisten Schritte auch für jede andere Angular-Anwendung anwendbar sein. 


## Globale Installationen aktualisieren

Falls nicht bereits geschehen, so sollten sie unbedingt auf NPM 5.x aktualisieren. NPM 5 ist ab Node.js 8 mit an Board. Das Angular-Buch geht noch von NPM 4 aus. Die wichtigste Neuerung sind die automatisch erzeugten Lock-Dateien (`package.json.lock`). Ohne großes Zutun hat damit der recht unglückliche Umgang mit Versionsnummern ein Ende. Erscheint bei Eingabe von `npm -v` eine Versionsnummer 5.x, so ist alles perfekt.  

Die globale Installation von der Angular CLI aktualisieren wir wie folgt:

```
npm i @angular/cli -g
ng -v
```


## Die generierten Dateien aktualisieren

Beim Update auf Angular 5 hilft der [Angular Update Guide](https://angular-update-guide.firebaseapp.com/).
Das Tool stellt eine Checkliste und die passenden Befehle für das Update per `npm install` bereit.
Das ist formal korrekt, die Angular-Pakete sind nach Anwendung des "Angular Update Guide" auf dem aktuellen Stand. Dies gilt jedoch nicht für die vielen Dateien, welche die Angular CLI beim Befehl `ng new` anlegt. Hier tut sich ständig etwas. Viele kleine Verbesserungen sind seit Frühjahr 2017 geschehen.
Leider gibt es hier kein automatisches Tooling. Es führt kein weg daran vorbei: Wir müssen eine Reihe von Dateien vergleichen und ersetzen, um das gesamte Projekt aufzufrischen.





