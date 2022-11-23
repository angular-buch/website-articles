---
title: 'Angular 15 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-11-25
lastModified: 2022-11-25
keywords:
  - Angular
  - Angular 15
  - Update
language: de
thumbnail: ./angular15.jpg
sticky: true
---

Am 16. November war es soweit: **Angular 15** ist erschienen.
Im Fokus der neuen Major-Version standen vor allem die Stabilidierung der mit Angular 14 eingeführten Standalone Components, die Bereitstellung funktionaler Alternativen für Guards, Resolver und Interceptoren sowie die Vereinfachung der initial generierten Projektdateien.

In diesem Blogpost fassen wir wieder die wichtigsten Neuigkeiten zusammen.
Im englischsprachigen [Angular-Blog](https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8) finden Sie außerdem die offizielle Mitteilung des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md).


## Projekt updaten

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=14.0-15.0).
Der Befehl `ng update` liefert außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 15 aktualisieren
ng update @angular/core@15 @angular/cli@15
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.

## Node.js 18 Support

Mit Angular 15 wird nun offiziell Node.js in der Version 18 unterstützt, die seit 25.10.2022 in den LTS Status übergegangen ist.
Die von Angular unterstützten Node.js Versionen sind jetzt:

- `14.20.x`
- `16.13.x`
- `18.10.x`

## TypeScript 4.8.2 und ES2022

### ECMA Script 2022

Angular setzt nun auf die TypeScript Version `4.8.2` und auf den ECMA Script Standard ES2022.

```json
{
  "compilerOptions": {
    // ...
    "useDefineForClassFields": false,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"]
  }
}
```

### `useDefineForClassFields`

Bei der Aktualisierung mit `ng update` wird in der TypeScript-Konfiguration standardmäßig die Compiler-Option `useDefineForClassFields` auf den Wert `false` gestezt.
Somit wird der TypeScript Compiler angeweisen die properitäre Implementierung zur Verarbeitung von Klassen-Properties zu nutzen.

<!-- TODO: mehr vom Buchtext hier rein -->

## Standalone Components

Die mit Angular 14 eingeführten Standalone Components sind nun als *stable* eingestuft und können somit bedenkenlos verwendet werden.
In diesem Zuge wurde noch die Funktion `provideHttpClient` eingeführt.
Diese ermöglicht das Bereitstellen vom Angular HttpClient beim Bootstrapping der Anwendung mit einer Komponente.
Weiterhin wurde die Funktion `withLegacyInterceptors`  umbenannt zu `withInterceptorsFromDi`.

```ts
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([myInterceptor]),
      withInterceptorsFromDi()       
    )
  ]
});
```

Weiterhin wurde die Direktive `RouterLinkWithHref`, die bisher speziell bei der Verwendung von `<a>` Elementen genutzt wurde nun in die Direktive `RouterLink` integriert.
Ein separater Import bei Verwendung in einer Standalone Komponente wird nun nicht mehr benötigt:

```diff
 @Component({
   selector: 'app-book-list',
   template: `
   <ul>
     <li><a routerLink="/books/1">Book 1</a></li>
     <li><button routerLink="/books/2">Book 2</button></li>
   </ul>
   `,
   standalone: true,
-  imports: [RouterLinkWithHref, RouterLink],
+  imports: [RouterLink],
 })
 class BookListComponent {}
```

## Weniger Projektdateien

Das Angular Team wollte hat weiterhin an den initial generierten Projektdateien bei der Ausführung von `ng new` gearbeitet.
Hier war das Ziel die Komplexität zu verringern und viele oft nicht angepasste Dateinen in die Interna des Angular Ökosystems zu verlagern.

- Die Datei `.browserslistrc` wird nicht mehr mit erzeugt. Angular nutzt intern eine Standardkonfiguration. Wird die Datei manuell mit einer entsprechenden Konfiguration angelegt, berücksichtigt die Angular CLI diese jedoch wie gehabt.
- Die Karma-Konfigurationsdateien `karma.conf.js` und `src/test.ts` werden nun nicht mehr mit angelegt. Karma nutzt hier intern eine Standardkonfiguration. Die Dateien können weiterhin manuelle angelegt und über die Datei `angular.json` Karma bekannt gemacht werden.
- Die bisher erzeugte Datei `polyfills.ts` wird nun nicht mehr mit angelegt. Stattdessen akzeptiert die Konfigurationsoption `polyfills` in der Datei `angular.json` nun auch ein Array von referenzierten Polifill-Dateien
- Die Umgebungsdateien `environment.ts` und `environment.prod.ts` wurden entfernt. Diese wurden oftmals nicht explizit genutzt. Der Mechnismus der `fileReplacements` in der Datei `angular.json`, der dafür sorgt, dass abhängig vom Build-Target ggf. einen andere Datei gelanden werden kann, bleibt jedoch weiterhin erhalten.

Weiterhin wird bei erzeugten Komponenten nun nicht mehr der Lifecycle-Hook `ngOnInit` mit generiert und der Komponentenklasse hinzugefügt.
Dieser wurde in vielen Fällen nicht benötigt.
Der Hook existiert jedoch und kann entsprechend auch bei Bedarf genutzt werden.

## Guards, Resolver und Interceptoren als Funktionen

Vielleicht hier den Tweet erwähnen?
https://twitter.com/Enea_Jahollari/status/1591433703678672896
Der zeigt gut das Zusammenspiel von Functional Guard, inject, CanMatch und loadComponent

## Directive Composition API

## Image Directive

## localize: Types

TODO: ist nun in tsconfig zu finden

## Styles

### CSS Imports

Style-imports aus den `node_modules` werden nun nicht länger mit einer vorangestellten Tilde (~) importiert.

```diff
-@import '~foo/styles.css';
+@import 'foo/styles.css';
```

### Stylus Support

Das Angular Team hat sich dazu entschieden Style-Definitionen mit Sytlus nicht länger zu unterstützen.

## Sonstiges

Neben den großen neuen Features hat das neue Release viele kleine Verbesserungen und Bug Fixes an Bord.
Eine Auswahl haben wir hier zusammengestellt:

- TODO

<br>
<br>

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 15!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** 20XX. Foto von Ferdinand Malcher</small>
