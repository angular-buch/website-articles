import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { App } from './app';
import {
  selectAllBooks,
  selectBooksError,
  selectBooksLoading,
  selectLikedBooks
} from './store/book.selectors';

describe('App', () => {
  it('erzeugt die App und zeigt die Bücher-Übersicht an', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllBooks, value: [] },
            { selector: selectLikedBooks, value: [] },
            { selector: selectBooksLoading, value: false },
            { selector: selectBooksError, value: null }
          ]
        })
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-books-overview')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Bücher');
  });
});
