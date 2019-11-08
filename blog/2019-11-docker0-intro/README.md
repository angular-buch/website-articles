---
title: "[Docker Serie 1/4] Angular-Apps und Docker: Einleitung"
author: Michael Kaaden
mail: blog@kaaden.net
published: 2019-11-30
keywords:
  - Docker
  - Deployment
language: de
thumbnail: TODO.jpg
hidden: true 
---

Es ist soweit: Ihre Dank der zweiten Auflage des famosen
[Angular-Buchs](https://angular-buch.com/) mit [Angular](https://angular.io/)
erstellte App ist fertig. Die Unit- wie End-to-End-Tests leuchten tiefgrün. Die
Code-Überdeckung liegt nahe 100 Prozent. Auf Ihrem Entwicklungssystem läuft die
App perfekt. Jetzt müssen Sie sie nur noch auf Ihrem extern verfügbaren
Web-Server zum Laufen bringen und die Begeisterungsstürme Ihrer Nutzer abwarten.

## Prinzipielles Deployment

Im Prinzip ist es dank [@angular/cli](https://cli.angular.io/) sehr einfach,
eine für den Produktivmodus geeignete Version Ihrer App zu erzeugen: Sie rufen
lediglich `ng build --prod` auf und kopieren anschließend den Inhalt des
Verzeichnisses `dist/<app-name>` auf den Rechner, auf dem der Web-Server läuft.
Im Web-Server, sei es ein Apache, nginx oder was auch immer, tragen Sie dann den
Verzeichnispfad ein, unter dem sie die App abgelegt haben, und sorgen dafür,
dass jede Anfrage auf `index.html` gemappt wird.

## Problemstellung

In naher Zukunft werden Sie Bugs in der App fixen und neue Features einbauen.
Jedes Mal werden Sie deswegen eine neue Version Ihrer App erstellen müssen. Wie
können Sie sicherstellen, dass die jeweils passende Version ihren Weg auf Ihren
Web-Server findet?

Vielleicht erstellen Sie die App ja auch im Kundenauftrag im Rahmen eines agilen
Entwicklungsprozesses. Der Kunde will dann nicht nur die jeweils aktuelle
Version Ihrer App nutzen, sondern auch den jeweils aktuellen Arbeitsstand
begutachten können, um frühzeitig Rückmeldung zu in Entwicklung befindlichen
Features geben zu können. Letzteren werden Sie täglich erweitern, beide Stände
evtl. durch Bugfixes pflegen müssen. Wie stellen Sie sicher, dass Sie in der
Hektik des Entwickleralltags nicht vergessen, den jeweils neuesten Stand
einzuspielen? Und wie gehen Sie damit um, wenn im Produktivstand ein Fehler
durchgeschlüpft ist, Ihre Entwicklungsmaschine aber gerade wegen eines
Festplattenschadens nicht verfügbar ist, um den Fehler zu beheben?

In diesem und den folgenden Blog-Artikeln möchte ich Ihnen zeigen, wie Sie mit
diesen Problemstellungen bestmöglich umgehen können.

## Die Beispiel-App

Als Beispiel soll uns über die Artikel hinweg eine ganz einfache App dienen, die
aus zwei Komponenten bestehen, zwischen denen wir mittels Routing wechseln
können. Die eine Komponente zeigt eine "1" an, die andere eine "2". Sinn dessen
ist, zu zeigen, dass die App samt Routing auch nach einem Reload in Ihrem
Browser noch funktioniert. Setzen Sie ihren Web-Server nämlich falsch auf, wird
das zu einer Fehlermeldung führen.

Diese App bleibt aus Benutzerperspektive über die ganze Artikelserie hinweg
identisch. Tatsächlich werden wir sie, wo nötig, erweitern, um den
Erfordernissen zu genügen. Sie finden die App auf
[GitHub](https://github.com/MichaelKaaden/dockerized-app). Die
`Part-...`-Verzeichnisse entsprechen den jeweiligen Teilen dieser Serie.

## Grundsätzliches zu Docker

Falls Sie mit Docker noch nichts zu tun haben, teasere ich in diesem Abschnitt
kurz einige der Vorteile von Docker an, um bereits die Lösung für die o. g.
Fragen zu skizzieren. Ich werde hier jedoch keine Docker-Konzepte vorstellen.
Eine erste (englischsprachige) Einführung bietet z. B. das
[Docker Get Started Tutorial](https://docs.docker.com/get-started/).

Bei Docker handelt es sich um nichts anderes als eine extrem leichtgewichtige
Virtualisierungslösung, die lediglich den Prozess mit der Software, die Sie
nutzen wollen, virtualisiert. Andere Lösungen wie VirtualBox oder VMware
emulieren einen ganzen Rechner, darauf ein Betriebssystem und erst darin die
Software.

### Images und Container

Docker erstellt sog. _Images_, die eine Software wie ihre App und die
notwendigen Abhängigkeiten wie den Web-Server und dessen Abhängigkeiten
enthalten. Zur Laufzeit werden Images in _Container_ instanziiert, die jeweils
einem Prozess entsprechen. Somit verhält sich ein Container zu einem Image wie
eine Instanz zu einer Klasse in gängigen objektorientierten Programmiersprachen.

### Portabel

Da ein Docker-Container seine eigene Ablaufumgebung mitbringt, können Sie eine
Software, die etwa ein Ubuntu benötigt, problemlos auf einem Debian laufen
lassen. Container sind somit portabel.

### Isoliert, schnell und ressourcenschonend

Docker nutzt Linux-Basismechanismen, um einzelne Prozesse mitsamt ihrer
Abhängigkeiten wie Libraries zu kapseln und isoliert vom Rest des Systems auf
dem Kernel des Wirtssystems zur Ausführung zu bringen. Somit benötigt ein
Docker-Container nur unwesentlich mehr Ressourcen als ein nativer Prozess: Es
kommen lediglich einige Verwaltungsstrukturen hinzu, außerdem läuft der
Netzwerkverkehr des Containers etwas verschlungenere Wege, um die Kommunikation
begrenzen und in ein virtuelles Netzwerk verlagern zu können. Software in einem
Docker-Container läuft dadurch fast genauso schnell und mit fast gleichem
Ressourcenverbrauch wie im nativen Betrieb. Sie können somit dutzende, wenn
nicht hunderte von Containern auf einem handelsüblichen Rechner betreiben.

![Docker-Virtualisierung](https://docs.docker.com/images/VM%402x.png) Quelle:
[https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)

### Repositories

Docker-Images können über _Repositories_ verteilt werden. Das können öffentliche
wie der [Docker Hub](https://hub.docker.com/) oder auch private in Ihrem lokalen
Netz sein. Die Installation ist extrem einfach, denn auch das Repository kommt
als Docker-Image auf Ihren Rechner. Sie können Images über ein Repository in
Ihrem Netzwerk verteilen: Rechner A, sei es Ihr Entwicklerrechner oder ein Build
Server, baut ein Docker-Image und schiebt dieses in das Repository. Rechner B,
Ihr Web-Server, holt sich das jeweils neueste Image vom Repository und startet
damit den Container neu. Schon haben Sie eine neue Version Ihrer App zum Laufen
gebracht.

### Lösungsskizze

Weiter oben habe ich schon die Problematik angedeutet, dass Sie ständig neue
Versionen Ihrer App auf ihren Web-Server aufspielen müssen. Wenn Sie bei jedem
Commit in Ihrem Versionsverwaltungssystem automatisiert ein neues Docker-Image
erzeugen und dieses von Ihrem Webserver aus holen und zur Ausführung bringen,
brauchen Sie sich keine Gedanken mehr darüber zu machen, wie und wo Sie Ihre App
bereitstellen.

Da Sie jedes Image mit einem sog. _Tag_ versehen können, etwa dem Zeitpunkt des
Builds, dem Namen des aktuellen Entwicklungszweigs usw., haben Sie nicht nur die
Möglichkeit, mehrere Stände parallel bereitzuhalten, sondern Sie haben Ihre
Images gleichzeitig auch versioniert vorliegen und können problemlos ein
beliebiges Image aus der Versionshistorie zur Ausführung bringen.

Sie sehen, dass Docker viele Probleme löst, über die Sie früher oder später
stolpern würden.

## Ausblick

Die Artikelserie besteht aus den folgenden Teilen:

1. Angular-App über Docker bereitstellen
2. Build Once, Run Anywhere oder: Konfiguration über Docker verwalten
3. Multi-Stage Builds oder: Immer die Build-Umgebung dabei haben

Für den Rest der Artikelserie gehe ich davon aus, dass Docker auf Ihrem System
einwandfrei funktioniert. Wie Sie das prüfen können, zeigt der o. g. [_Getting
Started Guide_](https://docs.docker.com/get-started/#test-docker-installation).

