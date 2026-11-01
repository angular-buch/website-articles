import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { BooksOverview } from './books-overview';
import { BookCard } from '../book-card/book-card';
import { BookStore } from '../shared/book-store';
import { Book } from '../shared/book';
import { b } from '../testing/book-factory';

function serviceMock(books: Book[], overrides: Partial<BookStore> = {}): Partial<BookStore> {
  return {
    getAll: () => of(books),
    create: (book: Book) => of(book),
    remove: () => of(undefined),
    ...overrides
  };
}

describe('BooksOverview (SignalStore)', () => {
  async function setup(mock: Partial<BookStore>) {
    await TestBed.configureTestingModule({
      imports: [BooksOverview],
      providers: [{ provide: BookStore, useValue: mock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(BooksOverview);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const firstCard = () => fixture.debugElement.query(By.directive(BookCard));
    return { fixture, el, firstCard };
  }

  it('rendert die geladenen Bücher als Karten', async () => {
    const { el } = await setup(serviceMock([b('1'), b('2')]));
    expect(el.querySelectorAll('app-book-card').length).toBe(2);
  });

  it('legt ein Buch an und leert die Felder', async () => {
    const { fixture, el } = await setup(serviceMock([b('1')]));
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '2';
    title.value = 'Neu';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('app-book-card').length).toBe(2);
    expect(isbn.value).toBe('');
  });

  it('entfernt ein Buch, wenn die Karte ein remove emittiert', async () => {
    const { fixture, el, firstCard } = await setup(serviceMock([b('1')]));
    firstCard().triggerEventHandler('remove', '1');
    await fixture.whenStable();
    expect(el.querySelectorAll('app-book-card').length).toBe(0);
  });

  it('markiert ein Buch als Favorit, wenn die Karte ein like emittiert', async () => {
    const book = b('1', 'Lieblingsbuch');
    const { fixture, el, firstCard } = await setup(serviceMock([book]));
    firstCard().triggerEventHandler('like', book);
    await fixture.whenStable();
    expect(el.querySelector('.favorites')?.textContent).toContain('Lieblingsbuch');
  });

  it('leert die Favoriten', async () => {
    const book = b('1', 'Lieblingsbuch');
    const { fixture, el, firstCard } = await setup(serviceMock([book]));
    firstCard().triggerEventHandler('like', book);
    await fixture.whenStable();
    (el.querySelector('.favorites button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.favorites')?.textContent).toContain('Noch keine Favoriten');
  });

  it('blendet eine Fehlermeldung beim Klick auf OK wieder aus', async () => {
    const { fixture, el } = await setup(serviceMock([], { getAll: () => throwError(() => new Error('Kaputt')) }));
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');

    (el.querySelector('.error button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(el.querySelector('.error')).toBeNull();
  });
});
