---
title: 'Angular 13 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2021-11-03
lastModified: 2021-11-03
keywords:
  - Angular
  - Angular 13
  - Ivy
language: de
thumbnail: ./angular13.jpg
sticky: true
---

Noch vor dem Jahresende erschien Anfang November 2021 die neue Major-Version 13 von Angular.
Auch diese Version bringt keine großen Änderungen an der Oberfläche des Frameworks mit, sondern verbessert vor allem Details im Hintergrund. Es gibt ein paar wenige Breaking Changes, die aber für die meisten Entwicklerinnen und Entwickler nicht interessant sein dürften.

Wir stellen in diesem Blogpost wie immer die wichtigsten Neuigkeiten vor.
Den Code des Beispielprojekts *BookMonkey* aus dem Angular-Buch halten wir stets [auf GitHub](https://github.com/angular-buch/book-monkey4) aktuell.

Die offizielle Mitteilung zum neuen Release finden Sie im englischsprachigen [Angular-Blog](https://blog.angular.io/angular-v13-is-now-available-cce66f7bc296).
Im Changelog von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md) finden Sie außerdem alle Details zum neuen Release.



## Projekt updaten

Wenn Sie Ihr bestehendes Projekt aktualisieren möchten, folgen Sie bitte den Instruktionen im [Angular Update Guide](https://update.angular.io).
Mithilfe des Befehls `ng update` erhalten Sie außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 13 aktualisieren
npx @angular/cli@13 update @angular/core@13 @angular/cli@13
```

Bitte beachten Sie, dass es noch einige Zeit dauern kann, bis Community-Projekte wie NgRx oder Nrwl Nx ebenso mit Angular 13 kompatibel sind.

## Neue Versionen: Node.js, TypeScript und RxJS

Angular 13 benötigt die folgenden Versionen von Node.js, TypeScript und RxJS:

* **Node.js:** mindestens Version 12.20.0. Außerdem wird jetzt auch **Node 16** unterstützt.
* **TypeScript:** mindestens Version 4.4.2. Ältere Versionen werden nicht mehr unterstützt.
* **RxJS:** Bei neu angelegten Angular-Projekten wird jetzt die Bibliothek RxJS in der aktuellen Version 7 genutzt. RxJS 6 wird weiterhin unterstützt. Bei bestehenden Projekten wird die Versionsnummer nicht automatisch erhöht.


## Test Module Teardown

Schon mit Angular 12.1 wurde das sogenannte *Test Module Teardown* eingeführt. **Mit Angular 13 ist das Teardown nun automatisch aktiv, siehe [Commit](https://github.com/angular/angular/commit/94ba59bc9db81ae04f20e8147b5133a0d3d45510).**
Diese Option, die bisher freiwillig aktiviert werden konnte, sorgt dafür, dass beim Unit-Testing mit dem `TestBed` das erzeugte Modul nach dem Test wieder zerstört wird. Dabei wird z. B. das DOM-Element der erzeugten Komponente wieder entfernt.
Die Option `destroyAfterEach` kann für jeden Test separat aktiviert werden:

```ts
TestBed.configureTestingModule({
  teardown: { destroyAfterEach: true },
  // ...
});
```

Alternativ ist auch eine globale Einstellung in der Datei `test.ts` möglich.
Für neue Projekte mit Angular 13 ist das Test Module Teardown per default eingeschaltet.
Für existierende Apps wird das Teardown zunächst explizit deaktiviert, sodass keine Anpassungen im Code notwendig sind.

Für weitere Informationen empfehlen wir den [Blogpost von Lars Gyrup Brink Nielsen](https://dev.to/this-is-angular/improving-angular-tests-by-enabling-angular-testing-module-teardown-38kh).



## Vereinfachte Schnittstelle für Dynamic Components

Mit der Schnittstelle der Klasse `ViewContainerRef` können Komponenteninstanzen dynamisch zur Laufzeit der Anwendung erzeugt werden.
Dafür war es bisher notwendig, den `ComponentFactoryResolver` zu verwenden, um zunächst eine Factory für die jeweilige Komponente zu erstellen. Das war aufwendig und erzeugte viel Code.

Die Schnittstelle für die Methode `createComponent()` wurde mit Angular 13 vereinfacht, siehe [Commit](https://github.com/angular/angular/commit/7dccbdd27be13eb7287f535f482b1de2c13fca74).
Jetzt ist es möglich, direkt eine Komponentenklasse zu übergeben, die dann in einem ViewContainer gerendert wird.
Das folgende Beispiel zeigt (stark vereinfacht!), wie eine Komponente dynamisch im ViewContainer einer Direktive erstellt werden kann:

```ts
import { ViewContainerRef } from '@angular/core';
import { MyComponent } from './my.component';

@Directive({ /* ... */ })
export class MyDirective {
  constructor(private vcr: ViewContainerRef) {
    this.vcr.createComponent(MyComponent);
  }
}
```

Zusammen mit Dynamic Imports kann die betreffende Komponente sogar "lazy" geladen werden.
Sie wird in ein eigenes Bundle verpackt und erst beim Aufruf von `import()` tatsächlich heruntergeladen.
Es ist damit nun noch einfacher, einzelne Komponenten auszulagern separat bereitzustellen.

```ts
import('./my.component').then(m => {
  this.vcr.createComponent(m.MyComponent);
});
```

## Persistent Cache

In Projekten mit Angular 13 ist der neue *Persistent Disk Cache* automatisch aktiv.
Dabei werden Teile der gebauten Anwendung zwischengespeichert, um zukünftige Builds zu beschleunigen.

Informationen zur Konfiguration des Build Cache finden Sie in der [Angular-Dokumentation](https://angular.io/cli/cache).


## Bibliotheken mit Ivy-Compilation

Nachdem der neue Renderer *Ivy* eingeführt wurde, musste die Kompatibilität mit Anwendungen gewährt werden, die noch auf die veraltete *View Engine* setzten.
Dafür wurde der Angular Compatibility Compiler (`ngcc`) entwickelt: Alle Bibliotheken, die auf NPM veröffentlicht werden, mussten zunächst weiterhin mit der View Engine kompiliert werden. Beim Build einer Ivy-Anwendung wurde automatisch der `ngcc` aktiv, um die Anweisungen in Ivy-Instruktionen zu übersetzen.

Dieser Prozess braucht Zeit.
Möglicherweise haben Sie diese Ausgabe beim `ng serve` schon einmal gesehen – sie stammt vom `ngcc`:

```
Compiling @angular/core : es2015 as esm2015
Compiling @angular/common : es2015 as esm2015
Compiling @angular/platform-browser : es2015 as esm2015
Compiling @angular/common/http : es2015 as esm2015
```

Seit Angular 13 können Bibliotheken direkt in Ivy-Instruktionen kompiliert und veröffentlicht werden.
Der Code ist dann nicht mehr mit der *View Engine* kompatibel.
Der `ngcc` wird damit weiter an Bedeutung verlieren und künftig entfernt werden können.
Die View Engine wird seit Angular 13 nicht mehr unterstützt.

Mehr Infos zum Veröffentlichen von Bibliotheken mit Ivy finden Sie in der [Angular-Dokumentation](https://angular.io/guide/creating-libraries#building-libraries-with-ivy).


## Neue Methoden für Reactive Forms

Für die Formularverarbeitung mit Reactive Forms wurden neue Methoden hinzugefügt, siehe [Commit](https://github.com/angular/angular/commit/1d9d02696eadbee2c2f719e432efca22f1e494e9):

* `hasValidator`, `hasAsyncValidator`
* `addValidators`, `addAsyncValidators`
* `removeValidators`, `removeAsyncValidators`

Damit ist es möglich, programmatisch zu prüfen, ob ein bestimmter Validator auf einem Control vorhanden ist, um z. B. Required-Felder optisch zu markieren.
Außerdem können *einzelne* Validatoren dynamisch hinzugefügt oder entfernt werden. Das kann z. B. in Abhängigkeit von anderen Formularwerten implementiert werden. Bisher war es nur möglich, *alle* Validatoren eines Controls zu setzen oder zu entfernen.

```ts
// prüfen, ob required-Validator auf dem Control vorhanden ist
isRequired(controlName: string) {
  const control = this.form.get(controlName);
  return !!control && control.hasValidator(Validators.required)
}

// required-Validator dynamisch hinzufügen
addRequired(controlName: string) {
  const control = this.form.get(controlName)!;

  control.addValidators(Validators.required);
  control.updateValueAndValidity();
}
```

Wir haben ein funktionierendes [Beispiel auf GitHub](https://github.com/angular-buch/playground-ng13-validators/blob/main/src/app/app.component.ts) bereitgestellt.



Auch die Typisierung bei den Formularen hat sich verbessert. Es wurde ein neuer Typ `FormControlStatus` eingeführt, welcher nun bei `form.status`und `form.statusChanges` zum Einsatz kommt, siehe [Commit](https://github.com/angular/angular/commit/e49fc96ed33c26434a14b80487dd912d8c76cace):
   
```ts
export type FormControlStatus = 'VALID'|'INVALID'|'PENDING'|'DISABLED';
```


## Sonstiges

* 
* **IE11 Support:** Die Unterstützung von Internet Explorer 11 wurde entfernt. Nachdem in der letzen Version der Support bereits "deprecated" wurde, ist Angular jetzt offiziell nicht mehr im Internet Explorer lauffähig.
* **Event für routerLinkActive:** Die Direktive `routerLinkActive` emittiert das Event `isActiveChange`, wenn sich der Aktivitätsstatus dieses Links ändert. Das kann man nutzen, um weitere Aktionen anzustoßen, wenn ein RouterLink aktiviert oder deaktiviert wird, siehe [Commit](https://github.com/angular/angular/commit/faf9f5a3bc444bb6cbf75916c8022f60e0742bca).
* **Adobe Fonts Inlining:** Fonts Inlining wurde bisher "out of the box" für Google Fonts unterstützt. Dabei werden beim Build die Font-Dateien heruntergeladen und zusammen mit der gebauten Anwendung abgelegt. Dieses Verfahren wird jetzt auch für Adobe Fonts unterstützt.
* **$localize stable:** Die Funktion `$localize` zur Übersetzung von Texten in der Anwendung gilt jetzt als *stable*. Siehe auch dieser Beitrag im Angular-Blog: [Angular localization with Ivy](https://blog.angular.io/angular-localization-with-ivy-4d8becefb6aa).
* **loadChildren String Syntax:** Die veraltete String-Syntax für Lazy-Loading mit `loadChildren` wurde entfernt. Die alte Schreibweise ist seit Angular 9 deprecated und sollte ohnehin nicht mehr genutzt werden. 
* **Zeitzone für DatePipe:** Die `DatePipe` nutzt ein neues InjectionToken `DATE_PIPE_DEFAULT_TIMEZONE`, mit dem die Zeitzone eingestellt werden kann, siehe [Commit](https://github.com/angular/angular/commit/adf4481211ac0a2eabf560f42ef5193ca550ec98).
* **min/max-Validatoren mit `null`:** Bei Template-Driven Forms können die Validatoren für `min` und `max` nun auch den Eingabewert `null` verarbeiten. Der Validator wird dadurch deaktiviert. Ein ähnliches Verhalten wird bereits von `minLength` und `maxLength` unterstützt. Siehe [Commit](https://github.com/angular/angular/commit/d9d8f950e90567c79b43eb156b81810a9f3d5c93).
* **renderModuleFactory entfernt:** Die Funktion `renderModuleFactory`, die im Zusammenhang mit Server-Side Rendering relevant ist, steht nicht mehr zur Verfügung. Stattdessen soll die Funktion `renderModule` genutzt werden.


Es hat sich also einiges getan, und es wurden viele Punkte aus der Sektion "In progress" von der Roadmap (Stand: 19.05.2021) abgearbeitet. Als einer der wichtigsten offenen Punkte sind nun noch die optionalen NgModules zu sehen, für die es jüngst eine Befragung der Community gab (siehe [RFC](https://github.com/angular/angular/discussions/43784)). 
Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 13!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Danny, Ferdinand und Johannes**

<small>**Titelbild:** Blick vom Poon Hill, Nepal, 2018</small>
