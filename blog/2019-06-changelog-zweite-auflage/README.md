---
title: "Changelog zur 2. Auflage"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2019-06-14
lastModified: 2019-06-14
keywords:
  - Angular
  - Buch
  - Changelog
  - Zweite Auflage
language: de
thumbnail: ../shared/buchblogheader.png
sticky: false
hidden: true
---

Im Juni 2019 erschien die zweite Auflage des deutschsprachigen Angular-Buchs.

In den zwei Jahren seit Veröffentlichung der ersten Auflage haben sich viele Dinge geändert:
Es wurden Best Practices etabliert, neue Features eingeführt, und einige wenige Features wurden wieder entfernt.
Die Webplattform bewegt sich schnell, und so muss auch ein Framework wie Angular stets an neue Gegebenheiten angepasst werden und mit den Anforderungen wachsen.

Die zweite Auflage wurde deshalb grundlegend aktualisiert und erweitert.
Wir möchten Ihnen einen kurzen Überblick über die Neuerungen und Aktualisierungen der zweiten Auflage geben.
Alle Texte und Codebeispiele haben wir auf die aktuelle Angular-Version 8 aktualisiert.

## Neue Kapitel

Folgende Kapitel und Abschnitte sind in dieser Auflage neu hinzugekommen:

* Interceptoren: HTTP-Requests abfangen und transformieren (Kapitel 10.3)
* Server-Side Rendering mit Angular Universal (Kapitel 19)
* Wissenswertes (Kapitel 24)
  * Container und Presentational Components (Kapitel 24.1)
  * TrackBy-Funktion für die Direktive ngFor (Kapitel 24.3)
  * Schematics: Codegenerierung mit der Angular CLI (Kapitel 24.4)
  * Angular Material und weitere UI-Komponentensammlungen (Kapitel 24.6)
  * Angular updaten (Kapitel 24.11)


## Vollständig neu geschriebene Kapitel

Einige bereits in der ersten Auflage existierende Kapitel wurden für die zweite Auflage vollständig neu aufgerollt:

### Schnellstart (Kapitel 1)
Der Schnellstart basierte in der ersten Auflage auf einer lokalen Lösung mit SystemJS und Paketen aus einem CDN. Der neue Schnellstart setzt auf die Online-Plattform [StackBlitz](https://stackblitz.com) zum schnellen Prototyping von Webanwendungen.

### Reaktive Programmierung mit RxJS (Kapitel 10.2)
Das Prinzip der reaktiven Programmierung und das Framework RxJS haben in den letzten Jahren weiter an Bedeutung gewonnen. Das alte Kapitel zu RxJS lieferte nur einen kurzen Überblick, ohne auf Details einzugehen. Mit dieser Neufassung finden Sie jetzt eine ausführliche Einführung in die Prinzipien von reaktiver Programmierung und Observables, und es werden alle wichtigen Konzepte anhand von Beispielen erklärt. Im Gegensatz zur ersten Auflage verwenden alle Beispiele im Buch die aktuelle Syntax von RxJS mit den *Pipeable Operators*.

### Formularverarbeitung & Validierung: Iteration IV (Kapitel 12)
In der ersten Auflage haben wir sowohl *Template-Driven Forms* als auch *Reactive Forms* gleichbedeutend vorgestellt. Wir empfehlen mittlerweile nicht mehr den Einsatz von Template-Driven Forms. Daher stellen wir zwar beide Ansätze weiterhin vor, legen aber im Kapitel zur Formularverarbeitung einen stärkeren Fokus auf Reactive Forms. Das Praxisbeispiel wurde neu entworfen, um eine saubere Trennung der Zuständigkeiten der Komponenten zu ermöglichen. Die Erläuterungen im Grundlagenteil wurden neu formuliert, um besser für die Anforderungen aus der Praxis geeignet zu sein.

### State Management mit Redux (Kapitel 20)
In den letzten zwei Jahren hat sich unserer Ansicht nach das Framework *NgRx* gegen weitere Frameworks wie *angular-redux* klar durchgesetzt. Während die erste Auflage in diesem Kapitel noch auf angular-redux setzte, arbeitet das neue Kapitel durchgehend mit den *Reactive Extensions for Angular (NgRx)*. Das neue Kapitel erarbeitet in der Einführung schrittweise ein Modell für zentrales State Management, um die Architektur von Redux zu erläutern, ohne eine konkrete Bibliothek zu nutzen.


## Stark überarbeitete und erweiterte Kapitel

### Einführung in TypeScript (Kapitel 4)
Das Grundlagenkapitel zu TypeScript wurde neu strukturiert und behandelt zusätzlich auch neuere Features von ECMAScript/TypeScript, z. B. Destrukturierung, Spread-Operator und Rest-Syntax.

### HTTP-Kommunikation: ein Server-Backendanbinden (Kapitel 10.1)
Das HTTP-Kapitel setzt durchgehend auf den `HttpClient`, der mit Angular 4.3 eingeführt wurde.
Dabei wird der Blick auch auf die erweiterten Features des Clients geworfen. Themen, die spezifisch für RxJS sind, wurden aus diesem Kapitel herausgelöst und werden nun im RxJS-Kapitel behandelt.

### Resolver: asynchrone Daten beim Routing vorladen (Kapitel 14.4.1)
Resolver sind aus unserer Sicht nicht die beste Wahl, um reguläre Daten über HTTP nachzuladen. Der Iterationsschritt zu Resolvern wurde deshalb aus dem Beispielprojekt entfernt, und das Thema wird in dieser Auflage nur noch in der Theorie behandelt.

### i18n: mehrere Sprachen und Kulturen anbieten (Kapitel 15.1)
Die Möglichkeiten zur Konfiguration des Builds wurden mit Angular 6 stark vorangebracht.
Viele zuvor notwendige Kommandozeilenparameter sind nun nicht mehr notwendig, die Konfigurationsdatei `angular.json` löst diese ab. Dadurch konnten wir das Kapitel zur Internationalisierung (i18n) kürzen und verständlicher gestalten. Im Gegensatz zur ersten Auflage zeigen wir nicht mehr, wie man eine Anwendung im JIT-Modus internationalisiert, der hauptsächlich für die Entwicklung vorgesehen ist, aber nicht für produktive Anwendungen.

### Softwaretests (Kapitel 17.1)
Das Kapitel zum Testen von Angular-Anwendungen wurde stark erweitert. Neben den reinen Werkzeugen wird der Fokus besonders auf Philosophien, Patterns und Herangehensweisen gelegt. Zusätzlich werden die mitgelieferten Tools zum Testen von HTTP und Routing betrachtet.

### NativeScript: mobile Anwendungen entwickeln (Kapitel 22)
Zur Entwicklung einer nativen mobilen Anwendung nutzen wir in diesem Kapitel die neue Version 7 von NativeScript, die insbesondere Verbesserungen in Sachen Codegenerierung und Wiederverwendbarkeit von Code mitbringt.

### Change Detection (Kapitel 24.9)
Das Kapitel zur Change Detection wurde für besseres Verständnis neu strukturiert. Insbesondere wird auf Debugging und Strategien zur Optimierung eingegangen.


## Sonstiges

Für die einzelnen Iterationsschritte aus dem Beispielprojekt bieten wir eine Differenzansicht an. So können die Änderungen am Code zwischen den einzelnen Kapiteln besser nachvollzogen werden. 

**[https://book-monkey3.angular-buch.com/diffs/](https://book-monkey3.angular-buch.com/diffs/)**

Zu guter Letzt haben wir an ausgewählten Stellen in diesem Buch Zitate von bekannten Persönlichkeiten aus der Angular-Community aufgeführt.
Die meisten dieser Zitate haben wir direkt für dieses Buch erbeten.
Wir freuen uns sehr, dass so viele interessante und humorvolle Worte diesem Buch eine einmalige Note geben.


<small>**Titelbild:** Zabriskie Point, Death Valley National Park, California, 2019</small>
