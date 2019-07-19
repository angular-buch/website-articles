---
title: "Mach auf deiner Webanwendung eine PWA"
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
published: 2019-07-18
lastModified: 2019-07-18
keywords:
  - PWA
  - Progressive Web App
  - Angular
  - Service Worker
language: de
thumbnail: ./pwa.jpg
sticky: false
hidden: true
---

Immer öfter stößt man im Webumfeld auf den Begriff PWA. Doch was genau steckt dahiner und welche Vorteile hat eine PWA gegenüber einer herkömmlichen Webanwendung oder einer App?
PWA steht als Abkürzung für _Progressive Web App_ und bezeichnet eine Webanwendung, die beim Aufruf einer Website als App auf einem lokalen Gerät installiert werden kann.

## Webanwendung VS. PWAs VS. App

Wir wollen zunächst den Begriff der PWA etwas konkreter einordnen. Dazu schauen wir uns den Unterschied einer PWA im Vergleich zu einer herkömmlichen Webanwendung und einer App an.
Mit Hilfe einer Webanwendung kann ein Nutzer über eine URL im Browser Informationen abrufen und verarbeiten. Eine App erfüllt einen ganz ähnlichen Zweck, nur kann diese auf einem Gerät lokal installiert werden und benötigt keinen Browser zur Informationsverarbeitung. Eine PWA stellt nun eine Art mix von beidem dar. Es handelt sich grundlegend auch um eine Webanwendung, nur dass diese durch den Nutzer heruntergleaden und auf dem lokalen Gerät gespeichert werden kann. Weiterhin sorgt eine PWA dafür, dass die wichtigstens Daten gecacht werden. Somit bleiben Informationen, die die Anwendung liefert stets abrufbar, auch wenn ggf. keine durchgängige Netzwerkverbindung vorhanden ist.

## Service Worker

Die Grundvoraussetzung für eine PWA sind die sogenannten Service Worker. Service Woker sind gewissermaßen kleine Helfer des Browsers, die bestimmte Aufgaben im Hintergrund übernehmen.
Hierzu zählen vor allem des Speichern und Abrufen der Daten auf einem Endgerät. Service Worker prüfen beispielsweise ob eine Netzwerkverbindung besteht und senden zur Webanwendung je nach Konfiguration Daten aus dem Cache oder versuchen die Daten online abzurufen.

## Eine bestehende Angular-Anwendung in eine PWA verwandeln

Schauen wir uns das Ganze an einem Beispiel an.
Wie wollen die Anwendung BookMonkey in eine PWA verwandeln. Somit können Nutzer diese auf ihrem Gerät installieren und erhalten stets Buchdaten, auch wenn Sie gerade keine Netzwerkkonnektivität haben. Zunächst klonen wir uns hierfür die bestehende Webanwendung in ein lokales Repository:

```bash
git clone git@github.com:book-monkey3/iteration-7-i18n.git BookMonkey
cd BookMonkey-PWA
```

Als nächstes installieren wir die Angular PWA Schematics, die uns bereits einen Großteil der Arbeit zum Erzeugen der PWA abnehmen:

- Hinzufügen des Packages `@angular/service-worker` zu unserem Projekt
- Aktivieren des Build Support für Service Worker in der Angular CLI
- Importieren und Registieren des Service Worker Moduls im `AppModule`
- Update der Datei `index.html` mit einem Link zum Web App Manifest (`manifest.json`) sowie Hinzufügen relevanter Meta-Tags
- Erzeugen und verlinken von Icon-Dateien
- Erzeugen der Service-Worker Konfigurationsdatei `ngsw-config.json`

```bash
ng add @angular/pwa --project  BookMonkey
```

Soweit so gut. Das wichtigste ist bereits erledigt. Wir können jetzt schon unsere Anwendung in Form einer PWA erzeugen und nutzen.

```bash
ng build --prod
```

Nach dem Estellen der Anwendung, wollen wir uns diese im Browser ansehen. Dafür nutzen wir den global installieren `angular-http-server`.

> Der `angular-http-server` leitet im Gegensatz zum `http-server` alle Anfragen zu nicht existierenden Verzeichnissen oder Dateien an die Datei `index.html` weiter.
Dies ist notwendig, da das Routing durch Angular und nicht durch den Webserver durchgeführt wird.

```bash
npm i -g angular-http-server
angular-http-server --path=dist/BookMonkey
```

Um nun zu testen, ob wir tatsächlich eine PWA erhalten haben, rufen wir am besten die Google Chrome Developer Tools auf. Dort können wir im Tab _Network_ die Checkbox _Offline_ setzen.
Anschließend laden wir die Seite neu.
Wir sehen, dass uns trotz des Offline-Modus die Startseite unserer App angezeigt wird, da der Service-Worker ein Caching erwirkt hat.
Navigieren wir allerdings zur Buchliste, so können keine Bücher angezeigt werden.

![Screenshot BookMonkey PWA, Offline-Modus in den Google Chrome Developer Tools aktivieren](bm-pwa-offline.png)

> Achtung: Die PWA verwendet Service Worker. Diese können ausschließlich über gesicherte Verbindungen mit HTTPS oder über eine Localhost-Verbindung genutzt werden. Rufen Sie die App, die mittels `angular-http-server` ohne SSL ausgeleifert wird also über ein anderes Gerät auf, so werden die Service Worker nicht wie gewünscht funktionieren.

### Anpassen des Web App Manifests (`manifest.json`)

Das Web App Manifest ist eine JSON-Datei, die dem Browser mitteilt, wie sich die Anwendung verhalten soll, wenn Sie installiert wird. Hier wird beispieltweise eine Hintergrundfarbe für die Menüleiste auf den nativen Engeräten hinterlegt und es werden die Pfade zu hinterlgten Icons angegeben.

Wir wollen die Standard-Datei, die uns die PWA Schematics generiert haben noch etwas anpassen. Um dies nicht händisch zu tun, verwenden wir am besten einen Generator.
Wir empfehlen hier den [Web App Manifest Generator](https://app-manifest.firebaseapp.com/).
Hierbei sollten wir bei der Einstellung _Display Mode_ die Auswahl _Standalone_ nutzen, da wir eine eigenstände App erhalten wollen.
Wollen wir das Standard-Icon ändern, laden wir hier einfach ein Bild hoch und lassen uns die zugehörigen Bilder erzuegen. Nach dem entpacken der ZIP-Datei, speichern wir Die Bilder in unserem Projekt unter `src/assets/icons` ab. Anschließend prüfen wir noch einmal die Pfade in der `manifest.json`-Datei.

![Screenshot Web App Manifest Generator](web-app-manifest-generator.png)

### Anpassen der `index.html` für iOS

Wollen wir unsere PWA unter iOS installieren, sind noch einige Anpassungen and der Datei `index.html` notwendig.
iOS Geräte benötigen spezielle `meta` und `link` Tags zur Identifizierung der zugehörigen Icons. Sie extrahieren diese Informationen nicht aus dem Web-Manifest.

Um das Icon für den Homescreen zu definieren, müssen die folgende Zeilen in die Datei `index.html` eingefügt werden:

```html
<head>
  ...
  <link rel="apple-touch-icon" href="assets/icons/icon-512x512.png">
  <link rel="apple-touch-icon" sizes="152x152" href="assets/icons/icon-152x152.png">
</head>
```

Wir geben den entsprechenden Pfad zum genutzten Icon an. Über das `sizes` Attribut können wir Icons mit bestimmten Größen hinterlegen. Weitere gängige Größen für iOS wären z. B. `180x180` und `167x167`.

Weiterhin können wir über die `link`-Tags für iOS ein Splashscreen Bild hinterlegen. Dieses wir angezeigt, sobald wir die App vom Homescreen aus starten.
Auch hierfür gib es einen Generator, der uns die Bilder in den entsprechenden Größen erzeugt und und die generierten `link`-Tags anzeigt: [iOS Splash Screen Generator](https://appsco.pe/developer/splash-screens/).

Anschließend fügen wir die Tags der `index.html` hinzu. Wir müssen an dieser Stelle noch den Pfad zu den Bildern so anpassen, sodass dieser korrekt ist.
Die erste Zeile teilt iOS Geräten mit, dass die Webanwendung als App gneutzt werden kann. Nur wenn diese Zeile in der `index.html` angegeben wurde, liest das iOS Gerät den `link`-Tag mit der Angabe zum Splashscreen aus.

```html
<head>
  ...
  <meta name="apple-mobile-web-app-capable" content="yes">
  ...
  <link href="assets/splashscreens/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/ipadpro1_splash.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/ipadpro3_splash.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
  <link href="assets/splashscreens/ipadpro2_splash.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
</head>
```

Als letztes haben wir noch die Möglichkeit die Statusbar der App hinsichtlich ihrer Farbe anzupassen. Dazu fürgen wir den folgenden Metatag zur `index.html` hinzu.

```html
<head>
  ...
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  ...
</head>
```

Wir können als Wert für `content` zwischen den folgenden Werten wählen:
|                     | Text- und Iconfarbe | Hintergrundfarbe                        |
|---------------------|---------------------|-----------------------------------------|
| `default`           | Schwarz             | Weiß                                    |
| `white`             | Schwarz             | Weiß                                    |
| `black`             | Weiß                | Schwarz                                 |
| `black-translucent` | Weiß                | Hintergrundfarbe der App (body-Element) |

Schauen wir uns nun das Ergebnis an, sehen wir, dass die App die korrekten Icons nutzt und uns nach der Installation und dem Start zunächst kurz den Spalshscreen zeigt, bevor die App vollflächig dargestellt wird. Die Statusbar ist in unserem Fall Schwarz, wie zuvor angegeben.

![Der BookMonkey als PWA mit Splashscreen unter iOS](bm-pwa-ios-homescreen-splashscreen-start.png)

### Anpassen der Konfiguration für Angular Service Worker -- `ngsw-config.json`

Die Konfigurationsdatei für Angular Service Worker definiert, welche Ressoucen und Pfade gecached werden sollen und welche Strategie hierfür verwendet wird.
Eine ausführliche Beschreibung der einzelnen Prameter findet man in der offiziellen Dokumentation auf [angular.io](https://angular.io/guide/service-worker-config).

Die beiden großen Blöcke der Konfiguration sind die `assetGroups` und die `dataGroup`. Im Array `asssetGroups` ist die Konfiguration zu Ressourcen enthalten die zur App selbst gehören. Hierzu zählen zum Biespiel statische Bilder, CSS-Stylesheets, Third-Party Ressourcen welche von CDNs geladen werden etc.
Das `dataGroup` Array, beinhaltet Ressourcen, die nicht zur App selbst gehören. Hierzu zählen zum Beispiel API-Aufrufe und andere Daten-Abhängigkeiten.

Wir wollen bei unserer Beispielanwendung als nächstes erwirken, die Liste der Bücher sowie bereits angesehene Bücher als auch die Suchresultate ebenfalls gecached werden und auch angezeigt werden können, sofern keine Netzwerkverbindung besteht.
Dazu passen wir die Datei `ngsw-config.json` an und erweitern diese wie folgt:

> Achtung! Wenn Sie Änderungen am Quellcode durchführen, werden ihnen ggf. beim Aktualisieren der Anwendung im Browser alte (gecachte) Daten angezeigt. Sie sollten deshalb während der Entwicklung stets einen neuen neuen Icognito Tab nutzen. Schließen Sie diesen und laden die Anwendung neu, erhalten Sie eine "frische" Anwednung. Achten Sie auch darauf, dass in den Google Chrome Developer Tools die Option _Disable Cache_ deaktiviert ist.

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [ /* ... */ ],
  "dataGroups": [
    {
      "name": "Books",
      "urls": [
        "/secure/books",
        "/secure/books/search/**",
        "/secure/book/**"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 50,
        "maxAge": "1d2h",
        "timeout": "3s"
      }
    }
  ]
}
```

Wir verwenden an dieser Stelle den `dataGroups` Block, da unsere Buchdatenbank keine statischen Daten enthält, die direkt zu App gehören.
Dem Block in `dataGroups` geben wir die Bezeichnung `BookList`. Wir legen fest, dass alle Aufrufe unter `/books` vom Service Worker behandelt werden sollen.
Im letzten Schritt definieren wir das Verhalten des Caches. Wir wollen hier die `freshness` Strategie verwenden. Diese besagt, dass idealerweise die aktuellen Daten abgerufen werden.
Erhalten wir jedoch ein Netzwerk-Timeout nach Ablauf der definierten Zeit im `timeout` Parameter, werden die zuletzt gecachten Daten ausgeliefert. Die Strategie eigent sich vor allem für dynamische Daten, die über eine API bezogen werden und die möglichst immer im aktuellen Stand repräsentiert werden sollen.
Die Option `maxSize` definiert die maximale Anzahl von Einträgen im Cache. `maxAge` gibt die maximale Gültigkeit der Daten im Cache an, in unserem Fall sollen die Daten einen Tag und 2 Stunden gültig sein.

Eine zweite Strategie für den Cache wäre übrigens die `performance` Strategie. Diese liefert immer zunächst die Daten aus dem Cache solange diese gültig sind.
Erst wenn der `timeout` abläuft, werden die Daten im Cache aktualisiert. Diese Strategie eignet sich vorallem für Daten, die nicht sehr oft geändert werden müssen oder bei denen eine hohe Aktualität keine große Relevanz hat.

Schauen wir uns nun wieder unsere Anwendung an und deaktivieren die Netzwerkverbindung, nach dem erstmaligen Abrufen der Buchliste, so sehen wir, dass weiterhin Buch-Daten angezeigt werden, wenn wir die Anwendung neu laden oder in ihr navigieren.

### Update der PWA
Service Worker Updates werden in Angular über den `SwUpdate`-Service behandelt. Dieser liefert uns Infomrationen über ein verfügbares bzw. durchgeführtes Update auf die wir reagieren können. In der Regel werden Service Worker im Hintergrund geupdatet und Nutzer bekommen davon nichts mit.
Es kann jedoch hilfreich sein, dem Nutzer mitzuteilen, dass ein Update vorliegt, um ihm beispielsweise über die Neuerungen zu informieren.
Wir wollen genau diesen Fall implementieren.

Zunächst passen wir dafür die Datei `ngsw-config.json` an. Hier fügen wir den Abschnitt `appData` ein. Dieser kann Informationen wie eine Beschreibung, die Version und weiteres enthalten. Wir wollen in diesem Abschnitt eine Versionsnummer sowie einen Changelog hinterlegen, den wir später bei einem Update den Nutzern anzeigen wollen.
Die Versionsnummer dient lediglich als Nutzerinformation. Hinter den Kulissen erfolgt jedoch ein Binärvergleich des erzeugten Service Workers aus der `ngsw-config.json`. Jede kleinste Änderung an der `ngsw-config.json` führt somit zu einem neuen Service Worker unabhängig von der von uns hinterlegten Versionsnummer.

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "appData": {
    "version": "1.1.0",
    "changelog": "aktuelle Version"
  },
  // ...
}
```

Anschließend erzeugen wir die Anwendung und rufen diese auf. Bis hierhin ist alles wie gehabt.
Nun wollen wir, dass Nutzer über Änderungen informiert werden.
Dafür nutzen wir den `SwUpdate`-Service von Angular. Wir abbonieren hier das Observable `available`.
Sobald eine neuer Service Worker erzeugt wird, greift dieses Event.
Wir können nun einen Confirm-Dialog anzeigen und den Nutzer fragen, ob er ein Update durchführen möchte.
Das Event aus dem Observable liefert uns außerdem die komplette Konfiguration von `appData` aus der `ngsw-config.json` in der aktuellen Version sowie in der neuen Version des Service Workers.
Bestätigt der Nutzer nun den Dialog mit _Ok_, erfolgt ein Neuladen der Seite, was ein Update des Service Workers zur Folge hat.

```ts
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({ /* ... */ })
export class AppComponent implements OnInit {

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((evt) => {
        const updateApp = window.confirm(`
          Ein Update ist verfügbar (${evt.current.appData['version']} => ${evt.available.appData['version']}).
          Änderungen: ${evt.current.appData['changelog']}
          Wollen Sie das Update jetzt installieren?
        `);
        if (updateApp) { window.location.reload(); }
      });
    }
  }
}
```

Um nun tatsächlich einen neuen Service Worker zu erhalten, müssen wir noch Änderungen an der `ngsw-config.json` vornehmen, damit nach dem Binärvergleich eine neue Service Worker Version erzeugt wird. Wir ändern hier lediglich die Versionsnummer sowie das Changelog.

> An dieser Stelle sei nochmals angemerkt, dass die Versionsnummer keine tatsächliche Version des Service Workers darstellt. Wir könnten hier auch eine niedrigere Versionsnummer angeben und es würde trotzdem ein Update des Service Workers erfolgen.

```json
{
  // ...
  "appData": {
    "version": "2.0.0",
    "changelog": "Caching bereits abgerufener Bücher"
  },
  // ...
}
```

Erzeugen wir die Anwendung neu und starten wieder den Webserver, so sehen wir, dass kurz nach dem Laden der Seite ein Hinweis zum Update erscheint. Bestätigen wir diesen, wird die Seite neu geladen und es wird fortan der neu erzeugte Service Worker verwendet.

![Screenshot Anzeiege eines Updates der PWA](bm-pwa-update.png)

Der fertige BookMonkey als PWA kann auch [auf Github](https://github.com/angular-buch/book-monkey3-pwa) abgerufen werden.

### Weiterführende Themen
Dies war nur ein kleiner Einblick in PWAs mit Angular. PWAs bieten noch weitere interessante Möglichkeiten.
Wir wollen hierzu gern den Blogpost [Build a production ready PWA with Angular and Firebase](https://itnext.io/build-a-production-ready-pwa-with-angular-and-firebase-8f2a69824fcc) von Önder Ceylan empfehlen.

Viel Spaß beim programmieren.