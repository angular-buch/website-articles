import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import { BookStore } from './shared/book-store';

describe('App', () => {
  it('erzeugt die App und zeigt die Bücher-Übersicht an', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: BookStore, useValue: { getAll: () => of([]) } }]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-books-overview')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Bücher');
  });
});
