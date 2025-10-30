---
title: 'Angular 20 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2025-11-30
lastModified: 2025-11-30
keywords:
  - Angular
  - Angular 21
language: de
header: angular21.jpg
sticky: false
---

Bevor wir uns in den Trubel zum Jahresende stürzen, gibt es Neuigkeiten aus der Angular-Welt:
Am **19. November 2025** wurde **Angular 21** veröffentlicht! Die offiziellen Release-Informationen finden Sie wie immer im [Angular-Blog](TODO).

Die Migration eines bestehenden Projekts auf Angular 21 kann mit dem Befehl `ng update` durchgeführt werden.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).


## Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 21 *mindestens* notwendig:

- TypeScript: TODO
- Node.js: TODO

Der Support für Node.js Version TODO wurde entfernt. Ausführliche Infos zu den unterstützten Versionen finden Sie der [Angular-Dokumentation](https://angular.dev/reference/versions) finden Sie .


## Signal-based Forms

Die aktuellen Ansätze für Formularverarbeitung in Angular sind nicht für das Zusammenspiel mit Signals ausgelegt.
Nun wurde ein neuer experimenteller Ansatz vorgestellt: *Signal Forms*.
Diese Variante integriert nicht nur breitflächig Signals, sondern soll die Erstellung und Verwaltung von Formularen grundlegend vereinfachen.

Die Grundidee: Die Daten liegen in einem einfachen Signal vor, das von uns verwaltet wird.
Angular leitet aus den Daten die Struktur des Formulars ab.
Die Regeln zur Validierung werden in Form eines Schemas definiert, das als Code notiert wird.

```ts
import { schema, form, Field } from '@angular/forms/signals';

export const bookSchema = schema<Book>(fieldPath => {
  required(fieldPath.isbn);
  minLength(fieldPath.isbn, 10);
  maxLength(fieldPath.isbn, 13);
  
  required(fieldPath.title);
});

@Component({
  // ...
  imports: [Field]
})
export class MyForm {
  bookData = signal<Book>({
    isbn: '',
    title: ''
  });

  bookForm = form(this.bookData, bookFormSchema);
}
```

Im Template erstellen wir die Datenbindungen mithilfe einer einzigen Direktive:

```html
<form>
  <input [field]="bookForm.isbn" />
  <input [field]="bookForm.title" />
</form>
```

Wir haben ausführliche Blogposts in englischer Sprache zu Signal Forms veröffentlicht:

- **Part 1: Getting Started with the Basics:** https://angular-buch.com/blog/2025-10-signal-forms-part1
- **Part 2: Advanced Validation and Schema Patterns:** https://angular-buch.com/blog/2025-10-signal-forms-part2
- **Part 3: Child Forms and Custom UI Controls:** https://angular-buch.com/blog/2025-10-signal-forms-part3

Perspektivisch könnten mit dem neuen Ansatz die älteren Varianten *Reactive Forms* und *Template-Driven Forms* verdrängt werden.
Das Angular-Team legt außerdem großen Wert auf Abwärtskompatibilität, sodass die Migration auf ein Signal-basiertes Formular kein großes Problem sein sollte.
Noch ist der neue Ansatz aber experimentell, sodass sich die Schnittstellen und Konzepte noch ändern können.


## TODO: vitest

## TODO: Property Binding für ARIA-Attribute



## Sonstiges

Alle Details zu den Neuerungen finden Sie immer im Changelog von [Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md).
Einige interessante Aspekte haben wir hier zusammengetragen:

- **TITLE:** (siehe [Commit]())


<hr>


Wir wünschen Ihnen viel Spaß beim Entwickeln mit Angular 21!
Haben Sie Fragen zur neuen Version zu Angular oder zu unserem Buch? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** Drei Zinnen, Dolomiten, Italien. Foto von Ferdinand Malcher</small>
