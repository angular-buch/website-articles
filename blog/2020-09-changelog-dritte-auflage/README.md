---
title: "Changelog zur 3. Auflage"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2020-09-20
lastModified: 2020-09-20
keywords:
  - Angular
  - Buch
  - Changelog
  - Dritte Auflage
  - PWA
  - Docker
  - Redux
  - NgRx
  - RxJS
  - Angular CLI
  - Monorepo
language: de
thumbnail: ../x_shared/buchblogheader3.png
sticky: false
hidden: true
---

Im September 2020 erscheint die **dritte Auflage** des deutschsprachigen Angular-Buchs.

Die Webplattform bewegt sich schnell, und so muss auch ein Framework wie Angular stets an neue Gegebenheiten angepasst werden und mit den Anforderungen wachsen.
In den drei Jahren seit Veröffentlichung der ersten Auflage dieses Buchs haben sich viele Dinge geändert:
Es wurden Best Practices etabliert, neue Features eingeführt, und einige wenige Features wurden wieder entfernt.

Die neue dritte Auflage haben wir deshalb grundlegend aktualisiert und erweitert.
Dabei haben wir das Feedback unserer Leser berücksichtigt, Fehler korrigiert und viele Erklärungen verständlicher formuliert.

Wir möchten Ihnen einen kurzen Überblick über die wichtigsten Neuerungen und Aktualisierungen der dritten Auflage geben.
Alle Texte und Codebeispiele haben wir auf die Angular-Version 10 aktualisiert.
Dabei betrachten wir auch neue Features.
Schon in der zweiten Auflage haben wir umfassende Aktualisierungen vorgenommen, die wir am Ende dieses Abschnitts zusammengefasst haben.

<a class="btn btn-primary cta__button" role="button" target="_blank" href="https://amzn.to/30s4mVX">3. Ausgabe jetzt vorbestellen</a>

## Neue Kapitel

In der dritten Auflage sind die folgenden Kapitel neu hinzugekommen:

### Progressive Web Apps (PWA) (Kapitel 24)
Progressive Web Apps sind ein wichtiger Pfeiler für moderne Anwendungsentwicklung mit Webtechnologien. Hier spielen besonders Service Worker, Installierbarkeit, Offlinefähigkeit und Push-Benachrichtigungen eine Rolle. Da das Thema bisher in diesem Buch nicht behandelt wurde, haben wir ein neues Kapitel entwickelt. Sie lernen dabei die Grundlagen zu Progressive Web Apps und migrieren die Beispielanwendung zu einer PWA.

### Angular-Anwendungen mit Docker bereitstellen (Kapitel 19)
Nachdem wir das Thema Docker in der zweiten Auflage nur in einem kurzen Abschnitt erwähnt hatten, haben wir nun ein ausführliches Kapitel neu ins Buch aufgenommen. Dort erläutern wir am praktischen Beispiel, wie Sie eine Angular-Anwendung in einem Docker-Container bereitstellen und ausführen können. Bei diesem Kapitel hat uns unser treuer Leser **Michael Kaaden** mit Praxiserfahrung und viel Zuarbeit unterstützt -- vielen Dank!

### Web Components mit Angular Elements (Kapitel 28.1)
Unter "Wissenswertes" sammeln wir interessante Themen, die im Verlauf des Buchs keinen Platz gefunden haben. Hier haben wir einen neuen Abschnitt zu Angular Elements hinzugefügt. Sie lernen, wie Sie Angular-Komponenten als Web Components verpacken, um sie auch in anderen Webanwendungen einzusetzen.

### OAuth2 und OpenID Connect (Abschnitt 10.3.5)
In der Iteration III erläutern wir die Kommunikation mit einem HTTP-Backend und betrachten Interceptoren, mit denen wir zum Beispiel Tokens in den Header einer HTTP-Nachricht einfügen können. In diesem Zusammenhang haben wir einen neuen Abschnitt hinzugefügt, in dem wir die Authentifizierung und Autorisierung mithilfe von OAuth 2 und OpenID Connect erläutern.

### Fortgeschrittene Konzepte der Angular CLI (Kapitel 27)
Die Angular CLI kann mehr als nur eine Anwendung in einem Projekt verwalten. In diesem neuen Kapitel werfen wir deshalb einen Blick auf die Architektur eines *Workspace*, der mehrere Anwendungen und Bibliotheken in einem gemeinsamen Repository pflegt. Zusätzlich betrachten wir hier kurz die *Schematics*, die für die Codegenerierung in der Angular CLI verantwortlich sind.


## Stark überarbeitete und erweiterte Kapitel

### Reaktive Programmierung mit RxJS (Kapitel 10.2)
Das Kapitel zu RxJS haben wir um einige wichtige Details ergänzt: So wurde die Erläuterung zu Higher-Order Observables überarbeitet und mit Marble-Diagrammen illustriert, wir haben den Unterschied zwischen Observer und Subscriber stärker herausgestellt und viele Erläuterungen vereinfacht.

### i18n: mehrere Sprachen und Kulturen anbieten (Kapitel 15.1)
Das Thema Internationalisierung wurde mit Angular 9.0 neu aufgerollt und verfügt nun über erweiterte Funktionen, z. B. Übersetzungen im TypeScript-Code. Wir nutzen in diesem Kapitel jetzt das neue Paket `@angular/localize`, um Übersetzungen zu rendern.

### Build und Deployment mit der Angular CLI (Kapitel 18)
Das Kapitel zum Deployment haben wir neu strukturiert. Hier wird nun die Build-Konfiguration in der `angular.json` detailliert erläutert. Mit dem Release des neuen Ivy-Compilers ist auch das Thema JIT mehr in den Hintergrund gerückt. Außerdem haben wir einen neuen Abschnitt zum Befehl `ng deploy` hinzugefügt.

### State Management mit Redux und NgRx (Kapitel 21)
Das Framework NgRx wird stetig weiterentwickelt, und so haben wir das Kapitel zum State Management grundlegend aktualisiert. Wir setzen nun durchgehend auf die neuen Creator Functions und haben viele Erläuterungen ausführlicher und verständlicher gestaltet. Außerdem gehen wir auf das neue Paket [@ngrx/component](https://ngrx.io/guide/component) ein und werfen einen kurzen Blick auf das Community-Projekt [RxAngular](https://github.com/BioPhoton/rx-angular).

### Server-Side Rendering mit Angular Universal (Kapitel 20)
Der Workflow für Server-Side Rendering wurde mit Angular 9.0 stark vereinfacht. Wir haben das Kapitel zu Angular Universal aktualisiert und erweitert: Dabei gehen wir auf den neuen Builder für statisches Pre-Rendering ein, geben Tipps für den Praxiseinsatz und betrachten das Community-Projekt [Scully](https://scully.io/).



## Sonstiges

Neben den genannten Kapiteln haben wir alle Texte im Buch erneut kritisch überarbeitet.
An vielen Stellen haben wir Formulierungen angepasst, Details ergänzt und Fehler korrigiert.
Wenn Sie weitere Fehler finden oder Anregungen zum Buch haben, so [schreiben Sie uns bitte](mailto:team@angular-buch.com)! Wir werden uns Ihr Feedback in der nächsten Auflage zu Herzen nehmen.

Für die einzelnen Iterationsschritte aus dem Beispielprojekt bieten wir eine Differenzansicht an. So können Sie die Änderungen am Code zwischen den einzelnen Kapiteln besser nachvollziehen:

**[https://book-monkey4.angular-buch.com/diffs/](https://book-monkey4.angular-buch.com/diffs/)**

Zu guter Letzt haben wir an ausgewählten Stellen in diesem Buch Zitate von Persönlichkeiten aus der Angular-Community aufgeführt.
Die meisten dieser Zitate haben wir direkt für dieses Buch erbeten.
Wir freuen uns sehr, dass so viele interessante und humorvolle Worte diesem Buch eine einmalige Note geben.

<a class="btn btn-primary cta__button" role="button" target="_blank" href="https://amzn.to/30s4mVX">3. Ausgabe jetzt vorbestellen</a>
