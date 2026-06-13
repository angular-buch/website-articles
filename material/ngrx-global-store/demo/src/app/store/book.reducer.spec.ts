import { initialState, reducer, State } from './book.reducer';
import * as BookActions from './book.actions';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Title ${isbn}`): Book => ({ isbn, title });

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

  it('createBookSuccess hängt ein Buch immutabel an', () => {
    const start: State = { ...initialState, books: [b('1')] };
    const state = reducer(start, BookActions.createBookSuccess({ book: b('2') }));
    expect(state.books.map(x => x.isbn)).toEqual(['1', '2']);
    expect(start.books.length).toBe(1); // Original unverändert
  });

  it('updateBookSuccess ersetzt das passende Buch', () => {
    const start: State = { ...initialState, books: [b('1', 'Alt'), b('2', 'Zwei')] };
    const state = reducer(start, BookActions.updateBookSuccess({ book: b('1', 'Neu') }));
    expect(state.books.find(x => x.isbn === '1')?.title).toBe('Neu');
  });

  it('deleteBookSuccess entfernt das Buch anhand der ISBN', () => {
    const start: State = { ...initialState, books: [b('1'), b('2')] };
    const state = reducer(start, BookActions.deleteBookSuccess({ isbn: '1' }));
    expect(state.books.map(x => x.isbn)).toEqual(['2']);
  });

  it('alle Failure-Actions setzen error (Mehrfach-on)', () => {
    expect(reducer(initialState, BookActions.createBookFailure({ error: 'c' })).error).toBe('c');
    expect(reducer(initialState, BookActions.updateBookFailure({ error: 'u' })).error).toBe('u');
    expect(reducer(initialState, BookActions.deleteBookFailure({ error: 'd' })).error).toBe('d');
  });

  it('lässt den State bei unbekannter Action unverändert', () => {
    const state = reducer(initialState, { type: 'unbekannt' } as never);
    expect(state).toBe(initialState);
  });
});
