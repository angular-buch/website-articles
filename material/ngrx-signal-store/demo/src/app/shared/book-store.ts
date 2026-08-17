import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Book } from './book';

/**
 * Datenzugriff auf die echte BookManager-API (wie im Buch).
 * Eine öffentlich gehostete Instanz liegt unter `api1.angular-buch.com`,
 * sodass die Demo ohne eigenes Backend läuft.
 *
 * Wir geben hier bewusst `Observable`s zurück (statt `httpResource`/`Promise`
 * wie in späteren Buch-Iterationen), weil `rxMethod` direkt mit Observables arbeitet.
 */
@Service()
export class BookStore {
  #http = inject(HttpClient);
  #apiUrl = 'https://api1.angular-buch.com';

  getAll(): Observable<Book[]> {
    return this.#http.get<Book[]>(`${this.#apiUrl}/books`);
  }

  create(book: Book): Observable<Book> {
    return this.#http.post<Book>(`${this.#apiUrl}/books`, book);
  }

  remove(isbn: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/books/${isbn}`);
  }
}
