---
title: 'Einführung in TypeScript'
published: 2026-02-10
lastModified: 2026-04-22
---

Für die Entwicklung mit Angular verwenden wir die Programmiersprache **TypeScript**.
Dieser Artikel richtet sich an alle, die mit modernem JavaScript und TypeScript noch nicht vertraut sind.
Wir gehen die wichtigsten Sprachfeatures Schritt für Schritt durch und legen damit das Fundament für die Arbeit mit Angular.

Keine Angst, du musst keine vollständig neue Sprache erlernen.
TypeScript baut auf JavaScript auf und ergänzt es um ein statisches Typsystem.

Wenn du schon Erfahrung mit modernem JavaScript oder TypeScript hast, kannst du diesen Crashkurs überspringen.

## Inhalt

[[toc]]

## TypeScript einsetzen

TypeScript ist ein Open-Source-Projekt von Microsoft und basiert auf den aktuellen ECMAScript-Standards.
Die Sprache ist ein *Superset* von JavaScript: Jede JavaScript-Syntax ist auch in TypeScript gültig.
Allerdings ist TypeScript deutlich strenger als reines JavaScript.
Der Compiler prüft zusätzlich die Typen und lehnt Code ab, der in JavaScript noch durchgelaufen wäre.
In Angular-Projekten sind diese Prüfungen standardmäßig aktiviert (*strict mode*).
Nur wenn wir die Einstellungen gezielt lockern, nähert sich TypeScript dem Verhalten von reinem JavaScript an.

TypeScript ist nicht direkt im Browser lauffähig.
Deshalb wird der Code vor der Auslieferung wieder in JavaScript umgewandelt.
Für diesen Prozess ist der TypeScript-Compiler verantwortlich.
Man spricht dabei auch von *Transpilierung*, weil der Code lediglich in eine andere Sprache übertragen wird.
Konkret bedeutet das: Die Typangaben werden beim Transpilieren entfernt.

```typescript
// TypeScript-Quellcode:
let age: number = 30;

// Nach der Transpilierung (JavaScript):
let age = 30;
```

Darüber hinaus kennt TypeScript eine Reihe von eigenen Syntaxen, die beim Transpilieren in äquivalenten JavaScript-Code aufgelöst werden.
Ein Beispiel dafür ist die Konstruktor-Kurzschreibweise:

```typescript
// TypeScript-Kurzschreibweise im Konstruktor:
class Book {
  constructor(public title: string) {}
}

// Nach der Transpilierung (JavaScript):
class Book {
  constructor(title) {
    this.title = title;
  }
}
```

Diese Schreibweise schauen wir uns später im Abschnitt zu Klassen genauer an.

Zur Laufzeit ist das Programm ein reines JavaScript-Programm ohne Typen.
Durch die Typprüfungen bei der Entwicklung und beim Build können viele Fehler aber schon frühzeitig erkannt werden.

Die meisten modernen IDEs wie Visual Studio Code oder IntelliJ/WebStorm unterstützen TypeScript nativ und ohne zusätzliche Plug-ins.
Neben der Fehlerprüfung profitieren wir dabei auch von Komfortfunktionen wie Autovervollständigung, Navigation zwischen Methoden und Klassen sowie einer soliden Refactoring-Unterstützung.
In einem Angular-Projekt ist der TypeScript-Compiler außerdem schon vollständig konfiguriert, sodass wir sofort mit der Entwicklung beginnen können.

## Variablen: `const` und `let`

In JavaScript und TypeScript deklarieren wir Variablen mit den Schlüsselwörtern `const` und `let`.
Beide wurden mit ECMAScript 2015 eingeführt und unterscheiden sich darin, ob sich der Wert nach der Initialisierung noch ändern lässt.

### Konstanten mit `const`

Variablen, deren Wert sich nach der Initialisierung nicht mehr ändern soll, deklarieren wir mit `const`.
In der Praxis ist das der häufigste Fall. Wir empfehlen, eine Variable zunächst immer mit `const` zu deklarieren.

```typescript
const name = 'Angular';
// name = 'React'; // Fehler: Zuweisung nicht möglich
```

Vorsicht ist allerdings geboten bei Variablen, die ein Objekt oder Array enthalten.
Objekte und Arrays werden in JavaScript nur anhand ihrer Speicherreferenz identifiziert.
Das bedeutet, dass eine `const`-Variable nur die Referenz auf das Objekt konstant speichert, wir den Inhalt aber trotzdem verändern können:

```typescript
const book = { title: 'Angular' };
book.title = 'Angular Buch'; // Das funktioniert!
// book = { title: 'Neues Buch' }; // Fehler: Zuweisung nicht möglich
```

### Variablen mit `let`

Soll sich der Wert einer Variable während des Programmablaufs ändern, deklarieren wir sie mit `let`.
Mit `let` deklarierte Variablen sind blockgebunden: Sie gelten nur innerhalb des Blocks, in dem sie deklariert wurden, also typischerweise zwischen geschweiften Klammern wie einer Schleife oder einem `if`-Block.

```typescript
for (let i = 0; i < 10; i++) {
  // i ist nur hier gültig
}
// console.log(i); // Fehler: i ist nicht definiert
```

### Hinweis: das alte `var`

In älterem JavaScript-Code begegnet uns noch das Schlüsselwort `var`, das vor ECMAScript 2015 die einzige Möglichkeit war, eine Variable zu deklarieren.
Im modernen Alltag benötigen wir es nicht mehr. Wir verwenden ausschließlich `const` und `let`.

## Die wichtigsten Basistypen

Die starke Typisierung ermöglicht es, die Datenstrukturen unserer Anwendung präzise zu beschreiben.
So können schon während der Entwicklung hilfreiche Informationen und Warnungen bereitgestellt werden, wenn die API nicht korrekt verwendet wird.

### Primitive Typen: Zahlen, Zeichenketten und boolesche Werte

Die wichtigsten primitiven Typen in TypeScript sind `number`, `string` und `boolean`.
Der Typ `number` legt den Wert einer Variable auf eine Ganz- oder Kommazahl fest.
Zeichenketten werden mithilfe des Datentyps `string` definiert.
Wenn eine Variable logische Wahrheitswerte (`true` oder `false`) annehmen soll, verwenden wir den Typ `boolean`.

Ein Typ wird immer mit einem Doppelpunkt hinter dem Variablennamen deklariert.
Wenn der Typ bereits aus dem Wert eindeutig bestimmbar ist, müssen wir diese Information nicht zwingend notieren.
TypeScript ermittelt den passenden Typ automatisch. Man spricht von *Typinferenz*.

```typescript
let age: number = 30;
let name: string = 'Angular';
let isActive: boolean = true;

// Typinferenz: Typ wird automatisch erkannt
let count = 42; // number
let title = 'Buch'; // string
```

### Typisierte Arrays

In JavaScript ist es möglich, ein Array mit verschiedenen Typen zu befüllen.
Mit TypeScript können Arrays typisiert werden, sodass nur Elemente eines festgelegten Typs zulässig sind.

```typescript
const numbers: number[] = [1, 2, 3];
const names: string[] = ['Angular', 'React', 'Vue'];

// Alternative Schreibweise mit Generic
const items: Array<number> = [1, 2, 3];
```

### Beliebige Werte mit `any` und `unknown`

Eine mit `any` oder `unknown` typisierte Variable kann immer beliebige Werte mit beliebigen Typen annehmen.

```typescript
let flexible: any = 'text';
flexible = 42;
flexible = true;
```

Diese beiden Basistypen haben jedoch einen wichtigen Unterschied:
Der Wert einer mit `any` typisierten Variable kann zu jeder anderen Variable zugewiesen werden.
Ohne strict mode wird `any` außerdem als Standardtyp verwendet, wenn TypeScript den Typ nicht automatisch ermitteln kann. In Angular-Projekten (strict mode aktiv) führt das zu einem Compiler-Fehler.

Im Gegensatz dazu ist `unknown` typsicherer.
Eine solche Variable kann ebenfalls beliebige Werte mit jedem Typ annehmen.
Allerdings kann der Wert einer `unknown`-Variable nur dann einer anderen Variable zugewiesen werden, wenn diese auch den Typ `unknown` oder `any` trägt.
Um den Wert einer mit `unknown` typisierten Variable dennoch zuweisen zu können, müssen wir mithilfe von `typeof` eine Typprüfung vornehmen.

```typescript
let value: unknown = 'hello';

// Typprüfung erforderlich
if (typeof value === 'string') {
  const text: string = value; // Jetzt erlaubt
}
```

Praktisch solltest du es vermeiden, `any` zu verwenden, denn dieser Typ ist fast immer ein Indiz dafür, dass Unklarheit über die Typisierung herrscht.
Aber auch `unknown` ist nur ein Notnagel: Wann immer möglich, sollten wir den konkreten Typ angeben.
Erst wenn das wirklich nicht geht, ist `unknown` die bessere Wahl als `any`.

In der Praxis begegnet uns `unknown` vor allem in `catch`-Blöcken.
Da ein Fehler von beliebigem Typ sein kann, ist die `error`-Variable standardmäßig als `unknown` typisiert:

```typescript
try {
  // riskante Operation
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

## Template-Strings

Mit einem normalen String in einfachen Anführungszeichen ist es nicht möglich, einen Text über mehrere Zeilen anzugeben.
Ein *Template-String* wird mit schrägen `` ` ``Hochkommata`` ` `` (*Backtick*) eingeleitet und beendet, nicht mit Anführungszeichen.
Der String kann sich über mehrere Zeilen erstrecken.

Mit Template-Strings können wir außerdem Ausdrücke direkt in einen String einbetten:

```typescript
const name = 'Angular';
const version = 21;

const message = `Willkommen bei ${name}!
Die aktuelle Version ist ${version}.`;
```

Wir werden Template-Strings vor allem nutzen, um URLs mit Parametern zusammenzubauen.
Genau für ein solches Szenario setzen wir Template-Strings auch im Angular-Buch ein, etwa um in einem Service die API-URL zusammenzubauen:

```typescript
// Vereinfacht aus Listing 20.1:
const apiUrl = 'https://api1.angular-buch.com';
const url = `${apiUrl}/books`;
// 'https://api1.angular-buch.com/books'
```

Im Buch arbeiten wir an dieser Stelle bereits mit dem Angular-`HttpClient` und Observables.
Für den Moment ist hier nur wichtig, dass der Template-String die Basis-URL mit dem Pfad `/books` zu einer vollständigen URL kombiniert.

## Klassen

Um eine Klasse zu beschreiben, verwenden wir in JavaScript und TypeScript das Schlüsselwort `class`.
Mit Klassen können einfache Datenobjekte oder auch komplexe objektorientierte Logik abgebildet werden.
Ein konkretes Objekt einer Klasse nennen wir eine *Instanz*.

```typescript
class User {
  firstname?: string;
  lastname: string;
  age = 0;
  isAdmin: boolean;

  constructor(lastname: string) {
    this.lastname = lastname;
    this.isAdmin = false;
  }
}
```

Klassen bestehen aus mehreren Bausteinen, die wir uns der Reihe nach anschauen.

### Eigenschaften/Propertys

Eigenschaften (engl. *properties*) erweitern eine Klasseninstanz mit zusätzlichen Informationen.
Propertys können mit Zugriffsmodifizierern wie `public`, `private` oder `protected` versehen werden, um die Sichtbarkeit zu steuern.
Lässt man die Angabe eines Zugriffsmodifizierers weg, so ist die Eigenschaft immer `public`.

Daneben gibt es weitere Modifier:

- `readonly` verhindert Änderungen nach der Initialisierung. Dazu kommen wir noch.
- `static` macht eine Eigenschaft zur Klasse statt zur Instanz zugehörig. Sie wird dann direkt über den Klassennamen aufgerufen, ohne dass eine Instanz erzeugt werden muss.

Ein Property kann als optional deklariert werden, indem wir ein Fragezeichen setzen.
Jedes Property einer Klasse muss entweder sofort einen Wert besitzen, im Konstruktor zugewiesen werden oder als optional markiert sein.

### Methoden

Methoden sind die Funktionen einer Klasse und enthalten ihre Logik.
Wir können die Methodensignatur präzisieren, indem wir Typen für die Argumente und den Rückgabewert angeben.

```typescript
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  log(message: string): void {
    console.log(message);
  }
}
```

Der Typ `void` sagt aus, dass eine Methode keinen Rückgabewert besitzt.

### Getter und Setter

Mit den Schlüsselwörtern `get` und `set` können wir Methoden so definieren, dass sie wie Eigenschaften gelesen oder geschrieben werden.
Statt `person.getAge()` schreibt man dann einfach `person.age`.

```typescript
class Person {
  private birthYear: number;

  constructor(birthYear: number) {
    this.birthYear = birthYear;
  }

  get age(): number {
    return new Date().getFullYear() - this.birthYear;
  }

  set age(value: number) {
    this.birthYear = new Date().getFullYear() - value;
  }
}

const person = new Person(1990);
console.log(person.age); // Getter: berechnet das Alter
person.age = 25;          // Setter: passt das Geburtsjahr an
```

### Konstruktor

Der Konstruktor ist eine besondere Methode, die beim Erzeugen einer neuen Instanz aufgerufen wird.
Er heißt immer `constructor`.

TypeScript bietet für die Initialisierung von Propertys eine Kurzschreibweise, die wir bereits ganz am Anfang im Transpilier-Beispiel kurz gesehen haben.
Wenn wir in der Methodensignatur des Konstruktors für das Argument einen Zugriffsmodifizierer wie `public` oder `private` verwenden, so wird das zugehörige Property automatisch deklariert und initialisiert.

```typescript
class Point {
  constructor(
    public x: number,
    public y: number
  ) {}
}

// Entspricht:
class PointLong {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

### Vererbung

Die Funktionalität einer Klasse kann auf andere Klassen übertragen werden.
Mit dem Schlüsselwort `extends` kann eine Klasse von einer anderen erben.

```typescript
class Animal {
  constructor(public name: string) {}
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);
  }
}
```

Mit `super()` kann der Konstruktor der Basisklasse ausgeführt werden.

## Private Eigenschaften von Klassen

Mit *Private Class Fields* in JavaScript können wir Datenkapselung in Klassen realisieren.
Ein privates Feld wird durch ein vorangestelltes `#`-Symbol definiert und ist nur innerhalb der Klasse zugänglich.

```typescript
class BankAccount {
  #balance: number;

  constructor(balance: number) {
    this.#balance = balance;
  }

  isEnoughFor(amount: number): boolean {
    return this.#balance >= amount;
  }
}

const account = new BankAccount(1000);
// account.#balance; // Fehler: Zugriff nicht möglich
```

In TypeScript existiert außerdem der Access Modifier `private`, der die Sichtbarkeit einschränkt.
Der Schutz ist allerdings zur Laufzeit nicht garantiert, da TypeScript zu JavaScript umgewandelt wird.
Wir empfehlen die moderne JavaScript-Variante mit `#`.
In bestehenden Angular-Projekten ist `private` allerdings noch weit verbreitet und ebenfalls eine gültige Wahl.

## Property Modifiers: `readonly` und `protected`

TypeScript stellt uns eine Reihe von *Property Modifiers* zur Verfügung, mit denen wir das Verhalten von Eigenschaften präzisieren können.

Der Modifier `protected` sorgt für eine eingeschränkte Sichtbarkeit.
Ein Protected Property ist nicht von außen sichtbar, sondern kann nur innerhalb derselben Klasse und in vererbten Kindklassen verwendet werden.
Dazu gehört auch das Template einer Angular-Komponente.

Mit `readonly` können wir sicherstellen, dass eine Eigenschaft nach der Initialisierung nicht mehr verändert werden kann.

```typescript
class Task {
  readonly id: string;
  protected isCompleted = false;

  constructor(id: string) {
    this.id = id;
  }
}
```

Für Angular-Projekte empfehlen wir folgende Konventionen:

- Propertys und Methoden, die nur innerhalb der Klasse verwendet werden, werden als privat markiert.
- Propertys, die im Template einer Komponente genutzt werden, werden mit `protected` gekennzeichnet.
- Propertys, die von Angular verwaltet werden, werden auf `readonly` gesetzt (z. B. `input()`, `output()`, `model()`).

## Arrow Functions

Eine *Arrow-Funktion* ist eine kompaktere Schreibweise für eine Funktion in JavaScript.
Sie hat allerdings einen wichtigen Unterschied beim `this`-Kontext, den wir gleich noch sehen.

Die Definition einer anonymen Funktion verkürzt sich damit elegant zu einem Pfeil `=>`.
Besitzt die Funktion genau einen Parameter ohne Typ, können die runden Klammern auf der linken Seite weggelassen werden.
Auch die geschweiften Klammern auf der rechten Seite können eingespart werden:
Lässt man die Klammern weg, ist das Ergebnis des rechtsseitigen Ausdrucks der Rückgabewert für die Funktion.

```typescript
// Diese vier Definitionen sind gleichwertig:
const fn1 = function(x: number) { return x * 2; };
const fn2 = (x: number) => { return x * 2; };
const fn3 = (x: number) => x * 2;
const fn4 = x => x * 2; // Klammern weglassen geht nur, wenn kein Typ notiert wird
```

Das folgende Beispiel zeigt, wie wir alle geraden Zahlen aus einer Liste ermitteln können:

```typescript
const numbers = [1, 2, 3, 4, 5, 6];

// Herkömmliche Funktion
const even1 = numbers.filter(function(n) {
  return n % 2 === 0;
});

// Arrow-Funktion, wesentlich kompakter
const even2 = numbers.filter(n => n % 2 === 0);
```

### Der `this`-Kontext

In JavaScript bezieht sich `this` innerhalb einer Methode normalerweise auf die Klasseninstanz, zu der die Methode gehört.
Bei einer klassischen Funktion mit dem Schlüsselwort `function` ändert sich dieser Bezug allerdings je nach Aufrufkontext.
Das führt schnell zu Fehlern.

Im folgenden Beispiel kennt die Funktion in `setTimeout` die Klasseninstanz nicht mehr:

```typescript
class Counter {
  count = 0;

  increment() {
    setTimeout(function() {
      this.count++; // Fehler: this ist hier nicht der Counter!
    }, 1000);
  }
}
```

Genau dieses Problem lösen Arrow-Funktionen: Sie besitzen keinen eigenen `this`-Kontext, sondern übernehmen `this` aus dem umgebenden Code.
Mit einer Arrow-Funktion in `setTimeout` zeigt `this` weiterhin auf die Klasseninstanz:

```typescript
class Counter {
  count = 0;

  increment() {
    setTimeout(() => {
      this.count++;
      console.log(this.count); // OK: this zeigt auf den Counter
    }, 1000);
  }
}
```

## Immutability

In JavaScript werden Objekte und Arrays stets nur als Referenzen auf eine zugehörige Speicherstelle gespeichert.
Ändern wir also die Inhalte direkt im Objekt, so ändert sich die Referenz nicht!
Das bedeutet auch, dass bei Zuweisung eines Objekts zu einer Variable lediglich ein Verweis auf das ursprüngliche Objekt erzeugt wird.

```typescript
const book = { title: 'Angular', year: 2023 };
const copy = book;
copy.year = 2024;

console.log(book.year); // 2024, auch das Original wurde geändert!
```

Um gut wartbaren Code zu erhalten, dürfen wir niemals die Werte eines Objekts oder Arrays direkt verändern.
Wir behandeln ein Objekt oder Array als *unveränderlich* (engl. *immutable*) und erzeugen bei einer Änderung immer eine Kopie.
Hierfür nutzen wir in der Regel die Spread-Syntax:

```typescript
const book = { title: 'Angular', year: 2023 };
const updated = { ...book, year: 2026 }; // Kopie mit neuem Wert
```

> **Merke:** Objekte und Arrays sollten nie direkt verändert werden. Stattdessen sollte immer eine Kopie mit neuer Referenz erzeugt werden, die die gewünschten Änderungen enthält.

Wie die Spread-Syntax genau funktioniert, schauen wir uns jetzt an.

## Spread-Syntax und Rest-Parameter

In JavaScript können wir eine Syntax mit drei Punkten verwenden (`...`).
Diese Schreibweise hat zwei Bedeutungen, je nachdem, wo sie eingesetzt wird:
Die *Spread-Syntax* breitet Elemente aus, während *Rest-Parameter* übrige Argumente einsammeln.

### Objekteigenschaften kopieren

Mit der Spread-Syntax können wir Objekte klonen und dabei Eigenschaften überschreiben:

```typescript
const book = { title: 'Angular', year: 2023 };
const copy = { ...book, year: 2026 };

console.log(book.year); // 2023, Original unverändert
console.log(copy.year); // 2026, Kopie mit neuem Wert
```

Bitte beachte, dass diese Idee nur für *Plain Objects* funktioniert und nur eine flache Kopie (*Shallow Copy*) erzeugt.
Verschachtelte Objekte werden zwischen Original und Kopie geteilt:

```typescript
const book = {
  title: 'Angular',
  author: { name: 'Hoppe' }
};

const copy = { ...book };
copy.author.name = 'Mustermann';
console.log(book.author.name); // 'Mustermann', das verschachtelte Objekt wurde geteilt!
```

Wird das zum Problem, können wir die native Funktion `structuredClone()` verwenden, die eine *Deep Copy* erzeugt und damit auch alle verschachtelten Objekte kopiert.

### Array-Elemente kopieren

Die Spread-Syntax funktioniert ähnlich auch für Arrays:

```typescript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const copy = [...arr1];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]
```

### Funktionsargumente übergeben

Wollen wir die Elemente eines Arrays einzeln als Argumente an eine Funktion übergeben, können wir die Spread-Syntax nutzen:

```typescript
const numbers = [1, 2, 3];
console.log(Math.max(...numbers)); // 3
```

### Funktionsargumente einsammeln

In einem anderen Kontext haben die drei Punkte eine andere Bedeutung:
Erhält eine Funktion mehrere Argumente, so können wir diese elegant in einem Array erfassen.
Ein solcher Parameter heißt *Rest-Parameter*.

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
```

## Optional Chaining

Wenn ein verschachteltes Objekt eine optionale Eigenschaft hat, könnte der Zugriff darauf fehlschlagen.
TypeScript warnt uns davor:

```typescript
type User = {
  address: { city: string } | undefined;
};

const user: User = { address: undefined };
const city = user.address.city;
// Fehler: 'user.address' ist möglicherweise 'undefined'
```

Mit Optional Chaining können wir solche Zugriffe absichern.
Der `?.`-Operator liefert `undefined`, wenn die linke Seite nicht existiert, statt einen Fehler zu werfen:

```typescript
const city = user.address?.city; // string | undefined
```

## Nullish Coalescing

Als *nullish* gelten in JavaScript die Werte `null` und `undefined`.
Der `??`-Operator (Nullish Coalescing) liefert einen Rückfallwert, wenn der linke Wert nullish ist:

```typescript
const value = null;
const result = value ?? 'default'; // 'default'

// Unterschied zu ||
const zero = 0;
console.log(zero || 'fallback'); // 'fallback'
console.log(zero ?? 'fallback'); // 0
```

## Promises und `async`/`await`

Manche Vorgänge brauchen Zeit, zum Beispiel ein Netzwerk-Aufruf an einen Server.
JavaScript wartet darauf nicht, sondern führt den restlichen Code weiter aus und meldet sich später mit dem Ergebnis.
Solche Vorgänge nennt man *asynchron*.

Eine *Promise* ist ein natives Objekt in JavaScript, das einen asynchronen Vorgang repräsentiert.
Sie liefert entweder einen Wert zurück, wenn die Operation erfolgreich war, oder einen Fehler, wenn die Ausführung fehlgeschlagen ist.

Mit den Schlüsselwörtern `async` und `await` können wir asynchronen Code schreiben, der wie synchroner Code aussieht.

```typescript
// Mit then()
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));

// Mit async/await
async function loadData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
}
```

## Union Types

Ein *Union Type* ist die Vereinigung mehrerer möglicher Typen. Eine Variable kann dann einen Wert von einem dieser Typen annehmen.
Mit dem `|`-Operator notieren wir die Alternativen:

```typescript
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

Häufig kombinieren wir auch mehrere String-Literale zu einem Union Type, um eine begrenzte Auswahl an Werten festzulegen:

```typescript
type Status = 'loading' | 'success' | 'error';

let currentStatus: Status = 'loading';
currentStatus = 'success'; // OK
// currentStatus = 'pending'; // Fehler: 'pending' ist nicht zulässig
```

## Interfaces

Um die Typisierung in unserem Programmcode konsequent umzusetzen, stellt TypeScript sogenannte *Interfaces* bereit.
Interfaces beschreiben, welche Eigenschaften ein Objekt haben muss und welchen Typ diese Eigenschaften haben.
Konkrete Werte legen sie nicht fest.
Optionale Eigenschaften werden durch ein Fragezeichen-Symbol gekennzeichnet.

```typescript
interface User {
  firstname: string;
  lastname: string;
  age?: number;
}

const user: User = {
  firstname: 'Max',
  lastname: 'Mustermann'
};
```

Fügen wir dem Objekt eine zusätzliche Eigenschaft hinzu oder hat eine der Eigenschaften nicht den Typ, der im Interface definiert wurde, so erhalten wir einen Fehler.

### Interface für Klassen

Interfaces können auch dafür verwendet werden, die Struktur einer Klasse vorzugeben.
Dafür wird nach dem Klassennamen das Schlüsselwort `implements` angefügt.

```typescript
interface Printable {
  print(): void;
}

class Document implements Printable {
  print(): void {
    console.log('Printing ...');
  }
}
```

## Generic Types

Mit *Generics* können wir Typparameter für Klassen und Funktionen definieren.
Sie sind ein wichtiges Konzept in TypeScript, um wiederverwendbare und flexible Funktionen zu erstellen.

Im einfachsten Fall definieren wir eine Funktion mit einem Typparameter `T`, der beim Aufruf automatisch ermittelt wird:

```typescript
// Eine generische Funktion mit Typparameter T
function first<T>(arr: T[]): T {
  return arr[0];
}

const firstBook = first(['Angular', 'React']); // string
const firstNumber = first([1, 2, 3]);          // number
```

Auch im Angular-Ökosystem begegnen uns Generics häufig.
Die Funktion `signal()` (mehr dazu im Buch) erzeugt einen reaktiven Wert mit generischem Typ:

```typescript
interface Book {
  title: string;
}

// Generischer Typ wird automatisch erkannt
const count = signal(0); // Signal<number>
const title = signal('Angular'); // Signal<string>

// Bei Objekten muss der Typ explizit angegeben werden
const book = signal<Book>({ title: 'Angular' }); // Signal<Book>
```

## Decorators

Mit Decorators können wir Klassen, Methoden und Eigenschaften dekorieren und damit Metadaten hinzufügen.
Metadaten sind zusätzliche Informationen über eine Klasse oder Methode. Sie beschreiben sie, sind aber nicht Teil ihrer eigentlichen Logik.
Man erkennt einen Decorator am `@`-Zeichen zu Beginn des Namens.

```typescript
@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>'
})
export class AppComponent {}
```

Angular nutzt dieses Sprachkonzept, um Klassen eine Semantik zu geben:
Durch den Decorator `@Component()` wird diese Klasse als Komponente behandelt.
Alle Decorators von Angular sind Funktionen, daher darf man die Funktionsklammern bei der Verwendung nicht vergessen.

Angular bringt eine Reihe von Decorators mit, darunter `@Component`, `@Directive`, `@Pipe` und `@Service`.
Sie unterscheiden Klassen nach ihrer Aufgabe innerhalb der Anwendung.

## Konfiguration

Die Konfiguration des TypeScript-Compilers wird in der Datei `tsconfig.json` hinterlegt.
Eine zentrale Einstellung ist `strict`: Mit `strict: true` werden alle strengen Typprüfungen aktiviert (siehe oben).
Eine weitere wichtige Option ist `target`. Sie legt fest, in welche Version von JavaScript der Code transpiliert werden soll.

In einem Angular-Projekt müssen wir uns über die Konfiguration von TypeScript nur wenige Gedanken machen, denn die Einstellungen sind bereits mit sinnvollen Werten vordefiniert. `strict` ist standardmäßig aktiviert.

## Zusammenfassung

Mit diesem Crashkurs haben wir die wichtigsten Bausteine von TypeScript kennengelernt: moderne Sprachfeatures aus JavaScript wie `const`/`let`, Arrow Functions und die Spread-Syntax, dazu das Typsystem von TypeScript mit Interfaces, Union Types und Generics, und schließlich die Objektorientierung mit Klassen und Property Modifiers.

TypeScript ist strenger als JavaScript, und genau das macht die Sprache so wertvoll.
Die Typprüfung im Compiler und die Unterstützung durch die IDE helfen uns, Fehler früh zu erkennen und Software wartbar zu entwickeln.

## Fazit

Wenn du diesen Artikel durchgearbeitet hast, steht der Entwicklung moderner Angular-Anwendungen nichts mehr im Wege.
TypeScript kennt zwar noch viele weitere praktische Konstrukte, aber eine solide Angular-Anwendung benötigt nicht zwingend alle.
Mit dem hier gelernten Werkzeugkasten bist du startklar.

Viel Spaß mit TypeScript und Angular!
