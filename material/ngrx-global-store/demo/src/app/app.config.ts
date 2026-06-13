import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import * as fromBook from './store/book.reducer';
import { BookEffects } from './store/book.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore(),
    provideState(fromBook.bookFeatureKey, fromBook.reducer),
    provideEffects(BookEffects)
  ]
};
