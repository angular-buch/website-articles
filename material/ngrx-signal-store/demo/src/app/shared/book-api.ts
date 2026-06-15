import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Book } from './book';

/**
 * In-Memory-Stand-in für ein echtes HTTP-Backend.
 * Die Methoden geben – wie ein HttpClient-Service – Observables zurück,
 * sodass der Store-Code identisch zum Artikel bleibt.
 *
 * `create()` wirft bewusst einen Fehler, wenn die ISBN bereits existiert –
 * so lässt sich die Fehleranzeige der Anwendung auch ohne Server auslösen.
 */
@Injectable({ providedIn: 'root' })
export class BookApi {
  private books: Book[] = [
    { isbn: '978-3-86490-900-1', title: 'Angular', rating: 5 },
    { isbn: '978-3-86490-466-2', title: 'Angular für Einsteiger', rating: 4 },
    { isbn: '978-3-96009-187-4', title: 'Webentwicklung mit Angular', rating: 4 }
  ];

  getAll(): Observable<Book[]> {
    return of(this.books.map(book => ({ ...book })));
  }

  create(book: Book): Observable<Book> {
    if (this.books.some(b => b.isbn === book.isbn)) {
      return throwError(() => new Error(`Ein Buch mit der ISBN ${book.isbn} existiert bereits.`));
    }
    this.books = [...this.books, { ...book }];
    return of({ ...book });
  }

  update(book: Book): Observable<Book> {
    this.books = this.books.map(b => (b.isbn === book.isbn ? { ...book } : b));
    return of({ ...book });
  }

  remove(isbn: string): Observable<void> {
    this.books = this.books.filter(b => b.isbn !== isbn);
    return of(undefined);
  }
}
