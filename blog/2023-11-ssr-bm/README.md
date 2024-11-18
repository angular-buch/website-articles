---
title: 'Book Monkey v5: Server-Side Rendering mit Angular 17'
author: Ferdinand Malcher
mail: ferdinand@malcher.media
published: 2023-11-21
lastModified: 2023-11-21
keywords:
  - Server-Side Rendering
  - Pre-Rendering
  - ESBuild
  - Application Builder
  - BookMonkey
language: de
header: bm.jpg
---

Mit Angular 17 wurde der Build-Prozess für Server-Side Rendering (SSR) und Pre-Rendering grundlegend überarbeitet.
In diesem Blogpost stellen wir vor, welche Unterschiede für das Beispielprojekt "BookMonkey" aus dem Angular-Buch relevant sind.

## Der neue Application Builder

Mit Angular 17 wurde Server-Side Rendering noch tiefer in Angular integriert.
Schon beim Anlegen eines neuen Projekts mit `ng new` können wir die Unterstützung für SSR sofort aktivieren.

Um den gesamten Build-Prozess zu harmonisieren, wurde außerdem der neue *Application Builder* eingeführt: Er vereint den Build für Browser und Server, sodass beide Schritte mit einem Befehl gemeinsam erledigt werden können.

Der neue Builder ist in neuen Projekten mit Angular 17 automatisch aktiv.
Wir haben darüber bereits im [Blogpost zum Angular-Release 17](/blog/2023-11-angular17) berichtet.

## SSR einrichten

Um Server-Side Rendering und Pre-Rendering in einer bestehenden Anwendung einzurichten, wird ab sofort das neue Paket `@angular/ssr` verwendet.
Das bisherige Paket `@nguniversal/express-engine`, das wir im Buch verwenden, wird nicht mehr genutzt.

```bash
ng add @angular/ssr
```

## Unterschiede in den generierten Dateien

Nachdem die Einrichtung von SSR abgeschlossen ist, können wir die Änderungen an den Dateien nachvollziehen.
Wir haben im Buch ausführlich beschrieben, welche Aspekte dabei wichtig sind.
Der grundlegende Ablauf ist noch immer der gleiche – der Code sieht jedoch anders aus.
Wir haben den Code im [GitHub-Repo für den BookMonkey](https://github.com/book-monkey5/16f-ssr) aktualisiert.

### Skripte in der Datei `package.json`

Bisher wurden in der Datei `package.json` mehrere Skripte hinzugefügt, mit denen die Builder für SSR und Pre-Rendering angestoßen werden können.
Da der Application Builder nun alle diese Aspekte übernimmt, wird nur noch ein einziges Skript hinzugefügt.
Es ist dafür verantwortlich, die SSR-Anwendung nach dem Build zu starten.

```json
{
  // ...
  "scripts": {
    // ...
    "serve:ssr:book-monkey": "node dist/book-monkey/server/server.mjs"
  }
}
```

Der gesamte Build wird nun mit dem gewohnten Befehl `ng build` angestoßen und beinhaltet auch den Teil für den Server und die statisch generierten HTML-Dateien für Pre-Rendering.
Das Verhalten können wir in der Datei `angular.json` konfigurieren.


### Konfiguration in der Datei `angular.json`

In der Datei `angular.json` wird der Application Builder konfiguriert.
Bisher waren hier einzelne *Build Targets* für SSR und Pre-Rendering notwendig. Der neue Builder vereint alle Teile unter dem Target `build`.
Das bedeutet auch, dass nur noch der Befehl `ng build` notwendig ist, um den gesamten Build auszuführen. Dabei wird die Anwendung also nicht nur für den Browser gebaut, sondern es wird auch der Node.js-Server für SSR generiert, und die statischen HTML-Dateien aus den Routen werden mithilfe von Pre-Rendering erzeugt.

SSR und Pre-Rendering können in der `angular.json` separat aktiviert und gesteuert werden.
Die folgenden neuen Einträge sind hier nach der Einrichtung zu finden:

```json
{
  "projects": {
    "book-monkey": {
      "architect": {
        "build": {
          // ...
          "server": "src/main.server.ts",
          "prerender": true,
          "ssr": {
            "entry": "server.ts"
          }
        }
      }
    }
  }
}
```


### Pre-Rendering konfigurieren

Im Buch haben wir gezeigt, wie wir die Liste der Routen für Pre-Rendering manuell übergeben können.
Ab sofort muss diese Liste in einer Datei abgelegt und in der `angular.json` referenziert werden.
Anstatt dem Wert `true` können wir für `prerender` das folgende Konfigurationsobjekt übergeben:

```json
"prerender": {
  "discoverRoutes": false,
  "routesFile": "routes.txt"
},
```

Die Datei `routes.txt` liegt im Root-Verzeichnis des Projekts und hat den folgenden Inhalt.
Bisher hatten wir diese Liste in der `angular.json` definiert.

```
/
/home
/books
/books/9783864909467
/books/9783864907791
/books/9783864906466
/books/9783864903571
```


### Sonstige Änderungen

- Die Datei `server.ts` beinhaltet weiterhin einen Express-Server für den SSR-Prozess. Hier wird nun allerdings die neue `CommonEngine` aus dem Paket `@angular/ssr` verwendet. Der Aufbau wird dadurch vereinfacht.
- Im `AppModule` wird automatisch der Eintrag `provideClientHydration()` unter `providers` hinzugefügt. Damit wird die Client-Side Hydration aktiviert. Wir haben darüber im [Blogpost zu Angular 16](/blog/2023-05-angular16) berichtet.
- Die Datei `app.server.module.ts` wurde umbenannt zu `app.module.server.ts`. Der Inhalt ist weiterhin derselbe.


## Bestehendes Projekt updaten

Wenn Sie ein bestehendes Projekt auf Angular 17 aktualisieren, sorgen die Migrationsskripte hinter `ng update` dafür, dass automatisch das neue Paket `@angular/ssr` verwendet wird.
Dabei wird allerdings nicht automatisch der neue Application Builder eingerichtet, sondern es werden weiterhin die bisherigen Builder für SSR und Pre-Rendering genutzt, die in das Paket `@angular-devkit/build-angular` umgezogen wurden.

```
❯ Replace usages of '@nguniversal/builders' with '@angular-devkit/build-angular'.
UPDATE angular.json (5182 bytes)
UPDATE package.json (1903 bytes)
  Migration completed (2 files modified).

❯ Replace usages of '@nguniversal/' packages with '@angular/ssr'.
RENAME server.ts => server.ts.bak
CREATE server.ts (2206 bytes)
UPDATE package.json (1887 bytes)
✔ Packages installed successfully.
  Migration completed (2 files modified).
```

Wenn Sie von hier aus den Application Builder nutzen möchten, ist eine manuelle Migration notwendig.
Die grundlegenden Schritte haben wir im [Blogpost zu Angular 17](/blog/2023-11-angular17) beschrieben.


## Fazit

Die Einrichtung und Konfiguration von SSR und Pre-Rendering funktioniert mit Angular 17 und dem neuen Application Builder anders als zuvor.
Für bestehende Projekte ist damit zwar etwas Aufwand zur Migration nötig – wir begrüßen allerdings sehr, dass der Build-Prozess harmonisiert wird und das Thema SSR mehr in den Fokus rückt.

Sie können weiterhin auch die bestehenden Builder nutzen, die aus dem Paket `@nguniversal/express-engine` nach `@angular-devkit/build-angular` verschoben wurden.
Dennoch empfehlen wir Ihnen den Umstieg auf den Application Builder, um alle Vorteile und Optimierungen sofort zu nutzen.

An den konzeptionellen Grundlagen zu SSR, die wir im Buch ausführlich beschrieben haben, ändert sich darüber hinaus nichts.
Der Ablauf ist noch immer der gleiche – nur die Umsetzung im Code hat sich mit Angular 17 geändert.

<hr>

<small>**Titelbild:** Photo by <a href="https://unsplash.com/@fotograw">Dmitriy Demidov</a> on <a href="https://unsplash.com/s/photos/wrench">Unsplash</a></small>
