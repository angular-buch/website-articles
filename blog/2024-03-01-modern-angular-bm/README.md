---
title: 'Book Monkey v5: Modern Angular'
author: Danny Koppenhagen
mail: mail@k9n.dev
published: 2024-03-01
lastModified: 2024-03-01
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

Mit den letzten Angular Versionen 15, 16 und 17 wurden viele neue Konzepte und Features eingeführt.
In diesem Blogpost wollen wir unser Beispielprojekt auf die neuesten Konzepte und Features von Angular updaten und auf die praktische Umsetzung und der Verwendung automatischer Migrationen eingehen.

Unter der Haube wurde das Build-System mit dem neuen Application Builder auf ESBuild mit Vite umgestellt und gleichzeitig mit dem Builder für SSR verschmolzen.
Standalone Features sind mittlerweile stark etabliert und Standard in jeder neuen Angular Anwendung.
Module hingegen sind optional und werden früher oder später vermutlich ganz aus Angular verschwinden.
Auch beim Thema Dependency Injection geht der Trend vermehrt zur Nutzung der `inject()` Funktion statt der herkömmlichen Konstruktor-Injection.
Interceptoren, Guards und Resolver werden Stand heute vorzugsweise als simple Funktionen erstellt.
Auch bei der Template Syntax wird der Control Flow künftig der präferierte Weg sein um Verzweigungen und Schleifen abzubilden.
Signals werden in immer mehr APIs von Angular integriert und die Verwendung wird mehr und mehr adaptiert.
Zu Guter letzt sind mit den letzten Major-Versionen auch Features wie die View Transition API als auch die `NgOptimizedImage` bereitgestellt worden.

Die einzelnen Features haben wir bereits separat in den jeweiligen Artikeln zu den Major-Releases vorgestellt:

- [Angular 16 ist da!](/blog/2023-05-angular16)
- [Angular 17 ist da!](/blog/2023-11-angular17)

Dem Thema SSR mit Angular 17 hatten wir bereits einen separaten Artikel gewidmet:

- [Book Monkey v5: Server-Side Rendering mit Angular 17](/blog/2023-11-ssr-bm)
<!--
- [Angular 18 ist da!](/blog/2024-06-angular18)
-->

## Die Ausgangsbasis

Als Ausgangsbasis wollen wir das Projekt _BookMonkey_ nutzen, welches wir im Angular Buch entwickeln.
Hier setzen wir auf dem Stand auf, bei dem bereits eines unserer Feature-Module auf Standalone Components migriert wurde:

- [BookMonkey: 17-standalone](https://github.com/book-monkey5/17-standalone)

Sollten Sie nicht mit dem Buch gearbeitet haben, können sie gern trotzdem ab hier starten und sich den Quellcode aus dem oben aufgeführten Repository zum Start herunterladen.:

```sh
git clone git@github.com:book-monkey5/17-standalone.git
cd 17-standalone && npm i
```

Die Schritte werden im folgenden einzeln beschrieben, sodass sie sich auch ideal auf andere Projekte abbilden lassen.

> Die Schritte beziehen sich auf die Verwendung von Angular 17.2 oder höher

## `inject()` statt Konstruktor Injection

Wir wollen mit der konsistenten Umsetzung der Dependency Injection mit `inject()` starten.
Seit Implementierung der `inject()` Funktion mit [Angular 14](/blog/2022-06-angular14) wird diese vermehrt von der Community verwendet.
In einigen Situationen (zum Beispiel bei Verwendung von Functional Guards/Resolvers oder Interceptors) kommen wir um die Verwendung ohnehin nicht herum.

Die Vorteile der Nutzung von `inject()` ggü. der Konstruktor Injection liegen auf der Hand:

- Vermeidung von Konflikten zwischen der TypeScript und JavaScript-Implementierung von Klassen (Stichwort: `useDefineForClassFields`, wir haben hierzu bereits einen [separaten Artikel verfasst](/blog/2022-11-use-define-for-class-fields))
- Konsistenz: Nutzung eines einheitlichen Stils
- Nutzung auch innerhalb von Funktionen (im Injection Kontext) möglich

Um alle Stellen zur Migration zu finden, suchen wir am besten im gesammten Projekt nach `constructor(`.

Schauen wir uns das Ganze am Beispiel der `LoggedinOnlyDirective` an.
Diese sieht vor der Migration wie folgt aus:

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

Wir müssen nun `inject()` importieren und übergeben hierbei das ProviderToken, welches zuvor über den Konstruktor angefordert wurde.

```ts
import { /* ... */, inject } from '@angular/core';
// ...
@Directive({ /* ... */ })
export class LoggedinOnlyDirective implements OnDestroy {
  // ...
  private template = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  constructor() {
    // ...
  }
  // ...
}
```

Bei Komponenten, wo der Konstruktor nach die Migration keinerlei Funktion mehr at, können wir diesen im Anschluss ersatzlos entfernen.

## Standalone Migration

Im nächsten Schritt wollen wir konsistent auf die Verwendung der Standalone APIs setzen.
Hierzu müssen wir noch folgende Anpassungen durchführen:

1. Migration der restlichen Komponenten auf `standalone: true` (`SearchComponent`, `HomeComponent`, gesamtes `AdminModule` mit allen Komponenten)
2. Bootstrapping der `AppComponent` (ohne `AppModule`)
3. Entfernen aller nicht mehr benötigten Module

Eine Ganze Menge Arbeit liegt hier vor uns, wenn wir diese Schritte manuell durchführen wollen.
Die Gute Nachricht ist:
Mittlerweile hat das Angular Team an einer automatischen Migration vieler dieser Schritte gearbeitet.

```sh
ng generate @angular/core:standalone
```

Im Anschluss werden wir aufgefordert einen der drei Migrationsschritte auszuwählen.

```txt
? Choose the type of migration: (Use arrow keys)
❯ Convert all components, directives and pipes to standalone
  Remove unnecessary NgModule classes
  Bootstrap the application using standalone APIs
```

### Komponenten, Direktiven und Pipes

Wir starten mit der ersten Option zur Migration aller Komponenten, Direktiven und Pipes.

Im Anschluss prüfen wir noch einmal alle durchgeführten Änderungen.
Diese sollten nun das Flag `standalone: true` haben und die benötigten Abhängigkeiten importieren.
Die `HomeComponent` sieht nach der Migration zum Beisiel wie folgt aus:

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

Weiterhin wurden durch die Migration die Komponenten, Direktiven und Pipes aus den `declarations`-Abschnitten der noch vorhandenen Module entfernt und in die `imports` verschoben.

### Bootstrapping mit Standalone API

Als nächstes wählen wir die Option zu Migration des _Bootstrapings_ der Anwendung unter Verwendung der Standalone API.
Hierbei wird bereits unser `AppModule` entfernt und in der `main.ts` wird die Funktion `bootstrapApplication` genutzt.


```ts
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
// ...

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
}).catch(err => console.error(err));
```

### NgModules entfernen

Jetzt haben wir noch drei Module in unserer Anwendung:

- `AppRoutingModule`
- `AdminModule`
- `AdminRoutingModule`

In unserem Test ließen sich diese Module nicht automatisch mit der Code Migration auflösen und wir müssen hier manuell Hand anlegen.

Wir starten mit dem `AppRoutingModule`.
Aus diesem extrahieren wir die Konstante `routes` in eine separate Datei `app.routes.ts` und exportieren die Routen.

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

Im Anschluss passen wir die Datei `main.ts` an.
Hier nutzen wir nun die Funktion `provideRouter` des Angular Routers und übergeben ihr die Routenkonfiguration:

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

Das `AppRoutingModule` benötigen wir nun nicht mehr.
Wir können entsprechend die Datei `app-routing.module.ts` löschen.

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
Der Aufruf von `ng generate @angular/core:control-flow` führt die Migration der Template Syntax durch und entfernt im Nachgang auch automatisch die unnötigen Importe der Direktiven `NgIf` und `NgForOf`.

Bitte prüfen Sie hier noch einmal alle Änderungen ausgiebig.

Nach der Ausführung können wir noch zwei Punkte an den Komponenten `BookListComponent` und `SearchComponent` optimieren.
Da wir über in diesen Komponenten jeweils über ein Array von Objekten iterieren, sollten wir idealerweise immer das Attribut eines jeden Objekts tracken, welches möglichst individuell ist.
Im Fall unserer Bücher eignet sich hier die ISBN-Nummer am besten.
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

// TODO

## NgOptimizedImage

// TODO
