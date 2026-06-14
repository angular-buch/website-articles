import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as BookActions from './book.actions';
import { BookStoreService } from '../shared/book-store.service';
import { toMessage } from '../shared/error-message';

@Injectable()
export class BookEffects {
  private actions$ = inject(Actions);
  private service = inject(BookStoreService);

  // Lesen: switchMap – eine neue Anfrage macht die alte überflüssig.
  loadBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.loadBooks),
      switchMap(() =>
        this.service.getAll().pipe(
          map(data => BookActions.loadBooksSuccess({ data })),
          catchError((error: unknown) => of(BookActions.loadBooksFailure({ error: toMessage(error) })))
        )
      )
    )
  );

  // Schreiben: concatMap – laufende Requests werden nicht abgebrochen.
  createBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.createBook),
      concatMap(({ book }) =>
        this.service.create(book).pipe(
          map(created => BookActions.createBookSuccess({ book: created })),
          catchError((error: unknown) => of(BookActions.createBookFailure({ error: toMessage(error) })))
        )
      )
    )
  );

  updateBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.updateBook),
      concatMap(({ book }) =>
        this.service.update(book).pipe(
          map(updated => BookActions.updateBookSuccess({ book: updated })),
          catchError((error: unknown) => of(BookActions.updateBookFailure({ error: toMessage(error) })))
        )
      )
    )
  );

  deleteBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.deleteBook),
      concatMap(({ isbn }) =>
        this.service.remove(isbn).pipe(
          map(() => BookActions.deleteBookSuccess({ isbn })),
          catchError((error: unknown) => of(BookActions.deleteBookFailure({ error: toMessage(error) })))
        )
      )
    )
  );
}
