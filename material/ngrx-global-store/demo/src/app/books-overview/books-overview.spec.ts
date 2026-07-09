import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { MockInstance } from 'vitest';

import { BooksOverview } from './books-overview';
import * as BookActions from '../store/book.actions';
import {
  selectAllBooks,
  selectBooksError,
  selectBooksLoading,
  selectLikedBooks
} from '../store/book.selectors';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Titel ${isbn}`): Book => ({
  isbn,
  title,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

interface Setup {
  fixture: ComponentFixture<BooksOverview>;
  dispatch: MockInstance<(action: unknown) => void>;
  el: HTMLElement;
}

describe('BooksOverview', () => {
  async function setup(
    books: Book[] = [],
    liked: Book[] = [],
    loading = false,
    error: string | null = null
  ): Promise<Setup> {
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
    return { fixture, dispatch, el: fixture.nativeElement };
  }

  it('dispatcht loadBooks beim Erzeugen', async () => {
    const { dispatch } = await setup();
    expect(dispatch).toHaveBeenCalledWith(BookActions.loadBooks());
  });

  it('rendert eine Karte pro Buch', async () => {
    const { el } = await setup([b('1'), b('2')]);
    expect(el.querySelectorAll('app-book-card').length).toBe(2);
  });

  it('zeigt die Favoriten', async () => {
    const { el } = await setup([], [b('1', 'Lieblingsbuch')]);
    expect(el.querySelector('.favorites')?.textContent).toContain('Lieblingsbuch');
  });

  it('dispatcht likeBook beim Klick auf Favorit', async () => {
    const book = b('1');
    const { el, dispatch } = await setup([book]);
    dispatch.mockClear();
    const likeButton = el.querySelector('app-book-card .book-card__footer button') as HTMLButtonElement;
    likeButton.click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.likeBook({ book }));
  });

  it('dispatcht deleteBook beim Klick auf Löschen', async () => {
    const { el, dispatch } = await setup([b('1')]);
    dispatch.mockClear();
    const buttons = el.querySelectorAll('app-book-card .book-card__footer button');
    (buttons[1] as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.deleteBook({ isbn: '1' }));
  });

  it('dispatcht createBook beim Anlegen und leert die Felder', async () => {
    const { el, dispatch } = await setup();
    dispatch.mockClear();
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '978-x';
    title.value = 'Neu';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();

    const action = dispatch.mock.calls.at(-1)?.[0] as ReturnType<typeof BookActions.createBook>;
    expect(action.type).toBe(BookActions.createBook.type);
    expect(action.book.isbn).toBe('978-x');
    expect(action.book.title).toBe('Neu');
    expect(isbn.value).toBe('');
  });

  it('dispatcht clearLikedBooks beim Leeren', async () => {
    const { el, dispatch } = await setup([], [b('1')]);
    dispatch.mockClear();
    (el.querySelector('.favorites button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.clearLikedBooks());
  });

  it('zeigt eine Fehlermeldung und dispatcht clearError beim Klick auf OK', async () => {
    const { el, dispatch } = await setup([], [], false, 'Kaputt');
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');
    dispatch.mockClear();
    (el.querySelector('.error button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.clearError());
  });

  it('zeigt den Ladeindikator', async () => {
    const { el } = await setup([], [], true);
    expect(el.querySelector('.loader')).toBeTruthy();
  });
});
