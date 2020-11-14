---
title: 'Angular 11 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2020-11-12
lastModified: 2020-11-12
keywords:
  - Angular
  - Angular 11
  - TypeScript
  - TSLint
  - ESLint
  - Hot Module Reloading
language: de
thumbnail: ./angular11.jpg
sticky: false
---

Es hätte kein schöneres Datum sein können: am 11.11.2020 wurde die neue Major-Version **Angular 11.0** veröffentlicht – fünf Monate nach dem [Release von Angular 10](/blog/2020-06-angular10).

Wie üblich stellen wir Ihnen in diesem Artikel die wichtigsten Neuerungen vor.
Das neue Major-Update bringt vor allem eine Menge Optimierungen und Stabilisierungen mit.
Grund dafür ist die "Operation Byelog", mit der sich das Angular-Team das Ziel gesetzt hat, den Großteil der Issues auf GitHub zu kategorisieren und in den nächsten Monaten zu bearbeiten.

Besonderer Fokus wurde in Angular 11.0 auf die Verbesserung des Toolings gelegt.
Dabei sind auch einige kleine Breaking Changes enthalten, die allerdings mithilfe der mitgelieferten Migrationsskripte und `ng update` leicht zu bewältigen sind.

Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular-Blog](https://blog.angular.io/version-11-of-angular-now-available-74721b7952f7).

## Update auf Angular 11

Das Update zur neuen Angular-Version sollte ohne viel Aufwand möglich sein.
Führen Sie dazu die folgenden Befehle in Ihrem Projekt mit Angular 10 aus:

```bash
ng update @angular/cli @angular/core
```

Im *Angular Update Guide* unter [update.angular.io](https://update.angular.io/#10.0:11.0) können Sie wie üblich alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Verbesserte Log-Ausgabe

Unter anderem wurde die Log-Ausgabe auf der Konsole für die Befehle `ng serve` und `ng build` überarbeitet.
Was zunächst nach einem rein kosmetischen Eingriff aussieht, ermöglicht einen verbesserten Überblick über die gebauten Bundles und ihre Größen.
Auch die Gesamtgröße der gebauten Artefakte wird nun ausgegeben.

![Ausgabe für ng serve](ngserve.png)


## `async` wird zu `waitForAsync`

Für Unit- und Integrationstests mit Karma (oder Jest) stellt Angular die Funktion `async()` zur Verfügung.
Dieser Funktionsname sorgte stets für Verwechslung mit dem nativen Schlüsselwort `async`. Die Funktion wurde deshalb nun umbenannt zu `waitForAsync`.

```ts
import { waitForAsync } from '@angular/core/testing';

it('should do X and Y', waitForAsync(() => {
  setTimeout(() => {
    expect(true).toBeTruthy();
  }, 500);
}));
```

## Hot Module Reloading

Der Entwicklungswebserver mit `ng serve` unterstützt nun das sogenannte Hot Module Reloading (HMR). Dabei wird nach einer Code-Änderung nicht die komplette Seite neu geladen, sondern es werden nur die geänderten Bundles "on the fly" ausgetauscht.
Dadurch funktioniert das Neuladen noch schneller.
Um HMR zu nutzen, kann die neue Option `--hmr` genutzt werden:

```bash
ng serve --hmr
```

## Migration zu ESLint

Der TypeScript-Linter TSLint wird seit einiger Zeit nicht mehr weiterentwickelt und ist [seit 2019 deprecated](https://medium.com/palantir/tslint-in-2019-1a144c2317a9). Es wird der Umstieg auf [ESLint](https://eslint.org/) empfohlen.

In einem neuen Projekt mit Angular 11 ist TSLint noch standardmäßig eingerichtet; ab Angular 12 soll auch diese Standardimplementierung wegfallen, sodass kein Linter als Standard im Projekt eingerichtet ist.

Das Communityprojekt [angular-eslint](https://github.com/angular-eslint/angular-eslint) wird nun vom Angular-Team offiziell empfohlen. Eine Anleitung zur Einrichtung finden Sie [in der Dokumentation](https://github.com/angular-eslint/angular-eslint#migrating-from-codelyzer-and-tslint).


## Weitere Neuigkeiten

Wir haben bis hierhin nur die wichtigsten Neuerungen aufgeführt. Eine ausführliche Aufstellung aller Änderungen finden Sie im [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md).

- **Font Inlining:** Ab Angular 11 werden eingebundene Google Fonts automatisch heruntergeladen und in die Anwendungsbundles übernommen. Das soll den "First Contentful Paint" verbessern.
- **Webpack 5:** Die neue Version von Webpack wird experimentell unterstützt. Damit funktioniert auch die sogenannte "Module Federation" – damit können Bundles dynamisch von einer externen Quelle nachgeladen werden.
- **Language Service:** Der Angular Language Service ermöglicht in der Entwicklungsumgebung eine inhaltliche Analyse des Codes, um z. B. Typprüfungen im Template anzubieten. Die aktuelle Implementierung basiert auf der alten "View Engine". Derzeit wird an einer neuen Version gearbeitet, die den neuen Ivy-Comppiler unterstützt. Das Modul kann bereits als Preview ausprobiert werden.
- **Verbesserung der Typisierung:** Viele Teile des Frameworks wurden hinsichtlich ihrer Typisierung verbessert, z. B. einige Pipes. Das führt in der Theorie zu Breaking Changes, daher ist die Liste der Breaking Changes im aktuellen Changelog sehr lang. Für die meisten Projekte sollte es hier aber keine praktische Auswirkung geben.


## Angular-Buch in der 3. Auflage

Die 3. Auflage unseres deutschsprachigen Angular-Buchs erschien vor wenigen Wochen im Handel!
Das Buch ist durchgängig auf dem Stand von Angular 10 und frühen Versionen von Angular 11, sodass Sie es auch für die Arbeit mit der aktuellen Version nutzen können.
Eine Leseprobe zum neuen Buch finden Sie auf der [Startseite](https://angular-buch.com).

<hr>

Die offizielle Roadmap für die Entwicklung von Angular in den nächsten Jahren ist übrigens in der Dokumentation zu finden: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 11!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** Nationalpark Harz, Oktober 2020</small>
