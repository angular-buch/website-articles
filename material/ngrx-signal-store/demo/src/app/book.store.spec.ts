import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BookStore } from './book.store';
import { BookStoreService } from './shared/book-store.service';
import { Book } from './shared/book';

const b = (isbn: string, title = `Title ${isbn}`): Book => ({ isbn, title });

/** Erzeugt einen frischen Store mit gemocktem BookStoreService. */
function createStore(mock: Partial<BookStoreService>) {
  TestBed.configureTestingModule({
    providers: [{ provide: BookStoreService, useValue: mock }]
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
      getAll: () => throwError(() => ({ message: 'Netzwerkfehler' }))
    });

    expect(store.error()).toBe('Netzwerkfehler');
    expect(store.loading()).toBe(false);
  });

  it('clearError setzt die Fehlermeldung zurück', () => {
    const store = createStore({
      getAll: () => throwError(() => ({ message: 'Netzwerkfehler' }))
    });
    expect(store.error()).toBe('Netzwerkfehler');

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
