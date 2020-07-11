---
title: 'Bring deine Angular PWA als TWA in den Android Store'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2020-09-01
lastModified: 2020-09-01
keywords:
  - TWA
  - Trusted Web Activity
  - PWA
  - Progressive Web App
  - Angular
  - Android
  - Android Store
language: de
thumbnail: ./twa.jpg
sticky: false
---

Progressive Web Apps sind in den letzten Jahren immer populärer geworden.
Sie erlauben es uns Webseiten und -Anwendungen auf einem Smartphone zu installieren und wie eine native installierte App zu benutzen.
Sie bieten uns die Möglichkeit Daten Offline über Service Worker zu cachen und zu speichern.
Weiterhin können Sie mit Push-Benachrichtigungen versenden.

> Wenn Sie noch keine Erfahrung mit der Umsetzung einer Angular-App als PWA haben, schauen Sie sich unseren Blog-Post ["Mach aus deiner Angular-App eine PWA"](blog/2019-07-progressive-web-app) an oder werfen Sie einen Blick in unser [_Angular Buch in der dritten Auflage_](angular-buch.com), wo wir dieses Thema detailiiert beschreiben.

Nach der Entwicklung einer PWA bleibt jedoch eine Hürde bestehen: Nutzer der Anwedung müssen sie URL kennen, über die die PWA abrufbar ist und installiert werden kann.
Viele Smartphone-Nutzer sind jedoch einen anderen Weg gewohnt um eine App zu installieren:
Sie suchen danach in einem App Store - sei es der Android _Google Play_ Store oder _App Store_ unter iOS.

In diesem Blog Post wollen wir Ihnen zeigen, wie Sie ihre PWA auf einfachem Weg den Android Store bringen können, ohne eine Android App mit Webview zu entwickeln, die lediglich ihre Website aufruft.

> Zur Zeit gibt es noch keine Möglichkeit PWAs im Apple App Store zu deployen.

## Trusted Web Activities vs. Webview-Integration

Um PWAs als Android App bereitzustellen benötigen wir eine Art App-Wrapper, der schlussendlich die PWA aufruft und somit unsere Web-Anwendung darstellen kann.
In der Vergangenheit wurde dies oft durch Android Apps umgesetzt, die lediglich einen sogenennten [_WebView_](https://developer.android.com/reference/android/webkit/WebView) integrieren.
Hinter diesem Feature versteckt sich ein integrierter Webbrowser in der Android App, der lediglich den Inhalt der Website darstellt.
Dieser Weg funktioniert für eine Vielzahl von Websites, gerät jedoch an seine Grenzen, wenn es beispielsweise um die Ausführung von Service Workern und Offline-Verhalten geht.
Weiterhin birgt ein Webview ein gewisses Sicherheitsrisiko, weil ledilgich die URL den Inhalt der Anwendung bestimmt und keinerlei Überprüfung des Contents stettfindet.
Wir also beispielsweise eine Website _"gekapert"_, bekommt der Nutzer ggf. den Inhalt einer falschen Seite angezeigt.
über einen Sicherheitsschlüssel verifiziert wird, dass die aufgerufene URL zur App passt.
Weiterhin werden durch TWAs auch Funktionen wie Offline-Funktionalität und Service-Worker unterstützt.

## TWAs im Detail

Die Grundidee einer TWA ist Recht simpel: Statt einer vollumfänglichen Android App, die einen Browser Implementiert und eine URL aufruft, wird bei einer TWA leidglich die PWA um eine kleine App-Schicht erweitert, sodass diese in den Google Play Store wandern kann.
Voraussetzung hierfür ist, dass auf dem Android Gerät der Google Chrome Browser in der Version 72 oder höher verfügbar ist.
Beim Öffen der PWA wird der Google Chrome Browser mit der hinterlegten URL geöffnet und es werden sämtliche UI Elemente des Google Chrome Browsers ausgeblendet.
Im Prinzip passiert also genau das, was auch geschieht wenn wir eine PWA über die _Add To Homescreen_ Funktion auf unserem Smartphone speichern, jedoch in Form einer App, die über den Google Play Store gefunden und installiert werden kann.
Somit bleiben Features wie Push-Benachrichtigungen, Hintergrundsynchronisierungen, Autofill bei Eingabeformularen, Media-Source-Extensions oder die Sharing API vorllumfänglich erhalten.
Ein weiterer Vorteil, den wir auf diesem Wege erhalten ist, dass Session-Daten und der Cache im Google Chrome Browser geteilt werden.
Haben wir uns also beispielsweise bei unserer Web-Anwendung zuvor im Browser angemeldt, so belibt die Anmeldung in der App bestehen.

Der Name der TWA lässt bereits darauf schließen: TWAs sind _trusted_ also vertraulich.
Durch eine spezielle Datei, die mit der Webanwendung ausgeliefert wird und die einen Fingerprint enthält, kann sichergestellt werden, dass die Anwendung vertrauenswürdig ist und der Inhalt kann somit sicher geladen werden.

## Eine PWA als TWA in den Android Store bringen

Genug der Theorie, wir wollen nun erfahren, wie wir eine PWA im Android Store als TWA bereitstellen können.

Dafür müssen wir folgende Schritte erledigen:

- Einen Android Developer Account registieren
- Die Android App in der Google Play Console erstellen
- Die App-Signatur erzeugen
- Den App-Signaturschlüssel in der PWA hinterlegen
- Bubblewrap CLI: Die TWA erzeugen
- Die signierte App bauen
- Die App in der Google Play Console bereitstellen
- Die App über die Google Play Console veröffentlichen

### Einen Android Developer Account registrieren

> Sofern Sie bereits einen Account für die _Google Play Console_ besitzen, können Sie diesen Schritt überspringen.

Um eine App im Google Play Store einzustellen, benötigen wir zunächst einen Account für die _Google Play Console_.
Den Account können Sie ganz einfach über den folgenden Link registrieren:

[https://play.google.com/apps/publish/signup](https://play.google.com/apps/publish/signup)

Bei der Registrierung wird eine einmalige Registrierungsgebühr in Höhe von 25 USD erhoben. Diese Gebühr gilt für sämtliche Apps, die Sie mit dem hinterlegten Google Account registrieren wollen.

![Google Play Console: Registrierung](play-register.png)

### Die Android App in der Google Play Console erstellen

Nach der Registierungs des Accounts, müssen wir uns in der [_Google Play Console_ einloggen](https://play.google.com/apps/publish).
Anschließend können wir über den Menüpunkt _Alle Apps_ mit dem Button _App Erstellen_ eine neue Anwendung anlegen.

![Google Play Console: Eine neue Anwendung erzeugen](play-create.png)

Nach Erstellung gelangen wir zur Detailkonfiguration für die neue Android App

![Google Play Console: Details zur neuen App](play-after-create.png)

Um nun eine Android App zu veröffentlich müssen wir uns durch alle Schritte arbeiten, die links im Menü mit einem ✅-Icon gekennzeichnet sind.

Füllen Sie hierfür als erstes alle obligatorischen Felder unter dem Menüpunkt _Store Eintrag_ aus und laden die entsprechend notwendigen Icons und Screenshots für die Anwendung hoch.
Diese können Sie im Nachhinein auch noch bearbeiten.
Wichtig ist zunächst, dass alle Pflichtfelder gefüllt sind.
Anschließend klicken Sie auf _Entwurf Speichern_.

Als nächstes arbeiten Sie sich durch den Menüpunkt _Einstufung des Inhalts_.
Hier müssen Sie einen Fragebogen zu den Inhalten ihrer App ausfüllen.
Anhand der Fragen wird ermittelt, für welche Personenkreise und Altersgruppen die App freigegben werden kann.

Haben Sie hier alle Angaben ausgefüllt und gespeichert, gehen Sie zum Schritt _App-Inhalte_.
Auch hier müssen Sie zunächst alle Schritte abarbeiten und beispielsweise einen Link zur Datenschutzerklärung angeben, Angaben machen, ob ihre App Werbebanner enthält und ihre Zielgruppe definieren.

Bevor wir nun ein Release erstellen können müssen wir noch den Menüpunkt _Preisgestaltung und Vertrieb_ abarbeiten.
Hier geben Sie an, ob es sich um eine kostenfreie oder kostenpflichtige App handeln soll und welchen Preis die App haben soll.
Sofern ihre App kostenflichtig sein soll, benötigen Sie noch ein Händlerkonto, dass Sie direkt über diese Seite einrichten können.
Im unteren Teil der Seite müssen Sie schlussendlich noch defineiren, in welchen Ländern die App im Google Play Store verfügbar sein soll.
Hier müssen Sie mindestens ein Land auswählen.
Weiterhin müssen Sie am Ende der Seite noch den Richtlinien für Inhalte und den Exportbestimmungen der USA zustimmen.

Okay, wir sollten nun bei allen Menüpunkten bis auf _App Releases_ einen grünes ✅ Icon sehen.
Im nächsten Schritt benötigen wir eine App-Signatur, die wir über die Erzeugung eines ersten Releases erhalten.

### Die App-Signatur erzeugen

Klicken wir auf den Menüpunkt _App-Signatur_, sehen wir zunächst nur einen Hinweis, dass wir zunächst ein Release benötigen.
Um dieses anzulegen gehen wir auf das Menü _App Releases_.
Hier müssen wir zunächst einen neuen Track erstellen.
Tracks können verschiedene Ausprägungen haben:

- Produktions-Track: Releases die für jeden Nutzer im Google Play Store bereitgestellt werden
- Offener Track: Releases die für jeden Nutzer im Google Play Store bereitgestellt werden aber als Vorab-Release (Beta Release) gekennzeichnet sind. Offene Tracks können auch auf eine bestimmte Anzahl von Nutzer begrenzt werden
- Geschlossener Track: Releases, die nur bestimmten Personen zum Download als Vorab-Release (Alpha Release) zur Verfügung stehen.
- Interner Test-Track: Releases, die zum Test für einen bestimmten personenkreis besipielsweise über einen Link bereitgestellt werden können.

In unserem Szenario wollen wir unsere App direkt bis in den Google Play Store bringen, um zu verifizieren, dass diese auch tatsächlich von allen Nutzern gefunden und installiert werden können.
Hierfür nutzen wir zunächst am besten den _Offenen Track_ und erstellen ein Beta-Release.
Dafür klicken wir im Abschnitt _Offener Track_ auf _Verwalten_.

![Google Play Console: Erstellen eines neuen Beta Releases](play-beta.png)

Auf der nächsten Seite klicken wir auf _Release Erstellen_.
Anschließend gelangen wir in den Abschnitt zur Erzeugung des _App-Signaturschlüssels_.
Hier klicken wir auf _Weiter_ um den Schlüssel zu aktivieren.

![Google Play Console: Erstellen des App-Signaturschlüssels](play-beta-sign.png)

Bevor wir nun unser Beta-Release veröffentlich müssen wir den erzuegten Schlüssel mit unserer PWA verknüpfen und die TWA erzeugen um Sie anschließend in die Google Play Console zu laden.

### Den App-Signaturschlüssel in der PWA hinterlegen

Wir verlassen zunächst wieder den Menüpunkt zur Erzeugung des Releases und gehen ins Menü _App-Signatur_.
Hier kopieren wir uns den _Fingerabdruck des SHA-256-Zertifikats_ in die Zwischenablage.

![Google Play Console: Kopieren des App-Signaturschlüssels](play-signature.png)

Dieser Fingerabdruck stellt später sicher, dass beim Aufruf der PWA durch unsere TWA verifiziert werden kann, dass die Anwendung _trusted_ - also verifiziert ist.

Um den Fingerabdruck aufspüren zu können, müssen wir diesen über die spezielle Datei `assetlinks.json` bereitstellen.
Weiterhin muss die Datei und ihr Inhalt über die spezielle URL `https://my-app.com/.well-known/assetlinks.json` aufrufbar sein.

Dafür erzeugen wir in unserem Angular-Workspace ein neues Verzeichnis `.well-known` unter `src`.
Darin legen wir die Datei `assetlinks.json` mit dem folgenden Inhalt an:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "allfront",
      "package_name": "com.angular_buch.book_monkey4",
      "sha256_cert_fingerprints": [
        "22:BD:55:D1...D1:79:D1:13"
      ]
    }
  }
]
```

Als `package_name` geben wir die Anwendungs-ID fest, die im Google Play Store eindeutig sein muss und genau auf eine App zeigt.
Die ID wird in der Regel aus einer Domain gebildet und rückwärts gelistet.
Sie muss mindestens einen Punkt enthalten, Zeichen hinter einem Punkt dürfen nur Buchstaben sein und die gesamte ID darf lediglich Alphanumerische Zeichen enthalten.
Zeichen wie `-` sind nicht erlaubt.
Alle Regeln zur Definition einer validen ID, können der [Android Entwicklerdokumentstion](https://developer.android.com/studio/build/application-id) entnommen werden.

Wie erkenntlich ist, müssen wir weiterhin den kopierten App-Signaturschlüssel unter `sha256_cert_fingerprints` eintragen.

> Achtung kopieren Sie den Fingerprint von der Google Play Console, wird ggf. der Präfix `SHA256: ` mit kopiert. Dieser muss beim Einfügen weggelassen werden.

Jetzt müssen wir Angular noch beibringen, dass der relative URL-Pfad `.well-known/assetlinks.json` nicht durch den Angular-Router behandelt und umgeleitet wird, sondern, dass sich dahinter ein statisches Asset verbrigt, welches direkt über die URL aufrufbar sein soll.

Dafür bearbeiten wir den Abschnitt `build` innerhalb des Projekt-Aschnitts unserer Datei `angular.json`.
Dort geben wir an, dass alle Dateien unter `src/.well-known` über den relativen Pfad `/.well-known/` bereitgestellt werden sollen:

```json
{
  // ...
  "projects": {
    "book-monkey": {
      // ...
      "architect": {
        "build": {
          // ...
          "options": {
            // ...
            "assets": [
              // ...
              {
                "glob": "**/*",
                "input": "src/.well-known/",
                "output": "/.well-known/"
              }
              // ...
            ],
            // ...
          },
          // ...
        },
        // ...
      },
      // ...
    },
    // ...
  },
  // ...
}       
```

Wir überprüfen das Ergebnis am besten indem wir einen Prod-Build ausführen und einen einfachen Webserver starten:

```
ng build --prod
cd dist/book-monkey
npx http-server
```

Rufen wir nun die URL `http://localhost:8080/.well-known/assetlinks.json` im Browser auf, sehen wir, dass unsere Datei `assetlinks.json` dargestellt wird:

![Test der Auslieferung der Datei assetlinks.json im Browser](assetlinks-browser.png)

War der Test erfolgreich, können wir unsere PWA deployen.
Wichtig ist, dass diese zwingend per _https_ asugeleifert werden muss.

> Achtung! Nutzen Sie beispielsweise Github Pages zur Auslieferung ihrer Anwendung, so müssen Sie vor dem Deployment im Dist-Verzeichnis (`dist/book-monkey`) eine Datei `_config.yml` mit dem Inhalt `include: [".well-known"]` anlegen, da alle Verzeichnisse beginnend `.` per Default [von Github Pages ignoriert werden](https://github.com/keybase/keybase-issues/issues/366#issuecomment-38749201). Diesen Schritt integrieren Sie am besten in ihre Deployment-Pipelin

Überprüfen Sie nach dem Deployment am besten noch einmal, ob Sie die URL `http://mydomain/.well-known/assetlinks.json` aufrufen können.
In unserem Fall wäre das: `https://bm4-pwa.angular-buch.com/.well-known/assetlinks.json`.

## Bubblewrap CLI: Die TWA erzeugen

Wir haben nun unsere PWA für den Konsum der TWA vorbereitet und alle nötigen Vorberitungen in der Google Play Console getroffen.
Als nächstes wollen die die Android App erstellen, die unser PWA in Form einer TWA aufruft und als eigenständige App kapselt.

Hierfür nutzen wir die [_Bubblewrap CLI_](https://www.npmjs.com/package/@bubblewrap/cli), die genau zu diesem Zweck geschaffen wurde.
Wir können diese direkt als NPM Paket über `npx` aufrufen und die Anwendung erzeugen lassen.
Anschließend fürht uns der Interaktive Wizard durch das Setup indem wir einge Fragen beantworten müssen, auf die wir anchfolgend weiter eingehen werden.

```bash
mkdir monkey4-pwa-twa-wrapper
cd monkey4-pwa-twa-wrapper
npx @bubblewrap/cli init --manifest https://bm4-pwa.angular-buch.com/manifest.json
```

Nutzen wir die Bubblewrap CLI das erste Mal, so werden wir in den ersten zwei Schritten nach den Verzeichnissen für das [Java OpenJDK](https://openjdk.java.net/) und das [AndroidSDK](https://developer.android.com/studio) gefragt.
Hier geben wir die Pfade zu den entsprechenden Verzeichnissen an:

```bash
? Path to the JDK: /Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home
? Path to the Android SDK: /Users/my-user/Library/Android/sdk
```

> Diese Angaben werden für spätere Installationen in der Datei `~/.llama-pack/llama-pack-config.json` gespeichert und können bei Bedarf angepasst werden.

Im nächsten Schritt liest die Bubblewrap CLI das Web App Manifest unserer PWA aus und stellt uns einige Fragen zur Bezeichnung der App, hinterlegten Icons und Pfaden.
Diese werden in der Regel schon korrekt ausgelesen und müssen von uns nicht weiter angepasst werden:

```bash
init Fetching Manifest:  https://bm4-pwa.angular-buch.com/manifest.json
? Domain being opened in the TWA: bm4-pwa.angular-buch.com
? Name of the application: BookMonkey 4 PWA
? Name to be shown on the Android Launcher: BookMonkey
? Color to be used for the status bar: #DB2828
? Color to be used for the splash screen background: #FAFAFA
? Relative path to open the TWA: /
? URL to an image that is at least 512x512px: https://bm4-pwa.angular-buch.com/assets/icons/icon-512x512.png
? URL to an image that is at least 512x512px to be used when generating maskable icons undefined
? Include app shortcuts?
  Yes
? Android Package Name (or Application ID): com.angular_buch.bm4_pwa.twa
```

Nun werden wir nach dem Pfad des Schlüssels zur Signierung der App gefragt.
Haben wir hier noch keinen erzeugt, werden wir darauf hingewiesen und können einen neuen Schlüssel anlegen.
Dafür geben müssen wir unseren Namen und Informationen zur Firma und Abteilung hinterlegen.
Weiterhin müssen wir einen Ländercode angeben (in unserem Fall `DE` für Deutschland).
Weiterhin müssen wir ein Passwort für den Key Store und eines für den einzelnen Key der Anwendung hinterlegen.
Dieses benötigen wir später beim Build und der Signierung der App erneut.

```bash
? Location of the Signing Key: ./android.keystore
? Key name: android
...
? Signing Key could not be found at "./android.keystore". Do you want to create one now? Yes
? First and Last names (eg: John Doe): John Doe
? Organizational Unit (eg: Engineering Dept): Engineering Dept
? Organization (eg: Company Name): My Company
? Country (2 letter code): DE
? Password for the Key Store: [hidden]
? Password for the Key: [hidden]
keytool Signing Key created successfully
init
init Project generated successfully. Build it by running "@bubblewrap/cli build"
```

Im Ergebnis sollten wir folgende Struktur erhalten:

![Die Dateistruktur nach Erzeugung der TWA mit Hile der Bubblewrap CLI](twa-bubblewrap.png)

Im Prinzip sind wir damit auch schon fertig.
Wir müssen nun noch die fertige Android App (`*.apk`-Datei) erzeugen.

## Die signierte App bauen

Auch hierfür nutzen wir die Bubblewrap CLI:

```bash
npx @bubblewrap/cli build
? KeyStore password: ********
? Key password: ********
build Building the Android App...
```

Wenn wir keinen Fehler erhalten, sollte sich die fertige signierte App unter `app/build/outputs/apk/release/app-release-signed.apk` befinden.

Kommt es zu folgenden Fehler, so können wir die signierte App auch mit Hilfe von Android Studio bauen:

```bash
cli ERROR Command failed: ./gradlew assembleRelease --stacktrace
```

Dafür öffnen wir dss Projektverzeichnis in Android Studio.
Wir warten hier zunächst ab, bis der automatische Gradle-Build nach dem Öffnen des Projektes durchgelaufen ist.
Den Fortschritt können wir im unten rechts in Android Studio begutachten.
Anschließend klicken wür im Menü "Build" auf "Generate Signed Bundle / APK".

![Android Studio: Signierte APK erstellen](android-studio-generate-signed-apk.png)

Wir wählen hier den Punkt "APK" aus und klicken auf "Next".

![Android Studio: Signierte APK erstellen](android-studio-generate-signed-apk2.png)

Im nächsten Schritt wählen wir den erstellten Keystore (`android.keystore`) aus dem Projektverzeichnis aus udn geben das von uns festgelegte Passwort ein.
Anschließend können wir aus dem Keystore den _Key alias_ auswählen (`android`).
Auch hier müssen wir das Passwort eingeben, welches wir für den konkreten Key vergeben hatten.
Haben wir alle Angaben korrekt getätigt, gehen wir weiter mit "Next".

![Android Studio: Signierte APK erstellen](android-studio-generate-signed-apk3.png)

Im nächsten Schritt wählen wir bei der Build Variante _release_ aus und setzen die beiden Checkboxen bei _V1 (Jar Signature)_ und _V2 (Full APK Signature)_.
Anschließend können wir die Erzeugung mit "Finish" starten.

![Android Studio: Signierte APK erstellen](android-studio-generate-signed-apk3.png)

## Die App in der Google Play Console bereitstellen

**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** TODO</small>
