import {
  selectAllBooks,
  selectBookState,
  selectBooksError,
  selectBooksLoading,
  selectLikedBooks
} from './book.selectors';
import { bookFeatureKey, State } from './book.reducer';
import { Book } from '../shared/book';

const b = (isbn: string): Book => ({
  isbn,
  title: `Titel ${isbn}`,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

describe('Book Selectors', () => {
  const bookState: State = {
    books: [b('1'), b('2')],
    loading: true,
    error: 'x',
    likedBooks: [b('1')]
  };
  const rootState: Record<string, State> = { [bookFeatureKey]: bookState };

  it('selectBookState liefert den Feature-State', () => {
    expect(selectBookState(rootState)).toBe(bookState);
  });

  it('selectAllBooks liefert die Buchliste', () => {
    expect(selectAllBooks(rootState).map(x => x.isbn)).toEqual(['1', '2']);
  });

  it('selectBooksLoading liefert das loading-Flag', () => {
    expect(selectBooksLoading(rootState)).toBe(true);
  });

  it('selectBooksError liefert die Fehlermeldung', () => {
    expect(selectBooksError(rootState)).toBe('x');
  });

  it('selectLikedBooks liefert die Favoriten', () => {
    expect(selectLikedBooks(rootState).map(x => x.isbn)).toEqual(['1']);
  });
});
