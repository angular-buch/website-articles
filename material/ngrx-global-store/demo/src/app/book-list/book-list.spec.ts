import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { MockInstance } from 'vitest';

import { BookList } from './book-list';
import * as BookActions from '../store/book.actions';
import { selectAllBooks, selectBooksError, selectBooksLoading } from '../store/book.selectors';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Title ${isbn}`, rating = 0): Book => ({ isbn, title, rating });

interface Setup {
  fixture: ComponentFixture<BookList>;
  dispatch: MockInstance<(action: unknown) => void>;
  el: HTMLElement;
}

describe('BookList', () => {
  async function setup(books: Book[] = [], loading = false, error: string | null = null): Promise<Setup> {
    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllBooks, value: books },
            { selector: selectBooksLoading, value: loading },
            { selector: selectBooksError, value: error }
          ]
        })
      ]
    }).compileComponents();

    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(BookList);
    await fixture.whenStable();
    return { fixture, dispatch, el: fixture.nativeElement };
  }

  it('dispatcht loadBooks beim Erzeugen', async () => {
    const { dispatch } = await setup();
    expect(dispatch).toHaveBeenCalledWith(BookActions.loadBooks());
  });

  it('rendert die Buchliste', async () => {
    const { el } = await setup([b('1', 'Eins'), b('2', 'Zwei')]);
    const items = el.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Eins');
  });

  it('zeigt den Ladeindikator', async () => {
    const { el } = await setup([], true);
    expect(el.querySelector('.loader')).toBeTruthy();
  });

  it('zeigt eine Fehlermeldung und dispatcht clearError beim Klick auf OK', async () => {
    const { el, dispatch } = await setup([], false, 'Kaputt');
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');
    dispatch.mockClear();
    (el.querySelector('.error button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.clearError());
  });

  it('dispatcht createBook beim Anlegen und leert die Felder', async () => {
    const { el, dispatch } = await setup();
    dispatch.mockClear();
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '111-1';
    title.value = 'Neues Buch';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(
      BookActions.createBook({ book: { isbn: '111-1', title: 'Neues Buch', rating: 0 } })
    );
    expect(isbn.value).toBe('');
    expect(title.value).toBe('');
  });

  it('legt nichts an, wenn die Felder leer sind', async () => {
    const { el, dispatch } = await setup();
    dispatch.mockClear();
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('rateUp erhöht die Bewertung und deckelt sie bei 5', async () => {
    const { el, dispatch } = await setup([b('1', 'Eins', 4), b('2', 'Zwei', 5)]);
    dispatch.mockClear();
    const rateButtons = el.querySelectorAll<HTMLButtonElement>('li button:first-of-type');
    rateButtons[0].click(); // 4 -> 5
    expect(dispatch).toHaveBeenCalledWith(BookActions.updateBook({ book: { isbn: '1', title: 'Eins', rating: 5 } }));
    dispatch.mockClear();
    rateButtons[1].click(); // 5 -> bleibt 5
    expect(dispatch).toHaveBeenCalledWith(BookActions.updateBook({ book: { isbn: '2', title: 'Zwei', rating: 5 } }));
  });

  it('dispatcht deleteBook beim Klick auf Löschen', async () => {
    const { el, dispatch } = await setup([b('1')]);
    dispatch.mockClear();
    (el.querySelector('li button:last-child') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.deleteBook({ isbn: '1' }));
  });
});
