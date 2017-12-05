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
---

Dank der Angular CLI ist es ziemlich einfach, eine neue Anwendung mit der aktuellen Version von Angular zu erstellen.
Doch was ist zu tun, wenn wir ein bestehendes Projekt auf den neuesten Stand bringen wollen?

Im konkreten Fall werden wir in diesem Artikel das Beispielprojekt ["Book Monkey 2"](http://book-monkey2.angular-buch.com/) aktualisieren.
Ich gehe davon aus, dass Sie den Anleitungen aus dem Buch gefolgt sind
und Sie nun den BookMonkey mit Angular 4.x und einer Version der Angular CLI unter 1.5 vorliegen haben.
Selbstverständlich werden die meisten Schritte auch für jede andere Angular-Anwendung anwendbar sein. 


## 1. Globale Installationen aktualisieren

Falls nicht bereits geschehen, so sollten Sie unbedingt auf NPM 5.x aktualisieren.
NPM 5 ist ab Node.js 8 mit an Board. Das Angular-Buch geht noch von NPM 4 aus.
Die wichtigste Neuerung sind die automatisch erzeugten Lock-Dateien (`package-lock.json`).
Ohne großes Zutun hat damit der recht unglückliche Umgang mit Versionsnummern ein Ende.
Erscheint bei Eingabe von `npm -v` eine Versionsnummer `5.x`, so ist alles perfekt.  

Die globale Installation der Angular CLI aktualisieren wir wie folgt:

```bash
npm i -g @angular/cli
ng -v
```


## 2. Generierten Dateien aktualisieren

Beim Update auf Angular 5 hilft der [Angular Update Guide](https://angular-update-guide.firebaseapp.com/).
Das Tool stellt eine Checkliste und die passenden Befehle für das Update per `npm install` bereit.
Das ist formal korrekt, die Angular-Pakete sind nach Anwendung des *Angular Update Guide* auf dem aktuellen Stand.
Dies gilt jedoch nicht für die vielen Dateien, welche die Angular CLI mit dem Befehl `ng new` anlegt.
Hier tut sich ständig etwas – viele kleine Verbesserungen sind seit Frühjahr 2017 geschehen.
Leider gibt es hier kein automatisches Tooling.
Es führt kein Weg daran vorbei:
Wir müssen eine Reihe von Dateien vergleichen und ersetzen, um das gesamte Projekt aufzufrischen.

Zunächst löschen wir die Datei `package-lock.json` aus dem BookMonkey-Verzeichnis – sofern diese vorhanden ist.
Wenn dieser Schritt vergessen wird, dann werden die manuellen Änderungen an der `package.json` nicht berücksichtigt.

Wir erzeugen nun ein zweites leeres Projekt, mit den selben Argumenten wie im Buch:

```bash
ng new BookMonkey -p bm -is --skip-install
``` 

Neu ist das Argument `--skip-install`.
Wir benötigen keine fertige Installation mit einem vollen Ordner `node_modules`
und auch nicht die Datei `package-lock.json`!
Nun kopieren wir die frischen Blueprint-Dateien vom neuen Projekt in das alte hinüber.
Im Falle des BookMonkeys sind dies folgende Dateien:

* `.angular-cli.json` – __Vorsicht!__
* `.gitignore`
* `karma.conf.js`
* `package.json` – __Vorsicht!__
* `protractor.conf.js`
* `src/main.ts`
* `src/polyfills.ts`
* `src/test.ts`
* `src/tsconfig.app.json`
* `src/tsconfig.spec.json`
* `tsconfig.json`
* `tslint.json`

Vorsichtig müssen wir bei den Dateien `.angular-cli.json` und `package.json` sein.
Hier sollten wir nicht die Dateien komplett überschreiben,
denn wir haben während der Entwicklung des BookMonkey einige Zeilen hinzugefügt.
Für die Einbindung des CSS-Frameworks haben wir in der Datei `.angular-cli.json`
diese Zeile im `styles`-Array hinzugefügt:

```
"../node_modules/semantic-ui-css/semantic.css"
```


Bei der Datei `package.json` haben wir ein paar Einträge zu den `scripts` hinzugefügt
und die Abhängigkeiten `angular-date-value-accessor` sowie `semantic-ui-css` eingeführt
(`npm i angular-date-value-accessor` sowie `npm i semantic-ui-css`).
Am leichtesten übernimmt man die neuen Zeilen mit einem Diff-Tool.
Der Rest der genannten Dateien kann getrost überschrieben werden.
Unser Diff mit einem Projekt der Angular CLI 1.0.0 sieht so aus:

* __[Update CLI project to 1.5.4](https://github.com/book-monkey2-build/iteration-7-i18n/commit/3c607f0bef8b6577029cf15dcec8fe9c6ff05874)__

Wenn Sie bereits einen neueren Stand der CLI haben, so sind bei Ihnen weniger Änderungen notwendig.


## 3. i18n-Kommentare ersetzen

Zum Abschluss der Reise mit dem BookMonkey hatten wir die Anwendung internationalisiert.
In zwei Dateien haben wir einen Text übersetzt, der nicht direkt von einem HTML-Element umschlossen wird.
Wir haben hierfür HTML-Kommentare verwendet.
Diese magischen Kommentare sind jetzt *deprecated* und sollten durch den `ng-container` ersetzt werden (siehe [#18998](https://github.com/angular/angular/pull/18998)).

Aus
```html
<!--i18n: @@BookDetailsComponent:book delete -->Buch löschen<!--/i18n-->
```

wird
```html
<ng-container i18n="@@BookDetailsComponent:book delete">Buch löschen</ng-container>
```

Die Änderungen sind schnell gemacht, sie sind in folgendem Diff zusammengefasst:

* __[Use ng-container over i18n comments](https://github.com/book-monkey2-build/iteration-7-i18n/commit/6e54598b2e05aff8e804e2bce7e47577a7c3b216)__


## 4. Den neuen HttpClient verwenden

Mit Version 4.3 des Angular-Frameworks steht der neue `HttpClient` bereit.
Dieser ersetzt den veralteten `Http`-Service (siehe [#18906](https://github.com/angular/angular/pull/18906)).
Dem neuen `HttpClient` widmen wir uns in einem [ausführlichen Blogpost](/blog/2017-11-httpclient).
Hier sind in aller Kürze die notwendigen Änderungen:

* __[Update to new HttpClient](https://github.com/book-monkey2-build/iteration-7-i18n/commit/efd88396773ba0c5b52494e0f1aef958f7cc3c3e)__


## 5. RxJS Lettable Operators verwenden

Mit Angular 5 kommt das Konzept der Lettable Operators in die Angular-Welt.
Über die neuen Operatoren haben wir im [Blogpost zu Angular 5](/2017-11-angular5#rxjs-lettable-operators) berichtet.

* __[Introduce lettable RxJS operators](https://github.com/book-monkey2-build/iteration-7-i18n/commit/043a3d0bb509aea3b6d714fdda75f55d7283c842)__


## 6. Lokalisierungs-Daten importieren und registrieren

Ab Angular 5 müssen die verfügbaren Locales einzeln importiert und registriert werden.
Dafür wurde die Funktion `registerLocaleData()` eingeführt, die z.B. im `AppModule` aufgerufen werden kann:

* __[Use registerLocaleData()](https://github.com/book-monkey2-build/iteration-7-i18n/commit/0e924f6ab5e540db4ce4c98f2b95c44f42a5b775)__

Es gibt noch weitere Änderungen, welche die Mehrsprachigkeit betreffen –
wobei aber in unserem Fall keine Änderungen im BookMonkey notwendig sind.
Der Blogpost [Internationalisierung in Angular 5](/blog/2017-11-ng5-locales) stellt diese im Einzelnen vor.


## 7. Neu: Das Interface `BookRaw`

Ein optionales aber sehr hilfreiches Feature sind die generischen Methoden des neuen `HttpClient`.
Im Buch haben wir noch den alten Service und damit die untypisierte Syntax verwendet:

```ts
this.http.get(`${this.api}/books`)
```

Der zurück gegebene Wert ist vom Typ `Observable<Object>`.
TypeScript kann uns so beim  Kompilieren und bei der automatischen Code-Vervollständigung kaum unterstützen.
Die neue API hat nun für jede der bekannten HTTP-Methoden eine generische Variante dabei:

```ts
this.http.get<T>(`${this.api}/books`)
```

Der zurück gegebene Wert ist nun vom Typ `Observable<T>`.
Statt `T` müssen wir natürlich einen existierenden Typ angeben.
In unserem Fall wollen wir ein Interface verwenden:

```ts
// book-raw.ts
export interface BookRaw {
  isbn: string;
  title: string;
  authors: string[];
  published: string;
  subtitle: string;
  rating: number;
  thumbnails: {
    url: string;
    title: string;
  }[];
  description: string;
}

```
Wir helfen damit dem Compiler auf die Sprünge.
Bei allen nachfolgende RxJs-Pipes können wir nun auf automatische Code-Vervollständigung setzen. 
Wir ersparen uns aber vor allem auch eine potentielle Quelle für Laufzeitfehler - welche stets schwer zu finden sind.
Das ganze Funktioniert natürlich nur, wenn wiederum keine Tippfehler im Interface vorhanden sind - TypeScript muss uns hier weiterhin "blind" vertrauen.

Auch diese optionalen Änderungen finden Sie in auf Github:
* __[Introduce interface BookRaw for HTTP response](https://github.com/book-monkey2-build/iteration-7-i18n/commit/f2d380af5171f079d37036370d03d6538e2f18f8)__


## 8. Optionaler Tipp: Swagger

Beim Datenaustausch zwischen Backend und Frontend knirscht es immer wieder gerne.
Im Backend wir ein Typ verändert, die Änderungen werden nicht im Frontend nachgezogen - **Boom: Exception** zur Laufzeit! Für den BookMonkey heißt das: wir müssen das Interface `BookRaw` sowie alle URLs stets im Auge behalten. Es könnte womöglich eine Änderung bei der API gegeben haben, die Sie nicht mitbekommen haben! _(Das ist natürlich rein hypothetisch. Wir ändern die BM-API nicht, versprochen! :smile:)_

Ich empfehle Ihnen wärmstens, Ihre API per Swagger zu definieren.
Sowohl Mensch als auch Maschine können das Swagger-Format leicht lesen und passend verwerten.
Natürlich setzt auch unser BookMonkey auf Swagger.
Mithilfe des Swagger-Formats wird folgendes User-Interface on-the-fly aufgebaut:

* https://book-monkey2-api.angular-buch.com/swagger-ui/#/book

Eine neue API zu testen wird so zum Kinderspiel.

Das ist schon sehr beeindruckend.
Das beste Feature ist allerdings die automatische Code-Generierung per [swagger-codegen](https://github.com/swagger-api/swagger-codegen).
Setzen Sie am besten gleich auf die kommende v3 und verwenden Sie den Generator `typescript-angular`.
Einmal eingerichtet und in das Continuous-Deployment eingebunden, bekommen wir ein fertiges Angular-Modul, passende Services und alle Entitäten als Interfaces automatisch generiert.
Stand heute muss aber noch ein kleiner Workaround angewendet werden: [#6722](https://github.com/swagger-api/swagger-codegen/issues/6722)


## 9. Geschafft!

Herzlichen Glückwunsch.
Der BookMonkey ist auf dem neuesten Stand und wurde auch gleich noch ein wenig modernisiert.
Das gesamte finale Projekt können Sie hier herunter laden:

 * [Der finale BookMonkey (ZIP)](https://github.com/book-monkey2-build/iteration-7-i18n/archive/master.zip)

**Ich wünsche Ihnen weiterhin viel Spaß mit Angular 5 und unserem Buch.**