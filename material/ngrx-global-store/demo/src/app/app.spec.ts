import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { App } from './app';
import { selectAllBooks, selectBooksError, selectBooksLoading } from './store/book.selectors';

describe('App', () => {
  it('erzeugt die App und zeigt die Buchliste an', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllBooks, value: [] },
            { selector: selectBooksLoading, value: false },
            { selector: selectBooksError, value: null }
          ]
        })
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1?.textContent).toContain('Books');
  });
});
