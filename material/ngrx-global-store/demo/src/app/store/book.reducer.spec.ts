import { Action } from '@ngrx/store';

import { initialState, reducer, State } from './book.reducer';
import * as BookActions from './book.actions';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Titel ${isbn}`): Book => ({
  isbn,
  title,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

describe('Book Reducer', () => {
  it('loadBooks setzt loading=true und error=null', () => {
    const state = reducer({ ...initialState, error: 'alt' }, BookActions.loadBooks());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadBooksSuccess speichert die Bücher und beendet das Laden', () => {
    const books = [b('1'), b('2')];
    const state = reducer({ ...initialState, loading: true }, BookActions.loadBooksSuccess({ data: books }));
    expect(state.books).toEqual(books);
    expect(state.loading).toBe(false);
  });

  it('loadBooksFailure setzt die Fehlermeldung', () => {
    const state = reducer({ ...initialState, loading: true }, BookActions.loadBooksFailure({ error: 'boom' }));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('boom');
  });

  it('clearError setzt die Fehlermeldung zurück', () => {
    const state = reducer({ ...initialState, error: 'boom' }, BookActions.clearError());
    expect(state.error).toBeNull();
  });

  it('createBookSuccess hängt ein Buch immutabel an', () => {
    const start: State = { ...initialState, books: [b('1')] };
    const state = reducer(start, BookActions.createBookSuccess({ book: b('2') }));
    expect(state.books.map(x => x.isbn)).toEqual(['1', '2']);
    expect(start.books.length).toBe(1);
  });

  it('deleteBookSuccess entfernt das Buch anhand der ISBN', () => {
    const start: State = { ...initialState, books: [b('1'), b('2')] };
    const state = reducer(start, BookActions.deleteBookSuccess({ isbn: '1' }));
    expect(state.books.map(x => x.isbn)).toEqual(['2']);
  });

  it('ein Schreibvorgang (Auslöser) setzt eine alte Fehlermeldung zurück', () => {
    const state = reducer({ ...initialState, error: 'alt' }, BookActions.createBook({ book: b('9') }));
    expect(state.error).toBeNull();
  });

  it('Failure-Actions setzen error', () => {
    expect(reducer(initialState, BookActions.createBookFailure({ error: 'c' })).error).toBe('c');
    expect(reducer(initialState, BookActions.deleteBookFailure({ error: 'd' })).error).toBe('d');
  });

  it('likeBook fügt ein Buch zu den Favoriten hinzu', () => {
    const state = reducer(initialState, BookActions.likeBook({ book: b('1') }));
    expect(state.likedBooks.map(x => x.isbn)).toEqual(['1']);
  });

  it('likeBook dedupliziert anhand der ISBN', () => {
    const start: State = { ...initialState, likedBooks: [b('1')] };
    const state = reducer(start, BookActions.likeBook({ book: b('1') }));
    expect(state.likedBooks.length).toBe(1);
    expect(state).toBe(start); // unverändert, keine neue Referenz
  });

  it('clearLikedBooks leert die Favoriten', () => {
    const start: State = { ...initialState, likedBooks: [b('1'), b('2')] };
    const state = reducer(start, BookActions.clearLikedBooks());
    expect(state.likedBooks).toEqual([]);
  });

  it('lässt den State bei unbekannter Action unverändert', () => {
    const state = reducer(initialState, { type: 'unbekannt' } as Action);
    expect(state).toBe(initialState);
  });
});
