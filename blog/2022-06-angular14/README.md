---
title: 'Angular 14 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-06-02
lastModified: 2024-11-19
keywords:
  - Angular
  - Angular 14
  - Typed Forms
  - Standalone Components
  - TitleStrategy
  - Update
language: de
header: angular14.jpg
sticky: false
---

Noch bevor die Sommer- und Urlaubszeit beginnt, wartet Angular mit tollen Neuigkeiten auf: Am 2. Juni 2022 erschien die neue Major-Version **Angular 14**!
Während die letzten Hauptreleases vor allem interne Verbesserungen für das Tooling mitbrachten, hat Angular 14 einige spannende neue Features mit an Bord.

In diesem Blogpost fassen wir wie immer die wichtigsten Neuigkeiten zusammen.
Im englischsprachigen [Angular-Blog](https://blog.angular.io/angular-v14-is-now-available-391a6db736af) finden Sie außerdem die offizielle Mitteilung des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md).

> **Die Update-Infos für neuere Versionen von Angular finden Sie in separaten Blogartikeln. Wenn Sie das Update durchführen möchten, lesen Sie bitte alle Artikel in der gegebenen Reihenfolge.**
> * [Angular 15 ist da!](/blog/2022-11-angular15)
> * [Angular 16 ist da!](/blog/2023-05-angular16)
> * [Angular 17 ist da!](/blog/2023-11-angular17)
> * [Angular 18 ist da!](/blog/2024-06-angular18)
> * [Angular 19 ist da!](/blog/2024-11-angular19)

## Projekt updaten

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=13.0-14.0).
Der Befehl `ng update` liefert außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 14 aktualisieren
ng update @angular/core@14 @angular/cli@14
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.


## Standalone Components

Damit eine Komponente genutzt werden kann, musste sie bisher immer in einem NgModule deklariert werden.
Insbesondere bei wiederverwendbaren Komponenten führte das leicht zu unübersichtlichem Code.
Das Konzept der NgModules mit allen Details (insbesondere Imports, Exports, Providers) erschwert außerdem den Einstieg in das Framework Angular.

Mit Angular 14 wurde dieses lang diskutierte Thema angegangen: Angular unterstützt nun *Standalone Components*.

Komponenten, Pipes und Direktiven müssen damit nicht mehr in einem Modul deklariert werden, sondern können alleinstehend verwendet werden.
Damit eine Komponente genutzt werden kann, wird sie direkt am Ort der Verwendung importiert.
Im folgenden Codebeispiel möchte die `AppComponent` die andere Komponente `DashboardComponent` in ihrem Template nutzen:

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent]
  // ...
})
export class AppComponent {}
```

Dadurch vereinfacht sich die Struktur der Anwendung, denn die Gruppierung in NgModules entfällt.
NgModules und Standalone Components sind kompatibel, können also auch in Kombination genutzt werden.

Das neue Feature ist zunächst als *Developer Preview* verfügbar.
Das bedeutet, dass die Schnittstelle vor dem finalen Release noch verändert werden kann.

> Wir behandeln das Thema ausführlich in einem separaten Blogpost:<br>
**[Standalone Components – neu ab Angular 14](https://angular.schule/blog/2022-05-standalone-components)**


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

Um den Titel der Seite mit Angular zu setzen, existiert schon seit einiger Zeit der Service `Title`.
Der Nachteil an dieser Strategie ist, dass man das tatsächliche Setzen des Titels selbst in der Anwendung implementieren muss.
Dazu muss entweder jede geroutete Komponente die passende Funktionalität mitbringen, oder wir müssen in einem Service selbst eine zentrale Logik dafür platzieren.

Seit Angular 14 bringt der Router eine passende Funktionalität mit, um den Titel der Seite automatisch zu setzen.
Dazu können wir in den Routen das Property `title` definieren, und der Seitentitel wird beim Aktivieren der Route automatisch angepasst:

```ts
const routes: Routes = [
  {
    path: 'admin/create',
    component: BookCreateComponent,
    title: 'Buch erstellen'
  },
  {
    path: 'admin/edit/:isbn',
    component: BookEditComponent,
    title: 'Buch bearbeiten'
  }
];
```

Leider wird der Titel nur verändert, wenn eine Route einen Eintrag `title` hat.
Betreten wir also eine Route ohne Titel, bleibt der zuletzt gesetzte Titel erhalten.

Um komplexere Anwendungsfälle zu lösen, können wir die Logik des Routers überschreiben.
Dafür müssen wir eine eigene `TitleStrategy` implementieren.
Die folgende Klasse setzt zum Beispiel den Titel auf den in der Route definierten Wert – oder auf den Default `BookMonkey`, wenn kein Titel gegeben ist:

```ts
@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  constructor(private title: Title) {
    super();
  }

  updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState) ?? 'BookMonkey';
    this.title.setTitle(title);
  }
}
```

So können wir zum Beispiel den Titel auch nach einem bestimmten Muster zusammensetzen, sodass immer der Text `BookMonkey` erhalten ist:

```ts
updateTitle(routerState: RouterStateSnapshot) {
  const title = this.buildTitle(routerState);
  if (title) {
    this.title.setTitle(`${title} | BookMonkey`);
  } else {
    this.title.setTitle('BookMonkey')
  }
}
```

Die selbst definierte `TitleStrategy` muss mithilfe eines Providers bekannt gemacht werden:

```ts
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: TitleStrategy, useClass: CustomTitleStrategy }
  ]
})
export class AppRoutingModule { }
```

> Für eine ausführlichere Auseinandersetzung empfehlen wir den folgenden Blogartikel von Brandon Roberts:<br>
**[Setting Page Titles Natively With The Angular Router](https://dev.to/brandontroberts/setting-page-titles-natively-with-the-angular-router-393j)**



## Autovervollständigung mit der Angular CLI

Die Angular CLI bietet ein praktisches neues Feature an: eine integrierte automatische Vervollständigung für die Kommandozeile.
Zur Einrichtung muss einmalig der Befehl `ng completion` ansgeführt werden.
Er ergänzt die Konfiguration der Kommandozeile (z. B. `.bashrc` oder `.zshrc`), sodass für die Autovervollständigung automatisch im Hintergrund die Angular CLI aufgerufen wird.

Tippen wir also z. B. in der Kommandozeile den Befehl `ng` und drücken die Tab-Taste, erhalten wir automatisch passende Vorschläge:

```bash
➜  book-monkey git:(main) ng
add           -- Adds support for an external library to your project.
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
~~Es gilt jedoch abzuwarten, wie sich die neuen Patterns etablieren werden.
Wir empfehlen also, Abhängigkeiten zunächst weiterhin direkt über den Konstruktor anzufordern.~~
> Update März 2024: Mittlerweile hat sich `inject()` etabliert, und der Verwendung steht nichts im Wege.

> Für einige Ideen zur Funktion `inject()` möchten wir auf einen Blogartikel von Younes Jaaidi verweisen:<br>
**[Angular Inject & Injection Functions - Patterns & Anti-Patterns](https://marmicode.io/blog/angular-inject-and-injection-functions
)**




## Sonstiges

Neben den großen neuen Features hat das neue Release viele kleine Verbesserungen und Bug Fixes an Bord.
Eine Auswahl haben wir hier zusammengestellt:

- **TypeScript-Unterstützung:** Angular unterstützt offiziell TypeScript in der Version 4.7, siehe [Commit](https://github.com/angular/angular/commit/29039fcdbcb8cab040d88dabe2dcb1abae34cb4e). Ältere Versionen als 4.6 werden hingegen nicht mehr supportet, siehe [Commit](https://github.com/angular/angular/commit/c9d566ce4b6e9097d9eceb7ac3964a0b25c404ad).
- **Types für Router Events:** Die Events des Routers (über `Router.events`) besitzen jetzt ein neues Property `type`. Um bestimmte Events zu filtern, war es bisher immer notwendig, mithilfe von `instanceof` nach der Klasse zu filtern. Das neue Property vereinfacht den Umgang, siehe [Commit](https://github.com/angular/angular/commit/41e2a68e30c12e5ad3e26047c3a4032e9aa1a6e1).
- **Schematics Default Collection:** In der `angular.json` konnte mit dem Property `defaultCollection` die Standard-Kollektion definiert werden, die für die Schematics (z. B. `ng generate`) genutzt wird. Bei der Installation von Drittbibliotheken wie `@ngrx/schematics` konnte diese Einstellung gesetzt werden. Dieses Property wurde nun ersetzt durch `schematicCollections`. Hier kann ein Array mit mehreren Collections definiert werden, die in der angegebenen Reihenfolge durchsucht werden. Damit entfällt bei wiederholten Befehlen die Notwendigkeit, die Collection manuell anzugeben. Siehe [Commit](https://github.com/angular/angular-cli/commit/366cabc66c3dd836e2fdfea8dad6c4c7c2096b1d).
- **defaultProject:** Die Einstellung `defaultProject` in der `angular.json` ist deprecated. Stattdessen wird das aktuelle Projekt jetzt anhand des Arbeitsverzeichnisses ermittelt, siehe [Commit](https://github.com/angular/angular-cli/commit/036327e9ca838f9ef3f117fbd18949d9d357e68d).
- **Protected Propertys:** In Komponenten ist es jetzt auch möglich, Propertys und Methoden im Template zu binden, die als `protected` markiert sind. Bisher funktionierte das nur für `public`.
- **Angular DevTools für Firefox:** Die offizielle Browser-Extension zum Debuggen von Angular-Anwendungen ist jetzt auch für Firefox verfügbar. Der Download ist über [das offizielle Verzeichnis von Mozilla](https://addons.mozilla.org/en-US/firefox/addon/angular-devtools/) möglich.

<br>
<br>

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 14!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Yosemite National Park, California, 2019. Foto von Ferdinand Malcher</small>
