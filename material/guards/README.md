---
title: 'Guards: Routen absichern'
published: 2026-05-23
lastModified: 2026-05-23
---

Normalerweise kann jede Route einer Angular-Anwendung uneingeschränkt betreten und wieder verlassen werden.
In komplexeren Anwendungen gibt es allerdings Bereiche, die nur unter bestimmten Umständen aufgerufen werden sollen – z. B. abhängig von Authentifizierung, Berechtigungen oder dem Zustand der Anwendung.
Der Angular-Router bietet dafür ein Feature an, mit dem wir Routen absichern können: *Route Guards*.

## Inhalt

[[toc]]

## Grundlagen zu Guards

Ein Guard ist eine Funktion, die entscheidet, ob ein Navigationsschritt ausgeführt werden darf oder nicht.
Routen können von Guards „beschützt" werden, sodass stets der Guard durchlaufen werden muss, bevor die Navigation tatsächlich ausgeführt wird.
Auf diese Weise können Guards die Nutzerführung in der Anwendung steuern.

Die Entscheidung, ob die Navigation durchgeführt wird, wird durch den Rückgabewert der Guard-Funktion ausgedrückt.
Dafür sind diese Varianten möglich:

- `true`: Die Navigation wird **ausgeführt**.
- `false`: Die Navigation wird **abgebrochen**.
- Typ `UrlTree` oder `RedirectCommand`: Die Navigation wird **abgebrochen**, und es wird zu einer anderen Route navigiert.

Dieser Rückgabewert kann synchron aus der Funktion zurückgegeben werden, oder er kann in ein Observable oder in eine Promise verpackt werden.
Damit ist es möglich, asynchrone Operationen im Guard zu verarbeiten: Zum Beispiel kann ein HTTP-Request durchgeführt werden, dessen Antwort entscheidet, ob navigiert werden darf.

> ⚠️ **Wichtig:** Guards steuern die Nutzerführung, aber sie sind kein Sicherheitsfeature!
> Der gesamte kompilierte Code der Anwendung kann vom Browser jederzeit heruntergeladen werden.
> Die Sicherheit der Daten muss immer vom Backend ausgehen: Nur wenn der Client authentifiziert ist, darf der Server die Daten herausgeben oder geschützte Aktionen durchführen.
> Guards helfen uns, abhängig von diesen Zuständen die Nutzerführung zu steuern.

## Varianten von Guards

Wir unterscheiden verschiedene Arten von Guards, mit denen wir unsere Routen absichern können:

| Variante | entscheidet, ob … |
|----------|-------------------|
| `CanActivate` | eine Route betreten werden darf |
| `CanActivateChild` | Kind-Routen einer Route betreten werden dürfen |
| `CanDeactivate` | eine Route verlassen werden darf (wegnavigieren) |
| `CanMatch` | eine Route bei der Auswertung berücksichtigt wird |

Ein Guard wird immer als Funktion entwickelt, die einer bestimmten Signatur folgt.

## Guards verwenden

Haben wir eine Guard-Funktion entwickelt, können wir sie auf unsere Routen anwenden:
Guards werden als Eigenschaft einer Routendefinition angegeben und wirken als eine Art Middleware.
Die verwendete Eigenschaft deutet immer auf die Art des Guards hin, z. B. `canActivate`.
Die Guards werden als Array aufgelistet, denn es können auch mehrere Guards für eine Route festgelegt werden.
In diesem Fall werden sie der Reihe nach durchlaufen.

```typescript
export const routes: Routes = [
  {
    path: 'foo',
    component: FooPage,
    canActivate: [myActivateGuard]
  },
  {
    path: 'bar',
    component: BarPage,
    canDeactivate: [leaveGuard]
  }
];
```

Rufen wir z. B. die Route mit dem Pfad `foo` auf, wird zunächst die Guard-Funktion `myActivateGuard` ausgeführt.
Liefert sie den Wert `true` zurück, wird die Route geladen, andernfalls wird die Navigation abgebrochen.
Gibt der Guard einen `UrlTree` oder ein `RedirectCommand` zurück, so wird eine neue Navigation zu der neuen Route gestartet.

## Guards implementieren

Ein Guard wird als Funktion implementiert, die einer bestimmten Typisierung folgt.
Durch den Typ wird die Signatur der Funktion festgelegt, sodass der Router sicher mit dem Guard arbeiten kann.
Je nach Guard-Variante nimmt die Funktion verschiedene Argumente entgegen.

Zum Anlegen eines Guards können wir die Angular CLI verwenden:

```bash
ng generate guard foo --guardType CanActivate
ng generate guard bar --guardType CanMatch
```

### CanActivate: Darf die Route aktiviert werden?

Mit einem `CanActivate`-Guard können wir prüfen, ob eine bestimmte Route betreten werden darf.
Wir verwenden den Typ `CanActivateFn`, um die Guard-Funktion zu typisieren.
Sie kann zwei Argumente entgegennehmen:

- `ActivatedRouteSnapshot`: Informationen zur angefragten Route, z. B. Routenparameter.
- `RouterStateSnapshot`: Der gesamte Zustand des Routers.

Wollen wir im Guard auf Services zugreifen, z. B. um die Entscheidung abhängig von einem zentralen Zustand zu machen, verwenden wir die Funktion `inject()`.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const myActivateGuard: CanActivateFn =
  (route, state) => {
    // Routenparameter lesen
    const foo = route.paramMap.get('foo');

    // Service injizieren
    const authService = inject(AuthService);

    // Entscheidung treffen (true / false)
    return authService.isAuthenticated();
  };
```

### Umleitung mit `UrlTree`

Wenn eine Navigation nicht erlaubt ist, kann es sinnvoll sein, stattdessen zu einer anderen Route umzuleiten.
Dafür können wir aus dem Guard ein Objekt vom Typ `UrlTree` zurückgeben.
Ein `UrlTree` ist die interne Repräsentation einer Route und gibt dem Router die Anweisung, zu dieser Route zu navigieren.
Er lässt sich mithilfe des Routers erzeugen: Die Methode `Router.parseUrl()` wandelt eine URL in einen `UrlTree` um:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Variante 1: nur true/false
export const myActivateGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/login');
};
```

Alternativ können wir einen `UrlTree` auch mit der Methode `Router.createUrlTree()` erzeugen.
Hier übergeben wir ein Array von Routensegmenten.
Außerdem können wir im zweiten Argument ein Objekt mit weiteren Optionen notieren, z. B. den Bezugspunkt für eine relative URL.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Variante 2: Umleitung über UrlTree
export const myActivateGuard: CanActivateFn = () => {
  // ...
  const router = inject(Router);
  return router.createUrlTree(['login']);
};
```

### Umleitung mit RedirectCommand

Seit Angular 18 gibt es eine weitere Möglichkeit, eine Umleitung aus einem Guard heraus auszulösen: das `RedirectCommand`.
Im Gegensatz zum `UrlTree` können wir damit zusätzliche Navigationsoptionen angeben, z. B. `replaceUrl` oder `skipLocationChange`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';

// Variante 3: Umleitung über RedirectCommand mit Navigationsoptionen
export const myActivateGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  const router = inject(Router);
  const urlTree = router.parseUrl('/login');
  return new RedirectCommand(urlTree, { replaceUrl: true });
};
```

### Warum `UrlTree` statt `Router.navigate()`?

Theoretisch könnten wir aus dem Guard heraus auch direkt die Methode `Router.navigate()` aufrufen, um zu einer anderen Route zu wechseln.
Praktisch hat der `UrlTree` (bzw. das `RedirectCommand`) allerdings einen entscheidenden Vorteil, wenn mehrere Guards aktiv sind, die asynchron arbeiten.
In einer solchen Konstellation ist nie klar, welcher der Guards wann eine Antwort liefert und damit über das Ziel der Navigation entscheidet.

Verwenden wir einen `UrlTree` als Rückgabewert, verhält sich der Router deterministisch:
Die Guards, die näher an der Wurzel der Routenhierarchie aktiv sind, haben eine höhere Priorität als die Guards, die tiefer im Baum platziert sind.
Der Router kümmert sich um die Priorisierung und Weiterleitung.

Verwende deshalb bitte immer einen `UrlTree` oder ein `RedirectCommand`, um aus einem Guard heraus zu einer anderen Route zu navigieren.

### CanDeactivate: Darf die aktive Route verlassen werden?

Mit einem `CanDeactivate`-Guard können wir prüfen, ob die gerade aktive Route verlassen werden darf.
Die Guard-Funktion erhält als erstes Argument eine Referenz auf die Komponente, die durch die Navigation verlassen wird.
Der Typ dieser Komponente wird mit dem generischen Typparameter `T` im Typ `CanDeactivateFn<T>` angegeben.

Die Funktion erhält die gesamte Instanz der Komponente als Argument:
Wir können also Daten aus der Komponente abfragen und die Entscheidung abhängig vom Zustand machen.
Das ist z. B. sinnvoll, um zu prüfen, ob Änderungen in einem Formular vorgenommen wurden, die nicht verworfen werden sollen.

```typescript
import { CanDeactivateFn } from '@angular/router';
import { MyComponent } from './my.component';

export const leaveGuard: CanDeactivateFn<MyComponent> =
  (component) => {
    return !component.hasUnsavedChanges();
  };
```

Wenn wir den Guard in der Route verwenden, wird das Verlassen der Komponente `MyComponent` nur erlaubt, wenn das Signal `hasUnsavedChanges` in der Komponente den Wert `false` hat.
Diese Eigenschaft ist selbst definiert und muss natürlich innerhalb der Komponente gesteuert werden.

> **Tipp: Guard wiederverwenden**
>
> Durch den generischen Typparameter ist der gezeigte `CanDeactivate`-Guard spezifisch für eine bestimmte Komponente.
> Um das zu vermeiden, empfehlen wir, ein Interface anzulegen, das die benötigte Schnittstelle der Komponente vorgibt, z. B. das Property `hasUnsavedChanges` mit einem Signal.
> Alle Komponenten, die diese Schnittstelle für den Guard anbieten, müssen das Interface implementieren.
> Der Guard verwendet in seinem Typparameter dann ebenfalls das Interface. So kann der Guard mit verschiedenen Komponenten arbeiten und ist nicht nur für eine einzelne Komponente verwendbar.

```typescript
export interface HasUnsavedChanges {
  hasUnsavedChanges: Signal<boolean>;
}

export const leaveGuard: CanDeactivateFn<HasUnsavedChanges> =
  (component) => {
    if (component.hasUnsavedChanges()) {
      return confirm('Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?');
    }
    return true;
  };
```

### CanActivateChild: Dürfen Kind-Routen betreten werden?

Ein Guard mit dem Typ `CanActivateChildFn` entscheidet, ob zu den Kind-Routen der betreffenden Route navigiert werden darf.
Dieser Guard wird für *alle* Kind-Routen ausgeführt, die mit `children` definiert sind.
Das ist besonders nützlich, um eine ganze Gruppe von Routen mit einer einzigen Prüfung abzusichern.

```typescript
import { inject } from '@angular/core';
import { CanActivateChildFn } from '@angular/router';

export const adminChildGuard: CanActivateChildFn =
  (childRoute, state) => {
    const authService = inject(AuthService);
    return authService.hasRole('admin');
  };
```

In der Routenkonfiguration wird der Guard auf der Elternroute notiert:

```typescript
const routes: Routes = [
  {
    path: 'users',
    canActivateChild: [adminChildGuard],
    children: [
      { path: 'list', component: UserListPage },
      { path: 'detail/:id', component: UserDetailPage },
    ],
  },
];
```

### CanMatch: Wird die Route berücksichtigt?

Ein Guard mit dem Typ `CanMatchFn` entscheidet, ob eine Route bei der Auswertung berücksichtigt wird.
Navigieren wir zu einer URL, werden alle Routen von oben nach unten abgearbeitet.
Für jede Route wird geprüft, ob sie zur angeforderten URL passt – und die erste passende Route wird geladen.
Mit `CanMatch`-Guards können wir entscheiden, ob eine Route dabei überhaupt ausgewertet oder übersprungen wird.

Die Guard-Funktion erhält zwei Argumente: das gesamte Routen-Objekt und die angeforderte URL in Form eines Arrays von URL-Segmenten.
Gibt die Funktion `false` zurück, wird die betreffende Route bei der Auswertung übersprungen – der Router versucht dann, eine andere passende Route zu finden.
Auch dieser Guard kann einen `UrlTree` zurückgeben, um eine neue Navigation anzustoßen.

```typescript
import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';

export const myMatchGuard: CanMatchFn =
  (route, segments) => {
    return inject(AuthService).isAuthenticated();
  };
```

Da wir auf diese Weise bestimmte Routen von der Auswertung ausschließen können, eignet sich `CanMatch` für ein besonderes Szenario:
Wir können mehrere Varianten einer Route anbieten, die auf verschiedene Komponenten zeigen.
Entscheidet der Guard, dass die erste Route nicht berücksichtigt wird, wird die zweite verwendet.

```typescript
const routes: Routes = [
  {
    path: 'myfeature',
    component: FeatureComponent,
    canMatch: [myMatchGuard]
  },
  {
    path: 'myfeature',
    component: AnonymousFeatureComponent
  }
];
```

Liefert das Signal `isAuthenticated` vom `AuthService` den Wert `true` zurück, wird die erste Route mit der `FeaturePage` geladen.
Steht der Zustand auf `false`, wird die `AnonymousFeaturePage` angezeigt.

Dieses Muster eignet sich hervorragend für Feature Flags, A/B-Testing oder bedingte Routenauswahl.

## Guards inline definieren

In allen bisherigen Beispielen haben wir die Funktionen separat abgelegt, sodass wir sie in den Routen referenzieren können.
Wollen wir einen Guard nur einmalig nutzen, können wir die Funktion auch direkt in der Route definieren:

```typescript
const routes: Routes = [
  {
    path: 'bar',
    component: BarPage,
    canDeactivate: [
      (comp: MyComponent) => !comp.hasUnsavedChanges(),
    ]
  },
  {
    path: 'secret',
    component: SecretPage,
    canActivate: [() => inject(AuthService).isAuthenticated()]
  }
];
```

## Praxisbeispiel: Admin-Bereich absichern

Schauen wir uns ein vollständiges Beispiel an.
Wir wollen den Administrationsbereich einer Anwendung absichern, sodass er nur für angemeldete Personen zugänglich ist.
Die Information zum Authentifizierungsstatus erhalten wir aus einem `AuthService`.

### Guard implementieren

Wir erstellen einen `CanActivate`-Guard, der den Authentifizierungsstatus prüft.
Ist die Person angemeldet, erlauben wir die Navigation.
Falls nicht, leiten wir zur Startseite um und zeigen eine Meldung an:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  alert('Bitte melde dich an, um den Admin-Bereich zu betreten.');
  return router.parseUrl('/home');
};
```

In einer realen Anwendung würden wir hier eine eigene UI-Komponente einsetzen, etwa eine Toast-Benachrichtigung oder einen Bestätigungsdialog. Für dieses Beispiel reicht uns hier aber der einfache `alert()`-Aufruf.
### Guard in der Route verwenden

In der Routenkonfiguration fügen wir die Eigenschaft `canActivate` hinzu und geben die Guard-Funktion an.
Damit wird der Guard ausgeführt, bevor die Route geladen wird:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    canActivate: [authGuard]
  },
  // ...
];
```

Wenn wir die Basisroute für das Lazy Loading mit dem Guard sichern, sind auch alle darunter folgenden Routen abgedeckt.

### Alternative: Asynchroner Guard mit Observable

In einer produktiven Anwendung erhalten wir den Status der Authentifizierung möglicherweise nicht synchron.
Unser `AuthService` bietet die Information zusätzlich über ein Observable an.
In diesem Fall können wir den Guard asynchron implementieren.
Er gibt dann ein Observable oder eine Promise zurück.
Der Router wartet auf die asynchrone Operation und entscheidet dann mit dem Ergebnis, ob und wie die Navigation ausgeführt wird.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      return router.parseUrl('/login');
    })
  );
};
```

Es ist wichtig, dass wir die Länge des Datenstroms mithilfe von `take(1)` begrenzen: Wir sind nur an einem einzigen Wert interessiert, nicht an allen danach folgenden.

## Diskussion: den richtigen Guard-Typ wählen

Die Wahl des Guard-Typs hängt davon ab, *wann* die Prüfung stattfinden soll:

- **`CanActivate`**: Die Route wird zunächst aufgelöst (und bei Lazy Loading heruntergeladen). Bevor die Komponente aktiviert wird, entscheidet der Guard.
- **`CanMatch`**: Die Prüfung findet statt, *bevor* die Route überhaupt aufgelöst wird. Bei Lazy Loading wird das Bundle nur heruntergeladen, wenn der Guard es erlaubt.
- **`CanActivateChild`**: Sichert alle Kind-Routen einer Elternroute mit einer einzigen Prüfung ab.
- **`CanDeactivate`**: Prüft, ob die aktuelle Route verlassen werden darf.

Für die Absicherung von Lazy-Loading-Routen empfehlen wir `CanMatch`, da so das Bundle nur bei Bedarf geladen wird.
Für einfache Authentifizierungsprüfungen auf einzelnen Routen ist `CanActivate` die gängigste Wahl.

## Mehrere Guards kombinieren

Guards werden als Array angegeben und in der definierten Reihenfolge ausgeführt.
Alle Guards müssen `true` zurückgeben, damit die Navigation stattfindet.
Gibt einer der Guards `false` oder einen `UrlTree` zurück, wird die Navigation abgebrochen bzw. umgeleitet.

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [authGuard, adminRoleGuard]
  },
];
```

In diesem Beispiel muss die Person sowohl authentifiziert sein als auch die Admin-Rolle besitzen, um die Route zu betreten.

## Zusammenfassung

- Mit Guards können Routen abgesichert werden, sodass die Navigation unter bestimmten Umständen abgebrochen wird.
- Ein Guard ist eine Funktion, die entscheidet, ob die Navigation ausgeführt werden darf.
- Es gibt vier Arten von Guards:
  - `CanActivate` – beim Aufruf einer Route
  - `CanDeactivate` – beim Verlassen einer Route
  - `CanActivateChild` – beim Aufruf einer Kind-Route
  - `CanMatch` – beim Auswerten der Route
- Der Rückgabewert eines Guards ist ein `boolean`, ein `UrlTree` oder ein `RedirectCommand`. Der Rückgabewert kann auch asynchron von einem Observable oder einer Promise geliefert werden.
- Gibt der Guard `true` zurück, wird die Navigation ausgeführt, bei `false` wird sie abgebrochen.
- Gibt der Guard einen `UrlTree` oder ein `RedirectCommand` zurück, wird eine neue Navigation zur enthaltenen Route gestartet.
- Guards werden als Eigenschaft einer Routendefinition notiert und wirken dann auf diese Route.
- Guards steuern die Nutzerführung, aber sie sind kein Sicherheitsfeature. Die Absicherung muss immer serverseitig erfolgen.
