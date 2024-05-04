---
title: 'Modern Angular: den BookMonkey migrieren'
author: Danny Koppenhagen und Ferdinand Malcher
mail: dannyferdigravatar@fmalcher.de # Gravatar
published: 2024-05-05
lastModified: 2024-05-05
keywords:
  - ESBuild
  - Application Builder
  - Standalone Components
  - inject
  - Functional Interceptor
  - Control Flow
  - Signals
  - Router Input Binding
  - Functional Outputs
  - NgOptimizedImage
  - BookMonkey
language: de
thumbnail: header-modernangular.jpg
hidden: true
---

Angular erlebt einen Aufschwung: Mit den letzten Major-Versionen des Frameworks wurden einige wichtige neue Konzepte und Features eingeführt.
Wir berichten darüber regelmäßig in unseren Blogposts zu den Angular-Releases.
In diesem Artikel wollen wir das Beispielprojekt "BookMonkey" aus dem Angular-Buch aktualisieren und die neuesten Konzepte von Angular praktisch einsetzen.

Besonders interessant sind die folgenden Neuerungen:

- Die **Standalone Features** sind inzwischen stark etabliert und Standard in jeder neuen Angular-Anwendung. **Module** sind dadurch optional geworden und werden früher oder später vermutlich ganz aus Angular verschwinden.
implementiert, anstatt eine Klasse zu verwenden.
- Der **Control Flow mit `@if` und `@for`** ist der empfohlene Weg, um Verzweigungen und Schleifen im Template abzubilden. Die Direktiven `ngIf` und `ngFor` werden vermutlich in einer späteren Version verschwinden.
- **Signals** sind stable und werden immer mehr die Schnittstellen von Angular integriert. In der Community entstehen Patterns und Bibliotheken rund um Signals.
- Für die Dependency Injection geht der Trend dazu, die **Funktion `inject()`** zu verwenden, anstatt Abhängigkeiten über den Konstruktor anzufordern.
- **Interceptoren, Guards und Resolver** werden als einfache Funktionen definiert, anstatt Klassen zu verwenden.
- Mit dem neuen **Application Builder** wurde das Build-System auf ESBuild mit Vite umgestellt. Gleichzeitig wurde Server-Side Rendering (SSR) direkt in diesen neuen Builder integriert.
- Kleinere Features sind die **View Transition API** und die Direktive `NgOptimizedImage`.

Die einzelnen Features haben wir bereits separat in den jeweiligen Artikeln zu den Major-Releases vorgestellt:

- [Angular 15 ist da!](/blog/2022-11-angular15)
- [Angular 16 ist da!](/blog/2023-05-angular16)
- [Angular 17 ist da!](/blog/2023-11-angular17)

Zum Thema Server-Side Rendering mit Angular 17 haben wir einen separaten Artikel veröffentlicht:

- [Book Monkey v5: Server-Side Rendering mit Angular 17](/blog/2023-11-ssr-bm)


**Inhaltsverzeichnis:**

- [Die Ausgangsbasis](/blog/2024-05-modern-angular-bm#die-ausgangsbasis)
- [`inject()` statt Constructor Injection](/blog/2024-05-modern-angular-bm#inject-statt-constructor-injection)
- [AsyncValidator als Funktion mit `inject()`](/blog/2024-05-modern-angular-bm#asyncvalidator-als-funktion-mit-inject)
- [Standalone Components](/blog/2024-05-modern-angular-bm#standalone-components)
  - [Komponenten, Direktiven und Pipes migrieren](/blog/2024-05-modern-angular-bm#komponenten-direktiven-und-pipes-migrieren)
  - [Bootstrapping mit Standalone API](/blog/2024-05-modern-angular-bm#bootstrapping-mit-standalone-api)
  - [ApplicationConfig anlegen](/blog/2024-05-modern-angular-bm#applicationconfig-anlegen)
  - [Routen migrieren](/blog/2024-05-modern-angular-bm#routen-migrieren)
  - [NgModules entfernen](/blog/2024-05-modern-angular-bm#ngmodules-entfernen)
- [Functional Interceptors](/blog/2024-05-modern-angular-bm#functional-interceptors)
- [Control Flow mit `@if` und `@for`](/blog/2024-05-modern-angular-bm#control-flow-mit-if-und-for)
- [Application Builder verwenden](/blog/2024-05-modern-angular-bm#application-builder-verwenden)
- [Signals](/blog/2024-05-modern-angular-bm#signals)
  - [Signals in Komponenten einsetzen](/blog/2024-05-modern-angular-bm#signals-in-komponenten-einsetzen)
  - [Observables in Signals konvertieren](/blog/2024-05-modern-angular-bm#observables-in-signals-konvertieren)
  - [Signals in Observables konvertieren](/blog/2024-05-modern-angular-bm#signals-in-observables-konvertieren)
- [Signal-based Inputs](/blog/2024-05-modern-angular-bm#signal-based-inputs)
- [Router Input Bindings, Signals und RxJS](/blog/2024-05-modern-angular-bm#Router-input-bindings-signals-und-rxjs)
  - [Component Input Binding aktivieren](/blog/2024-05-modern-angular-bm#component-input-binding-aktivieren)
  - [Kombination mit Signal Inputs](/blog/2024-05-modern-angular-bm#kombination-mit-signal-inputs)
- [Functional Outputs](/blog/2024-05-modern-angular-bm#functional-outputs)
- [Direktive `NgOptimizedImage` verwenden](/blog/2024-05-modern-angular-bm#direktive-ngoptimizedimage-verwenden)
- [Komponenten-Stylesheets: `styleUrls` =\> `styleUrl`](/blog/2024-05-modern-angular-bm#komponenten-stylesheets-styleurls--styleurl)
- [Migrations-Schematics von ngxtension verwenden](/blog/2024-05-modern-angular-bm#migrations-schematics-von-ngxtension-verwenden)
- [Demo und Code](/blog/2024-05-modern-angular-bm#demo-und-code)


## Die Ausgangsbasis

Als Grundlage verwenden wir das Projekt _BookMonkey_ aus unserem Angular-Buch der 4. Auflage.
Im letzten Praxiskapitel haben wir das Projekt bereits teilweise auf Standalone Components migriert. Der Code ist hier auf GitHub zu finden:

- [BookMonkey: 17-standalone](https://github.com/book-monkey5/17-standalone)

Sollten Sie bisher nicht mit dem Buch gearbeitet haben, können sie gern trotzdem hier einsteigen: Sie können das Repository [als ZIP herunterladen](https://github.com/book-monkey5/17-standalone/archive/refs/heads/main.zip) oder direkt Git verwenden:

```sh
git clone https://github.com/book-monkey5/17-standalone.git
cd 17-standalone
```

Installieren Sie anschließend die Abhängigkeiten mithilfe von NPM und starten Sie das Projekt einmal, um sicherzustellen, dass alles korrekt funktioniert:

```sh
npm install
ng serve
```

Wir werden in den folgenden Abschnitten alle Schritte für die Migration beschreiben.
Die Inhalte lassen sich also auch ideal auf andere Projekte abbilden.

Für alle vorgestellten Features setzen wir auf **Angular in Version 17.3**.

## `inject()` statt Constructor Injection

Wir wollen damit starten, die Dependency Injection konsequent mit `inject()` umzusetzen.
Die Funktion `inject()` wurde mit [Angular 14](/blog/2022-06-angular14) vorgestellt und erfreut sich seitdem großer Beliebtheit.
Viele Komponenten kommen inzwischen komplett ohne Konstruktor aus.
In einigen Situationen, zum Beispiel bei Functional Guards, Resolvers oder Interceptors, kommen wir um die Verwendung ohnehin nicht herum.

Die Funktion `inject()` bringt gegenüber der klassischen Constructor Injection unter anderem die folgenden Vorteile:

- Vermeidung von Konflikten zwischen den unterschiedlichen Klassen-Implementierungen von TypeScript und JavaScript. Stichwort: `useDefineForClassFields`, wir haben hierzu bereits einen [separaten Artikel verfasst](/blog/2022-11-use-define-for-class-fields).
- Konsistenz: Wir verwenden einen einheitlichen Stil
- Nutzung auch innerhalb von Funktionen möglich, solange diese in einem Injection Context aufgerufen werden.

Um alle Stellen für die Migration zu finden, können wir im gesamten Projekt nach `constructor(` suchen.

Wir schauen uns zunächst die Klasse `LoggedinOnlyDirective` an.
Vor der Migration sieht der Code wie folgt aus:

```ts
// ...
@Directive({ /* ... */ })
export class LoggedinOnlyDirective implements OnDestroy {
  // ...
  constructor(
    private template: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    // ...
  }
  // ...
}
```

Die Argumente des Konstruktors werden nun entfernt.
Stattdessen importieren wir die Funktion `inject()` und verwenden sie, um die Propertys direkt zu initialisieren.

```ts
// loggedin-only.directive.ts
import { /* ... */, inject } from '@angular/core';
// ...
@Directive({ /* ... */ })
export class LoggedinOnlyDirective implements OnDestroy {
  // ...
  private template = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  constructor() {
    // ...
  }
  // ...
}
```

Sollte der Konstruktor nach der Migration keinen Inhalt mehr besitzen, können wir die Methode vollständig entfernen.

> Übrigens: Das Projekt _ngxtension_ stellt zur Migration auf `inject()` ein Migrationsskript als [Schematic](https://ngxtension.netlify.app/utilities/migrations/inject-migration/) bereit.


## AsyncValidator als Funktion mit `inject()`

Dank `inject()` können wir den `AsyncValidatorsService` zu einer einfachen Funktion umbauen.
Dieser Service für die asynchrone Formularvalidierung war ursprünglich nur notwendig, weil wir den Konstruktor brauchten, um den `BookStoreService` per Dependency Injection anzufordern.
Wir können den Validator `isbnExists` jetzt ebenso als einfache Funktion definieren, wie wir es bei den synchronen Validatoren in der Datei `validators.ts` bereits getan haben.
Den `BookStoreService` fordern wir mithilfe von `inject()` an und nutzen dafür die Variable `service`.

```ts
// validators.ts
import { inject } from '@angular/core';
import { /* ... */, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs';

import { BookStoreService } from '../../shared/book-store.service';

// ...
export function isbnExists(): AsyncValidatorFn {
  const service = inject(BookStoreService);
  return (control: AbstractControl) => {
    return service
      .check(control.value)
      .pipe(map((exists) => (exists ? { isbnexists: true } : null)));
  };
};
```

Wichtig ist, dass `isbnExists()` weiterhin eine Factory-Funktion ist, die den Validator erst beim Aufruf generiert.
Nur so ist gewährleistet, dass `inject()` bei der Verwendung in einem Injection Context aufgerufen wird, nämlich bei Instanziierung der Komponentenklasse.

In der `BookFormComponent` fordern wir nun nicht mehr den `AsyncValidatorsService` an, sondern nutzen direkt die neu erstellte Funktion `isbnExists()`.

```ts
// book-form.component.ts
// ...
import { atLeastOneValue, isbnFormat, isbnExists } from '../shared/validators';

@Component({ /* ... */ })
export class BookFormComponent {
  // ...

  form = new FormGroup({
    // ...
    isbn: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, isbnFormat],
      asyncValidators: isbnExists(),
    }),
    // ...
  });

  // ...
}
```

Die Datei `async-validators.service.ts` kann anschließend gelöscht werden.
Der Code für den asychronen Validator hat sich damit stark vereinfacht, und der Overhead durch die Serviceklasse entfällt.

## Standalone Components

Im nächsten Schritt wollen wir die Anwendung konsistent mit Standalone APIs implementieren.
Das Feature `books` haben wir im Praxiskapitel zu Standalone Components bereits migriert.
Um das Projekt vollständig ohne Module umzusetzen, müssen wir noch folgende Anpassungen durchführen:

1. Die restlichen Komponenten zu Standalone Components migrieren: `SearchComponent`, `HomeComponent`, gesamtes `AdminModule` mit allen Komponenten
2. alle nicht mehr benötigten Module entfernen
3. Anwendung direkt mit `AppComponent` bootstrappen, ohne `AppModule`

Wenn wir diese Schritte manuell durchführen wollen, liegt eine ganze Menge Arbeit vor uns.
Glücklicherweise bietet Angular ein Migrationsskript an, um einen Großteil der Aufgaben zu automatisieren.

```sh
ng generate @angular/core:standalone
```

Führen wir diesen Befehl aus, können wir aus drei Migrationsschritten wählen:

```
? Choose the type of migration: (Use arrow keys)
❯ Convert all components, directives and pipes to standalone
  Remove unnecessary NgModule classes
  Bootstrap the application using standalone APIs
```

### Komponenten, Direktiven und Pipes migrieren

Wir starten mit der ersten Option, um alle Komponenten, Direktiven und Pipes zu migrieren.
Dabei wird automatisch für alle diese Klassen das Flag `standalone` mit dem Wert `true` gesetzt.
Außerdem wird das Template analysiert, und alle verwendeten Komponenten, Pipes und Direktiven werden automatisch unter `imports` im Kopf der Komponente eingetragen.

Im Anschluss sollten wir alle durchgeführten Änderungen noch einmal überprüfen.
Die `HomeComponent` sieht nach der Migration zum Beispiel wie folgt aus:

```ts
import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { RouterLink } from '@angular/router';

@Component({
  // ...
  standalone: true,
  imports: [RouterLink, SearchComponent]
})
export class HomeComponent {}
```
Damit die Anwendung weiterhin funktioniert, wurden alle migrierten Komponenten, Direktiven und Pipes innerhalb der Module verschoben: Sie stehen nun nicht mehr unter `declarations`, sondern unter `imports`:

```ts
// admin.module.ts
@NgModule({
  declarations: []
  imports: [
    // ...
    BookFormComponent,
    BookCreateComponent,
    BookEditComponent,
    FormErrorsComponent
  ],
})
export class AdminModule { }
```

### Bootstrapping mit Standalone API

Wir führen den Migrationsbefehl erneut aus und wählen die dritte Option: die Anwendung bootstrappen mit Standalone APIs.
Bei diesem Schritt wird das `AppModule` entfernt, und in der `main.ts` wird die Funktion `bootstrapApplication()` genutzt, um die Anwendung direkt mit der `AppComponent` zu bootstrappen.

Alle Providers aus dem `AppModule` werden dabei in die Datei `main.ts` verschoben.
Die Funktion `importProvidersFrom()` erlaubt es uns, die Providers aus den referenzierten Modulen zu extrahieren.
Dabei können wir das `BrowserModule` aus der Liste entfernen: Es wird in einer reinen Standalone-Anwendung nicht mehr benötigt.

Anstatt das `HttpClientModule` einzubinden, wird nach der Migration die Funktion `provideHttpClient()` verwendet.
Damit der klassenbasierte Interceptor, der per Provider bereitgestellt wird, weiterhin funktioniert, wird die Funktion `withInterceptorsFromDi()` angegeben.

```ts
// main.ts
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// ...

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule),
    provideHttpClient(withInterceptorsFromDi())
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ]
}).catch(err => console.error(err));
```

In unserem Test blieb in der `main.ts` der Import für die Funktion `platformBrowserDynamic` übrig, der allerdings nicht benötigt wird.
Sie können diese Zeile entfernen.

Übrigens empfehlen wir, auch in einer modulbasierten Anwendung die neue Funktion `provideHttpClient()` zu nutzen und nicht mehr das alte `HttpClientModule`.
Dieses Modul wird mit Angular 18 [als *deprecated* markiert](https://github.com/angular/angular/commit/f914f6a3628847c06cbdde9c90cd417fb2f4c61f).
Für den Umstieg bietet das Framework beim Update auf Angular 18 eine automatische Migration an.


### ApplicationConfig anlegen

In neu angelegten Angular-Projekten werden die globalen Providers in einer separaten Datei `app.config.ts` abgelegt. Damit bleibt die Datei `main.ts` schlank und beinhaltet nur den reinen Aufruf für das Bootstrapping.

Um die Struktur an neu angelegte Anwendungen anzugleichen, empfehlen wir Ihnen, selbst manuell die Datei `src/app/app.config.ts` anzulegen.
Sie beinhaltet unsere `ApplicationConfig` mit den Providers:

```ts
// app.config.ts
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { AuthInterceptor } from './shared/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AppRoutingModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
};
```

Die Datei `main.ts` importiert dann diese Variable:

```ts
// main.ts
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```



### Routen migrieren

Unser Feature-Modul `AdminModule` ist nun fast überflüssig, denn es importiert nur einige Komponenten und Module.
Damit die Klasse aber entfernt werden kann, müssen wir zuvor das zugehörige `AdminRoutingModule` auflösen.

Dazu entfernen wir aus der Datei `app-routing.module.ts` zunächst die Modulklasse und exportieren das Array mit Routen direkt unter dem Namen `ADMIN_ROUTES`.
Die Datei nennen wir außerdem um zu `admin.routes.ts`:

```ts
// admin.routes.ts
// ...
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: BookCreateComponent,
  },
  {
    path: 'edit/:isbn',
    component: BookEditComponent,
  }
];
```

In der Datei `admin.module.ts` können wir nun den Import für das `AdminRoutingModule` entfernen.

Anschließend migrieren wir auf die gleiche Weise das `AppRoutingModule`:

- Modulklasse entfernen
- Array von Routen direkt exportieren
- Datei umbenennen zu `app.routes.ts`

Außerdem müssen wir die Basisroute `admin` anpassen: Bisher wurde hier mittels Lazy Loading das `AdminRoutingModule` eingebunden.
Diesen Pfad müssen wir ändern, sodass unsere direkt exportierten `ADMIN_ROUTES` geladen werden:

```ts
// app.routes.ts
// ...
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'books',
    loadChildren: () => import('./books/books.routes').then(m => m.BOOKS_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
    /* VORHER: loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), */
  }
];
```


Damit die App-Routen genutzt werden, müssen wir das Array an den Router übergeben.
Dazu verwenden wir in der ApplicationConfig in `app.config.ts` die Funktion `provideRouter()`.
Der Aufruf von `importProvidersFrom()` mit dem `AppRoutingModule` ist jetzt nicht mehr notwendig.

```ts
// app.config.ts
// ...
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ]
})
```

Entfernen Sie bitte auf dem Weg alle nicht mehr genutzten Imports aus den Köpfen der Dateien.


### NgModules entfernen

Das `AdminModule` ist nun nur noch eine leere Hülle:
Es wird nirgendwo mehr genutzt, sodass wir die Datei `admin.module.ts` gefahrlos entfernen können.
Wir haben damit die Anwendung erfolgreich auf die Standalone APIs migriert.


## Functional Interceptors

Als Nächstes wollen wir den Interceptor zur Authentifizierung in eine Funktion umwandeln.
Die bisherige Implementierung als Klasse sieht so aus:

```ts
// ...
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = '1234567890';

    if (this.authService.isAuthenticated) {
      // ...
      return next.handle(reqWithToken);
    } else {
      return next.handle(request);
    }
  }
}
```

Ein Functional Interceptor ist grundsätzlich ähnlich aufgebaut, er besteht aber nur aus der Funktion, die bisher als Methode `intercept()` in der Klasse existierte.
Diese Funktion vom Typ `HttpInterceptorFn` erhält als Argumente den eingehenden Request und eine `HttpHandlerFn`.

```ts
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // ...
}
```

Durch den Typ `HttpInterceptorFn` ist die Signatur der Funktion schon vollständig beschrieben, sodass wir die Typen für die Argumente gar nicht explizit im Code notieren müssen.
Der Auth-Interceptor kann also wie folgt eingekürzt werden.
Anstelle von `next.handle()` rufen wir jetzt direkt die `HttpHandlerFn` mit `next()` auf.

```ts
// auth.interceptor.ts
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
// ...

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = '1234567890';

  if (authService.isAuthenticated) {
    // ...
    return next(reqWithToken);
  } else {
    return next(req);
  }
}
```

Mit einem solchen Functional Interceptor ist auch die Registrierung in der Anwendung etwas einfacher:
In der Datei `main.ts` entfernen wir den Provider für das DI-Token `HTTP_INTERCEPTORS`.
Stattdessen nutzen wir im Aufruf von `provideHttpClient()` die Funktion `withInterceptors()` (statt `withInterceptorsFromDi()`) und übergeben den neuen Interceptor in einem Array.
Der Interceptor wird damit direkt registriert.

Übrigens können wir den HttpClient noch weiter konfigurieren:
Mit der Funktion `withFetch()` verwendet Angular im Hintergrund die modernere [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
Damit wäre auch ein Deployment in einer Edge-Computing-Infrastruktur wie zum Beispiel CloudFlare Workers möglich, bei der nur die Fetch API unterstützt wird.

```ts
// app.config.ts
import {
  provideHttpClient,
  withInterceptors,
  withFetch
} from '@angular/common/http';
// ...
import { authInterceptor } from './app/shared/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
  ]
};
```

## Control Flow mit `@if` und `@for`

Mit Angular 17 wurde die neue Ablaufsteuerung im Template vorgestellt:
Anstatt die Direktiven `ngIf` und `ngFor` einzusetzen, nutzen wir für Verzweigungen und Schleifen die neuen Ausdrücke `@if` und `@for`.
Das hat den Vorteil, dass wir die Direktiven nicht einzeln importieren müssen. Der Control Flow wird direkt vom Compiler ausgewertet.

Auch wenn der Control Flow mit Angular 17 noch im Status *Developer Preview* ist, empfehlen wir die Nutzung bereits jetzt.

Um nicht alle Komponenten von Hand migrieren zu müssen, gibt uns Angular auch hier ein Migrationswerkzeug mit an die Hand.
Es erfolgt eine Migration der Template-Syntax, und im Nachgang werden auch automatisch die unnötigen Imports der Direktiven `NgIf` und `NgFor` entfernt:

```sh
ng generate @angular/core:control-flow
```

Bitte prüfen Sie anschließend noch einmal alle Änderungen gründlich. In komplexen Fällen kann die Migration unter Umständen nicht komplett automatisch durchgeführt werden.

Nach der Ausführung können wir noch zwei Punkte an den Komponenten `BookListComponent` und `SearchComponent` optimieren.

Mit `@for` ist es verpflichtend, eine Tracking-Information mithilfe von `track` anzugeben.
Angular verwendet dieses Merkmal, um die Elemente der iterierten Liste zu identifizieren.
Wenn wir eine Liste von Entitäten anzeigen, die eine ID besitzen, verwenden wir diese ID als Unterscheidungsmerkmal.
Da wir in den beiden Komponenten über ein Array von Buch-Objekten iterieren, eignet sich hier die ISBN am besten, sodass wir `book.isbn` als Trackingmerkmal verwenden.
Sollten die Elemente keine eindeutige ID besitzen, können Sie das Element selbst verwenden, oder – wenn die Liste sich zur Laufzeit nicht ändern wird – auch den Index (`$index`).

Für die Anzeige leerer Resultate brauchen wir übrigens nicht zwingend ein gesondertes `@if`.
Stattdessen bietet `@for` einen eigenen `@empty`-Block an:

```html
<!-- book-list.component.html -->
<h1>Books</h1>
@if (books$ | async; as books) {
  <ul class="book-list">
    @for (book of books; track book.isbn) {
      <li>
        <bm-book-list-item [book]="book"></bm-book-list-item>
      </li>
    } @empty {
      <li>No books available.</li>
    }
  </ul>
}
```

Die `SearchComponent` wird auf dieselbe Weise umgebaut.


## Application Builder verwenden

Die aktuelle Version der Anwendung nutzt bereits den neuen Application Builder von Angular, der unter der Haube auf ESBuild und Vite zurückgreift.
Sollte bei Ihnen noch ein älterer Builder genutzt werden (`@angular-devkit/build-angular:browser` oder `@angular-devkit/build-angular:browser-esbuild`), empfehlen wir Ihnen, auf den neuen Builder umzusteigen.
Auch hierfür hat das Angular-Team ein Schematic bereitgestellt:

```sh
ng update @angular/cli --name=use-application-builder
```

Server-Side Rendering und Pre-Rendering sind in einer neuen Anwendung mit Angular 17 automatisch aktiviert.
Der Application Builder kümmert sich um den kompletten Build-Prozess.
Wir haben die nötigen Einstellungen für statisches Pre-Rendering in unserem Beispielprojekt gesetzt, z. B. die Routenliste in der Datei `routes.txt`.

Alle Änderungen am Code können Sie in der Differenzansicht nachvollziehen:
[Differenzansicht (17-standalone -> 18-modern-angular)](https://book-monkey5.angular-buch.com/diffs/18-modern-angular.html)



## Signals

Im nächsten Schritt wollen wir uns dem Thema Signals widmen.
Wir haben darüber im Blogpost zu Angular 16 bereits ausführlich berichtet, siehe: [_Angular 16 ist da! Abschnitt "Reaktivität mit Signals"_](/blog/2023-05-angular16#reaktivität-mit-signals)).

Ein wichtiger Grund für die Einführung dieser neuen *Reactive Primitive* ist die Change Detection:
Um festzustellen, ob sich Daten geändert haben, muss Angular derzeit vergleichsweise hohen Aufwand betreiben.
Angular weiß niemals, *ob* und *welche* Daten sich tatsächlich ändern, sondern nur, dass es potenziell zu einer Datenänderung gekommen sein *könnte*.
Dafür verwendet Angular verschiedene Trigger, die die Change Detection auslösen. Zur Überwachung der Browser-Schnittstellen wird seit jeher die Bibliothek zone.js verwendet.

Mit Signals soll diese unspezifische Herangehensweise geändert werden: Ein Signal hält einen Wert und informiert die Anwendung, sobald sich dieser Wert ändert.
Auf diese Weise kann Angular gezielt die Views aktualisieren, in denen sich tatsächlich Daten geändert haben.

Einige Stellen, an denen wir bisher Observables und die AsyncPipe von Angular eingesetzt haben, können auch ohne RxJS mit Signals umgesetzt werden.

### Signals in Komponenten einsetzen

Als Erstes werfen wir einen Blick in die `SearchComponent`:
Das Property `isLoading` wird verwendet, um den Ladestatus der Suchanfrage zu erfassen.

Angular konnte Änderungen an diesem Property nur ermitteln, weil das Event Binding im Template und die eintreffende HTTP-Response jeweils die Change Detection ausgelöst haben.
Würden wir zone.js aus der Anwendung entfernen, würde der Ladeindikator nicht mehr korrekt angezeigt werden.


```ts
// ...
@Component({ /* ... */ })
export class SearchComponent {
  // ...
  isLoading = false;

  constructor() {
    this.results$ = // ...
}
```

Dieses Dilemma lässt sich mit einem Signal elegant lösen:
Anstatt den Wert direkt im Property zu speichern, verpacken wir das Loading-Flag in einem Signal.
Das Objekt wird mit `false` initialisiert, und der Wert kann später mit der Methode `.set()` überschrieben werden:

```ts
// search.component.ts
// ...
import { Component, inject, signal } from '@angular/core';

@Component({ /* ... */ })
export class SearchComponent {
  // ...
  isLoading = signal(false);

  constructor() {
    this.results$ = this.input$.pipe(
      // ...
      tap(() => this.isLoading.set(true)),
      switchMap(term => this.service.getAllSearch(term)),
      tap(() => this.isLoading.set(false))
    );
  }
}
```

Um Daten aus einem Signal zu lesen, rufen wir das Signal wie eine Funktion auf.
Wir müssen also das Template der `SearchComponent` anpassen:

```html
<!-- search.component.html -->
<input type="search"
  autocomplete="off"
  aria-label="Search"
  [class.loading]="isLoading()"
  #searchInput
  (input)="input$.next(searchInput.value)">
```

Sollten wir das einmal vergessen, informiert der Angular Language Service uns direkt im Editor mit einer Warnung.

Nun kann der Ladezustand auch erfasst werden, ohne auf die Change Detection mittels zone.js angewiesen zu sein.
Die Anwendung ist damit robuster für die Zukunft gewappnet.


### Observables in Signals konvertieren

Im nächsten Schritt werfen wir einen Blick auf die `BookListComponent`.
Hier nutzen wir bisher die AsyncPipe, um die Daten aus dem Observable mit Büchern anzuzeigen:

```ts
// book-list.component.ts
@Component({
  // ...
  imports: [AsyncPipe, /* ... */],
})
export class BookListComponent {
  books$ = inject(BookStoreService).getAll();
}
```

Mit der Funktion `toSignal()` können wir ein Observable in ein Signal umwandeln.
Die Funktion kümmert sich automatisch darum, auf das Observable zu subscriben und die Daten im erzeugten Signal bereitzustellen.
Auch das Beenden der Subscription wird automatisch erledigt.
Damit müssen wir nicht die `AsyncPipe` importieren oder manuell auf das Observable subscriben.

```ts
// book-list.component.ts
import { toSignal } from '@angular/core/rxjs-interop';
// ...

@Component({ /* ... */ })
export class BookListComponent {
  books = toSignal(inject(BookStoreService).getAll());
}
```

Im Template rufen wir entsprechend das Signal auf, um die Buchliste zu lesen:

```html
<!-- book-list.component.html -->
<h1>Books</h1>
@if (books(); as books) {
<ul class="book-list">
  <!-- ... -->
</ul>
}
```

Die Subscription auf dem Observable erfolgt einmalig und sofort, sobald wir die Funktion `toSignal()` benutzen.
Wir können den Wert aus dem Signal beliebig oft lesen, ohne dass erneut ein HTTP-Request ausgeführt wird.
Dieses Verhalten unterscheidet sich vom vorherigen Weg:
Benutzen wir die `AsyncPipe` mehrfach, wird das Observable auch mehrfach subscribet.


### Signals in Observables konvertieren

Jetzt wollen wir noch den `AuthService` umbauen.
Anstatt das Zustandsflag `isAuthenticated` als einfaches Property zu erfassen, wollen wir dafür ein Signal verwenden.
Der Wert soll weiterhin auch über ein Observable `isAuthenticated$` bereitgestellt werden, damit wir reaktiv mit der Information arbeiten können.

Als Basis zur Erfassung des Zustands wollen wir ein Signal verwenden, sodass wir kein `BehaviorSubject` mehr benötigen.
Die Ausgabe als Observable können wir elegant mit der Funktion `toObservable()` erledigen:

```ts
import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ /* ... */ })
export class AuthService {
  readonly isAuthenticated = signal(true);
  readonly isAuthenticated$ = toObservable(this.isAuthenticated);

  login() {
    this.isAuthenticated.set(true);
  }

  logout() {
    this.isAuthenticated.set(false);
  }
}
```

Die Aufrufe von `isAuthenticated` in den Dateien `app.component.html`, `auth.guard.ts` und `auth.interceptor.ts` müssen nun auch um die Klammern erweitert werden, um den Wert zu lesen: `isAuthenticated()`.

Die Direktive `LoggedinOnlyDirective` können wir in diesem Zuge auch noch weiter vereinfachen.
Hier können wir auf das Konstrukt aus Observable und dem Operator `takeUntil` verzichten und stattdessen einen Effect verwenden:
Ein Effect reagiert auf Änderungen an den Signals, die wir in der Effect-Funktion verwenden.
Sobald sich einer der Eingabewerte ändert, wird die Berechnung erneut durchgeführt.
Auf den Lifecycle-Hook `ngOnDestroy` können wir somit auch komplett verzichten, und der Code wird stark verkürzt:

```ts
import { /* ... */, effect, inject } from '@angular/core';
// ...

@Directive({ /* ... */ })
export class LoggedinOnlyDirective {
  // ...
  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.viewContainer.createEmbeddedView(this.template);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
```

## Signal-based Inputs

Mit dem Minor-Release von Angular 17.2.0 wurde eine Alternative zum bisherigen `@Input()`-Dekorator auf Basis von Signals eingeführt, siehe die [offizielle Information im Angular-Blog](https://blog.angular.io/signal-inputs-available-in-developer-preview-6a7ff1941823).
Nutzen wir die neue Funktion `input()`, wird der übergebene Wert eines Komponenten-Inputs direkt als Signal erfasst:

```ts
isbn = input() // InputSignal<unknown>
isbn = input<string>() // InputSignal<string | undefined>
isbn = input.required() // InputSignal<unknown>
isbn = input.required<string>() // InputSignal<string>
isbn = input('3864909465') // InputSignal<string>
```

Wir können einige Stellen unserer Anwendung auf diese neuen *Signal-based Inputs* umbauen.
Wir beginnen in der `FormErrorsComponent`: Statt `@Input()` setzen wir jeweils `input.required()` ein, da beide Informationen zwingend bei Verwendung der Komponente gesetzt werden müssen.
Um das Signal zu lesen, dürfen wir im Getter `errors` die Funktionsklammern nicht vergessen.

```ts
// form-errors.component.ts
import { Component, inject, input } from '@angular/core';
// ...

@Component({ /* ... */ })
export class FormErrorsComponent {
  controlName = input.required<string>();
  messages = input.required<{ [errorCode: string]: string }>();
  // ...

  get errors(): string[] {
    const control = this.form.control.get(this.controlName());
    // ...
    return Object.keys(control.errors).map(errorCode => {
      return this.messages()[errorCode];
    });
  }
}
```

Nicht immer wollen wir, dass der Name des Propertys in der Komponente dem Namen entspricht, den wir beim Property Binding von außen verwenden.
Diesen Fall haben wir bereits in der `ConfirmDirective` berücksichtigt.
Auch mit Signal Inputs lässt sich ein `alias` konfigurieren.

Wenn wir die Direktive verwenden, wollen wir den Text an das Property `bmConfirm` übergeben, das dem Attributnamen der Direktive entspricht.
Innerhalb der Direktivenklasse soll dieses Property jedoch `confirmText` lauten.

```ts
// confirm.directive.ts
import { /* ... */, input } from '@angular/core';

@Directive({
  selector: '[bmConfirm]',
  standalone: true
})
export class ConfirmDirective {
  confirmText = input.required<string>({ alias: 'bmConfirm' });
  // ...
  @HostListener('click') onClick() {
    if (window.confirm(this.confirmText())) {
      this.confirm.emit();
    }
  }
}
```

> Das Projekt _ngxtension_ stellt zur Migration auf Signal Inputs auch ein [Schematic](https://ngxtension.netlify.app/utilities/migrations/signal-inputs-migration/) bereit.


## Router Input Bindings, Signals und RxJS

Zum Abschluss dieses Abschnitts wollen wir ein neueres Feature des Routers verwenden: Component Input Bindings.
Damit ist es möglich, Routenparameter per Input in einer Komponente zu empfangen.
Anstatt also wie gewohnt den Service `ActivatedRoute` zu verwenden, erstellen in der Komponente ein Input, das den gleichen Namen trägt wie der Routenparameter:

```ts
@Component({ /* ... */ })
export class MyComponent {
  @Input() myParam?: string;
  myParam2 = input<string>();
}
```

Der Router befüllt diese Propertys automatisch mit Werten – sofern die Parameter in der Route existieren.
Dabei werden Path-Parameter, Query-Parameter und Routen-Daten gleichermaßen verarbeitet.
Tragen die verschiedenen Parameter-Typen den gleichen Namen, so ist nur einer der Werte verfügbar. Sie können die Implementierung im [Quellcode von Angular](https://github.com/angular/angular/blob/17.3.6/packages/router/src/directives/router_outlet.ts#L459) nachvollziehen.


### Component Input Binding aktivieren

Damit diese Mechanik funktioniert, müssen wir das Feature zunächst im Router aktivieren.
In der Datei `app.config.ts` fügen wir unter `provideRouter()` den Aufruf der Funktion `withComponentInputBinding()` hinzu:

```ts
// app.config.ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
// ...

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    // ...
  ]
};
```

### Kombination mit Signal Inputs

Zusammen mit Signal Inputs und den Möglichkeiten von RxJS ergibt sich ein elegantes neues Pattern, das wir in unseren Komponenten einsetzen wollen.
In der `BookDetailsComponent` und `BookEditComponent` wird jeweils ein Buch anhand der ISBN geladen, die in der Route übergeben wird.

Wir erzeugen zunächst ein passendes Input-Property mithilfe der Funktion `input()`:

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  isbn = input.required<string>();
}
```

Da es sich um ein Signal handelt, kann Angular bei Wertänderungen direkt reagieren.
Wir wollen den Parameter aber weiterhin mit RxJS verarbeiten: Der HTTP-Call wird über ein Observable abgebildet, und auch die Charakteristik des Operators `switchMap` wollen wir weiterhin nutzen.

Wir wandeln das Signal `isbn` also mit der Funktion `toObservable()` zunächst in ein Observable um.
In der Pipeline starten wir den HTTP-Request und rufen das Buch ab.

```ts
@Component({ /* ... */ })
export class BookDetailsComponent {
  // ...
  isbn = input.required<string>();

  book$ = toObservable(this.isbn).pipe(
    switchMap(isbn => this.service.getSingle(isbn))
  );
  // ...
}
```

Auf dieselbe Weise gehen wir in der `BookEditComponent` vor.
Der Code in der Komponentenklasse wird elegant verkürzt: Anstatt `ActivatedRoute` zu verwenden, stammt der Parameter aus dem Signal Input.
Der Konstruktor entfällt vollständig, wenn wir das Property `book$` direkt zuweisen.
Anschließend können wir die nicht benötigten Imports aufräumen.


## Functional Outputs

Analog zur Funktion `input()` steht seit der Minor-Version Angular 17.3.0 eine Alternative zum `@Output()`-Dekorator bereit: die Funktion `output()`.
Dabei wurde auch die Typsicherheit verbessert: Wenn wir den Output typisieren, z. B. `output<string>()`, dann ist übergebene Payload bei `emit()` verpflichtend.
Beim bisherigen Weg mit `EventEmitter` war der Payload hingegen immer optional.
Wollen wir keinen Payload übergeben, müssen wir den Output nicht typisieren, und es wird automatisch der Typ `void` für den Payload angenommen.

```ts
select = output() // OutputEmitterRef<void>
isbnChange = output<string>() // OutputEmitterRef<string>

// ...
this.select.emit(); // OK
this.isbnChange.emit(); // Error: Expected 1 arguments, but got 0.
this.isbnChange.emit('3864909465'); // OK
```

Wir wollen die neuen Functional Outputs in der `ConfirmDirective` nutzen:

```ts
import { /* ... */, output } from '@angular/core';

@Directive({ /* ... */ })
export class ConfirmDirective {
  // ...
  confirm = output();

  @HostListener('click') onClick() {
    if (window.confirm(this.confirmText())) {
      this.confirm.emit();
    }
  }
}
```

> Das Projekt _ngxtension_ stellt zur Migration auf Functional Outputs auch ein [Schematic](https://ngxtension.netlify.app/utilities/migrations/new-outputs-migration/) bereit.

## Direktive `NgOptimizedImage` verwenden

Bereits seit Angular 14.2 stellt das Framework eine Direktive zur optimierten Einbindung von Bildern bereit: `NgOptimizedImage`.
Wir haben hierzu im [Blogpost zum Release von Angular 15](/blog/2022-11-angular15#image-directive-optimierte-verwendung-von-bildern) berichtet.

Wir starten mit der `BookListItemComponent`:
Damit wir die Direktive im Template nutzen können, muss sie zuvor in der Komponente importiert werden.

```ts
// book-list-item.component.ts
import { NgOptimizedImage } from '@angular/common';
// ...

@Component({
  // ...
  imports: [RouterLink, IsbnPipe, NgOptimizedImage]
})
// ...
```

Im Anschluss ersetzen wir auf dem Element `<img>` das Attribut `src` durch `ngSrc`.
Das Bild wird standardmäßig "lazy" geladen und blockiert somit nicht das Laden der gesamten Buchliste.
Damit die Optimierung klappt und wir Layoutverschiebungen vermeiden, müssen wir noch die erwartete Größe des Bilds angeben, indem wir eine statische Breite und Höhe notieren.
Somit kann bereits vorab der Platz zur Anzeige des Bilds reserviert werden.

```html
<!-- book-list-item.component.html -->
<!-- ... -->
<img alt="Cover" [ngSrc]="thumbnail" width="120" height="175">
<!-- ... -->
```

Bei der Detailansicht der Bücher in der `BookDetailsComponent` gehen wir ähnlich vor:
Hier setzen wir jedoch zusätzlich das Attribut `priority`, da wir das Buchcover hier mit hoher Priorität laden wollen.

```html
<!-- book-details.component.html -->
<!-- ... -->
<img alt="Cover" [ngSrc]="book.thumbnailUrl" width="200" height="250" priority>
<!-- ... -->
```

Damit das priorisierte Laden funktioniert, müssen wir in der Datei `index.html` ein Meta-Tag hinzufügen:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
<head>
  <!-- ... -->
  <link rel="preconnect" href="https://cdn.ng-buch.de">
</head>
<!-- ... -->
```

## Komponenten-Stylesheets: `styleUrls` => `styleUrl`

Zum Abschluss wollen wir noch eine eher kosmetische Änderung im Code durchführen:
Bisher wurden die Komponenten-Stylesheets standardmäßig als Array im Property `styleUrls` übergeben.
Da es in den meisten Fällen aber nur genau eine Style-Datei gibt, können wir nun auch eine einzelne `styleUrl` als String angeben.
Neue Komponenten werden bereits mit einer einzelnen `styleUrl` generiert.

```ts
@Component({
  // VORHER:
  styleUrls: ['./book-list.component.css'],
  // NACHHER:
  styleUrl: './book-list.component.css',
  // ...
})
// ...
```

Nutzen wir zum Beispiel Visual Studio Code als Editor, können wir die Migration über die globale Suche mithilfe eines regulären Ausdrucks vollziehen:

- Suche: `styleUrls: \[(.*)\]` (Die Option "Regulärer Ausdruck" muss aktiviert sein)
- Ersetzen: `styleUrl: $1`


## Migrations-Schematics von ngxtension verwenden


Wir haben in den vorherigen Abschnitten erwähnt, dass das Paket [ngxtension](https://ngxtension.netlify.app/) Schematics für die Migration auf einige neuere Angular-Features anbietet. Es handelt sich nicht um ein offizielles Projekt von Angular, sondern stammt aus der Community.

Um die Migrationen zu verwenden, müssen wir das Paket zunächst im Projekt installieren:

```bash
npm i -D ngxtension
```

Anschließend können wir die Migration mithilfe von `ng generate` anstoßen:

```bash
# von @Input zu Signal Inputs
ng g ngxtension:convert-signal-inputs

# von @Output zu Functional Outputs
ng g ngxtension:convert-outputs

# von Constructor Injection zu inject()
ng g ngxtension:convert-di-to-inject
```


## Demo und Code

Damit haben wir den BookMonkey auf die neusten Konzepte und Features von Angular migriert.
Wir freuen uns sehr über die vielen Neuigkeiten in Angular: Standalone Components sorgen für eine einfachere Struktur und weniger verzweigte Referenzen in der Anwendung.
Zusammen mit der Funktion `inject()` werden asynchrone Validatoren und funktionale Interceptors/Guards stark verkürzt.
Der entwickelte Code wird schlanker und ist einfacher zu überblicken.
Nicht zuletzt ergeben sich durch Signals neue Patterns und Herangehensweisen.

**Quellcode, Änderungen und Demo:**

- [BookMonkey Demo](https://18-modern-angular-bm5.angular-buch.com/)
- [Repo: 17-standalone (Ausgangsbasis)](https://github.com/book-monkey5/17-standalone)
- [Repo: 18-modern-angular (Migration)](https://github.com/book-monkey5/18-modern-angular)
- [Differenzansicht (17-standalone -> 18-modern-angular)](https://book-monkey5.angular-buch.com/diffs/18-modern-angular.html)

<hr>

<small>**Titelbild:** Black Diamond, Kopenhagen, Dänemark. Foto von Ferdinand Malcher</small>
