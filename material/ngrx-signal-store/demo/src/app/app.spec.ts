import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { BookApi } from './shared/book-api';

describe('App', () => {
  it('erzeugt die App und zeigt die Buchliste an', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: BookApi, useValue: { getAll: () => of([]) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1?.textContent).toContain('Books');
  });
});
