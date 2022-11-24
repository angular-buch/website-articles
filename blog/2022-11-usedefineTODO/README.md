---
title: 'TODO'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-11-25
lastModified: 2022-11-25
keywords:
  - Angular
language: de
thumbnail: usedefine.jpg
sticky: false
---


In neuen Projekten wird in der TypeScript-Konfiguration automatisch die Compiler-Option `useDefineForClassFields` auf den Wert `false` gesetzt.
Neue Projekte erhalten die gleiche Einstellung.
Damit wird der TypeScript Compiler angewiesen, die properitäre Implementierung von TypeScript zur Verarbeitung von Klassen-Propertys zu nutzen und nicht das native Verhalten von JavaScript.
Dazu möchten wir kurz die Hintergründe erläutern.

In TypeScript können wir ein Klassen-Property direkt bei der Deklaration mit einem Wert initialisieren.
Beim Design der Propertys von TypeScript ging man nach bestem Wissen und Gewissen davon aus, dass die gewählte Implementierung exakt das Verhalten einer zukünftigen Version von JavaScript nachahmen würde.
Das hat leider nicht ganz funktioniert – die Standardisierung in ECMAScript ist über die Jahre einen anderen Weg gegangen.

Klassen-Propertys sind in TypeScript so implementiert, dass die Initialisierung mit Werten immer als erste Anweisung im Konstruktor durchgeführt wird.
Die beiden folgenden Schreibweisen waren bislang im Ergebnis absolut identisch:

```ts
class User {
  age = 25;
}

// ist in TypeScript exakt das gleiche wie:
class User {
  age: number;

  constructor() {
    this.age = 25;
  }
}
```

In JavaScript verhalten sich die nativen Klassen-Propertys leider etwas anders:
Es ist möglich, zunächst die Propertys zu initialisieren und erst *danach* den Konstruktor auszuführen.
Es handelt sich in JavaScript also um zwei voneinander unabhängige Schritte – bei der proprietären Implementierung von TypeScript geschieht die Initialisierung der Propertys hingegen immer zusammen mit dem Aufruf des Konstruktors.

Die Diskrepanz zwischen den beiden Welten ist besonders interessant, wenn wir Argumente über den Konstruktor empfangen, z. B. wenn wir eine Abhängigkeit mittels Dependency Injection anfordern.
Wollen wir einen injizierten Service für die direkte Initialisierung eines Propertys nutzen, funktioniert der Code in nativem JavaScript nicht.
In TypeScript ist der folgende Code hingegen gültig.


```ts
export class MyComponent {
  data$ = this.service.getData();

  constructor(private service: MyDataService) {}
}
```

Für dieses Dilemma gibt es zwei Lösungswege:

1. Setzen wir `useDefineForClassFields` auf `false`, wird das gewohnte proprietäre Verhalten von TypeScript aktiv. Diesen Weg hat Angular gewählt, um bestehenden Code nicht zu brechen.
2. Wir verwenden injizierte Services nicht bei der direkten Initialisierung eines Propertys. Dafür funktionieren zwei Ansätze: a) wir nutzen den Konstruktor oder b) wir setzen die Funktion `inject()` ein.

Verschieben wir die Initialisierung vollständig in den Konstruktor, sind die Argumente bereits vorhanden, bevor wir das Property initialisieren.

```ts
export class MyComponent {
  data$: Observable<MyData>;

  constructor(private service: MyDataService) {
    this.data$ = this.service.getData();
  }
}
```

Mit der Funktion `inject()` können wir eine Abhängigkeit direkt anfordern. Verwenden wir die Funktion bei der Initialisierung eines Propertys, steht die Serviceinstanz sofort zur Verfügung:

```ts
import { inject } from '@angular/core';

export class MyComponent {
  data$ = inject(MyDataService).getData();
}
```

Mit beiden Varianten ist der Code zukunftssicher und funktioniert sowohl in TypeScript als auch ES2022.
Es ist davon auszugehen, dass in Angular irgendwann die Einstellung `useDefineForClassFields` auf den Standardwert `true` gesetzt wird.
Wir empfehlen Ihnen also, Ihren Code jetzt schon möglichst robust zu entwickeln.


<hr>

<small>**Titelbild:** TODO, 2022. Foto von Ferdinand Malcher</small>
