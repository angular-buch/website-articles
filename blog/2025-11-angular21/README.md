---
title: 'Angular 20 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2025-11-30
lastModified: 2025-11-30
keywords:
  - Angular
  - Angular 21
  - ARIA
  - Zoneless
  - Signal Forms
language: de
header: angular21.jpg
sticky: false
---

Bevor wir uns in den Trubel zum Jahresende stürzen, gibt es Neuigkeiten aus der Angular-Welt:
Am **19. November 2025** wurde **Angular 21** veröffentlicht! Die offiziellen Release-Informationen finden Sie wie immer im [Angular-Blog](TODO).

Die Migration eines bestehenden Projekts auf Angular 21 kann mit dem Befehl `ng update` durchgeführt werden.
Detaillierte Infos zu den Schritten liefert der [Angular Update Guide](https://angular.dev/update-guide).


## Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 21 notwendig:

- TypeScript: >=5.9.0 <6.0.0
- Node.js: ^20.19.0 || ^22.12.0 || ^24.0.0

Ausführliche Infos zu den unterstützten Versionen finden Sie der [Angular-Dokumentation](https://angular.dev/reference/versions).

## Zoneless Change Detection: der neue Standard

Schon seit einiger Zeit unterstützt Angular die zonenlose Change Detection.
Früher wurde die Bibiothek Zone.js verwendet, um Änderungen an Daten zu ermitteln.
Mit Signals als neuem Grundbaustein hat sich das Vorgehen deutlich geändert: Signals teilen explizit mit, dass sich ein Wert geändert hat.
Wir haben darüber ausführlich im [Blogpost zu Angular 18](/blog/2024-05-angular18) berichtet.

Nun gibt es zu dem Thema großartige Neuigkeiten: Zoneless Change Detection ist der neue Standard!
Neue Anwendungen mit Angular 21 setzen also per Default auf den neuen Mechanismus.
Beim Anlegen einer Anwendung mit `ng new` müssen wir nicht mehr die Option `--zoneless` verwenden.
Es ist auch nicht mehr notwendig, die Funktion `provideZonelessChangeDetection()` in der `app.config.ts` aufzurufen.

Möchte man aus Kompatibilitätsgründen doch noch die alte Umsetzung der mit Zone.js verwenden, lässt sich die Change Detection in der `app.config.ts` konfigurieren.
Zusätzlich muss Zone.js installiert sein und unter `polyfills` in der `angular.json` eingetragen werden – so wie es früher in allen Anwendungen der Fall war.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideZoneChangeDetection({ eventCoalescing: true }),
};
```



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


## @angular/aria


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
