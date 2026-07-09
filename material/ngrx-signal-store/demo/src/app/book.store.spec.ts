import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { BookSignalStore } from './book.store';
import { BookStore } from './shared/book-store';
import { Book } from './shared/book';

const b = (isbn: string, title = `Titel ${isbn}`): Book => ({
  isbn,
  title,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

/** Erzeugt einen frischen Store mit gemocktem BookStore-Service. */
function createStore(mock: Partial<BookStore>) {
  TestBed.configureTestingModule({
    providers: [{ provide: BookStore, useValue: mock }]
  });
  return TestBed.inject(BookSignalStore);
}

describe('BookSignalStore', () => {
  it('lädt beim Init die Bücher und zählt sie', () => {
    const store = createStore({ getAll: () => of([b('1'), b('2'), b('3')]) });

    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.booksCount()).toBe(3);
  });

  it('setzt loading=true, solange der Ladevorgang läuft', () => {
    const response = new Subject<Book[]>();
    const store = createStore({ getAll: () => response });
    expect(store.loading()).toBe(true);

    response.next([b('1')]);
    response.complete();

    expect(store.loading()).toBe(false);
    expect(store.booksCount()).toBe(1);
  });

  it('addBook hängt ein Buch an die Liste an', () => {
    const store = createStore({ getAll: () => of([b('1')]), create: book => of(book) });
    store.addBook(b('2', 'Neu'));
    expect(store.books().map(x => x.isbn)).toEqual(['1', '2']);
  });

  it('deleteBook entfernt das Buch anhand der ISBN', () => {
    const store = createStore({ getAll: () => of([b('1'), b('2')]), remove: () => of(undefined) });
    store.deleteBook('1');
    expect(store.books().map(x => x.isbn)).toEqual(['2']);
  });

  it('schreibt eine Fehlermeldung in den State, wenn das Laden fehlschlägt', () => {
    const store = createStore({ getAll: () => throwError(() => new Error('Netzwerkfehler')) });
    expect(store.error()).toBe('Netzwerkfehler');
    expect(store.loading()).toBe(false);
  });

  it('schreibt eine Fehlermeldung, wenn das Anlegen fehlschlägt', () => {
    const store = createStore({
      getAll: () => of([b('1')]),
      create: () => throwError(() => new Error('Doppelte ISBN'))
    });
    store.addBook(b('1'));
    expect(store.error()).toBe('Doppelte ISBN');
    expect(store.booksCount()).toBe(1);
  });

  it('clearError setzt die Fehlermeldung zurück', () => {
    const store = createStore({ getAll: () => throwError(() => new Error('Netzwerkfehler')) });
    expect(store.error()).toBe('Netzwerkfehler');
    store.clearError();
    expect(store.error()).toBeNull();
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

  it('likeBook fügt einen Favoriten hinzu und dedupliziert anhand der ISBN', () => {
    const store = createStore({ getAll: () => of([]) });
    store.likeBook(b('1'));
    store.likeBook(b('1'));
    expect(store.likedCount()).toBe(1);
  });

  it('clearLikedBooks leert die Favoriten', () => {
    const store = createStore({ getAll: () => of([]) });
    store.likeBook(b('1'));
    store.clearLikedBooks();
    expect(store.likedCount()).toBe(0);
  });
});
