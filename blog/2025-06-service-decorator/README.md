---
title: 'Mein @Service()-Decorator für Angular'
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
published: 2025-06-24
lastModified: 2025-06-24
keywords:
  - Angular
  - Angular 20
  - Component Suffix
  - Decorator
language: de
header: angular20.jpg
---

Mit Angular 20 entfällt der Service-Suffix im neuen Style Guide.
Das bringt kürzere Dateinamen, macht aber die Rolle von Klassen weniger offensichtlich.
Dieser Artikel zeigt, wie ein eigener `@Service`-Decorator dieses Problem elegant lösen kann.


## Angular 20: Der Service Suffix ist weg

Die neue Major-Version von Angular bringt frischen Wind!
So wurde der neue [Angular coding style guide](https://angular.dev/style-guide) für v20 stark überarbeitet und verschlankt.
Es wird *nicht* mehr empfohlen, Komponenten, Services und Direktiven mit einem Suffix zu versehen.

Der Befehl `ng generate service book-store` generiert demnach nicht mehr eine Klasse mit dem Namen `BookStoreService`, sondern vergibt nur noch den Namen `BookStore`.
Folgerichtig wird aus `book-store.service.ts` nun einfach nur `book-store.ts`.

Das ist prinzipiell eine tolle Sache.
Wir erhalten Dateinamen und mehr Fokus auf bewusste Benennung.
Aber einen kleinen Nachteil hat das Ganze:
Wir erkennen nicht mehr auf den ersten Blick, dass eine Klasse als Service genutzt werden soll.

**bis Angular 19:**

```ts
// book-store.service.ts

@Injectable({
  providedIn: 'root'
})
export class BookStoreService { }
```

**ab Angular 20:**

```ts
// book-store.ts

@Injectable({
  providedIn: 'root'
})
export class BookStore { }
```

Wer Angular länger kennt, der weiß, dass der `Injectable` Decorator eigentlich in fast allen Fällen einen Service markiert.
Aber ehrlich gesagt könnte der Zweck des Decorators deutlicher erkennbar sein.

In Spring beispielsweise ist `@Service` eine gängige Annotation, welche verdeutlicht, dass eine Klasse Service-Logik enthält.

```java
import org.springframework.stereotype.Service;

@Service
public class BookStoreService {
    // ...
}
```

Zusätzlich gibt es noch weitere Annotationen wie `@Repository`, `@Controller` oder `@Component`.
Ich finde es weiterhin sehr charmant, das der Einsatzweck schon am Anfang der Klasse klar und deutlich ausgedrückt wird.


## Die Motivation – Mein `@Service()`-Decorator für Angular

Was tun wir also, wenn wir auf das altbekannte `Service`-Suffix verzichten wollen
und trotzdem noch deutlich machen möchten, dass eine Klasse ein Service ist?

Meine Idee: Warum nicht einfach einen eigenen Decorator namens `@Service()` einführen?
So ist schon direkt am Decorator klar, womit wir es zu tun haben.
Und weil wir schon mal dabei sind, sparen wir uns auch gleich noch das immer gleiche `providedIn: 'root'`.

Wenn ich mir also eine Änderung am Angular-Framework wünschen könnte,
dann wäre es vielleicht folgende neue Syntax:

```ts
// book-store.ts

@Service()
export class BookStore { }
```

So stelle ich mir das vor:

1. Wir verzichten weiterhin auf das Suffix `Service`.
2. Wir müssen nicht mehr bei jedem Service erneut `providedIn: 'root'` schreiben. Das hat mich schon immer gestört.


## Das Ziel: Kompakter, klarer und weniger Boilerplate-Code

Mein Ziel ist demnach ein eleganterer Decorator, der:

* auf einen Blick klarstellt, dass es sich bei der Klasse um einen Service handelt,
* automatisch die Bereitstellung im Root-Injector übernimmt (`providedIn: 'root'`),
* vollständig kompatibel mit dem AOT-Compiler und Ivy ist.

Um es kurz zu sagen: Ein Decorator, der einfach Spaß macht. 😇


## Welche Ansätze gibt es überhaupt?

Die Entwicklung eines solchen eigenen Decorators ist leider nicht komplett trivial, vor allem, da Angular intern sehr genau festlegt, wie DI funktioniert.
Schauen wir uns ein paar mögliche Ansätze gemeinsam an:


### Idee 1: Vererbung von `@Injectable`

Ein logischer Gedanke wäre, eine Basisklasse mit `@Injectable()` zu annotieren und Services daraus abzuleiten:

```ts
@Injectable({ 
  providedIn: 'root' 
})
export class BaseService {}

export class BookStore extends BaseService {}
```

Das funktioniert allerdings nicht, da Angular die Metadaten zur Compile-Zeit direkt an der Zielklasse speichert.
Diese Metadaten werden leider nicht vererbt.
Das Framework findet den Service einfach nicht, und wir erhalten die folgende Fehlermeldung:

> **❌ Fehlermeldung:** NullInjectorError: No provider for BookStore!

Außerdem ist der Ansatz auch optisch wenig überzeugend... und es handelt sich dabei auch nicht um einen Decorator.


## Idee 2: Eigener Decorator, der `@Injectable` wrappt

Eine zweite Idee wäre es, einen einfachen Wrapper zu erstellen:

```ts
export function Service(): ClassDecorator {
  return Injectable({ providedIn: 'root' });
}
```

Das würde funktionieren, aber nur im JIT (Just-in-Time)-Modus, da Angulars AOT-Compiler diese dynamische Erzeugung nicht zulässt.

> **❌ Fehlermeldung:** The injectable 'BookStore2' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.
> JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.
> Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
  or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.



## Idee 3: Nutzung interner Angular-Ivy-APIs

Jetzt wird es spannend: Nachdem wir zuvor ein paar Lösungen ausprobiert haben, die nicht funktionieren, schauen wir uns nun interne Angular-Ivy-APIs an.
Damit sind APIs gemeint, die Angular selbst verwendet, um Services zur Verfügung zu stellen.
Wir verlassen nun also offiziell unterstützte Pfade und begeben uns auf "internes" Terrain.

Die zentrale interne API, die für uns interessant ist, heißt [`ɵɵdefineInjectable`](https://github.com/angular/angular/blob/a40abf09f1abcabda3752ed915bb90e4eafe078d/packages/core/src/di/interface/defs.ts#L167).
Diese Funktion erstellt für eine Klasse die benötigten Metadaten, sodass Angular sie automatisch injizieren kann.
Der Code ist gut dokumentiert, und so stehen im verlinkten Code auch gleich Hinweise zur Verwendung. (**This should be assigned to a static `ɵprov` field on a type, which will then be an `InjectableType`.**)

### Minimalversion ohne Konstruktor-Injection

Beginnen wir mit einem minimalistischen Ansatz, der sehr einfach ist, aber auch eine klare Einschränkung mit sich bringt:

```ts
import { ɵɵdefineInjectable } from '@angular/core';

export function Service(): ClassDecorator {
  return (target: any) => {
    Object.defineProperty(target, 'ɵprov', {
      value: ɵɵdefineInjectable({
        token: target,
        providedIn: 'root',
        factory: () => new target()
      })
    });
  };
}
```

Was macht dieser Code?

* Wir erzeugen mit `ɵɵdefineInjectable` eine "injectable definition" und setzen diese direkt als neues Property an das `target`.
* Die Einstellung `providedIn: 'root'` sorgt dafür, dass der Service global verfügbar ist, ohne dass wir das immer wiederholen müssen.
* Die Factory-Funktion erzeugt einfach eine neue Instanz der Klasse – **aber ohne Konstruktor-Abhängigkeiten**.

Der große Vorteil dieses Ansatzes ist seine Einfachheit. 
Der große Nachteil liegt auf der Hand: Konstruktor-Injection ist nicht möglich, da wir nicht wissen, welche Abhängigkeiten der Konstruktor erwartet.
Das folgende Beispiel macht dies deutlich.
Wir erwarten, das der Service `BookRating` per Konstruktor-Injection verfügbar gemacht wird.
Statt dessen ist der Wert aber einfach nur `undefined`.

```ts
@Service()
export class BookStore {

  constructor(br: BookRating) {
    console.log(br) // undefined
  }
}
```

### Gregors Variante: Konstruktor-Injection mit expliziten Abhängigkeiten

An dieser Stelle habe ich bei meinen Recherchen festgestellt, das mein geschätzter GDE-Kollege Gregor Woiwode sich bereits vor 5 Jahren mit dem Thema beschäftigt hat.
[Seine Lösung](https://stackoverflow.com/a/59759381) hat er auf StackOverflow vorgestellt.
Der Decorator heißt hier `@InjectableEnhanced`, aber prinzipiell ist der Code derselbe.

Der folgende Code demonstriert, wie man die fehlende Konstruktor-Injection nachbilden kann. 
Dabei nutzt er ebenfalls die selbe Ivy-internen APIs, definiert aber explizit alle Abhängigkeiten innerhalb der Factory-Funktion:

```ts
// Gregor's Code, minimal abgewandelt:

export function InjectableEnhanced() {
  return <T extends new (...args: any[]) => InstanceType<T>>(target: T) => {
    (target as any).ɵfac = function() {
      throw new Error("cannot create directly");
    };

    (target as any).ɵprov = ɵɵdefineInjectable({
      token: target,
      providedIn: "root",
      factory() {
        // ɵɵinject can be used to get dependency being already registered
        const dependency = ɵɵinject(BookRating);
        return new target(dependency);
      }
    });
    return target;
  };
}

@InjectableEnhanced()
export class BookStore {

  constructor(br: BookRating) {
    console.log(br) // works!
  }
}
```

Was passiert hier genau?

* Gregor definiert nicht nur `ɵprov`, sondern explizit auch `ɵfac` (die Factory), die normalerweise automatisch vom Angular-Compiler erzeugt wird. 
  Er verhindert zudem, dass jemand die Klasse direkt instanziieren kann (mit einem Fehler).
  Das ist meiner Meinung nach nicht zwingend notwendig.
* Innerhalb der Factory-Funktion injiziert er explizit jede Abhängigkeit einzeln mittels `ɵɵinject`. 
  In diesem Fall handelt es sich um unseren Service `BookRating`.
  Dadurch unterstützt er direkte Konstruktor-Injection.
* Aber Achtung: Wir müssen jede Abhängigkeit einzeln und explizit in der Factory-Funktion angeben!
  Das ist aufwändig und anfällig für Fehler, falls sich die Konstruktorparameter ändern.

Der Code lässt sich auch so umschreiben, sodass er dem vorherigen Beispiel entspricht.
Statt der direkten Zuweisung `((target as any).ɵprov)`, würde ich eher `Object.defineProperty() ` verwenden.
Bei diesem Stil muss man zwar etwas mehr Code schreiben, aber dafür umgehen wir nicht mehr per Cast das Typsystem.
Die Fehlermeldung habe ich dabei auch weggelassen:

```ts
// Gregors Code, gekürtzt und angepasst:

export function Service(): ClassDecorator {
  return (target: any) => {
    Object.defineProperty(target, 'ɵprov', {
      value: ɵɵdefineInjectable({
        token: target,
        providedIn: 'root',
        factory: () => {
          // ɵɵinject can be used to get dependency being already registered
          const dependency = ɵɵinject(BookRating);
          return new target(dependency);
        }
      })
    });
  };
}

@Service()
export class BookStore {

  constructor(br: BookRating) {
    console.log(br) // works
  }
}
```

Dieser Ansatz ist technisch geschickt gelöst, hat aber eine klare Einschränkung: Er ist nicht generisch genug für alle Fälle.
Für jeden einzelnen Service müssen wir manuell die Abhängigkeiten auflisten.
Gregors Lösung funktioniert somit perfekt für spezielle Fälle mit wenigen oder immer denselben Abhängigkeit.


## Idee 4: Automatische Dependency-Auflösung mit reflect-metadata

Um Konstruktor-Injectionen ohne manuelle Angabe von Abhängigkeiten zu ermöglichen, 
könnten wir die Bibliothek [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) nutzen. 
Dies erfordert die Aktivierung von `emitDecoratorMetadata: true` in der `tsconfig.json` und die Einbindung von `reflect-metadata` als zusätzliche Abhängigkeit.

In früheren Angular-Versionen war `reflect-metadata` oft notwendig, da der JIT-Compiler Metadaten zur Laufzeit auswertete. 
Mit Ivy (ab Angular 9) und AOT-Compilation generiert Angular statische Metadaten während der Build-Zeit, 
wodurch `reflect-metadata` in Produktionsumgebungen meist überflüssig ist. 

Die Verwendung dieser Bibliothek würde daher die Bundle-Größe erhöhen, was in modernen Projekten vermieden werden sollte. 


### Idee 5: Die finale Idee – Elegante Dependency Injection mit `inject()`

Können wir es nicht einfacher haben, und zwar ohne jegliche manuelle Angabe der Konstruktor-Abhängigkeiten?
Genau an dieser Stelle kommt die neue Angular-Funktion `inject()` ins Spiel (die es 2020 noch nicht gab).

Mit `inject()` lassen sich Abhängigkeiten direkt innerhalb der Klassendefinition beziehen, ohne sie über den Konstruktor zu injizieren. 
Dadurch entfallen all unsere bisherigen Probleme:

```ts
// derselbe Code erneut, aus dem initialen Beispiel von Idee 3
import { ɵɵdefineInjectable } from '@angular/core';

export function Service(): ClassDecorator {
  return (target: any) => {
    Object.defineProperty(target, 'ɵprov', {
      value: ɵɵdefineInjectable({
        token: target,
        providedIn: 'root',
        factory: () => new target(), // keine Parameter nötig!
      }),
    });
  };
}
```

So sieht die Verwendung dann aus:

```ts

@Service()
export class BookStore {

  #service = inject(BookRating); // Abhängigkeit direkt injiziert
}
```

Warum ist dieser Ansatz besonders elegant und modern?

* Der Decorator ist bewusst kompakt gehalten.
* Keine explizite Deklaration von Konstruktor-Abhängigkeiten nötig.
* Der Einsatz von `inject()` wird ohnehin für modernen Code empfohlen
* Vollständig kompatibel mit Ivy und dem Angular AOT-Compiler.
* Zukunftsicher: Wenn die Lösung in Zukunft brechen sollte, können wir per Search&Replace von `@Service` wieder nach `@Injectable` zurück wechseln.


Hier ein weiteres Beispiel:

```ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Service } from './service';

@Service()
export class BookStore {
  #http = inject(HttpClient);

  getAll() {
    return this.#http.get('/api/books');
  }
}
```

Eine elegante Lösung, oder?


### Fazit zu Idee 3

Wir haben jetzt drei Varianten gesehen:

1. Minimalversion ohne Konstruktor-Injection (einfach, aber zu eingeschränkt).
2. Gregors Variante mit expliziter Angabe der Konstruktor-Abhängigkeiten (technisch interessant, aber nicht generisch genug).
3. Unsere finale Variante, die voll auf die `inject()`-Funktion setzt und auf Konstruktor-Injection verzichtet.

Die dritte Variante erweist sich als die eleganteste Lösung.
Wir kombinieren moderne Angular-Techniken (`inject()`) mit Ivy-internen APIs (`ɵɵdefineInjectable`) und schaffen so eine saubere, wartbare und angenehme Lösung.

Was meinst du?

> **Würdest du diesen @Service-Decorator ausprobieren?** Oder bleibst du lieber beim bewährten `@Injectable()`? Ich freue mich auf dein Feedback auf Twitter oder BlueSky! 😊

<hr>

<small>**Titelbild:** Morgenstimmung im Anklamer Stadtbruch. Foto von Ferdinand Malcher</small>
