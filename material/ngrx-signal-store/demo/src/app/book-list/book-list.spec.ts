import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BookList } from './book-list';
import { BookStoreService } from '../shared/book-store.service';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Title ${isbn}`, rating = 0): Book => ({ isbn, title, rating });

function serviceMock(books: Book[], overrides: Partial<BookStoreService> = {}): Partial<BookStoreService> {
  return {
    getAll: () => of(books),
    create: (book: Book) => of(book),
    update: (book: Book) => of(book),
    remove: () => of(undefined),
    ...overrides
  };
}

describe('BookList (SignalStore)', () => {
  async function setup(mock: Partial<BookStoreService>): Promise<ComponentFixture<BookList>> {
    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [{ provide: BookStoreService, useValue: mock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(BookList);
    await fixture.whenStable();
    return fixture;
  }

  it('rendert die vom Store geladenen Bücher', async () => {
    const fixture = await setup(serviceMock([b('1', 'Eins'), b('2', 'Zwei')]));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('li').length).toBe(2);
    expect(el.querySelector('li')?.textContent).toContain('Eins');
  });

  it('legt ein Buch an und leert die Felder', async () => {
    const fixture = await setup(serviceMock([b('1', 'Eins')]));
    const el = fixture.nativeElement as HTMLElement;
    const [isbn, title] = el.querySelectorAll<HTMLInputElement>('.add-form input');
    isbn.value = '2';
    title.value = 'Zwei';
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('li').length).toBe(2);
    expect(isbn.value).toBe('');
  });

  it('legt nichts an, wenn die Felder leer sind', async () => {
    const fixture = await setup(serviceMock([b('1', 'Eins')]));
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.add-form button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('li').length).toBe(1);
  });

  it('erhöht die Bewertung und deckelt sie bei 5', async () => {
    const fixture = await setup(serviceMock([b('1', 'Eins', 4)]));
    const el = fixture.nativeElement as HTMLElement;
    const rateButton = el.querySelector('li button:first-of-type') as HTMLButtonElement;

    rateButton.click(); // 4 -> 5
    await fixture.whenStable();
    expect(el.querySelector('li')?.textContent).toContain('★ 5');

    rateButton.click(); // bleibt bei 5
    await fixture.whenStable();
    expect(el.querySelector('li')?.textContent).toContain('★ 5');
  });

  it('entfernt ein Buch beim Klick auf Löschen', async () => {
    const fixture = await setup(serviceMock([b('1', 'Eins')]));
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('li button:last-child') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelectorAll('li').length).toBe(0);
  });

  it('blendet eine Fehlermeldung beim Klick auf OK wieder aus (clearError)', async () => {
    const fixture = await setup(serviceMock([], { getAll: () => throwError(() => new Error('Kaputt')) }));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('Kaputt');

    (el.querySelector('.error button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(el.querySelector('.error')).toBeNull();
  });
});
