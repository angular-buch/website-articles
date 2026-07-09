import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BooksOverview } from './books-overview';
import { BookStore } from '../shared/book-store';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Titel ${isbn}`): Book => ({
  isbn,
  title,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

function serviceMock(books: Book[], overrides: Partial<BookStore> = {}): Partial<BookStore> {
  return {
    getAll: () => of(books),
    create: (book: Book) => of(book),
    remove: () => of(undefined),
    ...overrides
  };
}

describe('BooksOverview (SignalStore)', () => {
  async function setup(mock: Partial<BookStore>): Promise<ComponentFixture<BooksOverview>> {
    await TestBed.configureTestingModule({
      imports: [BooksOverview],
      providers: [{ provide: BookStore, useValue: mock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(BooksOverview);
    await fixture.whenStable();
    return fixture;
  }

  it('rendert die geladenen Bücher als Karten', async () => {
    const fixture = await setup(serviceMock([b('1'), b('2')]));
    expect(fixture.nativeElement.querySelectorAll('app-book-card').length).toBe(2);
  });

  it('legt ein Buch an und leert die Felder', async () => {
    const fixture = await setup(serviceMock([b('1')]));
    const el = fixture.nativeElement as HTMLElement;
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '2';
    title.value = 'Neu';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('app-book-card').length).toBe(2);
    expect(isbn.value).toBe('');
  });

  it('entfernt ein Buch beim Klick auf Löschen', async () => {
    const fixture = await setup(serviceMock([b('1')]));
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('app-book-card .book-card__footer button');
    (buttons[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('app-book-card').length).toBe(0);
  });

  it('markiert ein Buch als Favorit', async () => {
    const fixture = await setup(serviceMock([b('1', 'Lieblingsbuch')]));
    const el = fixture.nativeElement as HTMLElement;
    const likeButton = el.querySelector('app-book-card .book-card__footer button') as HTMLButtonElement;
    likeButton.click();
    await fixture.whenStable();
    expect(el.querySelector('.favorites')?.textContent).toContain('Lieblingsbuch');
  });

  it('leert die Favoriten', async () => {
    const fixture = await setup(serviceMock([b('1', 'Lieblingsbuch')]));
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('app-book-card .book-card__footer button') as HTMLButtonElement).click();
    await fixture.whenStable();
    (el.querySelector('.favorites button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.favorites')?.textContent).toContain('Noch keine Favoriten');
  });

  it('blendet eine Fehlermeldung beim Klick auf OK wieder aus', async () => {
    const fixture = await setup(serviceMock([], { getAll: () => throwError(() => new Error('Kaputt')) }));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');

    (el.querySelector('.error button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(el.querySelector('.error')).toBeNull();
  });
});
