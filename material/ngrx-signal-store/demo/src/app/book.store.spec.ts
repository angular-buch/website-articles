import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { BookStore } from './book.store';
import { BookApi } from './shared/book-api';
import { Book } from './shared/book';

const b = (isbn: string, title = `Title ${isbn}`): Book => ({ isbn, title });

/** Erzeugt einen frischen Store mit gemocktem BookApi. */
function createStore(mock: Partial<BookApi>) {
  TestBed.configureTestingModule({
    providers: [{ provide: BookApi, useValue: mock }]
  });
  return TestBed.inject(BookStore);
}

describe('BookStore (SignalStore)', () => {
  it('lädt beim Init die Bücher und zählt sie', () => {
    const store = createStore({ getAll: () => of([b('1'), b('2'), b('3')]) });

    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.books().length).toBe(3);
    expect(store.booksCount()).toBe(3);
  });

  it('setzt loading=true, solange der Ladevorgang läuft', () => {
    const response = new Subject<Book[]>();
    const store = createStore({ getAll: () => response });
    // onInit hat loadBooks() ausgelöst; die Antwort steht noch aus:
    expect(store.loading()).toBe(true);

    response.next([b('1')]);
    response.complete();

    expect(store.loading()).toBe(false);
    expect(store.booksCount()).toBe(1);
  });

  it('addBook hängt ein Buch immutabel an die Liste an', () => {
    const store = createStore({
      getAll: () => of([b('1')]),
      create: book => of(book)
    });
    expect(store.booksCount()).toBe(1);

    store.addBook(b('2', 'Neues Buch'));

    expect(store.booksCount()).toBe(2);
    expect(store.books().map(x => x.isbn)).toEqual(['1', '2']);
  });

  it('updateBook ersetzt das passende Buch', () => {
    const store = createStore({
      getAll: () => of([b('1', 'Alt'), b('2', 'Zwei')]),
      update: book => of(book)
    });

    store.updateBook(b('1', 'Neu'));

    expect(store.books().find(x => x.isbn === '1')?.title).toBe('Neu');
    expect(store.booksCount()).toBe(2);
  });

  it('deleteBook entfernt das Buch anhand der ISBN', () => {
    const store = createStore({
      getAll: () => of([b('1'), b('2')]),
      remove: () => of(undefined)
    });

    store.deleteBook('1');

    expect(store.booksCount()).toBe(1);
    expect(store.books()[0].isbn).toBe('2');
  });

  it('schreibt eine Fehlermeldung in den State, wenn das Laden fehlschlägt', () => {
    const store = createStore({
      getAll: () => throwError(() => new Error('Netzwerkfehler'))
    });

    expect(store.error()).toBe('Netzwerkfehler');
    expect(store.loading()).toBe(false);
  });

  it('schreibt eine Fehlermeldung, wenn das Anlegen fehlschlägt', () => {
    const store = createStore({
      getAll: () => of([b('1')]),
      create: () => throwError(() => new Error('Doppelte ISBN'))
    });

    store.addBook(b('1', 'Doppelt'));

    expect(store.error()).toBe('Doppelte ISBN');
    expect(store.booksCount()).toBe(1); // Liste bleibt unverändert
  });

  it('ein erfolgreiches Schreiben räumt eine alte Fehlermeldung weg', () => {
    const store = createStore({
      getAll: () => throwError(() => new Error('Netzwerkfehler')),
      remove: () => of(undefined)
    });
    expect(store.error()).toBe('Netzwerkfehler');

    store.deleteBook('1');

    expect(store.error()).toBeNull();
  });

  it('clearError setzt die Fehlermeldung zurück', () => {
    const store = createStore({
      getAll: () => throwError(() => new Error('Netzwerkfehler'))
    });
    expect(store.error()).toBe('Netzwerkfehler');

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
