---
title: 'Angular 18 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2024-05-29
lastModified: 2024-05-29
keywords:
  - Angular
  - Angular 18
  - Zoneless
  - Zoneless Change Detection
language: de
thumbnail: angular18.jpg
sticky: false
---

Und schon wieder ist ein halbes Jahr vergangen:
Angular Version 18 ist jetzt verfügbar!

In den letzten Versionen wurden viele neue Funktionen und Verbesserungen eingeführt.
Diesmal lag der Fokus darauf, die bereits ausgelieferten APIs zu stabilisieren, diverse Feature Requests zu bearbeiten und eines der am meisten nachgefragten Projekte auf der Roadmap experimentell zu veröffentlichen: die **Zoneless Change Detection**.

Im offiziellen [Angular-Blog](https://blog.angular.dev/angular-v18-is-now-available-e79d5ac0affe) finden Sie alle offiziellen Informationen direkt vom Angular-Team.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md#1800-2024-05-22) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md#1800-2024-05-22).

Wenn Sie sich einen kurzweiligen Gesamtüberblick verschaffen wollen, so lohnt es sich, das hervorragende Video aus dem Release-Event anzuschauen:
[What’s new in Angular v18](https://www.youtube.com/watch?v=DK8M-ZFjaMw) 

Und für eine Zusammenfassung in deutscher Sprache lesen Sie jetzt einfach weiter. 🙂



## Zoneless Change Detection (experimentell)

Seit dem Beginn von Angular ist die Bibliothek [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) für das Auslösen der Änderungsüberprüfung (Change Detection) in Angular verantwortlich.
Zone.js hat den Umgang mit Angular massiv geprägt:
Änderungen an den anzuzeigenden Daten werden scheinbar wie durch Magie erkannt.
Aber leider hat diese Magie auch Reihe von technischen einige Nachteile mit sich gebracht.
Vor allem die Performance und die Handhabung beim Debugging werden so schon lange kritisiert, wie es die Integration von zone.js gibt.

Das Angular Team hat nun mehrere Jahre daran gearbeitet, eine Möglichkeit zu finden, Angular ohne zone.js zu verwenden. Endlich ist es soweit und wir können mit dieser neuen API experimentieren, indem folgendes Statement zur Datei `main.ts` hinzu gefügt:

```ts
bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
});
```

Anschließend kann `zone.js` aus dem Polyfills-Eintrag in der Datei `angular.json` entfernt werden.

Das Angular-Team verspricht folgende Vorteile durch die Zoneless Change Detection:

* Verbesserte Komponierbarkeit für Micro-Frontends und Interoperabilität mit anderen Frameworks
* Schnellere Initialisierung und Laufzeit der Angular-App
* Kleinere Bundle-Größe und schnellere Seitenladezeiten
* Lesbarere Stack-Traces
* Einfacheres Debugging

Allerdings bekommen wir all diese Vorteile nicht einfach umsonst.
Der "alte Angular-Stil", bei dem direkt Properties an den Komponenten abändert kann, ist mit dem zonenlosen Ansatz nicht direkt kompatibel.
Im Kern geht es darum, auf die neuen _Signals_ umzusteigen, die seit [Angular 16](https://angular-buch.com/blog/2023-05-angular16#reaktivit%C3%A4t-mit-signals) verfügbar sind. 
Wir haben über diesen modernen Ansatz in unserem letzten Blogpost bereichtet:
[Modern Angular: den BookMonkey migrieren](/blog/2024-05-modern-angular-bm)

Diese simple Komponente...
```ts
// Alter Stil
@Component({
  ...
  template: `
    <h1>Hallo von {{ name }}!</h1>
    <button (click)="handleClick()">Mit zone.js</button>
  `,
})
export class App {
  name = 'Angular';

  handleClick() {
    this.name = 'Klassiches Angular';
  }
}
```

... würden wir jetzt mit Signals folgendermaßen abbilden:
```ts
// Neuer Stil mit Signals
@Component({
  ...
  template: `
    <h1>Hallo von {{ name() }}!</h1>
    <button (click)="handleClick()">Ohne zone.js</button>
  `,
})
export class App {
  protected name = signal('Angular');

  handleClick() {
    this.name.set('Zoneless Angular');
  }
}
```

Im obigen Beispiel wird beim Klicken auf den Button das _Signal_ mit der Bezeichnung `name` aktualisiert und anchliepend die Oberfläche aktualisiert.
Dies funktioniert genauso zuverlässig wie bei einer Anwendung mit zone.js, jedoch begrenzt Angular die internen Überprüfungen auf ganz wenige Auslöser - wie den Aktualisierungen der Signals.
Die Performance ist hierbei deutlich höher.

### Auf "zoneless" updaten

Angular entwickelt sich stetig weiter, und "zoneless" ist ein zentraler Bestandteil davon.
Während das Framework weiterentwickelt wird, stellt das Angular Team selbverständlich sicher, dass der klassische Stil weiterhin wie erwartet funktioniert.
Der zukünftige Fokus des Angular-Teams ist allerdings eindeutig.
Aber es ist an der Zeit, bei der Entwicklung auf Signals zu setzen!
Wir empfehlen, neue Angular-Anwendungen definitiv mit den Signals umzusetzen.
Der klassische Stil wird weiterhin unterstützt werden, aber hier wird es keine neuen Innovationen mehr geben.
<!-- TODO: oder irgendeinen anderen überzeugenden Grund nennen. Wer will denn schon freiwillig alles updaten??? -->

### Natives `async/await` für zonenlose Apps:

Zone.js fängt viele APIs im Browseraufrufe ab, um die bisherige Change Detection von Angular zu realisieren.
Leider gehört `async/await` zu den APIs, die zone.js nicht patchen kann. 
Als Workaround wird bisher von der Angular CLI jede Verwendung der beiden Schlüsselwörter auf Promises heruntergestuft – denn Promises kann zone.js patchen. 
Das ist suboptimal, da alle modernen Browser `async/await` unterstützen und optimieren können.

Wird die die experimentelle zonenlose Change Detction genutzt, wird das native `async/await` verwendet. 
Dies verbessert das Debugging und verkleinert die Bundles.

### Zonenlose Unterstützung in bestehenden Komponenten

Das Angular Team hat zonenlose Unterstützung in [Angular Material](https://material.angular.io/) and damit auch im [Angular CDK](https://material.angular.io/cdk/) aktiviert.
Wenn Sie also auf die Bibliothek Angular Material setzen, können Sie prinzipiell direkt auf eine zonenlose App umsteigen.
Sollten Sie einen Bibliothek von einem anderen Hersteller bzw. von einem anderen Open-Source Projekt verwenden, so prüfen Sie am besten Vorab ob die Bibliothek bereits "zoneless Angular" unterstützt.
Ist dem nicht so, werden sich nach einer Umstellung diverse Stellen in der Anwendung nicht mehr korrekt aktualisieren.



<hr>


Wir wünschen Ihnen viel Spaß mit Angular 18!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Blumenwiese bei Västerås, Schweden. Foto von Ferdinand Malcher</small>
