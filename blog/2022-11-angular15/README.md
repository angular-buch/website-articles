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
  - Functional Guards
  - Functional Resolvers
  - Functional Interceptors
  - Standalone Components
language: de
thumbnail: ./angular15.jpg
sticky: true
hidden: true
---

Am 16. November 2022 erschien die neue Major-Version von Angular: **Angular 15.0.0**!
Im Fokus des neuen Releases standen vor allem diese drei Themen:

- Standalone Components gelten nun als *stable*.
- funktionale Guards, Resolver und Interceptors
- Vereinfachung der initial generierten Projektdateien

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

## Funktionale Guards, Resolver und Interceptors

Guards, Resolver und Interceptors sind zusätzliche Features von Angular, mit denen wir Router und HttpClient steuern können:

- Ein Guard entscheidet, ob eine Navigation ausgeführt werden darf.
- Ein Resolver löst (asynchrone) Daten auf, bevor eine Route geladen wird.
- Ein Interceptor verarbeitet einen HTTP-Request oder -Response, z. B. um Headerfelder für die Authentifizierung global hinzuzufügen.

Alle drei Bausteine existieren seit vielen Jahren – sie wurden aber bislang stets in Form einer Klasse implementiert.
Nun können Guards, Resolver und Interceptors auch als einfache Funktionen definiert werden.
Der Code wird damit leichtgewichtiger und flexibler.
Wollen wir innerhalb der Funktion Abhängigkeiten über die Dependency Injection anfordern, müssen wir die Funktion `inject()` nutzen.

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated;
};
```

```ts
export const dataResolver: ResolveFn<MyData> = (route, state) => {
  return inject(MyDataService).getData();
}
```

```ts
export const myInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // HTTP-Request weitergeben
  return next(req).pipe(
    // HTTP-Response verarbeiten
  );
}
```

Funktionale Guards und Resolver werden auf dieselbe Weise bereitgestellt wie die klassenbasierten Implementierungen.
Funktionale Interceptors können derzeit nur mit der neuen Funktion `provideHttpClient()` genutzt werden, siehe der nächste Abschnitt.

Voraussichtlich mit Angular 15.1 werden klassenbasierte Guards und Resolver als *deprecated* markiert.
Wir empfehlen also, den Code in Ihren Projekten auf die neuen Schnittstellen zu migrieren.

In diesem [Twitter-Post von Enea Jahollari](https://twitter.com/Enea_Jahollari/status/1591433703678672896) finden Sie ein gelungenes Beispiel für 
das Zusammenspiel von Functional Guard, `inject()`, `CanMatch` und `loadComponent`.




## Standalone Components

Die mit Angular 14 eingeführten Standalone Components sind nun als *stable* eingestuft und können ohne Einschränkungen verwendet werden.
Im Blog der Angular.Schule haben wir dieses Thema ausführlich beleuchtet: [Standalone Components – neu ab Angular 14 (von Ferdinand Malcher)](https://angular.schule/blog/2022-05-standalone-components).

### Neue Standalone APIs

In diesem Zuge wurde ein alternativer Weg eingeführt, um den `HttpClient` in der Anwendung bereitzustellen.
Bisher mussten wir dazu das `HttpClientModule` importieren.
Im Zusammenhang mit Standalone Components können wir die neue Funktion `provideHttpClient()` nutzen.

Als Argumente können wir sogenannte *Features* übergeben – zusätzliche Funktionen des HttpClients, die einzeln aktiviert werden können.
Auf diese Weise können wir z. B. funktionale Interceptors registrieren.

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

### RouterLinkWithHref

Mit Standalone Components müssen alle Abhängigkeiten einer Komponente direkt importiert werden.
Dazu gehören auch die Direktiven des Routers.
Bislang existierten zwei Implementierungen für den RouterLink: die Direktiven `RouterLink` und `RouterLinkWithHref`.
Diese beiden Implementierungen wurden nun zusammengeführt, sodass wir stets nur noch `RouterLink` importieren müssen.

```diff
@Component({
  template: `
    <ul>
      <li><a routerLink="/books/1">Book 1</a></li>
      <li><button routerLink="/books/2">Book 2</button></li>
     </ul>
  `,
  standalone: true,
  // VORHER:
  imports: [RouterLinkWithHref, RouterLink],

  // NACHHER:
  imports: [RouterLink],
 })
 class BookListComponent {}
```

## Weniger Projektdateien

Ein neu erstelltes Projekt mit der Angular CLI beinhaltet viele Konfigurationsdateien, die für den Einstieg in das Framework zunächst nicht relevant sind.
Deshalb hat das Angular-Team daran gearbeitet, die generierten Projektdateien zu reduzieren.
Für die im Folgenden aufgelisteten Konfigurationsdateien stellt Angular intern eine Standardkonfiguration bereit.
Wollen wir die Werte selbst anpassen, können wir die Dateien manuell anlegen – es wird dann die eigene Konfiguration genutzt.

- `.browserslistrc` wird nicht automatisch von `ng new` generiert.
- Die Karma-Konfiguration `karma.conf.js` und die Einstiegsdatei für die Testausführung `src/test.ts` werden nun nicht mehr mit angelegt.
- Die bisher erzeugte Datei `polyfills.ts` wird nun nicht mehr mit angelegt. Stattdessen akzeptiert die Konfigurationsoption `polyfills` in der Datei `angular.json` nun alternativ ein Array von referenzierten Polyfills.
- Die Umgebungsdateien `environment.ts` und `environment.prod.ts` werden in neuen Projekten nicht generiert. Der Mechanismus der `fileReplacements` in der Datei `angular.json`, der dafür sorgt, dass abhängig vom Build-Target eine andere Datei geladen werden kann, bleibt jedoch weiterhin erhalten. Bei Bedarf können Sie die Environment-Dateien also selbst anlegen und konfigurieren.

Beim Update auf die neue Angular-Version werden die genannten Dateien nicht entfernt, sondern bleiben bestehen.

## Komponenten ohne Konstruktor und `ngOnInit()`

Bei neu erzeugten Komponenten wird nun nicht mehr automatisch der Lifecycle-Hook `ngOnInit()` generiert.
Benötigen wir die Methode, können wir sie jederzeit manuell implementieren.
Auch der leere Konstruktor wird für neue Komponenten nicht mehr automatisch erzeugt.


## Support für Node.js 18

Mit Angular 15 wird nun Node.js in der Version 18 unterstützt, die am 25.10.2022 in den LTS-Status übergegangen ist.
Die von Angular offiziell unterstützten Node.js-Versionen sind damit:

- `14.20.x`
- `16.13.x`
- `18.10.x`

Höhere Nebenversionsnummern wie die aktuelle Version 18.12.1 (LTS) funktionieren nach unserer Erfahrung ebenso einwandfrei. Node.js 19 wird jedoch nicht offiziell unterstützt.

## TypeScript 4.8 und ES2022

Angular setzt nun auf TypeScript in der Version 4.8.
Ältere Versionen als 4.8.2 werden nicht mehr unterstützt.
Außerdem werden Projekte mit Angular 15 standardmäßig zu ES2022 kompiliert.
In der Datei `tsconfig.json` finden wir dazu die folgenden Angaben:

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


Die Option `useDefineForClassFields` ist notwendig, weil sich das Verhalten von TypeScript und nativem JavaScript bei der Initialisierung von Klassen-Propertys unterscheidet.
Angular setzt die Option vorsorglich auf `false`, um das gewohnte Verhalten zu aktivieren und bestehenden Code nicht zu brechen.

> Wir haben die Hintergründe dieser Option ausführlich in einem [separaten Blogartikel](/blog/2022-11-use-define-for-class-fields) erläutert.

Derzeit sind an bestehenden Angular-Projekten keine Änderungen notwendig.
Wir empfehlen Ihnen jedoch, schon jetzt den Code zukunftssicher zu implementieren.
Abhängigkeiten, die über den Konstruktor mittels Dependency Injection angefordert werden, sollten nicht mehr bei der direkten Initialisierung eines Propertys verwendet werden:

```ts
export class MyComponent {
  // funktioniert NICHT in JavaScript!
  data$ = this.service.getData();

  constructor(private service: MyDataService) {}
}
```

Um das Problem zu lösen, gibt es zwei Ansätze:

- a) wir nutzen den Konstruktor oder
- b) wir setzen die Funktion `inject()` ein.

Verschieben wir die Initialisierung vollständig in den Konstruktor, sind die Argumente bereits vorhanden, bevor wir das Property initialisieren.

```ts
export class MyComponent {
  data$: Observable<MyData>;

  constructor(private service: MyDataService) {
    this.data$ = this.service.getData();
  }
}
```

Mit der Funktion `inject()` können wir eine Abhängigkeit direkt anfordern. Verwenden wir die Funktion bei der Initialisierung eines Propertys, steht die Serviceinstanz sofort zur Verfügung:

```ts
import { inject } from '@angular/core';

export class MyComponent {
  data$ = inject(MyDataService).getData();
}
```

Mit beiden Varianten ist der Code zukunftssicher und funktioniert sowohl in TypeScript als auch ES2022.
Es ist davon auszugehen, dass in Angular irgendwann einmal die Einstellung `useDefineForClassFields` auf den Standardwert `true` gesetzt wird.
Wir empfehlen Ihnen also, Ihren Code schon heute möglichst robust zu entwickeln.

> Mehr zur Option `useDefineForClassFields` finden Sie in unserem separaten Blogartikel: [TypeScript: useDefineForClassFields – zukünftige Breaking Changes vermeiden (von Johannes Hoppe und Ferdinand Malcher)](/blog/2022-11-use-define-for-class-fields).



## Directive Composition API

In Angular können wir Direktiven implementieren, um Elemente in den Templates mit weiteren Funktionalitäten zu versehen.
Dabei werden solche Direktiven aber stets von außen auf einem Element notiert, in der Regel als Attribut.

Mit der neuen *Directive Composition API* können wir Direktiven auch von innen heraus anwenden:
Eine Direktive oder Komponente kann damit selbst deklarativ entscheiden, welche weiteren Direktiven auf ihrem Host-Element erzeugt werden.
Dadurch ist es möglich, einzelne Funktionalitäten in Direktiven auszulagern und diese dann in Komposition zu verwenden.

In den Metadaten von Direktiven und Komponenten wird dafür die Eigenschaft `hostDirectives` verwendet.
Setzen wir die folgende `MyComponent` in der Anwendung ein, so werden auf ihrem Host-Element automatisch Instanzen der `ToggleOnClickDirective` und `CoolDirective` erzeugt.

```ts
@Component({
  // ...
  hostDirectives: [ToggleOnClickDirective, CoolDirective]
})
export class MyComponent {}
```

Um mit den erzeugten Direktiven zu interagieren, können wir die Klassen mittels Dependency Injection anfordern.
Wir erhalten Zugriff auf die Instanzen und können dort die Propertys und Methoden direkt verwenden.

Außerdem können wir die Inputs und Outputs der Host-Direktiven deklarativ verfügbar machen.
Für alle Möglichkeiten der neuen Schnittstelle möchten wir Sie auf die [offizielle Angular-Dokumentation](https://angular.io/guide/directive-composition-api) verweisen.


## Image Directive: optimierte Verwendung von Bildern

Die neue Direktive `NgOptimizedImage` ist nun offiziell stabil und kann uneingeschränkt verwendet werden. 
Sie wurde in Angular 14.2 eingeführt und ermöglicht es, das Laden von Bildern zu verbessern, indem sie verschiedene Best Practices durchsetzt.
Bitte beachten Sie, dass es mit Angular 15 eine Änderung in der finalen API gibt:
Die Direktive besitzt jetzt Inputs mit den Namen `ngSrc` und `ngSrcset` (statt ursprünglich `rawSrc` und `rawSrcset`).


Die Einbindung der neuen Direktive ist sehr einfach:
Wir können die Klasse entweder über ein NgModule oder in einer Standalone Component importieren:

```ts
import { NgOptimizedImage } from '@angular/common';
    
// einbinden in Standalone Component
@Component({
  standalone: true
  imports: [NgOptimizedImage],
})
class MyStandaloneComponent {}

// einbinden in NgModule
@NgModule({
  imports: [NgOptimizedImage],
})
class AppModule {}
```

Anschließend können wir im Template der Angular-Komponenten das `src`-Attribut der Bilder durch `ngSrc` ersetzen:

```html
<!-- VORHER: -->
<img src="angular-buch.jpg" alt="">

<!-- NACHHER: -->
<img ngSrc="angular-buch.jpg" alt="">
```

Die Direktive `NgOptimizedImage` wird automatisch aktiv, sobald dieses Attribut eingesetzt wird.
Sie hilft dabei, diverse Best Practices für Bilder anzuwenden.
Vergisst man etwa, die Attribute `width` und `height` für das `img`-Element zu verwenden (wie oben gezeigt), so erscheint eine hilfreiche Fehlermeldung:

> Error: NG02954: The NgOptimizedImage directive (activated on an `<img>` element with the `ngSrc="angular-buch.jpg"`) has detected that these required attributes are missing: "width", "height". Including "width" and "height" attributes will prevent image-related layout shifts. To fix this, include "width" and "height" attributes on the image tag or turn on "fill" mode with the `fill` attribute.

Wir bekommen ebenso eine Warnung, wenn wir versehentlich eine falsche `width` und `height` eintragen. Natürlich gibt die Direktive nicht nur Fehlermeldungen aus. 
Eines der wichtigsten Features ist das "faule" (lazy) Laden von Bildern, sodass die Ladezeiten der einzelnen Routen deutlich verbessert werden können.
In diesem Beispiel wird keine Priorität angegeben:

```html
<img ngSrc="angular-buch.jpg"  alt="" width="800" height="1152">
```

Dadurch wird der Browser angewiesen, mit dem Laden des Bilds zu warten, bis der Browser schätzt, dass es unmittelbar benötigt wird.
Das Bild wird z. B. beim Scrollen erst dann geladen, wenn es kurz davor ist, im sichtbaren Bereich zu erscheinen.

Im folgenden Beispiel wird die Priorität gesetzt.
Diese Option weist den Browser an, das Bild möglichst schnell zu laden.
Dies bietet sich zum Beispiel beim Headerbild eines Blogs an, das wichtig für den ersten Eindruck ist.


```html
<img ngSrc="https://example.org/angular-buch.jpg" alt="" width="800" height="1152" priority>
```

Zusätzlich sollte man dann einen Preconnect-Link zum Header der Seite in der Datei `index.html` hinzufügen, wenn die Bilder von einer anderen Domain geladen werden.
Dies weist den Browser an, frühzeitig eine Netzwerkverbindung zum anderen Server aufzubauen.

```html
<head>
  <link rel="preconnect" href="https://example.org">
</head>
```

Auch hier gibt die Direktive im Debug-Modus eine Warnung aus, wenn man diese Optimierung vergessen hat:

> NG02956: The NgOptimizedImage directive (activated on an `<img>` element with the `ngSrc="https://example.org/angular-buch.jpg"`) has detected that there is no preconnect tag present for this image. Preconnecting to the origin(s) that serve priority images ensures that these images are delivered as soon as possible. To fix this, please add the following element into the `<head>` of the document:
> `<link rel="preconnect" href="https://angular-buch.com">`




Moderne Browser akzeptieren mehrere Varianten für ein Bild (`srcset`), sodass für die jeweilige Auflösung das optimale Bild geladen wird.
Zusammen mit einem (vorkonfigurierten oder eigenen) Loader können wir dem Browser mitteilen, wo das optimale Bild für die aktuelle Auflösung zu finden ist. Angular bringt bereits Unterstützung für folgende kommerzielle Anbieter mit:

* Cloudflare
* Cloudinary
* ImageKit
* Imgix

Diese Anbieter bereiten die bestehenden Bilder passend auf, sodass man dasselbe Bild nicht manuell in diversen Auflösungen abspeichern muss.
In der offiziellen [Dokumentation zur Direktive](https://angular.io/guide/image-directive) und in der [dazugehörigen API-Dokumentation](https://angular.io/api/common/NgOptimizedImage) wird detailliert beschrieben, wie Loader eingebunden werden können.
Ebenso werden dort noch weitere Details zu dem großen Funktionsumfang der Direktive beschrieben.

Probieren Sie die neue Direktive doch gleich einmal aus.
Wir haben hierfür eine Stackblitz-Demo vorbereitet:  
**[👉 Demo auf Stackblitz: NgOptimizedImage](https://stackblitz.com/edit/angular-ivy-98yfkn?file=src%2Fapp%2Fapp.component.html)**


### CSS-Imports ohne Tilde

Style-Imports aus dem Ordner `node_modules` wurden bisher mit einer vorangestellten Tilde (`~`) notiert.
Dieser Weg ist *deprecated*, und es ist nicht mehr notwendig, die Tilde anzugeben:

```diff
/* VORHER: */
@import '~foo/styles.css';

/* NACHHER: */
@import 'foo/styles.css';
```


## Sonstiges

Neben den großen neuen Features hat das neue Release viele kleine Verbesserungen und Bug Fixes an Bord.
Eine Auswahl haben wir hier zusammengestellt:

- **Utility-Funktionen für Reactive Forms:** Das Paket `@angular/forms` exportiert nun die Hilfsfunktionen `isFormControl()`, `isFormGroup()` und `isFormArray()`. Diese Funktionen sind praktisch, wenn der Typ eines Controls im Code geprüft werden muss, z. B. in einem Validator.
- **Optionen für Tree-Shakable Providers:** Das Property `providedIn` im Decorator `@Injectable()` trägt in den meisten Fällen den Wert `root`. Zwei mögliche andere Optionen wurden nun entfernt: Es ist *nicht* mehr möglich, dort den Wert `any` oder eine Modulklasse anzugeben.
- **Import für Localize:** Das Paket `@angular/localize` muss nicht mehr unter Polyfills eingetragen werden, sondern wird nun über die `tsconfig.json` referenziert. Die Umstellung wird vom Migrationsskript automatisch vorgenommen.
- **Stylus-Support eingestellt:** Angular unterstützt Style-Definitionen nicht nur in reinem CSS, sondern es können CSS-Präprozessoren genutzt werden: Sass/SCSS und LESS. Der weniger bekannte Präprozessor *Stylus* wird seit Angular 15 nicht mehr unterstützt.

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).


## Neue Auflage des Angular-Buchs

Wir haben in den letzten Monaten intensiv an einer Neuauflage des deutschsprachigen Angular-Buchs gearbeitet! Das neue Buch erscheint im Februar 2023 in allen Buchhandlungen und Onlineshops.

Wir haben das Buch neu strukturiert und alle Beispiele neu entwickelt.
Die neuen Features von Angular 15 werden ebenfalls ausführlich behandelt.
Bestellen Sie das neue [Angular-Buch](https://amzn.eu/d/8fgTIWL) am besten gleich vor!

<div style="text-align: center">
<img src="https://angular-buch.com/assets/img/book-cover-multiple-v4.png" alt="Buchcover 4. Auflage" style="max-width:500px">
</div>


<hr>


Wir wünschen Ihnen viel Spaß mit Angular 15!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Bornholm, Dänemark, 2022. Foto von Ferdinand Malcher</small>
