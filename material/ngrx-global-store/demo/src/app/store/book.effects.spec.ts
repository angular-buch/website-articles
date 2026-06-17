import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { BookEffects } from './book.effects';
import { BookStore } from '../shared/book-store';
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

describe('BookEffects', () => {
  let actions$: Observable<Action>;

  function setup(mock: Partial<BookStore>): BookEffects {
    TestBed.configureTestingModule({
      providers: [
        BookEffects,
        provideMockActions(() => actions$),
        { provide: BookStore, useValue: mock }
      ]
    });
    return TestBed.inject(BookEffects);
  }

  it('loadBooks$ feuert loadBooksSuccess mit den geladenen Büchern', () => {
    const books = [b('1'), b('2')];
    const effects = setup({ getAll: () => of(books) });
    actions$ = of(BookActions.loadBooks());

    let result: Action | undefined;
    effects.loadBooks$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.loadBooksSuccess({ data: books }));
  });

  it('loadBooks$ feuert loadBooksFailure bei einem Fehler', () => {
    const effects = setup({ getAll: () => throwError(() => new Error('Netzwerkfehler')) });
    actions$ = of(BookActions.loadBooks());

    let result: Action | undefined;
    effects.loadBooks$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.loadBooksFailure({ error: 'Netzwerkfehler' }));
  });

  it('createBook$ feuert createBookSuccess', () => {
    const book = b('3', 'Neu');
    const effects = setup({ create: x => of(x) });
    actions$ = of(BookActions.createBook({ book }));

    let result: Action | undefined;
    effects.createBook$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.createBookSuccess({ book }));
  });

  it('createBook$ feuert createBookFailure bei einem Fehler', () => {
    const effects = setup({ create: () => throwError(() => new Error('Doppelte ISBN')) });
    actions$ = of(BookActions.createBook({ book: b('3') }));

    let result: Action | undefined;
    effects.createBook$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.createBookFailure({ error: 'Doppelte ISBN' }));
  });

  it('deleteBook$ feuert deleteBookSuccess mit der ISBN', () => {
    const effects = setup({ remove: () => of(undefined) });
    actions$ = of(BookActions.deleteBook({ isbn: '1' }));

    let result: Action | undefined;
    effects.deleteBook$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.deleteBookSuccess({ isbn: '1' }));
  });

  it('deleteBook$ feuert deleteBookFailure bei einem Fehler', () => {
    const effects = setup({ remove: () => throwError(() => new Error('Löschfehler')) });
    actions$ = of(BookActions.deleteBook({ isbn: '1' }));

    let result: Action | undefined;
    effects.deleteBook$.subscribe(action => (result = action));
    expect(result).toEqual(BookActions.deleteBookFailure({ error: 'Löschfehler' }));
  });
});
