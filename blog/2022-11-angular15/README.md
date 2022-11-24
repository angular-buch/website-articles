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
- Ein Resolver löst (asynchrone) Daten aus, bevor eine Route geladen wird.
- Ein Interceptor verarbeitet einen HTTP-Request oder -Response, z. B. um Headerfelder für die Authentifizierung hinzuzufügen.

Alle drei Bausteine existieren seit vielen Jahren – sie wurden aber bislang stets in Form einer Klasse implementiert.
Nun können Guards, Resolver und Interceptors auch als einfache Funktionen definiert werden.
Der Code wird damit leichtgewichtiger und flexibler.
Wollen wir Abhängigkeiten über die Dependency Injection anfordern, müssen wir die Funktion `inject()` nutzen.

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

Guards und Resolver werden auf dieselbe Weise bereitgestellt wie die klassenbasierten Implementierungen.
Funktionale Interceptors können derzeit nur mit der neuen Funktion `provideHttpClient()` genutzt werden, siehe der nächste Abschnitt.

Voraussichtlich mit Angular 15.1 werden klassenbasierte Guards und Resolver als *deprecated* markiert.
Wir empfehlen also, den Code in Ihren Projekten auf die neuen Schnittstellen zu migrieren.

In diesem [Twitter-Post von Enea Jahollari](https://twitter.com/Enea_Jahollari/status/1591433703678672896) finden Sie ein gelungenes Beispiel für 
das Zusammenspiel von Functional Guard, `inject()`, `CanMatch` und `loadComponent`.




## Standalone Components

Die mit Angular 14 eingeführten Standalone Components sind nun als *stable* eingestuft und können ohne Einschränkungen verwendet werden.
Im Blog der Angular.Schule haben wir dieses thema ausdführlich beleuchtet: [Standalone Components – neu ab Angular 14 (von Ferdinand Malcher)](https://angular.schule/blog/2022-05-standalone-components).

### Neue Standalone APIs

In diesem Zuge wurde ein alternative Weg eingeführt, um den `HttpClient` in der Anwendung bereitzustellen.
Bisher mussten wir dazu das `HttpClientModule` importieren.
Im zusammenhang mit Standalone Components können wir die neue Funktion `provideHttpClient()` nutzen.

Als Argumente können wir sogenannte *Features* übergeben – zusätzliche Funktionen des HttpClients, die einzeln aktiviert werden können.

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

Mit Standalone Components müssen alls Abhängigkeiten einer Komponente direkt importiert werden.
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
-  imports: [RouterLinkWithHref, RouterLink],
+  imports: [RouterLink],
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
- Die bisher erzeugte Datei `polyfills.ts` wird nun nicht mehr mit angelegt.Stattdessen akzeptiert die Konfigurationsoption `polyfills` in der Datei `angular.json` nun alternativ ein Array von referenzierten Polifills.
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

### `useDefineForClassFields`: unterschiedliches Verhalten von Propertys

In neuen Projekten wird in der TypeScript-Konfiguration automatisch die Compiler-Option `useDefineForClassFields` auf den Wert `false` gesetzt.
Neue Projekte erhalten die gleiche Einstellung.
Damit wird der TypeScript Compiler angewiesen, die properitäre Implementierung von TypeScript zur Verarbeitung von Klassen-Propertys zu nutzen und nicht das native Verhalten von JavaScript.
Dazu möchten wir kurz die Hintergründe erläutern.

In TypeScript können wir ein Klassen-Property direkt bei der Deklaration mit einem Wert initialisieren.
Beim Design der Propertys von TypeScript ging man nach bestem Wissen und Gewissen davon aus, dass die gewählte Implementierung exakt das Verhalten einer zukünftigen Version von JavaScript nachahmen würde.
Das hat leider nicht ganz funktioniert – die Standardisierung in ECMAScript ist über die Jahre einen anderen Weg gegangen.

Klassen-Propertys sind in TypeScript so implementiert, dass die Initialisierung mit Werten immer als erste Anweisung im Konstruktor durchgeführt wird.
Die beiden folgenden Schreibweisen waren bislang im Ergebnis absolut identisch:

```ts
class User {
  age = 25;
}

// ist in TypeScript exakt das gleiche wie:
class User {
  age: number;

  constructor() {
    this.age = 25;
  }
}
```

In JavaScript verhalten sich die nativen Klassen-Propertys leider etwas anders:
Es ist möglich, zunächst die Propertys zu initialisieren und erst *danach* den Konstruktor auszuführen.
Es handelt sich in JavaScript also um zwei voneinander unabhängige Schritte – bei der proprietären Implementierung von TypeScript geschieht die Initialisierung der Propertys hingegen immer zusammen mit dem Aufruf des Konstruktors.

Die Diskrepanz zwischen den beiden Welten ist besonders interessant, wenn wir Argumente über den Konstruktor empfangen, z. B. wenn wir eine Abhängigkeit mittels Dependency Injection anfordern.
Wollen wir einen injizierten Service für die direkte Initialisierung eines Propertys nutzen, funktioniert der Code in nativem JavaScript nicht.
In TypeScript ist der folgende Code hingegen gültig.


```ts
export class MyComponent {
  data$ = this.service.getData();

  constructor(private service: MyDataService) {}
}
```

Für dieses Dilemma gibt es zwei Lösungswege:

1. Setzen wir `useDefineForClassFields` auf `false`, wird das gewohnte proprietäre Verhalten von TypeScript aktiv. Diesen Weg hat Angular gewählt, um bestehenden Code nicht zu brechen.
2. Wir verwenden injizierte Services nicht bei der direkten Initialisierung eines Propertys. Dafür funktionieren zwei Ansätze: a) wir nutzen den Konstruktor oder b) wir setzen die Funktion `inject()` ein.

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
Es ist davon auszugehen, dass in Angular irgendwann die Einstellung `useDefineForClassFields` auf den Standardwert `true` gesetzt wird.
Wir empfehlen Ihnen also, Ihren Code jetzt schon möglichst robust zu entwickeln.



## Directive Composition API

In Angular können wir Direktiven implementieren, um Elemente in den Templates mit weiteren Funktionalitäten zu versehen.
Dabei werden solche Direktiven aber stats von außen auf einem Element notiert, in der Regel als Attribut.

Mit der neuen *Directive Composition API* können wir Direktiven auch von innen heraus zu platzieren.
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

Um mit den erzeugten Direktiven zu interagieren, können wir die Klassen mittels Dependency Injection anfordern, so wie wir es im vorhergehenden Abschnitt beschrieben haben.
Wir erhalten Zugriff auf die Instanzen und können dort die Propertys und Methoden direkt verwenden.

Außerdem können wir die Inputs und Outputs der Host-Direktiven deklarativ verfügbar machen.
Für alle Möglichkeiten der neuen Schnittstelle möchten wir Sie auf die [offizielle Angular-Dokumentation](https://angular.io/guide/directive-composition-api) verweisen.


## Image Directive


## Neuerungen bei Styles

### CSS-Imports ohne Tilde

Style-Imports aus den `node_modules` werden nicht mehr mit einer vorangestellten Tilde (~) notiert:

```diff
-@import '~foo/styles.css';
+@import 'foo/styles.css';
```

### Stylus Support

Angular unterstützt Style-Definitionen nicht nur in reinem CSS, sondern es können CSS-Präprozessoren genutzt werden: Sass/SCSS und LESS.
Der weniger bekannte Präprozessor *Stylus* wird seit Angular 15 nicht mehr unterstützt.

## Sonstiges

Neben den großen neuen Features hat das neue Release viele kleine Verbesserungen und Bug Fixes an Bord.
Eine Auswahl haben wir hier zusammengestellt:

- **Utility-Funktionen für Reactive Forms:** Das Paket `@angular/forms` exportiert nun die Hilfsfunktionen `isFormControl()`, `isFormGroup()` und `isFormArray()`. Diese Funktionen sind praktisch, wenn der Typ eines Controls im Code geprüft werden muss, z. B. in einem Validator.
- **Optionen für Tree-Shakable Providers:** Das Property `providedIn` im Decorator `@Injectable()` trägt in den meisten Fällen den Wert `root`. Zwei mögliche andere Optionen wurden nun entfernt: Es ist *nicht* mehr möglich, dort den Wert `any` oder eine Modulklasse anzugeben.
- **Import für Localize:** Das Paket `@angular/localize` muss nicht mehr unter Polyfills eingetragen werden, sondern wird nun über die `tsconfig.json` referenziert. Die Umstellung wird vom Migrationsskript automatisch vorgenommen.

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).


## Neue Auflage des Angular-Buchs

Wir haben in den letzten Monaten intensiv an einer Neuauflage des deutschsprachigen Angular-Buchs gearbeitet! Das neue Buch erscheint im Februar 2023 in allen Buchhandlungen und Onlineshops.

Wir haben das Buch neu strukturiert und alle Beispiele neu entwickelt.
Die neuen Features von Angular 15 werden ebenfalls ausführlich behandelt.

<div style="text-align: center">
<img src="https://angular-buch.com/assets/img/book-cover.png" alt="Buchcover 4. Auflage" width="200">
</div>


<hr>


Wir wünschen Ihnen viel Spaß mit Angular 15!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** 20XX. Foto von Ferdinand Malcher</small>
