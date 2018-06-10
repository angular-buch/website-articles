---
title: "Angular 6 ist da!"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2018-05-21
lastModified: 2018-06-10
keywords:
  - Angular
  - Angular 6
  - RxJS
  - Tree-Shakable Providers
  - Angular CLI
language: de
thumbnail: ../angular6.png
sticky: true
---

Angular 6 ist da! Am 04. Mai 2018 erschien die neue Major-Version von Angular.
Obwohl das zunächst nach komplizierten Upgrades und vielen Breaking Changes klingt, können Sie aufatmen:
Ihre aktuellen Projekte mit Angular 4 oder 5 sind weiterhin lauffähig und das Upgrade ist in kurzer Zeit erledigt.

In diesem Artikel stellen wir Ihnen kurz die Neuerungen vor und aktualisieren das Beispielprojekt "Book Monkey".

## Angular 6: Alles ist neu?

Die Neuerungen in Angular 6 betreffen vor allem Themen aus dem Hintergrund des Frameworks.
An der öffentlichen API von Angular hat sich so gt wie nichts geändert. Das Upgrade auf Angular 6 ist also ein Kinderspiel.

Die offizielle Ankündigung zum Angular-6-Release finden Sie im
[Angular-Blog](https://blog.angular.io/version-6-of-angular-now-available-cc56b0efa7a4).
Für Details zu einzelnen Änderungen lohnt sich außerdem ein Blick in den
[Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md).

Beim Update auf Angular 6 hilft der [Angular Update Guide](https://update.angular.io/).
Das Tool stellt eine Checkliste und die passenden Befehle für das Update bereit.

Angular bietet ab sofort folgenden **Long Term Support (LTS)**:

* **Angular 4** – 23. September 2018
* **Angular 5** – 1. Mai 2019
* **Angular 6** – 3. November 2019

Damit ist gewährleistet, dass aktuelle Angular-Projekte auch langfristig lauffähig sind und nicht mit jeder Major-Version zeitnah ein vollständiges Upgrade durchgeführt werden muss.

Angular 6 ist übrigens die erste Version von Angular, mit der alle Module die selbe Versionsnummer 6 besitzen.


### Tree-Shakable Providers

Für jeden Service, den wir in der Anwendung nutzen wollten, mussten wir bisher folgende Schritte gehen:

* Serviceklasse mit Decorator `@Injectable()` versehen
* Service in einem Modul registrieren (unter `providers` in einem `NgModule` eintragen)
* Instanz über Constructor Injection anfordern, z.B. in einer Komponente

Dieser Weg funktionierte gut, hatte aber einen entscheidenden Nachteil:
Der Service ist immer in einem Modul referenziert, auch wenn er niemals verwendet wird.
Damit wird der Service *immer* auch in das Bundle unserer Anwendung eingebaut.

Mit Angular 6 kommt das Konzept der *Tree-Shakable Providers* ins Spiel.
Anstatt den Service explizit im Modul zu deklarieren, registriert sich der Service ab sofort eigenständig in einem Modul.
Dazu ist der Schlüssel `providedIn` im `@Injectable()`-Decorator zuständig:

```ts
@Injectable({ providedIn: 'root' })
export class BookStoreService {}
```

In 99 % der Fälle wird hier der Wert `root` verwendet.
Dieser Service wird nur dann in das Application-Bundle übernommen, wenn er auch von einer Komponente angefordert wird.


Für einen tieferen Einblick in Tree-Shakable Providers sei der passende [Blogartikel von Manfred Steyer](https://www.softwarearchitekt.at/post/2018/05/06/the-new-treeshakable-providers-api-in-angular-why-how-and-cycles.aspx) empfohlen.



### Angular CLI 6

Die Angular CLI wurde mit ihrer neuen Version grundlegend überarbeitet.
Grundlage der Code-Generierung sind die sogenannten **Schematics**. Dabei handelt es sich um "Baupläne" zur Code-Generierung und -Aktualisierung.
Jeder Aufruf von `ng generate` triggert die darunterliegenden Schematics.
Das System ist so strukturiert, dass auch eigene Schematics zur Codeerzeugung eingebunden werden können.
Viele Drittanbieter-Bibliotheken integrieren bereits entsprechende Bauanleitungen in ihre Projekte.

Für einen Deep-Dive in die Welt der Schematics können wir das [kostenlose E-Book von Manfred Steyer](https://leanpub.com/angular-schematics) empfehlen.


#### Workspaces und `angular.json`

Die Angular CLI setzt ab sofort auf das Konzept der *Workspaces*. Ein mit `ng new` generiertes Projekt ist nun nicht mehr nur eine einzige Anwendung, sondern ein Arbeitsbereich, in dem mehrere Anwendungen und Bibiotheken zusammen entwickelt werden.
Durch das [neue Library-Feature](https://github.com/angular/angular-cli/wiki/stories-create-library) kann wiederverwendbarer Code in gemeinsam genutzte Bibliotheken ausgelagert werden.

Verschiedene Anwendungen innerhalb eines Workspaces können sein z.B.
- nach Kundenwunsch angepasste Versionen einer Anwendung (siehe auch unser Blogartikel ["One App per Customer"](https://angular.schule/blog/2018-05-one-app-per-customer))
- die Browser-, Desktop- und Mobilversion einer Anwendung

Um diese neue Projektstruktur abzubilden, wurde eine neue Konfigurationsdatei geschaffen.
**Die neue `angular.json` löst die bisherige `.angular-cli.json` ab!**
Die Struktur innerhalb der Datei hat sich stark geändert, viele der Optionen sind aber trotzdem wiederzufinden und funktionieren genauso wie vorher.

#### `ng update`

Der neue Befehl `ng update` bringt ein Feature in die CLI, das wir uns schon lange gewünscht haben:
ein automatisches Update der Anwendung.
Auch diese Toolchain basiert auf Schematics: Darin sind Vorschriften verpackt, wie ein Projekt und seine Abhängigkeiten auf die nächsthöhere Version aktualisiert werden müssen.
Das Update von Angular 5 auf 6 funktioniert also vollautomatisch.
Weiter unten in diesem Artikel gehen wir noch auf den konkreten Ablauf anhand des Book Monkey ein.


#### `ng add`

Neu ist auch der Befehl `ng add`, mit dem neue Funktionalitäten zur bestehenden Anwendung hinzugefügt werden können.
Dabei handelt es sich nicht um einzelne Artefakte wie Komponenten, sondern grundlegende globale Funktionalitäten.

```bash
# Angular Material
ng add @angular/material

# Toolkit für Progressive Web App
ng add @angular/pwa

# Kendo UI for Angular (Beispiel)
ng add @progress/kendo-angular-inputs
```

mit `ng add` wird nicht nur das passende NPM-Paket installiert, sondern es werden Schematics ausgeführt, die den Projektcode anpassen und die neue Funktionalität direkt in das Projekt integrieren.


### RxJS 6

Die Reactive Extensions for JavaScript (RxJS) bilden die Grundlage für reaktive Programmierung mit Angular.
RxJS erschien fast zeitgleich mit Angular ebenfalls in der neuen Version 6.
Damit können die alten Operatoren mit Dot-Chaining nicht mehr verwendet werden, sondern es werden durchgehend Pipeable Operators eingesetzt.
Dieses Thema ist allerdings nicht neu, sondern wir haben bereits mit dem Upgrade auf Angular 5 empfohlen, auf Pipeable Operators umzusteigen.
Siehe dazu auch der [Artikel zum Upgrade auf Angular 5](/blog/2017-12-angular5#rxjs-pipeable-operators-ehemals-lettable-).

RxJS-Operatoren werden ab jetzt nur noch wie folgt verwendet:

```ts
myObservable$.pipe(
  map(e => e.id),
  filter(id => id.length > 5),
  mergeMap(id => this.bs.getSingle(id))
)
```

Um Abwärtskompatibilität zu wahren, wird zusätzlich das Paket [`rxjs-compat`](https://www.npmjs.com/package/rxjs-compat) bereitgestellt.
Nachdem alle Abhängigkeiten auf RxJS 6 aktualisiert wurden, sollten Sie dieses Paket entfernen. Das spart Platz.


### Angular Elements

In Version 6 ist auch das erste Release der Angular Elements enthalten.
Dieses Modul ermöglicht es uns, Angular-Komponenten als Webkomponenten zu verpacken und zu nutzen.
Damit können wir Angular-Komponenten auch außerhalb von Angular in jeder Anwendung einsetzen.

Für einen Einstieg in das Thema verweisen wir auf die [Dokumentation von Angular](https://angular.io/guide/elements).



## Book Monkey updaten

Jetzt geht es ans Eingemachte: Mit dem Wissen über die neuen Features von Angular wollen wir den Book Monkey aktualisieren.
Mit dem neuen Befehl `ng update` wird das Update sehr einfach.
Wir empfehlen Ihnen immer den Einstieg über den offiziellen [Angular Update Guide](https://update.angular.io/).


### Vorab: NPM Install

Als Grundlage für diese Anleitung haben wir den [aktualisierten Book Monkey vom Dezember 2017](/blog/2017-12-book-monkey-upgrade) verwendet.
Das heißt, wir sind schon auf Anguar 5 und nutzen die neue `package-lock.json`, welche mit NPM 5 hinzu gekommen ist.
Bei diesem speziellen Setup ist uns aufgefallen, dass ein normales `npm install` nicht mehr funktioniert.

__Fehlermeldung:__
```bash
> node-sass@4.7.2 install /Users/johanneshoppe/Work/angular-buch/iteration-7-i18n/node_modules/node-sass
> node scripts/install.js

module.js:557
    throw err;
    ^

Error: Cannot find module 'true-case-path'
```

Das ist etwas ärgerlich, aber leicht behoben.
__Lösung:__ Einfach den Ordner `node_modules` und die Datei `package-lock.json` löschen. Danach geht der `npm i` wieder. [Laut Stack Overflow](https://stackoverflow.com/a/48322891) sollte es ebenso ausreichen, node.js und NPM auf den allerneusten Stand zu bringen. Nun gut. Weiter geht es!

### Abhängigkeiten aktualisieren mit `ng update`

Für das Update unserer Anwendung sind folgende Befehle nötig:

```bash
# Angular CLI global aktualisieren
npm install -g @angular/cli

# Angular CLi lokal im Projekt aktualisieren
npm install @angular/cli

# Update!
ng update @angular/cli
```

Je nach der vorherigen Projekt-Version erscheint folgende Meldung:

> The Angular CLI configuration format has been changed, and your existing configuration can be updated automatically by running the following command:
> `ng update @angular/cli`

Der Hinweis ist eindeutig. Also noch einmal:

```bash
ng update @angular/cli
```

Und zum Schluss fehlt nur noch ein:

```bash
ng update @angular/core
```

### RxJS 6

Die Aktualisierung von RxJS hat ein eigenes Tool:

```bash
npm install -g rxjs-tslint
rxjs-5-to-6-migrate -p src/tsconfig.app.json
```

Sollten Sie noch irgendwo die alten RxJS-Operatoren statt der Pipeable Operators verwenden,
so werden diese automatisch mittels `rxjs-compat` weiterhin laufen.
Wenn Sie keine Pipeable Operators mehr verwenden und auch keine Drittabieterbibliotheken mehr darauf basieren, können und sollten Sie das Paket `rxjs-compat` entfernen.

In unserem Fall war schon alles auf Pipeable Operators umgestellt und `rxjs-compat` wurde nicht hinzugefügt, weswegen wir es auch nicht entfernen mussten.

Danach sollte das Projekt mit Angular 6 lauffähig sein – in wenigen automatisierten Schritten!
Sollten wir einen Schritt bzw. einen Fall übersehen haben, so schreiben Sie uns bitte an __team@angular-buch.com__.



### Tree-Shakable Providers

Der `BookStoreService` wird im Moment explizit im `AppModule` provided.
Dieser Weg wird auch weiterhin unterstützt.
Möchten Sie den Service trotzdem auf den neuen *tree-shakable* Weg migrieren, sind folgende Schritte nötig:

#### 1.) `providedIn` im Service hinzufügen

```ts
@Injectable({ providedIn: 'root' })
export class BookStoreService {
  // ...
}
```

#### 2.) Referenz und Import aus dem `AppModule` entfernen

```ts
// import { BookStoreService } from './shared/book-store.service'; <-- entfernen

@NgModule({
  // ...
  providers: [
    // BookStoreService, <-- entfernen
    BookResolver
  ]
})
export class AppModule {}
```

<hr>


**Wir wünschen Ihnen viel Spaß mit Angular 6 und beim Lesen unseres Buchs! Haben Sie Fragen? Schreiben Sie uns!**

- __Danny, Ferdinand und Johannes__


