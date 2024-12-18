---
title: "[Docker Serie 3/4] Build Once, Run Anywhere oder: Konfiguration über Docker verwalten"
author: Michael Kaaden
mail: blog@kaaden.net
bio: "Michael Kaaden ist als Software-Architekt und Manager für ein mittelständisches Unternehmen in Nürnberg tätig. Dort ist er für die technische Seite einer Cloud-Produktline verantwortlich. In dieser Eigenschaft kümmert er sich trotz seiner grundsätzlichen Affinität zu Angular nicht nur um Frontends, sondern neben der Gesamtarchitektur unter anderem auch um APIs, Backends, Datenbanken sowie Software-Entwicklungs- und Build-Prozesse. Wenn er in seiner Freizeit nicht gerade mit seiner Familie unterwegs ist, Full-Stack Developer spielt oder seine Nase in neue Technologien steckt, versucht er, seinen Laufstil zu verbessern und endlich den für ihn perfekten Fotoapparat zu finden."
published: 2019-12-16
keywords:
  - Docker
  - Settings
  - Angular
  - APP_INITIALIZER
language: de
header: header2.jpg
---

**Build Once, Run Anywhere:
Wie Sie ein einziges Image zur Laufzeit an beliebige Umgebungen anpassen.
Bleiben Sie auch ohne Code-Änderung flexibel!
Dies ist der 3. Teil unserer vierteiligen Artikelserie zu Angular und Docker.**

Inhaltsverzeichnis:

- [Motivation](/blog/2019-12-docker2-build-once-run-anywhere#motivation)
- [Anforderungen an die Konfigurierbarkeit](/blog/2019-12-docker2-build-once-run-anywhere#anforderungen-an-die-konfigurierbarkeit)
- [Konfigurierbarkeit umsetzen](/blog/2019-12-docker2-build-once-run-anywhere#konfigurierbarkeit-umsetzen)
- [Umgebung mit Docker konfigurieren](/blog/2019-12-docker2-build-once-run-anywhere#umgebung-mit-docker-konfigurieren)
- [Ausblick](/blog/2019-12-docker2-build-once-run-anywhere#ausblick)

Sie finden den Code zum Artikel auf
[GitHub](https://github.com/MichaelKaaden/dockerized-app/tree/master/Part-2-Build-Once-Run-Anywhere).

In Teil I dieser Artikelserie haben Sie gelernt, wie Sie Ihre Angular-App in ein Docker-Image packen und in einem Container zur Ausführung bringen können.

## Motivation

Die meisten Angular-Apps werden Daten abfragen und/oder persistieren.
Sie benötigen also ein Backend, meist in Gestalt eines RESTful Web Service.
Die App spricht das Backend über einen URL an, der irgendwo in der App abgelegt sein muss.
Das Angular-Team [stellt sich vor](https://angular.io/guide/build), dass Sie diesen URL in `src/environments/environment.ts` bzw. `src/environments/environment.prod.ts` ablegen, beispielsweise unter dem Namen
`baseUrl`.

Das klappt gut, solange Sie mit diesen beiden Umgebungen auskommen.
Gerade wenn Sie in einem Team entwickeln, werden Sie jedoch mindestens vier Umgebungen verwenden:

- _Development_ zum Entwickeln,
- _Testing_ für Integrations- und Systemtests sowie manuelle Tests,
- _Staging_ für die Produktabnahme und schließlich
- _Production_ für den Produktivbetrieb.

Jede dieser Umgebungen hat typischerweise ihr eigenes Backend und benötigt somit einen spezifischen `baseUrl`.
In der Realität werden Sie noch mehr zu konfigurieren haben, etwa einen Identity Provider für die Autorisierung.
Weitere Konfigurationsoptionen fügen allerdings diesem Artikel keinen Mehrwert hinzu, weshalb ich mich auf den `baseUrl` beschränke.

Sie sehen schon: Mit nur `environment.ts` und `environment.prod.ts` kommen wir da nicht ganz hin. Natürlich könnten wir noch ein `environment.testing.ts` und ein `environment.staging.ts` definieren, doch das hilft uns nicht weiter, wie wir gleich sehen werden.

## Anforderungen an die Konfigurierbarkeit

In der _Development_-Umgebung soll die App ganz normal mit `ng serve` bzw. `ng serve --prod` laufen können.
Wir brauchen also eine Lösung, die den `baseUrl` auch ohne Docker zur Verfügung stellt.

In den anderen Umgebungen möchten wir den jeweils passenden `baseUrl` nutzen.
Eine wesentliche Einschränkung dabei ist: Wir dürfen nicht damit anfangen, nur wegen eines jeweils anderen `baseUrl` ein Image je Umgebung zu erstellen.

Wenn ein Image in _Testing_ für gut befunden wurde, egal ob durch automatische oder manuelle Tests, dann ist genau dieses Image dasjenige, das nach _Staging_ und nach erfolgreicher Abnahme nach _Production_ wandern soll. Wir dürfen _kein_ neues Image erstellen, denn das könnte geringfügig anders sein als das getestete, beispielsweise weil in der Zwischenzeit Ihre geschätzten Admin-Kollegen automatisiert eine neue Version von Node.js auf Ihrem Rechner eingespielt haben. Vielleicht haben Sie auch Ihre globalen NPM-Pakete aktualisiert.
Oder ein Kollege hat stillschweigend einen Fix in die Sourcen eingebaut.

Wenn aber das Image aus _Testing_ auch für _Staging_ und _Production_ verwendet werden soll, heißt das, dass der `baseUrl` nicht Teil des Images sein darf, sondern von außen über Docker konfigurierbar sein muss.

Zusammengefasst benötigen wir also eine Lösung, die uns in der _Development_-Umgebung einen `baseUrl` auch ohne Docker zur Verfügung stellt, die uns aber einen Weg ebnet, den `baseUrl` für die anderen Umgebungen mit
Docker zu konfigurieren.

## Konfigurierbarkeit umsetzen

Um diese Anforderungen umsetzen zu können, benötigen wir einen Mechanismus, der die Konfiguration der App erst zur Laufzeit lädt. Würden wir das `environment.ts` für diesen Zweck nutzen, dann müsste die Konfiguration schon
beim _Build_ feststehen, was aber nicht sein darf, wie wir im vorangehenden Abschnitt festgestellt haben.

Eine gute Lösung ist, die Konfiguration in eine Datei zu packen, die wir im `assets`-Verzeichnis ablegen und von dort zusammen mit der App laden.
Auf diese Weise können wir diese Konfigurationsdatei beim Start des Containers beliebig überschreiben.
Wir ändern die Konfiguration dadurch zur _Laufzeit_ – wir sehen gleich, wie wir das bewerkstelligen.

Nachfolgende sehen Sie die Datei `src/assets/settings.json`, die wir zu diesem Zweck verwenden
werden.

```json
{
    "baseUrl": "http://localhost:5002"
}
```

Anschließend definieren Sie mittels `ng g class models/settings --skip-tests` in der Datei
`settings.ts` ein Interface, das die Struktur dieser Konfigurationsdatei vorgibt:

```typescript
export interface Settings {
    baseUrl: string;
}
```

Jetzt benötigen wir noch einen Service, den wir überall dort injizieren können, wo wir Zugriff auf die Konfiguration benötigen.
Wir erstellen diesen `SettingsService` mit der Angular CLI: `ng g service services/settings`.

```typescript
import { Injectable } from "@angular/core";
import { Settings } from "../models/settings";

@Injectable({
    providedIn: "root",
})
export class SettingsService {
    settings: Settings;
}
```

Außerdem wollen wir einen Service definieren, der für das Laden unserer `settings.json` verantwortlich ist.
Der Service soll später direkt von Angular genutzt werden, daher legen wir diese Mechanik nicht im `SettingsService` ab.
Der neue Service wird generiert mit dem Befehl `ng g service services/settings-initializer`.
Er soll eine Methode `initializeSettings()` beinhalten, die eine Promise zurückgibt:

```typescript
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Settings } from "../models/settings";
import { SettingsService } from "./settings.service";

@Injectable({
    providedIn: "root",
})
export class SettingsInitializerService {
    constructor(private http: HttpClient, private settings: SettingsService) {}

    initializeSettings(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get("assets/settings.json").subscribe(
                (response) => {
                    this.settings.settings = response as Settings;
                    resolve();
                },
                (error) => reject(error),
            );
        });
    }
}
```

Von Angular sind Sie es gewohnt, mit Observables zu arbeiten.
Daher wundern Sie sich eventuell über den Rückgabetyp von `initializeSettings()`.
Des Rätsels Lösung ist ganz einfach:
Der Mechanismus, über den wir in Kürze alles miteinander verdrahten, erwartet an der Stelle ausschließlich ein Promise.

Der zugehörige Unit-Test sieht folgendermaßen aus:

```typescript
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Settings } from "../models/settings";

import { SettingsInitializerService } from "./settings-initializer.service";
import { SettingsService } from "./settings.service";

describe("SettingsInitializerService", () => {
    let service: SettingsInitializerService;
    let httpMock: HttpTestingController;
    let settingsService: SettingsService;

    const testSettings: Settings = {
        baseUrl: "baseUrl",
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        service = TestBed.get(SettingsInitializerService);
        httpMock = TestBed.get(HttpTestingController);
        settingsService = TestBed.get(SettingsService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should initialize settings", (done) => {
        service.initializeSettings().then(() => {
            expect(settingsService.settings).toEqual(testSettings);
            done();
        });

        const request = httpMock.expectOne("assets/settings.json");
        expect(request.request.method).toBe("GET");
        request.flush(testSettings);
    });

    it("should not initialize settings if get settings.json failed", (done) => {
        service
            .initializeSettings()
            .then(() => {
                done.fail(new Error("this was expected to fail"));
            })
            .catch(() => {
                expect(settingsService.settings).toBeUndefined();
                done();
            });

        const request = httpMock.expectOne("assets/settings.json");
        expect(request.request.method).toBe("GET");
        request.flush(testSettings, {
            status: 500,
            statusText: "Some Weird Server Error",
        });
    });
});
```

Das war noch nicht weiter kompliziert.
Spannend wird die Frage, wann und wie wir den Service nun nutzen, um die Konfiguration aus der `settings.json` zu laden.
Die App benötigt die Konfiguration, sobald der Browser sie startet.
Leider lädt die App die Konfiguration aus dem `assets`-Verzeichnis per HTTP(S)-Aufruf, somit also asynchron.
Wir brauchen also ein Mittel, um das Laden abzuwarten, bevor die App startet.
Glücklicherweise hat Angular dafür das Konzept des `APP_INITIALIZER` eingeführt, das genau das leistet.

Wir passen also das `app.module.ts` mit dieser Erkenntnis folgendermaßen an, um die Konfiguration zu laden. Tipp: Neu darin sind die Funktion `initSettings()` vor dem `@NgModule()`-Decorator und der Provider für das Token `APP_INITIALIZER`:


```typescript
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { APP_INITIALIZER, NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./components/app/app.component";
import { OneComponent } from "./components/one/one.component";
import { TwoComponent } from "./components/two/two.component";
import { SettingsInitializerService } from "./services/settings-initializer.service";

// NEW
export function initSettings(
    settingsInitializerService: SettingsInitializerService,
) {
    return () => settingsInitializerService.initializeSettings();
}

@NgModule({
    declarations: [AppComponent, OneComponent, TwoComponent],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule],
    providers: [
        // NEW
        {
            provide: APP_INITIALIZER,
            useFactory: initSettings,
            deps: [SettingsInitializerService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

Anschließend können wir den `SettingsService` in der Anwendung verwenden, um die Einstellungen in unseren Komponenten und Services zu nutzen.

```typescript
import { Component } from "@angular/core";
import { Settings } from "../../models/settings";
import { SettingsService } from "../../services/settings.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {
    title = "dockerized-app";
    settings: Settings;

    constructor(private settingsService: SettingsService) {
        this.settings = settingsService.settings;
    }
}
```

Damit haben wir bereits die _Development_-Umgebung zum Laufen gebracht.
Sie können das mittels `ng serve` oder `ng serve --prod` leicht nachprüfen.

## Umgebung mit Docker konfigurieren

Wie erzeugen wir jetzt also pro Umgebung eine passende Datei `settings.json` je Container?
Ich nutze dafür das Tool `envsubst`.
Dieses liest ein Template, ersetzt darin Umgebungsvariablen und schreibt das Ergebnis in eine neue Datei.

Hier ist das Template in Form der Datei `src/assets/settings.json.template`:

```json
{
    "baseUrl": "${BASE_URL}"
}
```

Jetzt brauchen wir nur noch die Datei `docker-compose.yml` dahingehend anzupassen, dass `envsubst` verwendet wird, um zur Laufzeit die passende Datei `settings.json` für die jeweilige Umgebung zu erstellen:

```yaml
version: "3"

services:
    web:
        image: dockerized-app
        env_file:
            - ./docker.env
        ports:
            - "8093:80"
        command: /bin/bash -c "envsubst '$$BASE_URL' < \
            /usr/share/nginx/html/assets/settings.json.template > \
            /usr/share/nginx/html/assets/settings.json && exec nginx -g \
            'daemon off;'"
```

_Sie müssen die `command`-Angabe in *eine* einzige Zeile packen.
Im obigen Beispiel habe ich die Backslashes lediglich dazu benutzt, die Zeile der Lesbarkeit wegen umzubrechen._

Mit dieser Änderung lädt `docker-compose` die Umgebung aus der Datei `docker.env`, in der Umgebungsvariablen definiert sind.
Die Datei legen Sie bitte mit folgendem Inhalt an:

```bash
BASE_URL=http://some.official.server:444
```

Damit haben wir endlich alle Puzzleteile zusammen, um den Docker-Container mit der gewünschten Umgebung zu starten: Sie benötigen je Umgebung lediglich eine Datei `docker.env` und darin die jeweils passenden Umgebungsvariablen.
Die Skripte `dockerize.sh` und `redeploy.sh` aus dem vorherigen Teil funktionieren übrigens ohne Änderung weiterhin.

## Ausblick 

Die Artikelserie besteht aus den folgenden Teilen:

1. [Angular-Apps und Docker: Einleitung](https://angular-buch.com/blog/2019-12-docker0-intro)
2. [Angular-App über Docker bereitstellen](https://angular-buch.com/blog/2019-12-docker1-simple-case)
3. [Build Once, Run Anywhere oder: Konfiguration über Docker verwalten](https://angular-buch.com/blog/2019-12-docker2-build-once-run-anywhere) **(der aktuelle Artikel)**
4. [Multi-Stage Builds oder: Immer die Build-Umgebung dabei haben](https://angular-buch.com/blog/2019-12-docker3-multi-stage-build)

Im letzten Teil der Artikelserie zeige ich Ihnen, wie sie die Buildumgebung über die Projektlaufzeit im Griff behalten, auch wenn Sie Ihr System durch neue Versionen der benötigten Werkzeuge verändern.

<br>
<hr>

<small>**Titelbild:** Bild von [chuttersnap](https://unsplash.com/@chuttersnap) auf [Unsplash](https://unsplash.com), bearbeitet</small>
