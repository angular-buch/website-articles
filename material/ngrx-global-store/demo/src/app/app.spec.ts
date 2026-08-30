import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { App } from './app';
import { booksRoutes } from './books.routes';

describe('App', () => {
  it('erzeugt die App und zeigt die Bücher-Übersicht über den Router an', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(booksRoutes),
        provideStore(),
        provideEffects(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-books-overview')).toBeTruthy();
  });
});
