---
title: 'Einführung in TypeScript'
published: 2026-02-10
lastModified: 2026-02-05
hidden: true
---

> **Hinweis:** Dieser Artikel ist ein Zusatzmaterial zum [Angular-Buch](https://angular-buch.com).
> Im Buch setzen wir durchgehend auf **TypeScript** für die Entwicklung mit Angular.
> Dieses Kapitel bietet eine Einführung in die wichtigsten Sprachfeatures.
>
> Wenn du bereits Erfahrung mit TypeScript hast, kannst du dieses Kapitel überspringen.
> Viele Konzepte werden wir auch im Verlauf des Buchs praktisch kennenlernen.

---

Für die Entwicklung mit Angular verwenden wir die Programmiersprache *TypeScript*.
Für Entwickler:innen, die bisher noch nicht mit TypeScript entwickelt haben, wollen wir hier einen kurzen Einstieg geben.
Keine Angst – du musst keine vollständig neue Sprache erlernen, um mit Angular arbeiten zu können, denn TypeScript ist eine Obermenge von JavaScript.

TypeScript greift die aktuellen ECMAScript-Standards auf und integriert zusätzliche Features, unter anderem ein statisches Typsystem.
Das bedeutet praktisch, dass die Typen von Variablen, Funktionsparametern und Klassen-Propertys direkt im Code aufgeschrieben werden.
So erhalten wir schon während der Entwicklung eine gute Unterstützung im Editor und können unsere Software typsicher entwickeln.
Autovervollständigung, Typprüfungen und Rename Refactoring sind nur einige der Vorteile, die sich aus einem statischen Typsystem ergeben.

Jedes Programm, das in JavaScript geschrieben wurde, funktioniert auch in TypeScript.
Dein bestehendes Wissen zu JavaScript bleibt also weiterhin anwendbar.

## TypeScript einsetzen

TypeScript ist nicht direkt im Browser lauffähig.
Deshalb wird der TypeScript-Code vor der Auslieferung wieder in JavaScript umgewandelt.
Für diesen Prozess ist der TypeScript-Compiler verantwortlich.
Man spricht dabei auch von *Transpilierung*, weil der Code lediglich in eine andere Sprache übertragen wird.

Die statische Typisierung geht bei diesem Schritt verloren.
Das bedeutet, dass das Programm zur Laufzeit keine Typen mehr besitzt, denn es ist ein reines JavaScript-Programm.
Durch die Typunterstützung bei der Entwicklung und beim Build können allerdings schon die meisten Fehler erkannt und vermieden werden.

TypeScript ist als Open-Source-Projekt bei der Firma Microsoft entstanden.
Durch die Typisierung können Fehler bereits zur Entwicklungszeit erkannt werden.
Außerdem können Tools den Code genauer analysieren.
Dies ermöglicht Komfortfunktionen wie automatische Vervollständigung, Navigation zwischen Methoden und Klassen, eine solide Refactoring-Unterstützung und automatische Dokumentation in der Entwicklungsumgebung.

Die meisten modernen IDEs wie Visual Studio Code oder IntelliJ/WebStorm unterstützen TypeScript nativ und ohne zusätzliche Plug-ins.
In einem Angular-Projekt ist der TypeScript-Compiler außerdem schon vollständig konfiguriert, sodass wir sofort mit der Entwicklung beginnen können.

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: nein, ist mittlerweile Basiswissen und hat erst einmal auch nichts direkt mit TS zu tun -->
<!--
## Variablen: `const`, `let` und `var`

Ursprünglich wurden Variablen in JavaScript mit dem Schlüsselwort `var` eingeleitet.
Das funktioniert noch immer, allerdings kamen mit ECMAScript 2015 die neuen Variablenarten `let` und `const` hinzu.

### Die schmerzhafte `var`-heit

Mit dem Schlüsselwort `var` eingeleitete Variablen sind jeweils in der Funktion gültig, in der sie auch deklariert wurden – und zwar überall.
Variablen mit `var` „fressen" sich durch alle Blöcke hindurch und sind in der *gesamten* Funktion und in allen darin verschachtelten Blöcken und Funktionen verfügbar.

```typescript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 – x ist hier verfügbar!
}
```

Diese Eigenschaft führt in der Praxis schnell zu Kollisionen von Variablen aus verschiedenen Programmteilen.

### Blockgebundene Variablen mit `let`

Mit Einführung von ECMAScript 2015 hielt der Variablentyp `let` Einzug in die Webentwicklung.
Damit lassen sich blockgebundene Variablen definieren.
Sie sind nicht in der gesamten Funktion gültig, sondern lediglich innerhalb des Blocks, in dem sie definiert wurden.

```typescript
for (let i = 0; i < 10; i++) {
  // i ist nur hier gültig
}
// console.log(i); // Fehler: i ist nicht definiert
```

### Konstanten mit `const`

Variablen, die mit `var` oder `let` eingeleitet werden, lassen sich jederzeit überschreiben.
Häufig ändert sich der Wert einer Variable allerdings nach der Initialisierung nicht mehr.
Für solche Fälle gibt es Konstanten.
Sie werden mit dem Schlüsselwort `const` eingeleitet.
Wird eine Konstante einmal festgelegt, so lässt sich der Wert nicht mehr überschreiben.

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

### Wann nutze ich welche?

Als Faustregel kannst du dir Folgendes merken:

- Nutze zunächst immer `const`.
- Willst du den Wert später im Programm verändern, wähle `let`.
- Nutze nicht `var`, denn du wirst es nicht benötigen.
-->

## Die wichtigsten Basistypen

Die starke Typisierung ermöglicht es, die Schnittstellen der Software genau zu beschreiben.
So können schon während der Entwicklung hilfreiche Informationen und Warnungen bereitgestellt werden, wenn die API nicht korrekt verwendet wird.

### Primitive Typen: Zahlen, Zeichenketten und boolesche Werte

Die wichtigsten primitiven Typen in TypeScript sind `number`, `string` und `boolean`.
Der Typ `number` legt den Wert einer Variable auf eine Ganz- oder Kommazahl fest.
Zeichenketten werden mithilfe des Datentyps `string` definiert.
Wenn eine Variable logische Wahrheitswerte (`true` oder `false`) annehmen soll, verwenden wir den Typ `boolean`.

Ein Typ wird immer mit einem Doppelpunkt hinter dem Variablennamen deklariert.
Wenn der Typ bereits aus dem Wert eindeutig bestimmbar ist, müssen wir diese Information nicht zwingend notieren.
TypeScript ermittelt den passenden Typ automatisch – man spricht von *Typinferenz*.

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
`any` wird übrigens auch immer als Standardtyp verwendet, wenn wir eine Variable nicht explizit typisieren und der Typ von TypeScript nicht automatisch ermittelt werden kann.

Der Typ `unknown` schafft Abhilfe.
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
Willst du die konkrete Belegung einer Variable absichtlich im Unklaren lassen, ist `unknown` die bessere Wahl.

## Klassen

Um eine Klasse zu beschreiben, verwenden wir in JavaScript und TypeScript das Schlüsselwort `class`.
Mit Klassen können einfache Datenobjekte oder auch komplexe objektorientierte Logik abgebildet werden.

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

Klassen besitzen drei wesentliche Bestandteile: Eigenschaften, Methoden und eine besondere Methode – den Konstruktor.

### Eigenschaften/Propertys

Eigenschaften (engl. *properties*) erweitern eine Klasseninstanz mit zusätzlichen Informationen.
Propertys können mit den Zugriffsmodifizierern `public`, `private`, `static`, `protected` oder `readonly` versehen werden.
Lässt man die Angabe eines Zugriffsmodifizierers weg, so ist die Eigenschaft immer `public`.

Ein Property kann als optional deklariert werden, indem wir ein Fragezeichen setzen.
Jedes Property einer Klasse muss immer entweder sofort einen Wert besitzen oder als optional markiert werden.

### Methoden

Methoden sind die Funktionen einer Klasse und erweitern die Klasse mit Logik.
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

Mit den Schlüsselwörtern `get` und `set` können wir Methoden verstecken, indem eine Eigenschaft an diese gebunden wird.

```typescript
class Person {
  #birthYear: number;

  constructor(birthYear: number) {
    this.#birthYear = birthYear;
  }

  get age(): number {
    return new Date().getFullYear() - this.#birthYear;
  }
}

const person = new Person(1990);
console.log(person.age); // Berechnet das Alter
```

### Konstruktor

Der Konstruktor ist eine besondere Methode, die bei der Instanziierung einer Klasse aufgerufen wird.
Er muss immer den Namen `constructor()` tragen.

TypeScript bietet für die Initialisierung von Propertys eine Kurzschreibweise:
Wenn wir in der Methodensignatur des Konstruktors für das Argument einen Zugriffsmodifizierer wie `public` oder `private` verwenden, so wird das zugehörige Property automatisch deklariert und initialisiert.

```typescript
class User {
  constructor(
    public firstname: string,
    public lastname: string
  ) {}
}

// Entspricht:
class UserLong {
  public firstname: string;
  public lastname: string;

  constructor(firstname: string, lastname: string) {
    this.firstname = firstname;
    this.lastname = lastname;
  }
}
```

### Vererbung

Die Funktionalität einer Klasse kann auf andere Klassen übertragen werden.
Mit dem Schlüsselwort `extends` kann eine Klasse von einer anderen erben.

```typescript
class User {
  constructor(public name: string) {}
}

class PowerUser extends User {
  constructor(name: string, public permissions: string[]) {
    super(name);
  }
}
```

Mit `super()` kann der Konstruktor der Basisklasse ausgeführt werden.

## Interfaces

Um die Typisierung in unserem Programmcode konsequent umzusetzen, stellt TypeScript sogenannte *Interfaces* bereit.
Interfaces dienen dazu, die typisierte Struktur eines Objekts zu definieren, nicht jedoch die Werte.
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
    console.log('Printing...');
  }
}
```

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: sollte mittlerweile Standard sein und kann raus -->
<!--
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
-->

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: sollte mittlerweile Standard sein und kann raus -->
<!--
## Arrow Functions

Eine *Arrow-Funktion* ist eine Kurzschreibweise für eine normale `function()` in JavaScript.
Auch die Bezeichnung *Lambda-Ausdruck* ist verbreitet.

Die Definition einer anonymen Funktion verkürzt sich damit elegant zu einem Pfeil `=>`.
Besitzt die Funktion genau einen Parameter ohne Typ, können die runden Klammern auf der linken Seite weggelassen werden.
Auch die geschweiften Klammern auf der rechten Seite können eingespart werden:
Lässt man die Klammern weg, ist das Ergebnis des rechtsseitigen Ausdrucks der Rückgabewert für die Funktion.

```typescript
// Diese vier Definitionen sind gleichwertig:
const fn1 = function(x: number) { return x * 2; };
const fn2 = (x: number) => { return x * 2; };
const fn3 = (x: number) => x * 2;
const fn4 = x => x * 2; // Nur ohne Typangabe
```

Das folgende Beispiel zeigt, wie wir alle geraden Zahlen aus einer Liste ermitteln können:

```typescript
const numbers = [1, 2, 3, 4, 5, 6];

// Herkömmliche Funktion
const even1 = numbers.filter(function(n) {
  return n % 2 === 0;
});

// Arrow-Funktion – wesentlich kompakter
const even2 = numbers.filter(n => n % 2 === 0);
```

Ein weiterer Vorteil der Arrow-Funktion ist, dass sie keinen eigenen `this`-Kontext besitzt.
Das ist besonders dann interessant, wenn wir die Funktion innerhalb einer Klasse verwenden und mit `this` auf die Instanz der Klasse zugreifen möchten.
Mit Arrow-Funktionen wird die Variable `this` aus dem übergeordneten Kontext verwendet.

```typescript
class Counter {
  count = 0;

  increment() {
    // Arrow-Funktion: this zeigt auf die Klasseninstanz
    setTimeout(() => {
      this.count++;
      console.log(this.count);
    }, 1000);
  }
}
```
-->

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: haben wir im Buch und ist auch nicht spezifisch für TS, kann als raus -->
<!--
## Immutability

In JavaScript werden Objekte und Arrays stets nur als Referenzen auf eine zugehörige Speicherstelle gespeichert.
Ändern wir also die Inhalte direkt im Objekt, so ändert sich die Referenz nicht!
Das bedeutet auch, dass bei Zuweisung eines Objekts zu einer Variable lediglich ein Verweis auf das ursprüngliche Objekt erzeugt wird.

```typescript
const book = { title: 'Angular', year: 2023 };
const copy = book;
copy.year = 2024;

console.log(book.year); // 2024 – auch das Original wurde geändert!
```

Um gut wartbaren Code zu erhalten, dürfen wir niemals die Werte eines Objekts oder Arrays direkt verändern.
Wir behandeln ein Objekt oder Array als *unveränderlich* (engl. *immutable*) und erzeugen bei einer Änderung immer eine Kopie.
Hierfür nutzen wir in der Regel die Spread-Syntax.

> **Merke:** Objekte und Arrays sollten nie direkt verändert werden. Stattdessen sollte immer eine Kopie mit neuer Referenz erzeugt werden, die die gewünschten Änderungen enthält.
-->

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: haben wir im Buch und brauchen wir hier nicht. Auch nicht TS spezifisch -->
<!--
## Spread-Syntax und Rest-Parameter

In JavaScript können wir eine Syntax mit drei Punkten verwenden (`...`).
Diese Schreibweise hat zwei Bedeutungen, je nachdem, wo sie eingesetzt wird:
Die *Spread-Syntax* breitet Elemente aus, während *Rest-Parameter* übrige Argumente einsammeln.

### Objekteigenschaften kopieren

Mit der Spread-Syntax können wir Objekte klonen und dabei Eigenschaften überschreiben:

```typescript
const book = { title: 'Angular', year: 2023 };
const copy = { ...book, year: 2026 };

console.log(book.year); // 2023 – Original unverändert
console.log(copy.year); // 2026 – Kopie mit neuem Wert
```

Bitte beachte, dass diese Idee nur für *Plain Objects* funktioniert und nur eine flache Kopie (*Shallow Copy*) erzeugt.
Tiefere Zweige eines Objekts müssen einzeln geklont werden.
Wird diese Aufgabe zu kompliziert, können wir die native Funktion `structuredClone()` verwenden, die eine *Deep Copy* erzeugt.

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
-->

## Private Eigenschaften von Klassen

Mit *Private Class Fields* in JavaScript können wir Datenkapselung in Klassen realisieren.
Ein privates Feld wird durch ein vorangestelltes `#`-Symbol definiert und ist nur innerhalb der Klasse zugänglich.

```typescript
class User {
  #password: string;

  constructor(password: string) {
    this.#password = password;
  }

  checkPassword(input: string): boolean {
    return this.#password === input;
  }
}

const user = new User('secret');
// user.#password; // Fehler: Zugriff nicht möglich
```

In TypeScript existiert außerdem der Access Modifier `private`, der die Sichtbarkeit einschränkt.
Der Schutz ist allerdings zur Laufzeit nicht garantiert, da TypeScript zu JavaScript umgewandelt wird.
Wir empfehlen die moderne JavaScript-Variante mit `#`.

## Property Modifiers: `readonly` und `protected`

TypeScript stellt uns eine Reihe von *Property Modifiers* zur Verfügung:

Der Modifier `protected` sorgt für eine eingeschränkte Sichtbarkeit.
Ein Protected Property ist nicht von außen sichtbar, sondern kann nur innerhalb derselben Klasse und in vererbten Kindklassen verwendet werden.
Dazu gehört auch das Template einer Angular-Komponente.

Mit `readonly` können wir sicherstellen, dass eine Eigenschaft nach der Initialisierung nicht mehr verändert werden kann.

```typescript
class Config {
  readonly apiUrl = 'https://api.example.com';
  protected secret = '12345';
}
```

Für Angular-Projekte empfehlen wir folgende Konventionen:

- Propertys und Methoden, die nur innerhalb der Klasse verwendet werden, werden als privat markiert.
- Propertys, die im Template einer Komponente genutzt werden, werden mit `protected` gekennzeichnet.
- Propertys, die von Angular verwaltet werden, werden auf `readonly` gesetzt (z. B. `input()`, `output()`, `model()`).

## Decorators

Mit Decorators können wir Klassen, Methoden und Eigenschaften dekorieren und damit Metadaten hinzufügen.
Man erkennt einen Decorator am `@`-Zeichen zu Beginn des Namens.

```typescript
@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>'
})
class AppComponent {}
```

Angular nutzt dieses Sprachkonzept, um Klassen eine Semantik zu geben:
Durch den Decorator `@Component()` wird diese Klasse als Komponente behandelt.
Alle Decorators von Angular sind Funktionen, daher darf man die Funktionsklammern bei der Verwendung nicht vergessen.

## Generic Types

Mit *Generics* können wir Typparameter für Klassen und Funktionen definieren.
Sie sind ein wichtiges Konzept in TypeScript, um wiederverwendbare und flexible Funktionen zu erstellen.

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

<!-- TODO: klären, ob wir das drin haben wollen -->
<!-- Danny: haben wir schon im Buch und ist kein TS -->
<!--
## Promises und `async`/`await`

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
-->

## Weitere Features

### Union Types

Mit Union Types können wir zusammengesetzte Typen beschreiben:

```typescript
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

### Optional Chaining

Optional Chaining ermöglicht einen sicheren Zugriff auf verschachtelte Objekte:

```typescript
const user = { address: { city: 'Berlin' } };
const city = user?.address?.city; // 'Berlin'
const zip = user?.address?.zip; // undefined (kein Fehler)
```

### Nullish Coalescing

Nullish Coalescing erlaubt die einfache Zuweisung von Rückfallwerten:

```typescript
const value = null;
const result = value ?? 'default'; // 'default'

// Unterschied zu ||
const zero = 0;
console.log(zero || 'fallback'); // 'fallback'
console.log(zero ?? 'fallback'); // 0
```

## Konfiguration

Um TypeScript-Code in Node.js oder im Browser ausführen zu können, muss dieser zunächst in JavaScript umgewandelt werden.
Diese Aufgabe übernimmt der *Transpiler*.

Die Konfiguration wird in der Datei `tsconfig.json` hinterlegt.
Die wohl wichtigste Einstellung ist das `target`: Diese Option gibt an, in welche Version von JavaScript das Programm transpiliert werden soll.

In einem Angular-Projekt müssen wir uns über die Konfiguration von TypeScript nur wenige Gedanken machen, denn die Einstellungen sind bereits mit sinnvollen Werten vordefiniert.

## Zusammenfassung

TypeScript erweitert den JavaScript-Sprachstandard um viele Features, die wir bereits aus etablierten Sprachen wie C# oder Java kennen.
Dadurch fällt auch der Umstieg von einer anderen objektorientierten Sprache nicht schwer.
Auch wenn du bisher mit reinem JavaScript entwickelt hast, ist der Umstieg auf TypeScript keine große Hürde, weil alle bekannten Features aus JavaScript weiterhin verwendet werden können.

Mit der Typisierung und Objektorientierung können wir die Schnittstellen unserer Software klar definieren.
Der Editor kann uns bei der Arbeit mit TypeScript effizient unterstützen und schon zur Entwicklungszeit auf Fehler hinweisen.

Damit unsere Anwendung später auch in jedem Browser lauffähig ist, wird TypeScript vor der Auslieferung immer in reines JavaScript umgewandelt.
