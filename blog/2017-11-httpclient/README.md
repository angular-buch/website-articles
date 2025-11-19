---
title: "Angular 4.3: Der neue HttpClient"
author: Gregor Woiwode
mail: gregor.woiwode@gmail.com
published: 2017-11-05
keywords:
  - Angular
  - Angular 4
  - Angular 5
  - HttpClient
  - HTTP
language: de
header: angular5.png
isUpdatePost: true
---

## Abstract

> Mit Version 4.3 des Angular-Frameworks steht ein neuer HttpClient bereit.
Dieser weist eine stärkere Typisierung auf und vereinfacht die Verarbeitung von geladenen Daten.
Dieser Artikel zeigt Ihnen die wichtigsten Änderungen zum alten HTTP-Service. Sie werden lernen, wie Sie das neue `HttpClientModule` einsetzen können und welche Vorteile es Ihnen bringt. Ein kleines Beispiel demonstriert Ihnen die Nutzung des neuen `HttpClient`.


## Lohnt sich das Update?

Wenn Sie derzeit den herkömmlichen `Http`-Service von Angular nutzen, ist ein Update unter allen Umständen zu empfehlen.
Das `HttpModule` ist bereits als *deprecated* gekennzeichnet. Das bedeutet, dass es in einer künftigen Version von Angular entfernt wird.

**Die kurze Antwort lautet: Das Update lohnt sich nicht nur, es ist darüber hinaus auch notwendig.**

> **Eine Anmerkung zu @angular/http**
Wenn `@angular/common/http` eingesetzt wird, kann in vielen Fällen `@angular/http` aus dem Projekt entfernt werden. An dieser Stelle ist etwas Vorsicht geboten: Angular-Bibliotheken, die von der Community oder Drittanbietern entwickelt wurden, können nach wie vor eine Abhängigkeit zu `@angular/http` aufweisen. Darum ist es für bestehende Projekte empfehlenswert zu prüfen, ob die vorherige Version des HTTP-Moduls entfernt werden kann oder ob eine Migration nötig ist.

## Die neue HTTP-Bibliothek im Überblick

Die neue Bibliothek zum Laden von Daten über HTTP heißt `HttpClientModule`.
Sie kann aus dem Paket `@angular/common/http` importiert werden.

```typescript
import { HttpClientModule } from '@angular/common/http';
```

Das Modul weist eine kleinere Bundle-Größe auf als sein Vorgänger.

Der Name des Clients hat sich von `Http` in `HttpClient` geändert.
Die gute Nachricht ist, dass beide Clients problemlos parallel betrieben werden können.
Somit ist eine schrittweise Aktualisierung von bestehenden Angular-Apps möglich.

Neben einigen Änderungen in der API können *HttpRequests* nun vor dem Absenden zur API verändert werden.
Das ist nützlich, wenn Sie Informationen zur Authentifizierung, Fortschrittsanzeigen oder Logging zentral einrichten und steuern möchten.
Hinter dem beschriebenen Mechanismus verbergen sich die _Interceptors_.
Wenn Sie Ihren eigenen Interceptor schreiben möchten, finden Sie unter https://angular.io/guide/http#advanced-usage einen Guide, der alles zeigt, was Sie benötigen.

## TL;DR – am Beispiel lernen

Wenn Sie ein erfahrener Angular-Entwickler sind, benötigen Sie den theoretischen Teil eventuell nicht.
Falls das auf Sie zutrifft, können Sie in der folgenden Demo sehen, wie der `HttpClient` eingesetzt wird.

Für eine ausführlichere Erläuterung lesen Sie einfach weiter.

<iframe
  style="width: 100%; height: 600px"
  src="https://embed.plnkr.co/XH4zUY/?show=app/book-store.service.ts,preview&deferRun"
  frameborder="0"
  allowfullscren="allowfullscren">
</iframe>

## Das HttpClientModule verwenden

Ab Version 4.3 ist Angulars neue HTTP-Bibliothek in `@angular/common/http` enthalten.
Um das `HttpClientModule` einzubinden, muss es im betreffenden `NgModule` registriert werden.
In unserem Beispiel binden wir es im `AppModule` ein.

```typescript
/* ... */
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports:      [BrowserModule, HttpClientModule],
  declarations: [AppComponent],
  bootstrap:    [AppComponent]
})
export class AppModule { }
```

Damit steht der `HttpClient` in der gesamten Anwendung zur Verfügung.

## Der HttpClient – typsicher und produktiv

Um den `HttpClient` zu verwenden, hat sich bis auf den Namen nichts im Vergleich zum Vorgänger verändert.
Beim Importieren ist zu beachten, dass der Pfad `@angular/common/http` verwendet wird.
Das folgende Snippet zeigt, wie der `HttpClient` in einen Service eingebunden werden kann.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BookStoreService {
  constructor(private http: HttpClient) {}
}
```

Das Angular-Team hat sich die Nutzung des HTTP-Dienstes angesehen und festgestellt,
dass in den meisten Fällen nur der Payload der _Response_ verarbeitet wird.
Aus diesem Grund gibt der `HttpClient` nicht mehr das gesamte Response-Objekt zurück.
Dadurch vereinfacht sich das Mapping, denn der Aufruf `response.json()` ist nicht mehr notwendig.

Darüber hinaus ist es möglich, das erwartete Ergebnis eines Requests zu typisieren.

```typescript
this.http
  .get<T>(/* URL */): Observable<T>
  .put<T>(/* URL */, /* Payload */): Observable<T>
  .post<T>(/* URL */, /* Payload */): Observable<T>
  .delete<T>(/* URL */): Observable<T>
```

Trotzdem ist der Zugriff auf das `HttpResponse`-Objekt weiterhin möglich.
Dazu muss lediglich ein weiterer Parameter übergeben werden:
Mit der Option `{ observe: 'response' }` liefert der Aufruf die gesamte `HttpResponse` zurück – nicht nur den Payload.
Das erlaubt Ihnen zum Beispiel das Auslesen von Header-Daten und Status-Codes.

```typescript
this.http
  .get(/* URL */, { observe: 'response' }): Observable<HttpResponse>
  .put(/* URL */, /* Payload */, { observe: 'response' }): Observable<HttpResponse>
  .post(/* URL */, /* Payload */, { observe: 'response' }): Observable<HttpResponse>
  .delete(/* URL */, { observe: 'response' }): Observable<HttpResponse>
```

Durch die stärkere Typisierung können wir nun spezifizieren, welche Daten von der API erwartet werden.
Für die Daten der [BookMonkey-API](https://book-monkey2-api.angular-buch.com) kann beispielswise folgendes Interface bereitgestellt werden, um die JSON-Daten zu beschreiben:

```typescript
export interface BookRaw {
  title: string;
  subtitle: string;
  isbn: string;
  description: string;
  rating: number;
  authors: string[];
}
```

Die Daten der API müssen in manchen Fällen transformiert werden, damit sie in der Anwendung eingesetzt werden können.
In unserem Fall ist das Zielformat die Klasse `Book`.
Im Gegensatz zu `BookRaw` bildet `Book` hier das Autorenteam in Form einer Zeichenkette ab und verzichtet auf die Anzeige der Bewertung.

```typescript
export class Book implements BookRaw {
  constructor(
    public title: string,
    public subtitle: string,
    public isbn: string,
    public description: string,
    public authorTeam: string
  ) {}
}

```

Um aus den Daten der API die gewünschten Klasseninstanzen zu erzeugen, kann mit den bekannten Operatoren gearbeitet werden.
Im folgenden Beispiel wird der Service `BookStoreService` erweitert.
Eine Bücherliste wird von der [BookMonkey-API](https://book-monkey2-api.angular-buch.com) geladen.
Die geladenen Daten haben den Typ `BookRaw[]`.
Der Service sorgt dafür, dass Komponenten mit dem Typ `Book[]` arbeiten können.
Dazu wird die Liste mit Hilfe des RxJS-Operators `map` transformiert.

> An dieser Stelle sei der Hinweis gestattet, dass RxJS-Operatoren zusätzlich importiert werden müssen.
> Der `map`-Operator kann mit folgendem Statement geladen werden: `import 'rxjs/add/operator/map';`
> Auf die *Pipeable Operators* (vorher: Lettable Operators) haben wir an dieser Stelle noch verzichtet. Auf GitHub ist der gesamte Quelltext allerdings aktualisiert.

Das Mapping wird in die Methode `provideBooksFrom()` ausgelagert, damit der Code lesbarer ist.
Sie werden bemerken, dass der Übergabeparameter `raws` im `map`-Operator mit `BookRaw[]` typisiert ist.
Die explizite Typisierung innerhalb des Operators entfällt.

```typescript
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { Book, BookRaw } from './models/book';

@Injectable()
export class BookStoreService {
  api = 'https://book-monkey2-api.angular-buch.com';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Book[]> {
     return this.http
       .get<BookRaw[]>(`${this.api}/books`)
       .map(raws => this.provideBooksFrom(raws));
       //   ^-- raws ist vom Typ BookRaw[]
  }

  provideBooksFrom(raws: BookRaw[]): Book[] {
    return raws.map(raw => new Book(
      raw.title,
      raw.subtitle,
      raw.isbn,
      raw.description,
      raw.rating
    ));
  }
}
```

## Fazit

Mit dem neuen `HttpClient` lässt sich die Kommunikation mit HTTP-Schnittstellen stärker typisieren.
Die Verwendung ist ansonsten weitestgehend gleich geblieben.
Lediglich die manuelle Umwandlung der Response von JSON mit `response.json()` entfällt ab sofort.
Der `HttpClient` lässt sich allerdings so konfigurieren, dass weiterhin das gesamte Response-Objekt zurückgegeben wird.

Für neue Funktionen sollten Sie sofort auf den `HttpClient` setzen.
Älteren Code können Sie schrittweise migrieren.

Das alte `HttpModule` ist *deprecated* und wird wahrscheinlich mit dem Release von Angular 6 im Jahr 2018 entfernt.
In Angular 5 steht Ihnen das `HttpModule` zum Übergang noch zur Verfügung.
