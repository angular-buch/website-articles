---
title: 'Den Book-Monkey v4 updaten (3. Ausgabe)'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-01-01
keywords:
  - Angular
  - Angular 12
  - Angular 13
  - Strict Mode
language: de
thumbnail: ./angular12.jpg
---

Das Angular-Ökosystem wird kontinuierlich verbessert.
Das Release einer neuen Major-Version von Angular bedeutet keineswegs, dass alle Ideen verworfen werden und Ihre Software nach einem Update nicht mehr funktioniert.
Die Grundideen von Angular sind seit Version 2 konsistent und auf Beständigkeit über einen langen Zeitraum ausgelegt.
Die in unserem Buch beschriebenen Konzepte behalten ihre Gültigkeit.

Ein paar kleine Änderungen haben sich jedoch seit der Veröffentlichung der 3. Ausgabe ergeben.
Diese wollen wir hier detailiert besprechen.
Es geht vor allem daraum, dass seit **Angular 12** diverse strikte Einstellung für neue Projekte per Default aktiviert sind.
Als wir das Buch im letzten Sommer 2020 veröffentlicht haben, war das noch nicht so.
Sind die strikten Einstellungen aktiv, brechen nun leider einige gedruckte Beispiele, die sich aber mit moderatem Aufwand beheben lassen.

## Der BookMonkey

Der "BookMonkey" ist das Demo-Projekt zum Buch.
Anhand des Beispielprojekts führen wir Sie schrittweise an die Entwicklung mit Angular heran.

Alle Entwicklungsschritte im Buch stellen wir in separaten Repositorys zur Verfügung.
Wenn man den Anleitungen im Buch folgt, sieht die eigene Codebasis im Idealfall genauso aus, wie unser Stand auf GitHub.


## Einen bestehenden BookMonkey updaten

Wenn Sie unser Buch gleich nach der Veröffentlichung gekauft haben und alle Beispiele daraufhin nach Anleitung umgesetzt haben, dann haben Sie keinen großen Aufwand.
Zum Zeitpunkt der Veröffentlichung war Angular 10 der neueste Stand, kurz danach folgte Angular 11.
Wurde Ihr BookMonkey in dieser Zeit erstellt, dann sind in ihrem Projekt noch keinen strikten Einstellungen aktiv.
Um auf den neuesten Stand von Angular zu gelangen, müssen Sie lediglich `ng update` in die Kommandozeilen eingeben und den Anweisungen auf dem Bildschirm folgen.

Lesen Sie dazu auch gerne unsere Blogposts mit den neuesten Änderungen zu Angular:

* [Angular 11 ist da!](/blog/2020-11-angular11)
* [Angular 12 ist da!](/blog/2021-05-angular12)
* [Angular 13 ist da!](/blog/2021-11-angular13)


## Einen neuen BookMonkey erstellen

Wenn Sie heute wie im Buch beschrieben den BookMonkey mit `ng new` erzeugen, so wird das Projekt standardmäßig mit strikten Einstellungen erstellt.
Dieser **"Strict Mode"** bewirkt eine Reihe an neuen Einstellungen, welche auf der [offiziellen Website von Angular](https://angular.io/guide/strict-mode) näher beschrieben sind.
Zum einen sind die [Einstellungen von TypeScript](https://www.typescriptlang.org/tsconfig#strict) restriktiver gesetzt.
Zum anderen kommen eine Reihe von Prüfungen vom Angular-Team hinzu.
Diese sind auf der Seite zu den [Angular compiler options](https://angular.io/guide/angular-compiler-options) näher beschrieben.


## Walkthrough: Den BookMonkey "refactoren"

Wir haben unseren "alten" BookMonkey (Stand Angular 10) per `ng update` aktualisiert und anschließend die strikten Einstellungen manuell aktiviert:

`tsconfig.json`
```ts
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Sobald diese Einstellungen gewählt wurden, kompiliert das Projekt nicht mehr!
Die selbe Situation ergibt sich, wenn Sie mit einem strikten Projekt beginnen und die Beispiele aus dem Angular-Buch eins zu eins übernehmen.
In beiden Fällen müssen wir Alternativen für den gedruckten Code finden.
Im Folgenden wollen wir nun die problematischen Codestellen aufzeigen und mögliche  Lösungen aufzeigen.
Die Reihenfolge dieses Walkthroughs entspricht unseren Iterationen im Buch.
Wenn Sie also den BookMonkey zum ersten Mal implementieren,
dann halten Sie am Besten diese Anleitung gleich bereit.

### Strikte Initialisierung von Properties

Gleich in der ersten Iteration bei der `BookListComponent` (`src/app/book-list/book-list.component.ts`) erhalten wir einen der häufigsten Fehler:

> Property 'books' has no initializer and is not definitely assigned in the constructor.

```ts
// VORHER
export class BookListComponent implements OnInit {
  books: Book[];

  ngOnInit(): void {
    this.books = [/* ... */]
  }
}
```

Hier prüft der Type-Checker, dass jede in einer Klasse deklarierte Eigenschaft entweder...

__1. mögliche Lösung:__ einen Typ hat, der `undefined` enthält,  
__2. mögliche Lösung:__ im Konstruktor zugewiesen wird oder  
__3. mögliche Lösung:__ einen expliziten Initialisierer hat.



Eine mögliche Lösung besteht darin, der Eigenschaft einen Typ zu geben, der `undefined` enthält:

```ts
// 1. mögliche Lösung
export class BookListComponent {
  books: Book[] | undefined;
}
```

Allerdings würde dies weitere Änderungen im Template und im Code zur Folge haben, da wir nun den Typ `undefined` berücksichtigen müssten.

Wir könnten ebenso das Array mit allen Werten sofort im Konstruktor initialisieren.
Dadurch müssen wir den bisheren Typ (Array aus `Book`) nicht ändern.
Auf die Methode `ngOnInit()` könnten wir dann ganz verzichten:

```ts
// 2. mögliche Lösung
export class BookListComponent {
  books: Book[];

  constructor() {
    this.books = [/* ... */]
  }
}
```

Für unser Refactoring haben wir uns für die letzte Variante entschieden.
Wir haben das Property explizit mit einem leeren Array inititalisiert.
Dadurch müssen wir den bestehenden Code kaum anpassen.
Die konkreten Werte werden weiterhin in der Methode `ngOnInit()` zugewiesen:

```ts
// NACHHER
// 3. mögliche Lösung
export class BookListComponent implements OnInit {
  books: Book[] = [];

  ngOnInit(): void {
    this.books = [/* ... */]
  }
}
```


<!--
https://mariusschulz.com/blog/strict-property-initialization-in-typescript
https://www.typescriptlang.org/tsconfig#strictPropertyInitialization
-->






## Zusammenfassung

Hier sehen Sie noch einmal alle notwendigen Änderungen am Code als Differenzanzeige.

<!-- * **[Alle Änderungen vom großen BookMonkey 4<br>von Angular 10 auf Angular 12](https://github.com/angular-buch/book-monkey4/commit/1c9fca396de63605494b1859f4492ef7bdf5b222)** -->

* **[Iteration 1: Komponenten (Kapitel 6.1)](https://github.com/book-monkey4/iteration-1-components/commit/4c32571ef9ce2d2f746ec0c3939a0fa48ac5540b)**
* **[Iteration 1: Property-Bindings (Kapitel 6.2)](https://github.com/book-monkey4/iteration-1-property-bindings/commit/02b1a286f03808f0094f0c85ea4825b4824a7c3b)**
* **[Iteration 1: Event-Bindings (Kapitel 6.3)](https://github.com/book-monkey4/iteration-1-event-bindings/commit/8cf96312ae178d628df782583a36dd34f7f4b666)**
* **[Iteration 2: Dependency Injection (Kapitel 8.1)](https://github.com/book-monkey4/iteration-2-di/commit/f2db935c2df1a1af3eabf88f4fa223d9ce5bec81)**
* **[Iteration 2: Routing (Kapitel 8.2)](https://github.com/book-monkey4/iteration-2-routing/commit/11fabf50b5b46501305a8d6c929d8f4f8a4e0228)**
* **[Iteration 3: HTTP (Kapitel 10.1)](https://github.com/book-monkey4/iteration-3-http/commit/b4a106a1778d94626a5cadb295fd31b18ac79f23)**
* **[Iteration 3: RxJS (Kapitel 10.2)](https://github.com/book-monkey4/iteration-3-rxjs/commit/f304d932c095982a64de0e4649769e59c25f8569)**
* **[Iteration 3: Interceptoren (Kapitel 10.3)](https://github.com/book-monkey4/iteration-3-interceptors/commit/0d6c18002e4af0cc93ee493854b8caec5115d9a2)**
* **[Iteration 4: Template-Driven Forms (Kapitel 12.2)](https://github.com/book-monkey4/iteration-4-template-driven-forms/compare/e096ade..33fe9db)**
* **[Iteration 4: Reactive Forms (Kapitel 12.3)](https://github.com/book-monkey4/iteration-4-reactive-forms/commit/550f61684483710bb110d86b95768dc1d38313e0)**
* **[Iteration 4: Eigene Validatoren (Kapitel 12.4)](https://github.com/book-monkey4/iteration-4-custom-validation/compare/228bd47..b41530e)**
* **[Iteration 5: Pipes (Kapitel 13.1)](https://github.com/book-monkey4/iteration-5-pipes/compare/e00ade1..829abfe)**
* **[Iteration 5: Direktiven (Kapitel 13.2)](https://github.com/book-monkey4/iteration-5-directives/compare/66801ed..fe97efd)**
* **[Iteration 6: Module (Kapitel 14.1)](https://github.com/book-monkey4/iteration-6-modules/compare/2edd6e7..9d65223)**
* **[Iteration 6: Lazy Loading (Kapitel 14.2)](https://github.com/book-monkey4/iteration-6-lazy-loading/compare/d0bc5ef..e699f26)**
* **[Iteration 6: Guards (Kapitel 14.3)](https://github.com/book-monkey4/iteration-6-guards/compare/1fba833..d7e2a70)**
* **[Iteration 7: Internationalisierung (Kapitel 15.1)](https://github.com/book-monkey4/iteration-7-i18n/commit/8c3ecd42e67cd0c38eab155f910ba83717bfeb96)**



Wir wünschen Ihnen viel Spaß mit Angular!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen  
Danny, Ferdinand und Johannes**

<small>**Titelbild:** XXX</small>
