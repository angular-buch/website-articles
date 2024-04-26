---
title: 'Book Monkey v5: Modern Angular'
author: Danny Koppenhagen
mail: mail@k9n.de
published: 2024-04-04
lastModified: 2024-04-04
keywords:
  - ESBuild
  - Application Builder
  - Standalone Components
  - inject
  - functional interceptor
  - Control Flow
  - Signals
  - NgOptimizedImage
  - BookMonkey
language: de
thumbnail: bm.jpg
---

Angular erlebt einen Aufschwung: Mit den letzten Major-Versionen des Frameworks wurden einige neue Konzepte und Features eingeführt.
Wir berichten darüber regelmäßig in unseren Blogposts zu den Angular-Releases.
In diesem Artikel wollen wir das Beispielprojekt "BookMonkey" aus dem Angular-Buch aktualisieren und die neuesten Konzepte von Angular praktisch einsetzen.

Besonders interessant sind die folgenden Neuerungen in Angular:

- Mit dem neuen **Application Builder** wurde das Build-System auf ESBuild mit Vite umgestellt. Gleichzeitig wurde Server-Side Rendering (SSR) direkt in diesen neuen Builder integriert.
- Die **Standalone Features** sind inzwischen stark etabliert und Standard in jeder neuen Angular-Anwendung. **Module** sind dadurch optional geworden und werden früher oder später vermutlich ganz aus Angular verschwinden.
- Für die Dependency Injection geht der Trend dazu, die **Funktion `inject()`** zu verwenden, anstatt Abhängigkeiten über den Konstruktor anzufordern.
- **Interceptoren, Guards und Resolver** werden als einfache Funktionen implementiert, anstatt eine Klasse zu verwenden.
- Der **Control Flow mit `@if` und `@for`** ist der empfohlene Weg, um Verzweigungen und Schleifen im Template abzubilden. Die Direktiven `ngIf` und `ngFor` werden vermutlich in einer späteren Version verschwinden.
- **Signals** sind stable und werden immer mehr die Schnittstellen von Angular integriert. In der Community entstehen Patterns und Bibliotheken rund um Signals.
- Kleinere Features sind die **View Transition API** und die Direktive `NgOptimizedImage`.

Die einzelnen Features haben wir bereits separat in den jeweiligen Artikeln zu den Major-Releases vorgestellt:

- [Angular 15 ist da!](/blog/2022-11-angular15)
- [Angular 16 ist da!](/blog/2023-05-angular16)
- [Angular 17 ist da!](/blog/2023-11-angular17)

Zum Thema Server-Side Rendering mit Angular 17 haben wir einen separaten Artikel veröffentlicht:

- [Book Monkey v5: Server-Side Rendering mit Angular 17](/blog/2023-11-ssr-bm)
<!--
- [Angular 18 ist da!](/blog/2024-06-angular18)
-->

## Die Ausgangsbasis

Als Ausgangsbasis verwenden wir das Projekt _BookMonkey_ aus unserem Angular-Buch der 4. Auflage.
Im letzten Praxiskapitel haben wir das Projekt bereits teilweise auf Standalone Components migriert:

- [BookMonkey: 17-standalone](https://github.com/book-monkey5/17-standalone)

Sollten Sie bisher nicht mit dem Buch gearbeitet haben, können sie gern trotzdem ab hier starten und den Quellcode aus dem oben aufgeführten Repository zum Start herunterladen. Dazu können Sie das Repository [als ZIP herunterladen](https://github.com/book-monkey5/17-standalone/archive/refs/heads/main.zip) oder direkt Git verwenden:

```sh
git clone https://github.com/book-monkey5/17-standalone.git
cd 17-standalone
```

Installieren Sie anschließend die Abhängigkeiten mithilfe von NPM:

```sh
npm install
```

Wir werden in den folgenden Abschnitten alle Schritte für die Migration beschreiben.
Die Inhalte lassen sich also auch ideal auf andere Projekte abbilden.

Für alle vorgestellten Features setzen wir auf **Angular in Version 17.3**.

## `inject()` statt Constructor Injection

Wir wollen damit starten, die Dependency Injection konsequent mit `inject()` umzusetzen.
Die Funktion `inject()` wurde mit [Angular 14](/blog/2022-06-angular14) vorgestellt und erfreut sich seitdem großer Beliebtheit.
Viele Komponenten kommen seitdem komplett ohne Konstruktor aus.
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

Die Argumente des Konstruktors werden entfernt.
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

Sollte der Konstruktor nach die Migration keinen Inhalt mehr besitzen, können wir die Methode vollständig entfernen.

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
Der Code für den asychronen Validator hat sich damit drastisch vereinfacht, und der Overhead durch die Serviceklasse entfällt.

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
Damit die Anwendung weiterhin funktioniert, wurden alle migrierten Komponenten, Direktiven und Pipes innerhalb der Module verschoben: Sie stehen nun nicht mehr unter `declarations`, sondern unter `imports`.

### Bootstrapping mit Standalone API

Wir führen den Migrationsbefehl erneut aus und wählen die dritte Option: die Anwendung bootstrappen mit Standalone APIs.
Bei diesem Schritt wird das `AppModule` entfernt, und in der `main.ts` wird die Funktion `bootstrapApplication()` genutzt, um die Anwendung direkt mit der `AppComponent` zu bootstrappen.

Alle Providers aus dem `AppModule` werden dabei in die Datei `main.ts` verschoben.
Die Funktion `importProvidersFrom()` erlaubt es uns, die Providers aus den referenzierten Modulen extrahieren.
Dabei können wir das `BrowserModule` aus der Liste entfernen: Es wird in einer reinen Standalone-Anwendung nicht mehr benötigt.

Anstatt das `HttpClientModule` einzubinden, wird nach der Migration die Funktion `provideHttpClient()`.
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

In unserem Test blieb übrigens in der `main.ts` der Import für die Funktion `platformBrowserDynamic` übrig, der allerdings nicht benötigt wird.
Sie können diese Zeile entfernen.

### ApplicationConfig anlegen

In neu angelegten Angular-Projekten werden die globalen Providers in einer separaten Datei abgelegt. Damit bleibt die Datei `main.ts` schlank und beinhaltet nur den reinen Aufruf für das Bootstrapping.

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

TODO


### NgModules entfernen

Jetzt haben wir noch drei Module in unserer Anwendung:

- `AppRoutingModule`
- `AdminModule`
- `AdminRoutingModule`

In unserem Test ließen sich diese Module nicht automatisch mit der Code Migration auflösen und wir müssen hier manuell Hand anlegen.

Wir starten mit dem `AppRoutingModule`.
Wir entfernen hier die Modulklasse und exportieren die Variable mit den Routen (`routes`).
Im Anschluss benennen wir die Datei `app-routing.module.ts` in `app.routes.ts` um.

```ts
import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { authGuard } from './shared/auth.guard';

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
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
  }
];
```

Jetzt passen wir noch die Datei `main.ts` an.
Hier nutzen wir nun die Funktion `provideRouter` des Angular Routers und übergeben ihr die Routenkonfiguration.
Wir benötigen jetzt den Aufruf von `importProvidersFrom()` mit dem `BrowserModule` und dem `AppRoutingModule` nicht mehr.

```ts
// ...
import { provideRouter } from '@angular/router';
// ...
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserModule),
    // ...
  ]
}).catch(err => console.error(err));
```

Im nächsten Schritt kümmern wir uns um das `AdminModule` samt der Routing-Konfiguration.
Hier können wir die Datei `admin-routing.module.ts` zu `admin.routes.ts` umbenennen.
In der Datei müssen wir lediglich die Routenkonstante exportieren.
Der gesamte `NgModule`-Teil entfällt.

```ts
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

Zum Abschluss müssen wir in unserer Hauptkonfiguration der Routen (`app.routes.ts`) noch auf die neu exportierten Routen verweisen.
Wir müssen hier lediglich den Import anpassen und auf die Konstante der Routen verweisen:

```ts
// ...
export const routes: Routes = [
  // ...
  {
    path: 'admin',
    /*
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    */
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  }
];
```

Die Datei `admin.module.ts` können wir jetzt entfernen.

Wir haben nun erfolgreich auf die Standalone APIs migriert.

## Functional Interceptors

Als nächstes Wollen wir uns den Interceptor zur Authentifizierung ansehen.
Dieser ist bisher als Klasse implementiert und sieht wie folgt aus:

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

Bei Verwendung eines functional Interceptors legen wir eine Factory Funktion an, die den Request und eine `HttpHandlerFn` übergeben bekommt.
Die `HttpHandlerFn` ist equivalent zum Aufruf von `.handle` vom zuvor verwendeten `HttpHandler`.

```ts
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
// ...

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
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

Jetzt, da wir keine Klasse mehr verwenden, die das DI Token `HTTP_INTERCEPTORS` überlädt, müssen wir noch eine Anpassung in unserem `main.ts` vornehmen.
Hier nutzen wir nun `withInterceptors()` statt `withInterceptorsFromDi()` und übergeben den Interceptor im Array.
Entsprechend können wir das Token-Konfigurationsobjekt mit dem Verweis auf die Klasse entfernen.
Bei der Gelegenheit können wir auch `provideHttpClient()` zusätzlich die Funktion `withFetch()` mit übergeben, um Angular zur Nutzung der moderneren [Fetch-API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) zu bewegen.
Damit wäre auch ein Deployment in einer Edge-Computing-Infrastruktur wie zum Beispiel CloudFlare Workers möglich, bei der nur die Fetch-API unterstützt wird.

```ts
import {
  provideHttpClient,
  withInterceptors,
  withFetch
} from '@angular/common/http';
// ...
import { authInterceptor } from './app/shared/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // ...
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
  ]
}).catch(err => console.error(err));
```

## Control Flow

Mit Angular 17 kam der neue Control Flow ins Spiel.
Dieser erlaubt es uns Verzweigungen und Schleifen mit `@if()` und `@for()` direkt im Template von Angular Komponenten zu nutzen,
ohne zuvor passende Direktiven dafür importieren zu müssen.

Auch wenn der Control Flow mit Angular 17 noch im Developer Preview ist, empfehlen wir die Nutzung bereits jetzt.

Um nicht alle Komponenten von Hand migrieren zu müssen, gibt uns Angular auch hier ein Migrationswerkzeug mit an die Hand.
Es erfolgt eine Migration der Template Syntax und im Nachgang werden auch automatisch die unnötigen Importe der Direktiven `NgIf` und `NgFor` entfernt.

```sh
ng generate @angular/core:control-flow
```

Bitte prüfen Sie hier noch einmal alle Änderungen ausgiebig.

Nach der Ausführung können wir noch zwei Punkte an den Komponenten `BookListComponent` und `SearchComponent` optimieren.
Die Angabe von `track` im `@for` Block muss zwingend erfolgen.
Hier müssen wir die Information hinterlegen, nach welchem Merkmal die Elemente der Liste identifiziert werden können.
Dieses Property sollte eindeutig sein, z. B. die ID des Datensatzes.
Da wir in den beiden Komponenten jeweils über ein Array von Buch-Objekten iterieren, eignet sich hier die ISBN-Nummer am besten.
Weiterhin benötigen wir für die Anzeige leerer Resultate nicht zwingend ein gesondertes `@if()`.
Hier können wir den `empty()` block der `@for()` Schleife nutzen.

```html
<h1>Books</h1>
@if (books$ | async; as books) {
  <ul class="book-list">
    @for (book of books; track book.isbn) {
      <li>
        <bm-book-list-item [book]="book"></bm-book-list-item>
      </li>
    } @empty() {
      <li>No books available.</li>
    }
  </ul>
}
```

Mit der `SearchComponent` gehen wir analog hierzu vor.

## Application Builder

Die aktuelle Version der Anwendung nutzt bereits den neuen Application Builder von Angular, der unter der Haube auf ESBuild und Vite zurückgreift.
Sollte bei Ihnen noch ein älterer Builder genutzt werden (`@angular-devkit/build-angular:browser` oder `@angular-devkit/build-angular:browser-esbuild`), empfehlen wir die Migration.
Auch hierfür hat das Angular-Team ein Schematic über die Angular CLI bereitgestellt:

```sh
ng update @angular/cli --name=use-application-builder
```

## Signals

Im nächsten Schritt wollen wir uns dem Thema Signals annehmen.
Signals sind eine neue reaktive Primitive und stellen eine Alternative zur Observables mit RxJS und dem bisherigen zu Grunde liegenden Modell der Change Detection basierend auf Zone.js dar.
Künftig können wir somit komplett auf die Integration von Zone.js verzichten (Siehe: [_Angular 16 ist da! Abschnitt "Reaktivität mit Signals"_](/blog/2023-05-angular16#reaktivität-mit-signals)).

Als Erstes werfen wir hierfür einen Blick auf die `SearchComponent`.
Hier nutzen wir die `isLoading` um den Status der Suchanfrage festzuhalten und anzuzeigen.
Bisher funktioniert die Anzeige des Zustands nur, weil die Change Detection von Angular über Zone.js informiert wird, dass es eine Änderung am Property `isLoading` gab.
Würden wir Zone.js entfernen oder die Change Detection auf `OnPush` umstellen, müssten wir selbst dafür sorgen, Angular mitzuteilen, dass der entsprechende Teil des Templates neu gerendert werden soll.

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

Wir können hier Gebrauch von einem Signal machen, um Änderungen direkt sichtbar zu machen (Ohne Verwendung von Zone.js bzw. manuelles Triggern der Change Detection).
Dafür setzen wir den Wert des Signals initial auf `false` und ändern ihn über `set(<value>)`.

```ts
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

Da im Property `isLoading` nun ein Signal steckt, müssen wir noch unser Template anpassen.
Hier müssen die Klammern (`()`) nach dem `isLoading` ergänzt werden.
Der Angular Language Service informiert uns hier auch, sollten wir das einmal vergessen.

```html
<input type="search"
  autocomplete="off"
  aria-label="Search"
  [class.loading]="isLoading()"
  #searchInput
  (input)="input$.next(searchInput.value)">
```

### Observables in Signals konvertieren

Im nächsten Schritt werfen wir einen Blick auf die `BookListComponent`.
Hier nutzen wir bisher die AsyncPipe, um die Daten aus dem Observable mit Büchern anzuzeigen.

```ts
@Component({
  /* ... */
  imports: [AsyncPipe, /* ... */],
})
export class BookListComponent {
  books$ = inject(BookStoreService).getAll();
}
```

Mit der Hilfsfunktion `toSignal()` aus `@angular/core/rxjs-interop` können wir das Observable in ein Signal umwandeln.
Damit müssen wir weder die `AsyncPipe` importieren noch manuell auf das Observable subscriben.

```ts
import { toSignal } from '@angular/core/rxjs-interop';
// ...

@Component({ /* ... */ })
export class BookListComponent {
  books = toSignal(inject(BookStoreService).getAll());
}
```

Im Template rufen wir entsprechend das Signal auf:

```html
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

Jetzt wollen wir noch unseren `AuthService` umbauen.
Dieser soll künftig den Status der Authentifizierung sowohl als Signal (`isAuthenticated`) als auch als Observable (`isAuthenticated$`) ausgeben.
Wir können hier auf das bisher verwendete `BehaviorSubject` verzichten und nutzen Signals als Basis.
Die Ausgabe als Observable können wir elegant über die Hilfsfunktion (`toObservable`) aus `@angular/core/rxjs-interop` erwirken.

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

Die Aufrufe von `isAuthenticated` in den Dateien `app.component.html`, `auth.guard.ts` und `auth.interceptor.ts` müssen nun entsprechend auch um die Klammern erweitert werden (`isAuthenticated()`).
Die Direktive `LoggedinOnlyDirective` können wir in diesem Zuge auch noch weiter vereinfachen.
Hier können wir auf das Konstrukt aus Observable und `takeUntil(this.destroy$)` verzichten und stattdessen einen Effect nutzen, der auslöst, wenn sich der Wert des Signals `isAuthenticated` ändert.
Ein Effekt reagiert auf Änderungen an den Signals, die wir in der Effekt-Funktion verwenden.
Sobald sich einer der Eingabewerte ändert, wird die Berechnung erneut durchgeführt.
Auf den Lifecycle-Hook `OnDestroy` können wir somit auch komplett verzichten.

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

### Signal Inputs

Mit dem Minor-Release von Angular 17.2.0 wurde eine Alternative zum bisherigen `@Input()`-Dekorator [aus Basis von Signals eingeführt](https://blog.angular.io/signal-inputs-available-in-developer-preview-6a7ff1941823).

```ts
isbn = input() // InputSignal<unknown>
isbn = input<string>() // InputSignal<string | undefined>
isbn = input.required() // InputSignal<unknown>
isbn = input.required<string>() // InputSignal<string>
isbn = input('3864909465') // InputSignal<string>
```

Wir können in unserer Anwendung an einigen Stellen auf die neuen Signal-based Inputs umstellen.

Als Beispiel wollen wir die `FormErrorsComponent` nutzen.
Wir nutzen hier jeweils `input.required()`, da beide Informationen zwingend bei Verwendung der Komponente gesetzt werden müssen.

```ts
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

Nicht immer wollen wir, dass der Name des Input Signals in der Komponente dem Namen bei der Verwendung im Template entspricht.
In diesem Fall können wir einen `alias` konfigurieren.
Wir sehen uns das am Beispiel der `ConfirmDirective` an.
Hier wollen wir innerhalb der Komponente mit dem Property `confirmText` arbeiten.
Nach außen, wollen wir das Input-Signal jedoch gegen den Selector `bmConfirm` der Direktive selbst binden.
Durch die Angabe des Alias wird uns dies ermöglicht.

```ts
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

## Functional Outputs

Mit der Minor-Version Angular 14.3.0 steht und auch eine Alternative zum bisherigen `@Output`-Dekorator im Developer Preview bereit.
Die neuen funktionsbasierten Outputs sind stark and die neuen Signal Inputs angelehnt und kommen mit einer verbesserten Typisierung ggü. der bisherigen API basierend auf Dekoratoren.

```ts
select = output() // OutputEmitterRef<void>
isbnChange = output<string>() // OutputEmitterRef<string>

// ...

this.select.emit(); // OK
this.isbnChange.emit(); // Error: Expected 1 arguments, but got 0.
this.isbnChange.emit('3864909465'); // OK
```

Auch hier können wir die `ConfirmDirective` migrieren.
Auch hier rufen wir auf dem Output `emit()` auf.

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

## Verwendung der Direktive `NgOptimizedImage`

Bereits mit Angular 14.2 hat uns das Angular Team eine Direktive zur optimierten Einbindung von Bildern bereitgestellt: `NgOptimizedImage`.
Wir haben hierzu bereits im Blogpost [Angular 15 ist da!](/blog/2022-11-angular15#image-directive-optimierte-verwendung-von-bildern) berichtet.

Wir wollen nun Gebrauch von der Direktive machen.

Wir starten mit der `BookListItemComponent`.
Hier importieren wir zunächst die Direktive, damit wir sie im Template nutzen können:

```ts
import { NgOptimizedImage } from '@angular/common';
// ...

@Component({
  // ...
  imports: [RouterLink, IsbnPipe, NgOptimizedImage]
})
// ...
```

Im Anschluss ersetzen wir auf dem `<img>` element das `src` Attribut mit `ngSrc`.
Das Bild wird standardmäßig "lazy" geladen und blockiert somit nicht das Laden der gesamten Buchliste.
Damit die Optimierung klappt und wir Layoutverschiebungen vermeinden, müssen wir noch die erwartete Größe des Bildes mit angeben.
Somit kann bereits vorab der Platz zur Anzeige des zu ladenden Bildes reserviert werden.

```html
<!-- ... -->
<img alt="Cover" [ngSrc]="thumbnail" width="120" height="175">
<!-- ... -->
```

Bei der Detailansicht der Bücher in der BookDetailsComponent gehen wir ähnlich vor.
Wir importieren dir Direktive und passen das Template an.
Hier setzen wir jedoch zusätzlich das property `priority`, da wir das Buchcover hier mit hoher Priorität laden wollen.

```html
<!-- ... -->
<img alt="Cover" [ngSrc]="book.thumbnailUrl" width="200" height="250" priority>
<!-- ... -->
```

Werfen wir einen Blick in
Damit das Property `priority` Wirkung zeigt, benötigen wir noch

```html
<!doctype html>
<html lang="en">
<head>
  <!-- ... -->
  <link rel="preconnect" href="https://cdn.ng-buch.de">
</head>
<!-- ... -->
```

## `styleUrls` -> `styleUrl`

Zum Abschluss wollen wir noch eine eher kosmetische Änderung durchführen.
Angular unterstützt neben der Referenzierung von Stylesheets unter `styleUrls` im Komponenten-Dekorator nun auch die Angabe einer einzelnen `styleUrl` asl String.
Da wir lediglich ein Stylesheet referenzieren benötigen wir hier die bisherige Notation in Form eines Array nicht.

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

Nutzen wir zum Beispiel Visual Studio Code als Editor, können wir die Migration ganz einfach über die Suche eines regulären Ausdrucks vollziehen:

- Suche: `styleUrls: \[(.*)\]` (Die Option "regulärer Ausdruck" muss aktiviert sein)
- Ersetzen: `styleUrl: $1`

## Demo & Repo

Geschafft, wir haben jetzt den BookMonkey auf die neusten Konzepte und Features von Angular migriert.
Wie wir sehen hat sich in den letzten Major-Versionen von Angular viel bewegt.

Den Quellcode bzw. die Änderungen und die Demo findest du unter:

- [BookMonkey Demo](https://18-modern-angular-bm5.angular-buch.com/)
- [Repo: 17-standalone (Ausgangsbasis)](https://github.com/book-monkey5/17-standalone)
- [Repo: 18-modern-angular (Migration)](https://github.com/book-monkey5/18-modern-angular)
- [Differenzansicht (17-standalone -> 18-modern-angular)](https://book-monkey5.angular-buch.com/diffs/18-modern-angular.html)
