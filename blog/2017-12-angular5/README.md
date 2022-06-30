---
title: "Angular 5 ist da!"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2017-12-05
keywords:
  - Angular
  - Angular 5
language: de
thumbnail: ../x_shared/angular5.png
---

> **Die Update-Infos für neuere Versionen von Angular finden Sie in separaten Blogartikeln. Wenn Sie das Update durchführen möchten, lesen Sie bitte alle Artikel in der gegebenen Reihenfolge.**
> * [Angular 6 ist da!](/blog/2018-05-angular6)
> * [Angular 7 ist da!](/blog/2018-10-angular7)
> * [Angular 8 ist da!](/blog/2019-06-angular8)
> * [Angular 9 ist da!](/blog/2020-02-angular9)
> * [Angular 10 ist da!](/blog/2020-06-angular10)
> * [Angular 11 ist da!](/blog/2020-11-angular11)
> * [Angular 12 ist da!](/blog/2021-06-angular12)
> * [Angular 13 ist da!](/blog/2021-11-angular13)
> * [Angular 14 ist da!](/blog/2022-06-angular14)

<br>
<br>

Angular 5 ist da! Anfang November 2017 erschien die neue Major-Version von Angular und bringt einige Neuerungen mit sich. Die gute Nachricht: Ihre alten Projekte mit Angular 4 sind weiterhin lauffähig – nur an einigen wenigen Stellen müssen Kleinigkeiten angepasst werden.

Die offizielle Ankündigung zum Angular-5-Release finden Sie im [Angular-Blog](https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced).
Für Details zu einzelnen Änderungen lohnt sich außerdem ein Blick in den [Changelog von Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md).
Beim Update auf Angular 5 hilft der [Angular Update Guide](https://update.angular.io/#4.0:5.0). Das Tool stellt eine Checkliste und die passenden Befehle für das Update bereit.

**Auch für die Leser unseres Angular-Buchs hat sich nicht viel geändert!**

In diesem Blogpost stellen wir Ihnen im Folgenden die wichtigsten Neuerungen vor.
Zu einzelnen Themen haben wir drei weitere separate Artikel verfasst, um Ihnen einen fundierten Überblick zu geben.

* [Angular 5: Den Book-Monkey upgraden](/blog/2017-12-book-monkey-upgrade)
* [Angular 5: Änderungen für i18n](/blog/2017-12-ng5-i18n)
* [Angular 4.3: Der neue HttpClient](/blog/2017-11-httpclient)

## Build Optimizer / White Spaces

In Projekten mit Angular 5 und der aktuellen Angular CLI (ab Version 1.5) ist ab sofort automatisch der *Build Optimizer* aktiv.
Dadurch wird die effektive Bundle-Größe weiter reduziert und die Start-Performance verbessert.

Außerdem wurde für den Compiler die neue Option `preserveWhitespaces` eingeführt.
Wird die Option deaktiviert, werden White Space Characters in den Templates automatisch entfernt – und damit die Bundle-Größe weiter reduziert.
Die Option kann in den Komponenten oder global in der `tsconfig.app.json` angepasst werden.

```js
// tsconfig.app.json
{
  // ...
  "angularCompilerOptions": {
    "preserveWhitespaces": false
  }
}
```

```typescript
// my.component.ts
@Component({
  template: '...',
  preserveWhitespaces: false
})
export class MyComponent
```

In einzelnen Blöcken können wir die Whitespace Preservation schließlich wieder selektiv aktivieren:

```html
<!-- my.component.html -->
<div ngPreserveWhitespaces>
  White Spaces werden in diesem Block erhalten
</div>
```

Weitere Infos zu `preserveWhitespaces` finden Sie in der [offiziellen Dokumentation](https://angular.io/api/core/Component#preserveWhitespaces).


## Lokalisierte Pipes

Einige der eingebauten Pipes basieren auf lokalisierten Informationen: `DatePipe`, `DecimalPipe` und `CurrencyPipe`.
Bisher war für die Lokalisierung ein Polyfill nötig. In Angular 5 wurde das Polyfill entfernt und die Lokalisierung wurde mit anderen Regeln gelöst.

Damit ändern sich allerdings folgende Feinheiten:
- Die oben genannten Pipes verhalten sich zu Teil anders und haben geänderte Signaturen.
- Zum Einstellen der Sprache sind zusätzliche Schritte nötig.

**Mehr zu dem Thema erfahren Sie demnächst in unserem zusätzlichen Blogartikel: [Angular 5: Änderungen für i18n](/blog/2017-12-ng5-i18n).**


## HttpClient

Mit [Angular 4.3](https://github.com/angular/angular/blob/master/CHANGELOG.md#430-2017-07-14) wurde der neue `HttpClient` eingeführt – und löst damit das `HttpModule` ab, das wir Kapitel 10.1 im Angular-Buch beschrieben haben.
Der neue `HttpClient` wird weitgehend gleich verwendet, allerdings entfällt ein wesentlicher Schritt: die manuelle Umwandlung von JSON mit `res.json()`.

Außerdem bietet der `HttpClient` zusätzliche Features wie verbesserte Typisierung und die Möglichkeit, auf tieferer Ebene manuell in HTTP-Requests einzugreifen.

Wir empfehlen Ihnen die Migration auf das neue Modul.
**Alle Details zum neuen HttpClient finden Sie in unserem Blogartikel: [Angular 4.3: Der neue HttpClient](/blog/2017-11-httpclient)**



## RxJS Pipeable Operators (ehemals *Lettable*)

Mit Angular 5 wurde *RxJS* auf die neueste Version 5.5 aktualisiert.
Damit kommt auch das Konzept der [Pipeable Operators](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md) in die Angular-Welt.
(**Achtung:** Pipeable Operators sind auch bekannt unter dem alten Namen *Lettable Operators*.)

Für den Entwickler ändert sich dabei die Verwendung der RxJS-Operatoren.
Anstatt die Operatoren zu verketten, wird ab sofort die Methode `pipe()` eingesetzt.
Sie erhält als Argumente die gesamte Pipeline von Operatoren.
Die Operatoren werden weiterhin einzeln importiert, allerdings als *Named Imports* aus dem zentralen Modul `rxjs/operators`.

Das folgende Beispiel ist aus dem *Listing 10-31* aus dem Angular-Buch entnommen:

```typescript
// Originales Beispiel aus dem Buch
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
// ...

this.keyup
  .debounceTime(500)
  .distinctUntilChanged()
  .switchMap(searchTerm => this.bs.getAllSearch(searchTerm))
  .subscribe(books => console.log(books));
```

```typescript
// mit Lettable Operators
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

this.keyup.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(searchTerm => this.bs.getAllSearch(searchTerm)),
)
.subscribe(books => console.log(books));
```

Wichtig: Einige Operator-Namen haben sich geändert, um Konflikte mit bestehenden Schlüsselworten in JavaScript zu vermeiden.

| **alt** | **neu** |
|-----|-----|
| `do()`  | `tap()` |
| `catch()`  | `catchError()` |
| `switch()`  | `switchAll()` |
| `finally()`  | `finalize()` |

Die alten (und im Buch beschriebenen) Imports und verkettbaren Operatoren werden weiterhin unterstützt.
Wir empfehlen Ihnen aber die Migration, denn die neuen Operatoren können wesentlich besser optimiert werden.
Außerdem können Sie einfach eigene Operatoren entwickeln und in Ihren Pipelines verwenden.


## Verbesserung der Build-Geschwindigkeit

Die Angular CLI 1.5 setzt für den Build nun auf TypeScript Transforms.
Damit wird der inkrementelle Rebuild bei der Ahead-Of-Time-Kompilierung (AOT) unterstützt, die nun endlich auch zur Entwicklungszeit ohne lange Wartezeit einsetzbar ist:

```bash
ng serve --aot
```

Übrigens: AOT-Kompilierung wird in absehbarer Zeit die JIT-Kompilierung auch zur Entwicklungszeit ablösen.



## Zusammenfassung

Die neue Angular-Version bringt zwar ein paar kleinere Breaking Changes mit sich, beschert dem Entwickler aber insgesamt viele gute Neuerungen.
Der Umstieg auf Angular 5 ist in den meisten Projekten ohne große Anpassungen möglich, denn die stabilen APIs haben sich kaum geändert.

<!--
Alle wichtigen Neuerungen sind im [Angular-Blog](https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced) zusammengefasst.
-->

**Wir wünschen Ihnen viel Spaß mit Angular 5 und beim Lesen unseres Buchs!**

---

Lesen Sie hier weiter:

* [Angular 5: Den Book-Monkey upgraden](/blog/2017-12-book-monkey-upgrade)
* [Angular 5: Änderungen für i18n](/blog/2017-12-ng5-i18n)
* [Angular 4.3: Der neue HttpClient](/blog/2017-11-httpclient)


