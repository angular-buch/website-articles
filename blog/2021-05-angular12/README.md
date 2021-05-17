---
title: 'Angular 12 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2021-05-21
lastModified: 2021-05-21
keywords:
  - Angular
  - Angular 12
  - TypeScript
  - Protractor
  - e2e
language: de
thumbnail: ./angular12.jpg
sticky: false
---

Am 12.05.2021 wurde die neue Major-Version **Angular 12.0** veröffentlicht – ein halbes Jahr nach dem [Release von Angular 11](/blog/2020-11-angular11).

Wie üblich stellen wir Ihnen in diesem Artikel die wichtigsten Neuerungen vor.

Es sind auch einige kleine Breaking Changes enthalten, die allerdings mithilfe der mitgelieferten Migrationsskripte und `ng update` leicht zu bewältigen sind.

Die offizielle Ankündigung zum neuen Release mit allen Features finden Sie im [Angular-Blog](https://blog.angular.io/angular-v12-is-now-available-32ed51fbfd49).

<!--
> **Die Update-Infos für neuere Versionen von Angular finden Sie in separaten Blogartikeln. Wenn Sie das Update durchführen möchten, lesen Sie bitte alle Artikel in der gegebenen Reihenfolge.**
> * [Angular XX ist da!](/blog/yyyy-mm-slug)
-->

## Update auf Angular 12

Das Update zur neuen Angular-Version sollte ohne viel Aufwand möglich sein.
Führen Sie dazu die folgenden Befehle in Ihrem Projekt mit Angular 11 aus:

```bash
ng update @angular/cli @angular/core
```

Im *Angular Update Guide* unter [update.angular.io](https://update.angular.io/#11.0:12.0) können Sie wie üblich alle Migrationsschritte im Detail nachvollziehen und die Migration vorbereiten.

## Prod by default

In einem neuen Angular 12 Projekt ist es nun nicht mehr notwendig bei einem Production-Build das Flag `--prod` anzugeben.
Der Build-Konfiguration für einen Production-Build ist nun standardmäßig aktiv.
Wenn explizit kein Production-Build gewünscht ist, muss dies über die Angabe der Konfiguration mitgegeben werden:

```bash
ng build                             # produces a production build by default
ng build --configuration=development # produces a build with the configuration for "development" from the angular.json config
```

Bei bestehenden Angular-Projekten gibt es zunächst keine automatische Anpassung und die Build-Konfigurationen in der Angular CLI bleiben wie zuvor konfiguriert.
Sie können jedoch mittels optionalem Opt-In Schematic der Angular CLI 12, die Änderung automatisch für ein bestehendes Projekt vollziehen lassen:

```bash
ng update @angular/cli --migrate-only production-by-default
```

## Strict Mode by default

Neu angelegte Angular-Projekte werden fortan standardmäßig im Strict-Mode angelegt.
Was sich genau hinter dem Strict-Mode verbirgt haben wir in unserem [Artikel zu Angular 10 unter "Setup mit strikten Compiler-Optionen"](/blog/2020-06-angular10#setup-mit-strikten-compiler-optionen) festgehalten.

## Ivy Engine

Die Ivy-Rendering Engine, die bereits m it Angular 9 vom Angular-Team geliefert wurde,
wird nun auch in Library-Projekten stärker forciert.
Lib-Autoren wird dringend erhalten mit dem Major-Release von Angular 12 letztmalig die Möglichkeit,
ihre Library auf die Ivy-Rendering-Engine umzustellen, bevor mit Angular 13 endgültig die alter View Engine entfernt wird.

Mehr Details zur Umstellung von Libraries und zub den Hintegründen, finden Sie immer [Blogpost "Upcoming improvements to Angular library distribution" auf angular.io](https://blog.angular.io/upcoming-improvements-to-angular-library-distribution-76c02f782aa4).

## Inline critical CSS / Fonts CSS Inlining

Weiterhin hat das Angular Team an Performance-Optimierungen gearbeitet.
Hierzu zählt unter anderem das ["inline critical CSS"](https://angular.io/guide/workspace-config#styles-optimization-options) Feature, welches die wichtigsten Styledefinitionen effizienter lädt und somit die Zeit zum [_First Contentful Paint_](https://web.dev/first-contentful-paint) reduziert.

Eine weitere [Optimierung wurde bei blockierenden Zugriffen auf Google Fonts](https://angular.io/guide/workspace-config#fonts-optimization-options) erwirkt.
Diese können nun zur Compile-Zeit automatisch heruntergeladen und im Source Code direkt eingebunden werden.
Somit werden blockierende Zugriffe zum Laden der Schriften beim Aufruf der Seite verhindert.
Um das Feature nutzen zu können und die Fonts zu laden, muss eine Internetverbindung hergestellt werden.
Dies ist insbesondere beim Build in einer CI/CD-Pipeline zu beachten - ggf. müssen Sie hier entsprechende Proxy-Konfigurationen vornehmen.

Beide Features sind bei neuen Angular-Projekten standardmäßig aktiv.

## e2e-Testing mit Protractor

Das Angular-Team evaluiert zur Zeit die Zukunft des e2e-Testing Tools Protractor.
Mittlerweile haben sich viele Tools wie Cypress, TestCafe oder Playwright stark in der Community etabliert.
Nach aktuellem Stand wird das Angular Team mehr Kraft investieren um Angular mit diesen Tools besser zu verankern.
Wir empfehlen bei neuen Greenfield-Projekten nicht mehr auf Protractor zu setzen.

## Nullish Coalescing in der Template Syntax

Mit Angular 12 wird die Template Syntax von Angular um den Nullish Coalescing Operator erweitert.
Somit lässt sich Template Code in Fällen mit komplexen Conditionals stark verkürzen und vereinfachen:

Der folgende Ausdruck soll anstatt der Erfahrungsjahre im Umgang mit Angular eines Textausgabe anzeigen, sofern keine Information hierzu vorliegt:

```html
{{ yearsOfExperienceWithAngular !== null && yearsOfExperienceWithAngular !== undefined ? yearsOfExperienceWithAngular : 'Keine Angabe' }}
```

Mit dem Nullish Coalascing Operator lässt sich der Ausdruck wie folgt vereinfachen:

```html
{{ yearsOfExperienceWithAngular ?? 'Keine Angabe' }}
<!-- Auch eines "0" ist ein valider Wert beim Nullish Coalascing im Gegensatz zur Prüfung mit '||' -->
```

### Angular DevTools

Weiterhin hat das Angular-Team mit Release von Angular 12 auch eine neue [Google Chrome Extension](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh) für EntwicklerInnen bereitgestellt.
Die neuen **Angular DevTools** helfen beim debuggen und profilen von Angular Anwendungen und ersetzen die Community Extension [**Augury**](https://augury.rangle.io/) von rangle.io.
Das Angular Team hat hierbei die Erfahrungen von rangle.io mit Augury genutzt und mit deren Unterstützung eine neue Extension entwickelt, die nun alle Angular-Anwendungen ab Angular 9 unterstützt.
Lesen Sie mehr hierzu in der offiziellen [Angular Dokumentation auf angular.io](https://angular.io/guide/devtools).

## Weitere Neuigkeiten

Wir haben bis hierhin nur die wichtigsten Neuerungen aufgeführt. Eine ausführliche Aufstellung aller Änderungen finden Sie im [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md).
Folgende Punkte sind zusätzlich erwähnenswert:

- **Deprecated: Support für IE 11:** Angular12 wird die letzte Major-Angular-Version mit Support für den Internet Explorer 11 sein. Dies ermöglicht es dem Angular-Team auf modernere Web-APIs zurückzugreifen, die in allen aktuellen Browsern unterstützt werden.
- **Webpack 5:** Unter der Haube verwendet Angular nun Webpack5 als Build- und Bundling-Tool
- **`min` und `max` Validatoren:** Bei Verwendung von Formular-Validierungen können nun die eingebauten `min` und `max`-Validatoren genutzt werden.
- **`APP_INITIALIZER` mit Observables:** Das DI Token `APP_INITIALIZER` zur Bereitstellung von Funktionen während der Anwendungsinitialisierung kann nun ein Observable zurückliefern. Zuvor war es lediglich möglich Promises zurückzugeben.
- **i18n legacy message IDs**: Die bis dato noch unterstützten i18n legacy message ID Formate werden nun nicht mehr unterstützt. Das Angular-Team hierfür Migrationsscripte und eine entsprechende [Anleitung zur Migration](https://angular.io/guide/migration-legacy-message-id) bereitgestellt.
- **Inline SASS/SCSS:** Es ist nun auch möglich in Inline-Komponenten-Styles SASS/SCSS Styledefinitionen zu verwenden.

<hr>

Die offizielle Roadmap für die Entwicklung von Angular in den nächsten Jahren ist übrigens in der Dokumentation zu finden: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 12!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** Wo auch immer, mmmm yyyy</small>
