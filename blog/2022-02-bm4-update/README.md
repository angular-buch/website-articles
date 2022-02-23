---
title: 'Den Book-Monkey v4 updaten (3. Ausgabe)'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-02-25
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
Die Grundideen von Angular sind seit Version 2 konsistent und auf Beständigkeit über einen langen Zeitraum ausgelegt.
Die in unserem Buch beschriebenen Konzepte behalten ihre Gültigkeit.

Ein paar kleine Änderungen haben sich jedoch seit der Veröffentlichung der 3. Ausgabe unseres Buchs ergeben.
Diese wollen wir hier detailliert besprechen.
Es geht vor allem darum, dass seit **Angular 12** diverse strikte Einstellungen für neue Projekte standardmäßig aktiviert sind.
Als wir das Buch im Oktober 2020 veröffentlicht haben, war das noch nicht so.
Sind die strikten Einstellungen aktiv, brechen nun leider einige gedruckte Beispiele, die sich aber mit moderatem Aufwand beheben lassen.

## Der BookMonkey

Der "BookMonkey" ist das Demo-Projekt zum Buch.
Anhand des Beispielprojekts führen wir Sie schrittweise an die Entwicklung mit Angular heran.

Alle Entwicklungsschritte im Buch stellen wir in separaten Repositorys zur Verfügung.
Wenn man den Anleitungen im Buch folgt, sieht die eigene Codebasis im Idealfall genauso aus, wie unser Stand auf GitHub.


## Einen bestehenden BookMonkey updaten

Wenn Sie unser Buch gleich nach der Veröffentlichung gekauft haben und alle Beispiele daraufhin nach Anleitung umgesetzt haben, dann haben Sie keinen großen Aufwand.
Zum Zeitpunkt der Veröffentlichung war Angular 10 die neueste Version, kurz danach folgte Angular 11.
Wurde Ihr BookMonkey in dieser Zeit erstellt, dann sind in ihrem Projekt noch keinen strikten Einstellungen aktiv.

Sie können die verwendete Angular-Version in der Datei `package.json` ablesen.
Der Befehl `ng version` liefert ebenfalls ausführliche Infos zur Angular-Version im jeweiligen Projekt.

Um auf den neuesten Stand von Angular zu gelangen, benutzen Sie bitte den Befehl `ng update` in der Kommandozeile und folgen Sie den Anweisungen auf dem Bildschirm.

Lesen Sie dazu auch gerne unsere Blogposts mit den neuesten Änderungen zu Angular:

* [Angular 11 ist da!](/blog/2020-11-angular11)
* [Angular 12 ist da!](/blog/2021-05-angular12)
* [Angular 13 ist da!](/blog/2021-11-angular13)


## Einen neuen BookMonkey erstellen

Wenn Sie heute wie im Buch beschrieben den BookMonkey mit `ng new` erzeugen, so wird das Projekt standardmäßig mit strikten Einstellungen erstellt.
Dieser **"Strict Mode"** bewirkt eine Reihe an neuen Einstellungen, welche auf der [offiziellen Website von Angular](https://angular.io/guide/strict-mode) näher beschrieben sind.
Zum einen sind die [Einstellungen von TypeScript](https://www.typescriptlang.org/tsconfig#strict) restriktiver gesetzt.
Zum anderen kommt eine Reihe von Prüfungen im Angular-Compiler hinzu.
Diese sind in der Doku zu den [Angular Compiler Options](https://angular.io/guide/angular-compiler-options) näher beschrieben.


## Walkthrough: Den BookMonkey "refactoren"

Wir haben unseren "alten" BookMonkey (Stand Angular 10) mithilfe von `ng update` aktualisiert und anschließend die strikten Einstellungen manuell aktiviert:

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
Dieselbe Situation ergibt sich, wenn Sie mit einem strikten Projekt beginnen und die Beispiele aus dem Angular-Buch direkt übernehmen.
In beiden Fällen müssen wir Alternativen für den gedruckten Code finden.
Im Folgenden wollen wir nun die problematischen Codestellen kommentieren und mögliche Lösungen aufzeigen.
Die Reihenfolge dieses Walkthroughs entspricht unseren Iterationen im Buch.
Wenn Sie also den BookMonkey zum ersten Mal implementieren,
dann halten Sie am Besten diese Anleitung gleich bereit.

### Kapitel 6.1: Strikte Initialisierung von Properties

Gleich in der ersten Iteration zum Thema Komponenten (Kapitel 6.1) bei der `BookListComponent` (`src/app/book-list/book-list.component.ts`) erhalten wir einen der häufigsten Fehler:

> Property 'books' has no initializer and is not definitely assigned in the constructor.

```ts
// VORHER: book-list.component.ts
export class BookListComponent implements OnInit {
  books: Book[];

  ngOnInit(): void {
    this.books = [/* ... */]
  }
}
```

Hier prüft der Type-Checker, dass jede in einer Klasse deklarierte Eigenschaft entweder...

__1.__ einen Typ hat, der `undefined` enthält,  
__2.__ im Konstruktor zugewiesen wird oder  
__3.__ einen expliziten Initialisierer hat.


Eine mögliche Lösung ist also, der Eigenschaft einen Typ zu geben, der `undefined` enthält.
Denselben Effekt erhalten wir, wenn wir das Property mit einem Fragezeichen (`?`) auf optional setzen.

```ts
// 1. mögliche Lösung
export class BookListComponent {
  books: Book[] | undefined;
  // ODER
  books?: Book[];
}
```

Allerdings würde dies weitere Änderungen im Template und im Code zur Folge haben, da wir nun den Typ `undefined` berücksichtigen müssten, sobald wir das Property verwenden.

Wir könnten ebenso das Array mit allen Werten sofort im Konstruktor initialisieren.
Dadurch müssen wir den bisherigen Typ (Array aus `Book`) nicht ändern.
Auf die Methode `ngOnInit()` können wir dann ganz verzichten:

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
Wir haben das Property explizit mit einem leeren Array initialisiert.
Dadurch müssen wir den bestehenden Code kaum anpassen.
Die konkreten Werte werden weiterhin in der Methode `ngOnInit()` zugewiesen:

```ts
// NACHHER: book-list.component.ts
// 3. mögliche Lösung 
export class BookListComponent implements OnInit {
  books: Book[] = [];

  ngOnInit(): void {
    this.books = [/* ... */]
  }
}
```

Beim Start der Komponente ist `books` also sofort mit einem leeren Array belegt.
Sobald `ngOnInit()` ausgeführt wird (das geschieht etwas später), wird dieses leere Array überschrieben.

<!--
https://mariusschulz.com/blog/strict-property-initialization-in-typescript
https://www.typescriptlang.org/tsconfig#strictPropertyInitialization
-->

### Kapitel 6.2: Properties mit `@Input()`-Decorator

In der ersten Iteration erläutern wir im Kapitel 6.2 die Verwendung von Property Bindings, um Werte an eine Kindkomponente zu übergeben.
Dazu dekorieren wir das entsprechende Property in der Kindkomponente mit einem `@Input()`-Decorator:

```ts
// VORHER: book-list-item.component.ts
export class BookListItemComponent implements OnInit {
  @Input() book: Book;

  ngOnInit(): void {
  }
}
```

Erneut erhalten wir hier den Fehler, das das Property nicht korrekt initialisiert wurde.
Wir wollen aber nicht dieselbe Lösung wie im vorherigen Abschnitt verwenden.
Es wäre sehr aufwendig und unschön, das Property mit einem Dummy-Ersatzbuch zu initialisieren.

Stattdessen schauen wir uns zunächst noch einmal die Verwendung an:
Die `BookListItemComponent` wird zusammen mit `*ngFor` verwendet.
Wir können uns daher theoretisch sicher sein, dass immer auch ein Buch über das Property Binding zur Verfügung gestellt wird:

```html
<bm-book-list-item
  *ngFor="let b of books"
  [book]="b"></bm-book-list-item>
```

Das Input-Property wird aber erst **zur Laufzeit von Angular** durch das Property Binding zugewiesen.
Diesen Umstand berücksichtigt die strikte Prüfung **von TypeScript** nicht.
Laut TypeScript muss bereits zum Zeitpunkt der Initialisierung der Klasse ein Wert bereitstehen. 

Da der Wert des Properties aber erst zu einem späteren Zeitpunkt gesetzt wird, sollten wir dies auch folgerichtig im Code ausdrücken:

```ts
export class BookListItemComponent implements OnInit {
  @Input() book: Book | undefined;

  ngOnInit(): void {
  }
}
```

Statt dieser Schreibweise können wir auch einen äquivalenten Shortcut verwenden und das Property als optional markieren:

```ts
// NACHER: book-list-item.component.ts
export class BookListItemComponent implements OnInit {
  @Input() book?: Book;

  ngOnInit(): void {
  }
}
```

Wenn Sie möchten, können Sie auch gerne die nicht verwendete Methode `ngOnInit()` entfernen:

```ts
// NACHER: book-list-item.component.ts
export class BookListItemComponent {
  @Input() book?: Book;
}
```

Man kann Property Bindings in Angular leider nicht verpflichtend machen.
Daher empfehlen wir bei Input-Properties grundsätzlich, den Wert `undefined` zu berücksichtigen.

Da das Buch nun also `undefined` sein kann, greift eine weitere Typprüfung:

> optional (property) Book.thumbnails?: Thumbnail[] | undefined  
> Object is possibly 'undefined'.
> book-list-item.component.ts: Error occurs in the template of component BookListItemComponent.

```html
<!-- VORHER: book-list-item.component.html -->
<img class="ui tiny image"
     *ngIf="book.thumbnails && book.thumbnails[0] && book.thumbnails[0].url"
     [src]="book.thumbnails[0].url">
<div class="content">
  <div class="header">{{ book.title }}</div>
  <div *ngIf="book.subtitle" class="description">{{ book.subtitle }}</div>
  <div class="metadata">
    <span *ngFor="let author of book.authors; last as l">
      {{ author }}<span *ngIf="!l">, </span>
    </span>
    <br>
    ISBN {{ book.isbn }}
  </div>
</div>
```

Die Prüfung bemängelt zu Recht, dass das Property `book` den Wert `undefined` haben kann und dann auch der Zugriff auf `book.thumbnails` oder `book.isbn` den Wert `undefined` ergeben würde.
Wir haben die Meldung wie folgt behoben:
Das gesamte Template wird mit `*ngIf` nur dann eingeblendet, wenn ein Buch vorhanden ist:

```html
<!-- NACHER: book-list-item.component.html -->
<ng-container *ngIf="book">
  <!-- Vorheriger Code -->
  <img class="ui tiny image" ...>
  <div class="content" ...></div>
</ng-container>

```

Der `<ng-container>` ist ein Hilfselement, das nicht als DOM-Element gerendert wird.
Er sorgt nur für eine logische Gruppierung.
Innerhalb des Containers ist `book` durch die Verwendung von `*ngIf` immer definiert.

### Kapitel 6.3: Weitere Property-Prüfungen

Im Kapitel zu den Event Bindings übergeben wir ein Buch von der Kindkomponente `BookListComponent` zur Elternkomponente `AppComponent` und zeigen damit eine Detailansicht an.
Das Buch speichern wir im Property `book`.
Dieses Property sollten wir ebenso mit dem Fragezeichen als optional kennzeichnen, denn es ist nicht immer mit einem Wert belegt:

```ts
// VORHER: app.component.ts 
export class AppComponent {
  book: Book;
}
```

```ts
// NACHHER: app.component.ts 
export class AppComponent {
  book?: Book;
}
```

Das Template der `AppComponent` muss in diesem Fall nicht angepasst werden.

Die Anzeige des Buchs geschieht in der `BookDetailsComponent`.
Erneut müssen wir den Code aufgrund der strikten Prüfungen anpassen:

```ts
// VORHER: book-details.component.ts 
export class BookDetailsComponent implements OnInit {
  @Input() book: Book;
}
```

```ts
// NACHHER: book-details.component.ts 
export class BookDetailsComponent implements OnInit {
  @Input() book?: Book;
}
```


Die `BookDetailsComponent` hat eine Methode `getRating()`, welche nur eine Zahl akzeptiert.
Diese Methode wird im Template verwendet:

```html
<!-- VORHER: book-details.component.html -->
<div class="four wide column">
  <h4>Rating</h4>
  <i class="yellow star icon"
    *ngFor="let r of getRating(book.rating)"></i>
</div>
```

Damit der Code wieder kompiliert, müssen wir sicherstellen, dass es keinen Fall geben kann, bei dem das Rating `undefined` ist. 
Nun kann sowohl das Buch an sich `undefined` sein, als auch dessen Property `rating`.
Dies ergibt sich auch dem Interface `Book`, wo das Rating als optional markiert ist:

```ts
export interface Book {
  // [...]
  rating?: number;
}
```

Auch hier haben wir wieder das umschließende `<div>` für eine Prüfung verwendet.
Das Div-Element und sein Inhalt werden nur angezeigt, wenn `book.rating` definiert ist:


```html
<!--  NACHHER: book-details.component.html -->
<div class="four wide column" *ngIf="book.rating">
  <h4>Rating</h4>
  <i class="yellow star icon"
    *ngFor="let r of getRating(book.rating)"></i>
</div>
```

### Kapitel 8.2: Werte vom Router

Im Kapitel 8.2 stellen wir die Anwendung auf Routing um und ändern in diesem Zuge die `BookDetailsComponent`.
Statt eines Input-Properties verwenden wir nun die ISBN, die wir aus der aktuellen Route ermitteln.
Diese ISBN verwenden wir, um das richtige Buch vom `BookStoreService` zu erhalten.

Im gedruckten Buch finden Sie den folgenden Code:

```ts
// VORHER: book-details.component.ts 
export class BookDetailsComponent implements OnInit {
  book: Book;

  constructor(
    private bs: BookStoreService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.book = this.bs.getSingle(params.get('isbn'));
  }
}
```

Das Property `book` können wir mittels des Fragezeichens wieder als optional markieren.
Eine neue Herausforderung bietet dann allerdings folgende Fehlermeldung:

> const params: ParamMap  
> Argument of type 'string | null' is not assignable to parameter of type 'string'.  
> Type 'null' is not assignable to type 'string'.

Die Methode `get()` von der `ParamMap` liefert entweder einen String zurück (wenn der Parameter verfügbar ist) oder `null` (wenn der Parameter nicht in der Map vorhanden ist).
Erst zur Laufzeit der Anwendung kann sicher ermittelt werden, ob ein bestimmter Routen-Parameter verfügbar ist.
Um diesem Umstand gerecht zu werden, liefert `get()` einen Union-Type mit Null zurück.  

Der Typ des Routen-Parameters ist `string | null`.
Die Methode `getSingle()` erwartet allerdings nur `string`.
Vor den strikten Prüfungen von TypeScript war der gedruckte Code mit der Diskrepanz zwischen den beiden Typen valide, jetzt ist dies nicht mehr der Fall.

Wir können deshalb einen leeren String als Fallback-Wert definieren.
Auf diese Weise wird immer ein String übergeben:

```ts
// NACHHER: book-details.component.ts 
export class BookDetailsComponent implements OnInit {
  book?: Book;

  constructor(
    private bs: BookStoreService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    // verwendet den String ODER den leeren String falls der Ausdruck falsy ist
    this.book = this.bs.getSingle(params.get('isbn') || '');
  }
}
```

Es wird natürlich nie geschehen, dass wir diese Route ohne eine ISBN erreichen.
Hätten wir das Routing anders konfiguriert (sodass keine ISBN notwendig ist),
dann würden wir in diesem Fall einen leeren String an die Methode übergeben.

Eine weitere Möglichkeit besteht darin, die Typprüfung mittels des **"Non-Null Assertion Operator"** anzupassen.
Mit einem Ausrufezeichen (`!`) teilen wir dem Compiler mit, dass der Wert niemals `null` sein wird.

```ts
// alternative Möglichkeit
this.book = this.bs.getSingle(params.get('isbn')!);
```

Wir müssen uns dann aber auch wirklich sicher sein, dass dieser Fall wirklich niemals auftreten wird.
Verwenden Sie die Non-Null Assertion daher bitte mit Vorsicht.

Auch der `BookStoreService` benötigt eine kleine Korrektur.
Zuvor hatten wir den Rückgabewert für die Methode `getSingle()` als `Book` angegeben.
Das war nicht ganz korrekt, denn wenn es keinen Treffer gibt, dann ist der Rückgabewert `undefined`.
Diese Nachlässigkeit führt jetzt zu einem Fehler, daher lautet die korrekte Signatur wie folgt:

```ts
// NACHHER: book-store.service.ts
export class BookStoreService {

  getSingle(isbn: string): Book | undefined {
    return this.books.find(book => book.isbn === isbn);
  }
}
```



## TODO

morgen geht's hier weiter! 😅


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
