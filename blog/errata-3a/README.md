---
title: "Errata zur 3. Auflage"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2021-01-25
lastModified: 2021-11-08
keywords:
  - Angular
  - Errata
  - Fehlerverzeichnis
language: de
sticky: false
hidden: false
---

In der 3. Auflage unseres Angular-Buchs haben wir alle Kapitel überarbeitet und viele Fehler beseitigt.
Das war durch wertvolle Hinweise unserer Leserinnen und Leser möglich. Dennoch: Ein gedrucktes Buch ist niemals fehlerfrei, und natürlich hat sich auch in der 3. Auflage der Fehlerteufel eingeschlichen.

**Haben Sie Fragen oder Hinweise, oder haben Sie einen Fehler im Buch gefunden?
Bitte zögern Sie nicht, und schreiben Sie uns eine E-Mail: team@angular-buch.com **

------

### Änderungen durch den Strict Mode

Seit Angular 12 ist der Strict Mode beim Anlegen eines neuen Projekts standardmäßig aktiviert.
Das BookMonkey-Projekt im Buch wurde jedoch ohne Strict Mode entwickelt.
Es sind deshalb einige Änderungen im Code nötig, um die Anforderungen des Strict Mode zu erfüllen.
Insbesondere die Meldungen `property has no initializer` oder `is possibly undefined` hängen mit dem Strict Mode zusammen.
Wir informieren darüber demnächst in einem separaten Blogpost.
Den Code auf GitHub haben wir entsprechend aktualisiert und mit Kommentaren versehen.

### TSLint / ESLint

Im Buch gehen wir auf den Linter *TSLint* ein, erwähnen aber auch, dass TSLint seit 2019 deprecated ist. Seit Angular 12 wird in neuen Projekten kein Linter mehr eingerichtet.
Wir empfehlen Ihnen, das Tool *ESLint* zu nutzen. Einige Hinweise dazu haben wir im [Blogpost zum Update auf Angular 12](/blog/2021-06-angular12) untergebracht.

### 9 Chrome DevTools: Abbildung falsch referenziert

Im Abschnitt "Zwischen mehreren Dateien navigieren" auf Seite 185 haben wir im Text die Abbildung falsch referenziert.
Der Textabschnit bezieht sich auf die nachfolgende Abbildung 9-13, nicht wie gedruckt auf 9-11.

> Es öffnet sich ein Suchfeld, in dem nach Dateinamen gesucht werden kann (siehe Abbildung 9-13).


### 10.3.5 OAuth/OIDC: Authorization Code Flow

In der Abbildung 10-15 auf Seite 264 zum Authorization Code Flow ist Schritt (3) falsch beschriftet.
Im Request vom Client zum Server wird die *Code Challenge* übermittelt, nicht der Verifier.
Im Text ist der Flow korrekt beschrieben.

### 12.2.8 Template-Driven Forms: ngModel und FormMessagesComponent

In der Iteration zu Template-Driven Forms entwickeln wir die `FormMessagesComponent`, um Meldungen im Formular anzuzeigen.
Die Komponente erhält als Input-Property ein `AbstractControl`.
Im Listing 12-17 auf Seite 300 f. für das Template der `BookFormComponent` zeigen wir, dass die Instanz von `ngModel` direkt an die Messages-Komponente übergeben werden kann. Das ist nicht korrekt, denn `ngModel` ist kein `AbstractControl`! Stattdessen müssen wir das Control aus der Property `control` lesen:

```html
<!-- book-form.component.html -->
<input name="isbn" ... #isbnInput="ngModel">
<bm-form-messages
  [control]="isbnInput.control"
  controlName="isbn"></bm-form-messages>
```

Dieser Fix muss auf alle Stellen im Template der `BookFormComponent` angewendet werden. Wir haben den [Code im GitHub-Repo](https://github.com/book-monkey4/iteration-4-template-driven-forms/blob/master/src/app/book-form/book-form.component.html#L11-L18) entsprechend aktualisiert.

### 12.2.8 Template-Driven Forms: `controlName="author"`

Im Listing 12-27 auf Seite 301 hat sich ein Tippfehler eingeschlichen.
Der `controlName` für das Autorenfeld muss `authors` lauten. Dieser Fehler taucht nur im Buch auf, der Code auf GitHub ist davon nicht betroffen.

```html
<!-- book-form.component.html -->
<bm-form-messages
  [control]="authorInput.control"
  controlName="authors"></bm-form-messages>
```

### 14.1.4 HttpClientModule in Feature-Modulen

Im Abschnitt 14.1.4 auf Seite 406 erklären wir, dass ein Feature-Modul alle benötigten weiteren Module importieren muss:
> Je nachdem, welche Features außerdem in dem Modul benötigt werden, müssen ebenso weitere Module wie `ReactiveFormsModule` oder `HttpClientModule` eingebunden werden.

Für das `HttpClientModule` ist diese Aussage nicht korrekt! Dieses Modul sollte nur einmalig im Hauptmodul der Anwendung importiert werden, aber nicht in die Feature-Module. Darauf weisen wir im Kasten auf Seite 405 sogar ausdrücklich hin.
Hintergrund ist, dass Providers in lazy geladenen Modulen erneut instanziiert werden können. Dadurch werden unter Umständen die HTTP-Interceptoren von Features-Modulen überschrieben.

### 14.1.5 Spread-Operator und Compodoc

Im Kasten auf Seite 409 schlagen wir vor, den Spread-Operator zu verwenden, um die Bestandteile eines Moduls ohne Redundanz zu definieren.
Leider funktioniert das nicht, wenn Sie das Tool *Compodoc* verwenden (siehe Abschnitt 28.5 auf Seite 759). In diesem Fall müssen Sie auf den Trick mit dem Spread-Operator verzichten.

### 14.1.6 Dateibaum mit `book`

Ab Seite 409 unterteilen wir den BookMonkey in mehrere Module.
Die Module `BooksModule` und `AdminModule` liegen dabei in eigenen Unterordnern `books` und `admin`.
Im Dateibaum auf Seite 412 haben wir den Ordner allerdings fälschlicherweise `book` genannt – hier fehlt ein `s`.

### 14.3.2 Config für Router.createUrlTree()

Auf Seite 433 enthält das Listing 14-28 einen Fehler:
Um die Einstellung `relativeTo` zu setzen, muss das Konfigurationsobjekt im zweiten Argument von `createUrlTree()` übergeben werden.
Korrekt lautet der Code also wie folgt:

```ts
this.router.createUrlTree(['../login'], { relativeTo: route });
```

### 27.2 Typo: *Das größte Vorteil*

Auf Seite 741 hat sich ein Tippfehler eingeschlichen. Der korrekte Artikel am Anfang des ersten Satzes lautet natürlich "der":
> Der größte Vorteil dieser Architektur zeigt sich …


### 28.11 ng update --all

Im Abschnitt *28.11 Angular updaten* wird in der Konsolenausgabe der Befehl `ng update --all` genannt.
Der Parameter `--all` wurde mit Angular 11.0 entfernt und kann nicht mehr genutzt werden.





