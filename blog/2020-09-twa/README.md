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
- Das `assetlink`-File über die PWA bereitstellen
- Das Basis-TWA Projekt kopieren
- Das TWA-Projekt anpassen
- Die signierte App erzeugen
- Die App in der Google Play Console bereitstellen
- Die App über die Google Play Console veröffentlichen

### Einen Android Developer Account registrieren

> Sofern Sie bereits einen Account für die _Google Play Console_ besitzen, können Sie diesen Schritt überspringen.

Um eine App im Google Play Store einzustellen, benötigen wir zunächst einen Account für die _Google Play Console_.
Den Account können Sie ganz einfach über den folgenden Link registrieren:

[https://play.google.com/apps/publish/signup](https://play.google.com/apps/publish/signup)

Bei der Registrierung wird eine einmalige Registrierungsgebühr in Höhe von 25 USD erhoben. Diese Gebühr gilt für sämtliche Apps, die Sie mit dem hinterlegten Google Account registrieren wollen.

![Google Play Console Registrierung](play-register.png)

### Die Android App in der Google Play Console erstellen

Nach der Registierungs des Accounts, müssen wir uns in der [_Google Play Console_ einloggen](https://play.google.com/apps/publish).
Anschließend können wir über den Menüpunkt _Alle Apps_ mit dem Button _App Erstellen_ eine neue Anwendung anlegen.

![Google Play Console Neue Anwendung erzeugen](play-create.png)

Nach Erstellung gelangen wir zur Detailkonfiguration für die neue Android App

![Google Play Console Details zur neuen App](play-after-create.png)

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

- Produktions-Track:
- Offener Track:
- Geschlossener Track:
- Interner Test-Track:

<!--
TODO: Hinweis: Dotfiles bei GH-Pages includen (`_config.yml`)
-->


**Viel Spaß wünschen
Johannes, Danny und Ferdinand**

<small>**Titelbild:** TODO</small>
