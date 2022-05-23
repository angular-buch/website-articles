---
title: 'Angular 14 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-06-02
lastModified: 2022-06-02
keywords:
  - Angular
  - Angular 14
  - Typed Forms
  - Standalone Components
  - Update
language: de
thumbnail: ./angular14.jpg
sticky: true
---

Noch bevor die Sommer- und Urlaubszeit beginnt, wartet Angular mit tollen Neuigkeiten auf: Am TODO. Juni 2022 erschien die neue Major-Version **Angular 14**!
Während die letzten Hauptreleases vor allem interne Verbesserungen für das Tooling mitbrachten, hat Angular 14 einige spannende neue Features mit an Bord.

In diesem Blogpost fassen wir wie immer die wichtigsten Neuigkeiten zusammen.
Im englischsprachigen [Angular-Blog](TODO) finden Sie außerdem die offizielle Mitteilung des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md).



## Projekt updaten

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io)
Der Befehl `ng update` liefert außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 14 aktualisieren
npx @angular/cli@14 update @angular/core@14 @angular/cli@14
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe von Git die Änderungen.


## Standalone Components

TODO

## Strikt typisierte Formulare

Reactive Forms sind ein mächtiger Ansatz, um komplexe Formulare mit Angular zu entwickeln.
Die bisherige Umsetzung hatte allerdings Schwächen, denn die Modelle waren stets mit `any` typisiert:

```ts
const myForm = new FormGroup({ /* ... */ })
const value = myForm.value; // any ❌
```


Mit Angular 14 ändert sich dieses Verhalten: Die Formularmodelle für Reactive Forms sind jetzt strikt typisiert!
Das Design für die neue Typisierung war nicht trivial, deshalb wurde der Prozess von einem [öffentlichen RFC](https://github.com/angular/angular/discussions/44513) begleitet.

> Wir behandeln das Thema ausführlich in einem separaten Blogpost:<br>
**[Typisierte Reactive Forms – neu ab Angular 14](https://angular.schule/blog/2022-05-typed-forms)**

Beim Update auf Angular 14 werden bestehende Formulare automatisch auf eine untypisierte Variante migriert, z. B. wird `FormControl` ersetzt durch `UntypedFormControl`.
Alte Formulare können so zunächst unverändert bleiben, und die Migration zum neuen Ansatz kann schrittweise durchgeführt werden.





## Seitentitel setzen mit dem Router

TODO

## Autovervollständigung mit der Angular CLI

Die Angular CLI bietet ein praktisches neues Feature an: eine integrierte Auto Completion für die Shell.
Zur Einrichtung muss einmal der Befehle `ng completion` ansgeführt werden.
Er ergänzt die Konfiguration der Kommandozeile (z. B. `.bashrc` oder `.zshrc`), sodass für die Autovervollständigung automatisch im Hintergrund die Angular CLI aufgerufen wird.

Tippen wir also z. B. in der Kommandozeile den Befehl `ng` und drücken die Tab-Taste, erhalten wir automatisch passende Vorschläge:

```bash
➜  book-monkey git:(main) ng
add           -- Adds support for an external library to your project.
analytics     -- Configures the gathering of Angular CLI usage metrics. See https://angular.io/cli/usage-analytics-ga
build         -- Compiles an Angular application or library into an output directory named dist/ at the given output
cache         -- Configure persistent disk cache and retrieve cache statistics.
completion    -- Set up Angular CLI autocompletion for your terminal.
config        -- Retrieves or sets Angular configuration values in the angular.json file for the workspace.
deploy        -- Invokes the deploy builder for a specified project or for the default project in the workspace.
doc           -- Opens the official Angular documentation (angular.io) in a browser, and searches for a given keyword
e2e           -- Builds and serves an Angular application, then runs end-to-end tests.
extract-i18n  -- Extracts i18n messages from source code.
generate      -- Generates and/or modifies files based on a schematic.
# ...
```

Dadurch, dass die Autovervollständigung stets die Angular CLI nutzt, bezieht sich die Vervollständigung auf den aktuellen Kontext.
Zum Beispiel liefert die Vervollständigung für `ng generate` alle möglichen Schematics, die wir im Projekt installiert haben.
Damit verbessert sich sich Developer Experience enorm.



## Neue Funktion `inject()`

Um Abhängigkeiten per Dependency Injection anzufordern, wird üblicherweise der Konstruktor von Komponenten und Services verwendet:

```ts
@Component({ /* ... */ })
export class MyComponent {
  constructor(private service: BookStoreService) {}
}
```

Alternativ konnte auch bisher schon die Klasse `Injector` mit der Methode `get()` verwendet werden.
Diese Klasse musste aber wiederum auch mittels Dependency Injection angefordert werden:

```ts
import { Injector } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  constructor(private injector: Injector) {
    const service = injector.get(BookStoreService);
  }
}
```


In Angular 14 kommt die neue Funktion `inject()` hinzu.
Im Gegensatz zum `Injector` muss sie nicht erst über Dependency Injection angefordert werden, sondern kann komplett eigenständig verwendet werden.

```ts
import { inject } from '@angular/core';
 
export function getService() {
  return inject(BookStoreService);
}

@Component({ /* ... */ })
export class MyComponent {
  constructor() {
    const service = getService();
  }
}
```

Eine Einschränkung ist hierbei zu beachten: Der Aufruf von `inject()` muss immer indirekt über den Konstruktor erfolgen, also aus einem sogenannten *Injection Context*. Tut man das nicht, wird der folgende Fehler geworfen:

> `ERROR Error: NG0203: inject() must be called from an injection context`

Durch die Unabhängigkeit von der Komponentenklasse ergeben sich viele spannende Möglichkeiten zur Komposition.
Es gilt jedoch abzuwarten, wie sich die neuen Patterns etablieren werden.
Wir empfehlen also, Abhängigkeiten zunächst weiterhin direkt über den Konstruktor anzufordern.


> Für einige Ideen zur Funktion `inject()` möchten wir auf einen Blogartikel von Younes Jaaidi verweisen:<br>
**[Angular Inject & Injection Functions - Patterns & Anti-Patterns](https://marmicode.io/blog/angular-inject-and-injection-functions
)**




## Sonstiges

- **TypeScript-Unterstützung:** Angular unterstützt offiziell TypeScript in der Version 4.7, siehe [Commit](https://github.com/angular/angular/commit/29039fcdbcb8cab040d88dabe2dcb1abae34cb4e). Ältere Versionen als 4.6 werden hingegen nicht mehr supportet, siehe [Commit](https://github.com/angular/angular/commit/c9d566ce4b6e9097d9eceb7ac3964a0b25c404ad).
- **Types für Router Events:** Die Events des Routers (über `Router.events`) besitzen jetzt ein neues Property `type`. Um bestimmte Events zu filtern, war es bisher immer notwendig, mithilfe von `instanceof` nach der Klasse zu filtern. Das neue Property vereinfacht den Umgang, siehe [Commit](https://github.com/angular/angular/commit/41e2a68e30c12e5ad3e26047c3a4032e9aa1a6e1).
- **Schematics Default Collection:** In der `angular.json` konnte mit dem Property `defaultCollection` die Standard-Kollektion definiert werden, die für die Schematics (z. B. `ng generate`) genutzt wird. Bei der Installation von Drittbibliotheken wie `@ngrx/schematics` konnte diese Einstellung gesetzt werden. Dieses Property wurde nun ersetzt durch `schematicCollections`. Hier kann ein Array mit mehreren Collections definiert werden, die in der angegebenen Reihenfolge durchsucht werden. Damit entfällt bei wiederholten Befehlen die Notwendigkeit, die Collection manuell anzugeben. Siehe [Commit](https://github.com/angular/angular-cli/commit/366cabc66c3dd836e2fdfea8dad6c4c7c2096b1d).
- **defaultProject:** Die Einstellung `defaultProject` in der `angular.json` ist deprecated. Stattdessen wird das aktuelle Projekt jetzt anhand des Arbeitsverzeichnisses ermittelt, siehe [Commit](https://github.com/angular/angular-cli/commit/036327e9ca838f9ef3f117fbd18949d9d357e68d).



<hr>

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).-->

Wir wünschen Ihnen viel Spaß mit Angular 14!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<small>**Titelbild:** Blick vom Poon Hill, Nepal, 2018. Foto von Ferdinand Malcher</small>
