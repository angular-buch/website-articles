import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { MockInstance } from 'vitest';

import { BookList } from './book-list';
import * as BookActions from '../store/book.actions';
import { selectAllBooks, selectBooksError, selectBooksLoading } from '../store/book.selectors';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Title ${isbn}`): Book => ({ isbn, title, rating: 0 });

interface Setup {
  fixture: ComponentFixture<BookList>;
  dispatch: MockInstance<(action: unknown) => void>;
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
    return { fixture, dispatch };
  }

  it('dispatcht loadBooks beim Erzeugen', async () => {
    const { dispatch } = await setup();
    expect(dispatch).toHaveBeenCalledWith(BookActions.loadBooks());
  });

  it('rendert die Buchliste', async () => {
    const { fixture } = await setup([b('1', 'Eins'), b('2', 'Zwei')]);
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Eins');
  });

  it('zeigt den Ladeindikator', async () => {
    const { fixture } = await setup([], true);
    expect(fixture.nativeElement.querySelector('.loader')).toBeTruthy();
  });

  it('zeigt eine Fehlermeldung', async () => {
    const { fixture } = await setup([], false, 'Kaputt');
    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('Kaputt');
  });

  it('dispatcht deleteBook beim Klick auf Löschen', async () => {
    const { fixture, dispatch } = await setup([b('1')]);
    dispatch.mockClear();
    const deleteButton = fixture.nativeElement.querySelector('li button:last-child') as HTMLButtonElement;
    deleteButton.click();
    expect(dispatch).toHaveBeenCalledWith(BookActions.deleteBook({ isbn: '1' }));
  });
});
