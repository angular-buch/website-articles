import { selectAllBooks, selectBooksError, selectBooksLoading } from './book.selectors';
import { Book } from '../shared/book';

const b = (isbn: string): Book => ({ isbn, title: `Title ${isbn}` });

describe('Book Selectors', () => {
  const rootState = {
    book: { books: [b('1'), b('2')], loading: true, error: 'x' }
  } as never;

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
