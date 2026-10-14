import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCard } from './book-card';
import { Book } from '../shared/book';
import { b } from '../testing/book-factory';

describe('BookCard', () => {
  async function setup(book: Book) {
    await TestBed.configureTestingModule({ imports: [BookCard] }).compileComponents();
    const fixture: ComponentFixture<BookCard> = TestBed.createComponent(BookCard);
    fixture.componentRef.setInput('book', book);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const buttonByText = (text: string) =>
      Array.from(el.querySelectorAll('button')).find(btn => btn.textContent?.includes(text));
    return { fixture, el, buttonByText };
  }

  it('zeigt Titel, Autor:innen und ISBN an', async () => {
    const { el } = await setup(b('1', 'Eins'));
    expect(el.textContent).toContain('Eins');
    expect(el.textContent).toContain('Autor');
    expect(el.textContent).toContain('ISBN 1');
  });

  it('emittiert like mit dem Buch beim Klick auf "Favorit"', async () => {
    const book = b('1');
    const { fixture, buttonByText } = await setup(book);
    let liked: Book | undefined;
    fixture.componentInstance.like.subscribe(value => (liked = value));

    buttonByText('Favorit')?.click();

    expect(liked).toEqual(book);
  });

  it('emittiert remove mit der ISBN beim Klick auf "Löschen"', async () => {
    const { fixture, buttonByText } = await setup(b('1'));
    let removed: string | undefined;
    fixture.componentInstance.remove.subscribe(value => (removed = value));

    buttonByText('Löschen')?.click();

    expect(removed).toBe('1');
  });
});
