---
title: 'Interceptors: HTTP-Requests erfassen und transformieren'
published: 2026-03-03
lastModified: 2026-03-04
---

In diesem Artikel geht es um *Interceptors*. Damit lassen sich HTTP-Requests und -Responses in Angular zentral erfassen und transformieren.
So können wir zum Beispiel Authentifizierungs-Header automatisch setzen, Fehler global behandeln oder die HTTP-Kommunikation loggen, ohne jeden einzelnen Request manuell anpassen zu müssen.
Dabei betrachten wir zunächst die Funktionsweise und Implementierung von Interceptors, bevor wir am Beispiel einer Authentifizierung mit OAuth 2 und OpenID Connect ein praxisnahes Einsatzszenario umsetzen.

## Inhalt

[[toc]]

Interceptors fungieren als Middleware, also als Zwischenschicht, für die gesamte HTTP-Kommunikation.
Sie werden global installiert und für alle HTTP-Abfragen und -Antworten ausgeführt.
So lassen sich Requests und Responses an zentraler Stelle verarbeiten und verändern.
Typische Einsatzgebiete sind unter anderem:

- Sicherheitsfunktionen, z. B. Authentifizierung über ein Access Token, das mit jedem Request im Header übermittelt werden muss
- Hinzufügen zusätzlicher Headerfelder, z. B. für Caching
- Logging von Request und Response
- Anzeige von Zustandsinformationen zum Request (z. B., ob eine HTTP-Anfrage noch aktiv ist oder nicht)
- globales Erfassen und Behandeln von Fehlern bei einer HTTP-Anfrage, z. B. mit `catchError()`

## Funktionsweise der Interceptors

Bindest du einen Interceptor in die Anwendung ein, so wird er bei jedem HTTP-Request aktiv:
Der Request läuft zunächst durch den Interceptor und kann dort verändert werden.
Anschließend wird der Request über das Netzwerk zum Server übermittelt.
Die Antwort vom Server wird ebenfalls im Interceptor verarbeitet, bevor sie beim Aufrufenden eintrifft.

In einer Anwendung können mehrere Interceptors registriert werden.
Sie werden als Array hinterlegt, also mit einer definierten Reihenfolge.
Bei einem HTTP-Request werden die Interceptors von vorn nach hinten abgearbeitet, bei der HTTP-Response umgekehrt – von hinten nach vorn.

![Abarbeitung von Interceptors](./interceptor-flow.svg)

## Interceptors anlegen

Interceptors werden als einfache Funktion implementiert.
Angular stellt dafür den Typ `HttpInterceptorFn` bereit.
Du erhältst den Request und eine Funktion vom Typ `HttpHandlerFn`, an die du den veränderten Request übergibst.
Um auf Services zuzugreifen, kannst du `inject()` nutzen, da der Interceptor in einem Injection Context ausgeführt wird.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const myInterceptor: HttpInterceptorFn = (req, next) => {
  // Request verarbeiten oder verändern
  return next(req);
};
```

Um Interceptors zu registrieren, verwenden wir die Funktion `provideHttpClient()` zusammen mit `withInterceptors()`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { myInterceptor } from './my-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([myInterceptor])
    )
  ]
};
```

## Den Request manipulieren

Die Interceptor-Funktion wird für jeden ausgehenden HTTP-Request ausgeführt.
Bevor du den Request auf die Reise schickst, kannst du den Inhalt manipulieren.
Zum Beispiel kannst du einen Interceptor entwickeln, der bestimmte Headerfelder in jeden Request einfügt.

Das Request-Objekt ist unveränderlich. Um es zu modifizieren, erzeugen wir mit `clone()` eine Kopie und übergeben die gewünschten Änderungen.
Mit `setHeaders` lassen sich z. B. neue Headerfelder hinzufügen.
Den veränderten Request übergeben wir dann mit `next()` an den nächsten Handler.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Authorization': 'Bearer my-token',
      'X-Custom-Header': 'my-value'
    }
  });

  return next(modifiedReq);
};
```

## Die Response verarbeiten

Der HttpClient arbeitet intern mit Observables aus der Bibliothek RxJS.
Jeder Interceptor gibt ein Observable zurück: Es verarbeitet den Request und gibt die HTTP-Antworten aus, die vom Server eintreffen.
Du kannst dieses Observable nutzen, um mit den eintreffenden Daten zu arbeiten.
Zum Beispiel kannst du auf diese Weise Fehler behandeln, die Antworten loggen oder sogar den Inhalt manipulieren.

Um alle eingehenden Responses zu loggen, kannst du den Operator `tap()` verwenden.
Er lässt den Inhalt des Observables unverändert, und du kannst sowohl die erfolgreiche Serverantwort als auch fehlgeschlagene Requests auf der Konsole ausgeben.

```typescript
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Request URL:', req.url);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log('Response Status:', event.status);
        }
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    })
  );
};
```

> **Wichtig:** Das HTTP-Observable muss completen!
> Die HTTP-Kommunikation über die Interceptors wird mithilfe von Observables realisiert.
> Es ist wichtig, dass das Observable, das du aus dem Interceptor zurückgibst, immer completet wird.
> Ist der Datenstrom nie zu Ende, so wird auch der ursprüngliche Aufruf des HttpClient niemals beendet.

## Interceptors einbinden

Interceptors werden als Provider über die Dependency Injection von Angular bereitgestellt.
Wir registrieren sie mit `provideHttpClient()` und `withInterceptors()`.

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { loggingInterceptor } from './logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor
      ])
    )
  ]
};
```

Die Reihenfolge der Interceptors im Array bestimmt die Ausführungsreihenfolge:
Bei einem Request werden sie von vorn nach hinten abgearbeitet, bei der Response umgekehrt.

## Interceptors mit httpResource

Die Funktion `httpResource()` nutzt intern den HttpClient, um HTTP-Requests durchzuführen.
Das bedeutet, dass alle konfigurierten Interceptors automatisch auch für `httpResource()` angewendet werden.

```typescript
import { httpResource } from '@angular/common/http';

// In einer Komponente oder einem Service:
const booksResource = httpResource<Book[]>(() => '/api/books');
```

Beachte, dass `httpResource()` einen Injection Context benötigt. Der Aufruf darf also nicht an einer beliebigen Stelle im Code stehen, sondern muss z. B. in einer Komponente oder einem Service erfolgen. Alternativ kann mit `runInInjectionContext()` ein solcher Kontext manuell erzeugt werden.

Wenn du also einen Auth-Interceptor konfiguriert hast, der ein Bearer-Token hinzufügt, wird dieses Token auch bei allen Requests über `httpResource()` automatisch mitgesendet.
Dasselbe gilt für Logging-Interceptors, Error-Handler und alle anderen Interceptors.

## Praxisbeispiel: API-Aufrufe mit Credentials anreichern

Viele APIs erfordern eine Authentifizierung, um Daten lesen oder bearbeiten zu können.
Wir wollen exemplarisch einen Interceptor implementieren, der ein Token mit jedem Request an eine Web-API sendet.
Das Token ist dabei hart codiert, um die Implementierung zu vereinfachen.

Die Authentifizierungsverfahren können dabei ganz unterschiedlich ausfallen, unter anderem:

- native HTTP-Authentifizierung (Basic/Digest)
- Verwendung von Cookies
- Token-basierte Authentifizierung (z. B. Bearer-Token mit JWT)
- OAuth 2/OpenID Connect (verwendet ebenso ein Bearer-Token)

Eines haben aber alle Methoden gemeinsam: Sie erfordern, dass spezielle Informationen in jedem HTTP-Request mitgeliefert werden, um sich gegenüber dem Backend auszuweisen.

### Service zur Authentifizierung

Zunächst benötigen wir eine zentrale Stelle in der Anwendung, die die Authentifizierung verwaltet und den aktuellen Status bereitstellt.

Etablierte Bibliotheken stellen hierfür unter anderem folgende oder ähnliche Funktionen zur Verfügung:

- `isAuthenticated`: ein Signal, das den aktuellen Status der Authentifizierung reaktiv bereitstellt
- `login()`: Methode zum Einloggen
- `logout()`: Methode zum Ausloggen

Diesen Ansatz wollen wir mit einem eigenen Service nachbilden.

```typescript
// auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated = signal(true);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  login() {
    this._isAuthenticated.set(true);
  }

  logout() {
    this._isAuthenticated.set(false);
  }
}
```

### Den Auth-Interceptor implementieren

Um in jede API-Anfrage einen Token zur Authentifizierung einzubauen, wollen wir einen Interceptor nutzen.
Das hat den Vorteil, dass wir nicht bei jedem einzelnen HTTP-Request einen entsprechenden Header mit dem Token setzen müssen.
Sobald der Interceptor aktiv ist, wird er auf alle HTTP-Requests angewendet.

Zur Authentifizierung am Server wollen wir ein Bearer-Token einsetzen.
Ein solches Token muss üblicherweise zuvor von einem Authentifizierungsserver ausgestellt werden.
Die konkrete Implementierung hängt stark vom Projekt und von den zu nutzenden Endpunkten ab.
Uns geht es an dieser Stelle vor allem darum, zu zeigen, wie ein solches Token in den Request eingebaut werden kann.
Wir nutzen deshalb den statischen String `1234567890`, den wir als Bearer-Token senden.
Das bedeutet, dass das Token im Headerfeld `Authorization` mit dem Präfix `Bearer` übermittelt werden muss.

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    const modifiedReq = req.clone({
      setHeaders: {
        'Authorization': 'Bearer 1234567890'
      }
    });
    return next(modifiedReq);
  }

  return next(req);
};
```

An dieser Stelle treffen wir eine Fallunterscheidung:
Liefert der AuthService im Property `isAuthenticated` den Wert `true`, wollen wir ein zusätzliches Headerfeld im Request setzen.
Wir verwenden die Methode `clone()` und setzen den Header `Authorization`.
Danach übergeben wir den Request an den Handler, damit er zum nächsten Interceptor bzw. zum Server gesendet wird.
Falls `isAuthenticated` den Wert `false` besitzt, reichen wir den originalen Request unverändert weiter.
Das Token wird also im Header übermittelt, falls eine Authentifizierung vorliegt.

### Den Interceptor registrieren

Bevor der Auth-Interceptor genutzt werden kann, muss er noch registriert werden:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## OAuth 2 und OpenID Connect

Unser Praxisbeispiel zeigt das grundlegende Prinzip, wie ein Token mit jedem Request gesendet werden kann.
In einer echten Anwendung wird das Token jedoch nicht hart codiert, sondern dynamisch von einem Authorization Server bezogen und muss regelmäßig erneuert werden.

**Wir möchten dir an dieser Stelle dazu raten, eine Authentifizierungslösung nie selbst zu entwickeln.
Etablierte Anbieter und Identity Provider bieten Lösungen, die seit Jahren erprobt sind und stets an die neuesten Sicherheitsanforderungen angepasst werden.**

Egal ob du eine unternehmensinterne oder eine öffentliche Webanwendung entwickelst, die im Internet erreichbar ist:
In vielen Fällen benötigt die Anwendung einen Login, um Authentifizierung und Autorisierung zu realisieren.
In der Regel wird dieser Vorgang durch den Austausch von Authentifizierungstokens umgesetzt.
Nach dem Login senden wir mit jedem Request an die Web-API ein Access Token, das die Berechtigung der nutzenden Person bestätigt.
Dies ist ein klassischer Anwendungsfall für einen Interceptor, denn er ermöglicht es, das Token automatisch mit jedem Request einzufügen.

Weit verbreitete Industriestandards zur Autorisierung sind *OAuth 2* und das darauf aufsetzende Authentifizierungsframework *OpenID Connect (OIDC)*.

- **OAuth 2** ist ein Standard zur Autorisierung von API-Zugriffen im Web.
- **OpenID Connect (OIDC)** ist eine Erweiterung von OAuth 2, die alle notwendigen Funktionen für Login und Single Sign-On (SSO) etabliert.

Die Datenflüsse in einer Anwendung mit OAuth 2 und OIDC können in verschiedenen *Flows* realisiert werden.

### Authorization Code Flow

Mit der Verbreitung von OAuth 2 und OIDC wurde kontinuierlich an noch sichereren Möglichkeiten der Authentifizierung gearbeitet.
Ein Ergebnis dieser Arbeit ist der nun empfohlene *Authorization Code Flow*.

Der Flow verwendet die Erweiterung *PKCE (Proof Key for Code Exchange)*, die sicherstellt, dass beim Austausch des Access Tokens keine sensiblen Informationen bei potenziellen Angriffen abgefangen werden können.
Dafür sendet der Client mit der Umleitung zum Authorization Server einen Hashwert mit.
Der Client generiert zunächst einen Zufallsstring (den sogenannten *Verifier*) und leitet daraus eine *Code Challenge* ab.
Diese Challenge wird dann im Request übertragen.

Nach dem erfolgreichen Login empfängt der Client lediglich einen *Authorization Code* vom Authorization Server.
Dieser Code ist noch kein gültiges Token, sondern muss zunächst „eingetauscht" werden:
Dafür sendet der Client den Authorization Code zusammen mit dem Verifier in einem HTTP-Request an den Authorization Server.
Dieser kann jetzt prüfen, ob der Verifier zum zuvor ausgestellten Authorization Code passt.
Ist die Prüfung erfolgreich, stellt der Authorization Server schließlich an den Client das Access Token und das Identity Token aus.
Damit kann der Client nun den Resource Server abfragen, der wiederum prüft, ob das Access Token valide ist.

Durch den zusätzlichen Schritt und den flüchtigen Authorization Code kann sichergestellt werden, dass das Token während des Datenaustauschs nicht gestohlen werden kann, denn nur der Client kennt den verwendeten Verifier.

### OpenID Connect und Angular

Um den empfohlenen Authorization Code Flow fehlerfrei zu implementieren, ist es notwendig, die Spezifikationen sehr genau zu studieren.
Damit das Fehlerrisiko gering bleibt, solltest du eine etablierte Bibliothek verwenden, um die Datenflüsse für die Autorisierung und Authentifizierung korrekt abzubilden.
Für Angular möchten wir die beiden folgenden Bibliotheken empfehlen:

- [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client)
- [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc)

Beide sind von der OpenID Foundation zertifiziert und bieten komfortable Schnittstellen, um die Flows von OAuth 2 und OIDC in eine Angular-Anwendung zu integrieren.

## Interceptors im Angular-Ökosystem

Nicht nur für Authentifizierung — viele Bibliotheken aus dem Angular-Ökosystem nutzen Interceptors als Integrationspunkt.
Hier eine Auswahl:

**Authentifizierung:** Bibliotheken wie [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc), [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client), [@azure/msal-angular](https://github.com/AzureAD/microsoft-authentication-library-for-js) (Azure AD / Entra ID), [@auth0/auth0-angular](https://github.com/auth0/auth0-angular) und [keycloak-angular](https://github.com/mauriciovigolo/keycloak-angular) bringen eigene Interceptors mit, die den gesamten Token-Lifecycle verwalten: Login, Token-Erneuerung und das automatische Anhängen des Access Tokens an jeden Request.

**Ladeindikator:** Bibliotheken wie [ngx-progressbar](https://github.com/MurhafSousli/ngx-progressbar), [@ngx-loading-bar/http-client](https://github.com/aitboudad/ngx-loading-bar) und [ng-http-loader](https://github.com/mpalourdio/ng-http-loader) nutzen Interceptors, um bei laufenden HTTP-Requests automatisch einen Fortschrittsbalken oder Spinner anzuzeigen.

**Caching:** Die Bibliothek [@ngneat/cashew](https://github.com/ngneat/cashew) stellt einen Interceptor bereit, der HTTP-Responses cacht und bei wiederholten Requests direkt aus dem Cache ausliefert.

## Fazit

Interceptors sind ein zentrales Werkzeug, um die HTTP-Kommunikation einer Angular-Anwendung zu steuern.
Statt in jedem Service einzeln Header zu setzen, Fehler zu behandeln oder Requests zu loggen, erledigt ein Interceptor diese Aufgaben an einer einzigen Stelle, für alle HTTP-Anfragen gleichermaßen.
Interceptors mit `HttpInterceptorFn` sind leichtgewichtig und lassen sich über `provideHttpClient(withInterceptors([...]))` flexibel zusammenstellen.
Da auch `httpResource()` intern den HttpClient verwendet, profitieren alle HTTP-Zugriffe automatisch von den konfigurierten Interceptors.
Beachte dabei: Interceptors eignen sich für globale Aufgaben. Wenn du nur für einen einzelnen Request spezielle Header oder Optionen setzen möchtest, ist der direkte Weg über den HttpClient der bessere Ansatz.
