---
title: "Errata zur 3. Auflage"
author: Angular Buch Team
mail: team@angular-buch.com
published: 2021-01-25
lastModified: 2021-01-25
keywords:
  - Angular
  - Errata
  - Fehlerverzeichnis
language: de
# thumbnail: ./header-twa.jpg
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
Es sind deshalb kleinere Änderungen im Code nötig, um die Anforderungen des Strict Mode zu erfüllen.
Wir informieren darüber demnächst in einem separaten Blogpost.

### 14.1.4 HttpClientModule in Feature-Modulen

Im Abschnitt 14.1.4 auf Seite 406 erklären wir, dass ein Feature-Modul alle benötigten weiteren Module importieren muss:
> Je nachem, welche Features außerdem in dem Modul benötigt werden, müssen ebenso weitere Module wie `ReactiveFormsModule` oder `HttpClientModule` eingebunden werden.

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





