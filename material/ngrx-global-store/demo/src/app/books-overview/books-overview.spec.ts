import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { BooksOverview } from './books-overview';
import { BookCard } from '../book-card/book-card';
import * as BookActions from '../store/book.actions';
import {
  selectAllBooks,
  selectBooksError,
  selectBooksLoading,
  selectLikedBooks
} from '../store/book.selectors';
import { Book } from '../shared/book';
import { b } from '../testing/book-factory';

describe('BooksOverview', () => {
  async function setup(options: { books?: Book[]; liked?: Book[]; loading?: boolean; error?: string | null } = {}) {
    const { books = [], liked = [], loading = false, error = null } = options;
    await TestBed.configureTestingModule({
      imports: [BooksOverview],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllBooks, value: books },
            { selector: selectLikedBooks, value: liked },
            { selector: selectBooksLoading, value: loading },
            { selector: selectBooksError, value: error }
          ]
        })
      ]
    }).compileComponents();

    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(BooksOverview);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const firstCard = () => fixture.debugElement.query(By.directive(BookCard));
    return { fixture, dispatch, el, firstCard };
  }

  it('dispatcht loadBooks beim Erzeugen', async () => {
    const { dispatch } = await setup();
    expect(dispatch).toHaveBeenCalledWith(BookActions.loadBooks());
  });

  it('rendert eine Karte pro Buch', async () => {
    const { el } = await setup({ books: [b('1'), b('2')] });
    expect(el.querySelectorAll('app-book-card').length).toBe(2);
  });

  it('zeigt die Favoriten', async () => {
    const { el } = await setup({ liked: [b('1', 'Lieblingsbuch')] });
    expect(el.querySelector('.favorites')?.textContent).toContain('Lieblingsbuch');
  });

  it('dispatcht likeBook, wenn die Karte ein like emittiert', async () => {
    const book = b('1');
    const { dispatch, firstCard } = await setup({ books: [book] });
    dispatch.mockClear();
    firstCard().triggerEventHandler('like', book);
    expect(dispatch).toHaveBeenCalledWith(BookActions.likeBook({ book }));
  });

  it('dispatcht deleteBook, wenn die Karte ein remove emittiert', async () => {
    const { dispatch, firstCard } = await setup({ books: [b('1')] });
    dispatch.mockClear();
    firstCard().triggerEventHandler('remove', '1');
    expect(dispatch).toHaveBeenCalledWith(BookActions.deleteBook({ isbn: '1' }));
  });

  it('dispatcht createBook beim Anlegen und leert die Felder', async () => {
    const { el, dispatch } = await setup();
    dispatch.mockClear();
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '978-x';
    title.value = 'Neu';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();

    const action = dispatch.mock.calls.at(-1)?.[0] as unknown as ReturnType<typeof BookActions.createBook>;
    expect(action.type).toBe(BookActions.createBook.type);
    expect(action.book.isbn).toBe('978-x');
    expect(action.book.title).toBe('Neu');
    expect(isbn.value).toBe('');
  });

  it('dispatcht clearLikedBooks beim Leeren', async () => {
    const { el, dispatch } = await setup({ liked: [b('1')] });
    dispatch.mockClear();
    (el.querySelector('.favorites button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.clearLikedBooks());
  });

  it('zeigt eine Fehlermeldung und dispatcht clearError beim Klick auf OK', async () => {
    const { el, dispatch } = await setup({ error: 'Kaputt' });
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');
    dispatch.mockClear();
    (el.querySelector('.error button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.clearError());
  });

  it('zeigt den Ladeindikator', async () => {
    const { el } = await setup({ loading: true });
    expect(el.querySelector('.loader')).toBeTruthy();
  });
});
