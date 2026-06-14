import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BookList } from './book-list';
import { BookStoreService } from '../shared/book-store.service';
import { Book } from '../shared/book';

const b = (isbn: string, title = `Title ${isbn}`): Book => ({ isbn, title, rating: 0 });

describe('BookList (SignalStore)', () => {
  async function setup(books: Book[] = []): Promise<ComponentFixture<BookList>> {
    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        {
          provide: BookStoreService,
          useValue: {
            getAll: () => of(books),
            create: (book: Book) => of(book),
            update: (book: Book) => of(book),
            remove: () => of(undefined)
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BookList);
    await fixture.whenStable();
    return fixture;
  }

  it('rendert die vom Store geladenen Bücher', async () => {
    const fixture = await setup([b('1', 'Eins'), b('2', 'Zwei')]);
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Eins');
  });

  it('entfernt ein Buch beim Klick auf Löschen', async () => {
    const fixture = await setup([b('1', 'Eins')]);
    const deleteButton = fixture.nativeElement.querySelector('li button:last-child') as HTMLButtonElement;

    deleteButton.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(0);
  });
});
