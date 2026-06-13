import { computed, inject } from '@angular/core';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Book } from './shared/book';
import { BookStoreService } from './shared/book-store.service';

type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null
};

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length)
  })),
  withMethods((store, service = inject(BookStoreService)) => ({
    clearError(): void {
      patchState(store, { error: null });
    },
    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.getAll().pipe(
            tapResponse({
              next: books => patchState(store, { books }),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message }),
              finalize: () => patchState(store, { loading: false })
            })
          )
        )
      )
    ),
    addBook: rxMethod<Book>(
      pipe(
        concatMap(book =>
          service.create(book).pipe(
            tapResponse({
              next: created =>
                patchState(store, state => ({ books: [...state.books, created] })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    ),
    updateBook: rxMethod<Book>(
      pipe(
        concatMap(book =>
          service.update(book).pipe(
            tapResponse({
              next: updated =>
                patchState(store, state => ({
                  books: state.books.map(b => (b.isbn === updated.isbn ? updated : b))
                })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    ),
    deleteBook: rxMethod<string>(
      pipe(
        concatMap(isbn =>
          service.remove(isbn).pipe(
            tapResponse({
              next: () =>
                patchState(store, state => ({
                  books: state.books.filter(b => b.isbn !== isbn)
                })),
              error: (err: { message: string }) =>
                patchState(store, { error: err.message })
            })
          )
        )
      )
    )
  })),
  withHooks({
    onInit(store) {
      store.loadBooks();
    }
  })
);
