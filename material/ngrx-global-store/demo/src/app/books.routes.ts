import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import * as fromBook from './store/book.reducer';
import { BookEffects } from './store/book.effects';
import { BooksOverview } from './books-overview/books-overview';

export const booksRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(fromBook.bookFeatureKey, fromBook.reducer),
      provideEffects(BookEffects)
    ],
    component: BooksOverview
  }
];
