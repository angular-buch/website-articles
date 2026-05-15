---
title: 'Resolvers: Daten beim Routing vorladen'
published: 2026-05-15
lastModified: 2026-05-15
---

Der Angular-Router bietet mit *Resolvers* die Möglichkeit, Daten asynchron vorzuladen, bevor eine Komponente aktiviert wird.
Hier betrachten wir die Funktionsweise, Implementierung und den Zugriff auf die aufgelösten Daten in der Komponente.
Außerdem diskutieren wir, wann Resolvers sinnvoll sind – und wann nicht.

## Inhalt

[[toc]]

## Motivation

Asynchrone Operationen wie HTTP-Requests lösen wir in Angular üblicherweise direkt in der Komponente auf.
Dafür gibt es verschiedene Möglichkeiten:
Wir können die moderne Resource API einsetzen oder den `HttpClient` direkt verwenden und subscriben.
Die Funktion `toSignal()` und die AsyncPipe helfen uns bei der Arbeit mit Observables.
Die Komponente ist dabei sofort sichtbar, und wir können einen Ladeindikator anzeigen, während die Daten eintreffen.

Als Alternative bietet der Router sogenannte *Resolvers* an, um Daten schon vor dem Start der Komponente asynchron vorzuladen.
Wir geben also die Verantwortung für das Laden der Daten an den Router ab, und die Daten sind in der Komponente sofort und synchron verfügbar.


## Das UX-Problem mit Resolvers

Resolvers sind einfach zu verwenden – aber sie haben ein grundlegendes Problem:
Der Router wartet auf die asynchrone Operation, bevor die Route aktiviert wird.

Stell dir einen langsamen HTTP-Request vor.
Nach dem Klick auf einen Link startet der Request, aber die Navigation wird erst abgeschlossen, wenn die Antwort eintrifft.
Dauert der Request 5 Sekunden, dauert auch die Navigation 5 Sekunden.
In dieser Zeit sieht der User keine Reaktion – und klickt womöglich mehrfach auf den Link.

Dieses Verhalten widerspricht der Grundidee einer Single-Page-Anwendung:
Eine SPA sollte immer schnell reagieren und die Daten zur Laufzeit nachladen.
Mit Resolvers kehren wir zum Verhalten einer klassischen serverseitig gerenderten Seite zurück: Klick, warten, weiter.

### Die bessere Alternative: Daten direkt in der Komponente laden

Ohne Resolvers wird die Komponente sofort angezeigt, und die Daten werden im Hintergrund geladen.
Während der Ladezeit können wir einen Ladeindikator oder Platzhalter-Elemente (Ghost Elements) anzeigen.
Die Navigation ist sofort abgeschlossen, und der User erhält unmittelbares Feedback.

Mit der `resource()`-API oder `httpResource()` geht das besonders elegant:

```typescript
@Component({ /* ... */ })
export class MyComponent {
  private service = inject(BookStoreService);
  booksResource = this.service.getAllAsResource();
}
```

Alternativ können wir Observables mit `toSignal()` in ein Signal umwandeln und im Template nutzen:

```typescript
@Component({
  template: `
    @if (books().length) {
      <app-book-list [books]="books()" />
    } @else {
      <p>Laden...</p>
    }
  `,
})
export class MyComponent {
  books = toSignal(inject(BookStoreService).getAll(), { initialValue: [] });
}
```

In beiden Fällen ist die Komponente sofort sichtbar, und die Daten werden asynchron nachgeladen.
Das ist fast immer die bessere Wahl gegenüber einem Resolver.

## Einen Resolver definieren

Ein Resolver wird als Funktion mit dem Typ `ResolveFn<T>` definiert.
Der generische Typparameter `T` gibt an, welchen Datentyp das Ergebnis besitzt.
Die Funktion muss ein Observable, eine Promise oder einen direkten Wert zurückliefern.

Als Argumente erhält die Funktion die aktuelle Route in Form eines `ActivatedRouteSnapshot` und den Zustand des Routers als `RouterStateSnapshot`.
Wir können also z. B. Routenparameter auslesen und diese bei der Datenabfrage verarbeiten.

Alle Abhängigkeiten fordern wir mithilfe von `inject()` an.
Das Observable mit dem Ergebnis geben wir direkt aus der Funktion zurück – um die Subscription kümmert sich der Router automatisch.

Das folgende Beispiel zeigt einen Resolver, der eine Buchliste mithilfe des Service `BookStore` bereitstellt:


Um eine Resolver-Funktion zu generieren, können wir die Angular CLI nutzen:

```bash
ng generate resolver books
```

## Resolver in der Route registrieren

Damit der Resolver verwendet wird, muss er in der Routenkonfiguration registriert werden.
In der Eigenschaft `resolve` geben wir ein Objekt an, in dem alle Resolvers notiert sind.
Der Schlüssel in diesem Objekt (hier: `books`) ist frei wählbar.
Unter diesem Namen rufen wir die Daten anschließend in der Komponente ab.

```typescript
{
  path: 'mypath',
  component: MyComponent,
  resolve: {
    books: booksResolver
  }
}
```

Sobald die Route aufgerufen wird, erstellt der Router automatisch eine Subscription auf das Observable, und die Daten werden abgerufen und gespeichert.
Erst dann wird die Komponente geladen.
Der Router wartet also, bis die asynchrone Operation abgeschlossen ist!

## Auf die Daten in der Komponente zugreifen

Es gibt zwei Wege, um in der Komponente auf die aufgelösten Daten zuzugreifen.

### Ansatz 1: ActivatedRoute

Die aufgelösten Daten sind über `ActivatedRoute` verfügbar.
Das Property `data` auf der Route enthält ein Observable, das die Daten aller Resolvers bereitstellt.
Die Schlüssel entsprechen den Namen, die wir im `resolve`-Objekt der Routenkonfiguration festgelegt haben.

```typescript
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ /* ... */ })
export class MyComponent {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);

  books = computed(() => this.data()?.books as Book[]);
}
```

### Ansatz 2: Component Input Binding (empfohlen)

Seit Angular 16 gibt es die Möglichkeit, aufgelöste Daten direkt als Inputs an die Komponente zu übergeben.
Dazu muss `withComponentInputBinding()` bei der Router-Konfiguration aktiviert sein:

```typescript
import { provideRouter, withComponentInputBinding } from '@angular/router';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ],
});
```

In der Komponente definieren wir dann einen Input, dessen Name dem Schlüssel aus dem `resolve`-Objekt entspricht:

```typescript
import { Component, input } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  books = input.required<Book[]>();
}
```

Dieser Ansatz ist typsicherer und eleganter, weil wir die `ActivatedRoute` nicht injizieren müssen.

## Fehlerbehandlung

Wenn ein Resolver fehlschlägt, wird standardmäßig ein `NavigationError` ausgelöst und die Navigation abgebrochen.
Das führt zu einer schlechten User Experience.
Deshalb sollten wir Fehler in Resolvers immer behandeln.

### Fehler direkt im Resolver abfangen

Wenn der Resolver mit Observables arbeitet, können wir mit dem RxJS-Operator `catchError` arbeiten und bei einem Fehler z. B. eine Weiterleitung auslösen.
Dazu kann der Resolver ein `RedirectCommand` zurückgeben.

```typescript
import { inject } from '@angular/core';
import { ResolveFn, RedirectCommand, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

export const booksResolver: ResolveFn<Book[] | RedirectCommand> =
  (route, state) => {
    const service = inject(BookStoreService);
    const router = inject(Router);

    return service.getAll().pipe(
      catchError(error => {
        console.error('Failed to load books:', error);
        return of(new RedirectCommand(router.parseUrl('/error')));
      })
    );
  };
```

### Zentrale Fehlerbehandlung mit `withNavigationErrorHandler()`

Alternativ können wir einen zentralen Error-Handler für alle Navigationsfehler registrieren:

```typescript
import { provideRouter, withNavigationErrorHandler } from '@angular/router';

provideRouter(
  routes,
  withNavigationErrorHandler(error => {
    const router = inject(Router);
    console.error('Navigation error:', error.message);
    router.navigate(['/error']);
  })
);
```

## Resolver für den Seitentitel

Im Kapitel zum Routing haben wir gezeigt, wie wir den Titel der Seite in der Routenkonfiguration mit dem Property `title` setzen können.
Dabei haben wir stets einen statischen Titel übergeben.

Wollen wir den Seitentitel hingegen dynamisch setzen, können wir einen Resolver verwenden.
Der Resolver muss dafür zu einem String auflösen.
Zum Beispiel können wir den Buchtitel anhand der ISBN aus dem Routenparameter ermitteln:

```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const bookTitleResolver: ResolveFn<string> =
  (route, state) => {
    const service = inject(BookStore);

    const isbn = route.paramMap.get('isbn')!;
    return service.getTitleByISBN(isbn);
  };
```

Diesen Resolver geben wir dann in der Route im Property `title` an.
Das Observable wird automatisch vom Router aufgelöst, und der Seitentitel wird gesetzt:

```typescript
{
  path: 'books/:isbn',
  component: BookDetailsPage,
  title: bookTitleResolver
}
```

Dabei ist zu beachten, dass der Router auch hier auf das Ergebnis wartet, bevor die Komponente geladen wird.

## Aufgelöste Daten in Kind-Resolvers verwenden

Resolvers werden von der Elternroute zur Kindroute ausgeführt.
Wenn eine Elternroute einen Resolver definiert, sind die aufgelösten Daten in Kind-Resolvers verfügbar:

```typescript
provideRouter([
  {
    path: 'users/:id',
    resolve: { user: userResolver },
    children: [
      {
        path: 'posts',
        component: UserPostsPage,
        resolve: {
          posts: (route: ActivatedRouteSnapshot) => {
            const postService = inject(PostService);
            const user = route.parent?.data['user'] as User;
            return postService.getPostsByUser(user.id);
          },
        },
      },
    ],
  },
]);
```

## Ladeindikator während der Navigation anzeigen

Da Resolvers die Navigation blockieren, kann es sinnvoll sein, einen globalen Ladeindikator anzuzeigen.
Dazu können wir den Navigationszustand des Routers überwachen:

```typescript
import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Wird geladen …</div>
    }
    <router-outlet />
  `,
})
export class App {
 #router = inject(Router);
  protected readonly isNavigating = computed(() => !!this.#router.currentNavigation());
}
```

## Best Practices

- **Resolvers sparsam verwenden:** Der Router wartet auf die asynchrone Operation und lädt die Komponente erst, wenn das Ergebnis vorliegt. Das widerspricht dem gewohnten Verhalten einer Single-Page-Anwendung, die schnell reagiert und die Daten zur Laufzeit nachlädt.
- **Keine regulären Nutzdaten laden:** HTTP-Requests können eine längere Zeit in Anspruch nehmen. Nutze stattdessen den herkömmlichen Weg und lade die Daten direkt in den Komponenten.
- **Fehler behandeln:** Fange Fehler im Resolver ab, um eine schlechte User Experience zu vermeiden.
- **Caching nutzen:** Speichere aufgelöste Daten zentral (z. B. in einem Service oder Store), damit sie nicht doppelt geladen werden müssen.
- **Ladeindikator anzeigen:** Da die Navigation blockiert wird, solltest du dem User visuelles Feedback geben.
- **Nur für besondere Fälle:** Resolvers sollten nur eingesetzt werden, wenn Daten unbedingt beim Start der Komponente benötigt werden und der Router aus gutem Grund den weiteren Ablauf verzögern soll.

## Wann sind Resolvers sinnvoll?

Angesichts der beschriebenen UX-Probleme stellt sich die Frage: Gibt es überhaupt einen guten Anwendungsfall für Resolvers?

Ein valider Einsatz ist das Vorladen von Daten, die *sofort* verfügbar sind – z. B. gecachte Konfigurationsobjekte.
Wenn die Daten bereits im Speicher liegen und kein HTTP-Request mehr nötig ist, blockiert der Resolver die Navigation nicht spürbar.

Ein Beispiel: Wir haben einen `ConfigService`, der die Konfiguration beim Start der Anwendung einmalig lädt und anschließend aus dem Cache liefert:

```typescript
import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs';

@Service()
export class ConfigService {
 #http = inject(HttpClient);

  readonly config$ = this.#http.get<AppConfig>('/api/config').pipe(
    shareReplay(1)
  );
}
```

Der zugehörige Resolver gibt einfach das gecachte Observable zurück:

```typescript
export const configResolver: ResolveFn<AppConfig> =
  () => inject(ConfigService).config$;
```

Beim ersten Aufruf wird der HTTP-Request ausgeführt.
Bei allen weiteren Navigationen liefert der Operator `shareReplay()` das Ergebnis sofort aus dem Cache – die Navigation wird also nicht verzögert.

Aber auch hier gilt: Wir könnten den `ConfigService` genauso gut direkt in der Komponente injizieren und das `config$`-Observable dort nutzen.
Ein Resolver ist also selbst in diesem Fall nicht zwingend notwendig.

## Empfehlung

Resolvers sind ein nützliches Werkzeug im Angular-Router, aber die Anwendungsfälle sind selten.
Für die allermeisten Szenarien ist der reaktive Ansatz – Daten direkt in der Komponente laden und mit `resource()`, `httpResource()` oder `toSignal()` verarbeiten – die bessere Wahl.

Wenn du Resolvers in deiner Codebasis hast und sie gut funktionieren: prima!
Wenn du überlegst, Resolvers neu einzuführen, prüfe zuerst, ob ein reaktiver Ansatz nicht einfacher und benutzerfreundlicher ist.

## Zusammenfassung

- Ein Resolver ist eine Funktion vom Typ `ResolveFn<T>`, die ein Observable, eine Promise oder einen direkten Wert zurückgibt.
- Abhängigkeiten werden mit `inject()` angefordert.
- Der Resolver wird in der Routenkonfiguration unter `resolve` registriert.
- Die aufgelösten Daten können über `ActivatedRoute` oder über Component Input Binding (`withComponentInputBinding()`) abgerufen werden.
- Für den dynamischen Seitentitel kann ein Resolver im Property `title` der Route angegeben werden.
- Resolvers blockieren die Navigation. Deshalb sollten sie sparsam und nur für essenzielle Daten eingesetzt werden.
- Fehler in Resolvers sollten immer behandelt werden, z. B. mit `catchError()` oder `withNavigationErrorHandler()`.
