import { selectAllBooks, selectBookState, selectBooksError, selectBooksLoading } from './book.selectors';
import { bookFeatureKey, State } from './book.reducer';
import { Book } from '../shared/book';

const b = (isbn: string): Book => ({ isbn, title: `Title ${isbn}` });

describe('Book Selectors', () => {
  const bookState: State = { books: [b('1'), b('2')], loading: true, error: 'x' };
  const rootState: Record<string, State> = { [bookFeatureKey]: bookState };

  it('selectBookState liefert den Feature-State', () => {
    expect(selectBookState(rootState)).toBe(bookState);
  });

  it('selectAllBooks liefert die Buchliste', () => {
    expect(selectAllBooks(rootState)).toEqual([b('1'), b('2')]);
  });

  it('selectBooksLoading liefert das loading-Flag', () => {
    expect(selectBooksLoading(rootState)).toBe(true);
  });

  it('selectBooksError liefert die Fehlermeldung', () => {
    expect(selectBooksError(rootState)).toBe('x');
  });
});
