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
import { BookStore } from './shared/book-store';
import { toMessage } from './shared/error-message';

type BookState = {
  books: Book[];
  loading: boolean;
  error: string | null;
  likedBooks: Book[];
};

const initialState: BookState = {
  books: [],
  loading: false,
  error: null,
  likedBooks: []
};

export const BookSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books, likedBooks }) => ({
    booksCount: computed(() => books().length),
    likedCount: computed(() => likedBooks().length)
  })),
  withMethods((store, bookStore = inject(BookStore)) => ({
    clearError(): void {
      patchState(store, { error: null });
    },

    // Favoriten – reiner Client-State, dedupliziert, ganz ohne Seiteneffekt.
    likeBook(book: Book): void {
      if (!store.likedBooks().some(b => b.isbn === book.isbn)) {
        patchState(store, state => ({ likedBooks: [...state.likedBooks, book] }));
      }
    },
    clearLikedBooks(): void {
      patchState(store, { likedBooks: [] });
    },

    // Lesen: switchMap – eine neue Anfrage macht die alte überflüssig.
    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          bookStore.getAll().pipe(
            tapResponse({
              next: books => patchState(store, { books }),
              error: (err: unknown) => patchState(store, { error: toMessage(err) }),
              finalize: () => patchState(store, { loading: false })
            })
          )
        )
      )
    ),

    // Schreiben: concatMap – laufende Requests werden nicht abgebrochen.
    addBook: rxMethod<Book>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap(book =>
          bookStore.create(book).pipe(
            tapResponse({
              next: created =>
                patchState(store, state => ({ books: [...state.books, created] })),
              error: (err: unknown) => patchState(store, { error: toMessage(err) })
            })
          )
        )
      )
    ),
    deleteBook: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap(isbn =>
          bookStore.remove(isbn).pipe(
            tapResponse({
              next: () =>
                patchState(store, state => ({
                  books: state.books.filter(b => b.isbn !== isbn)
                })),
              error: (err: unknown) => patchState(store, { error: toMessage(err) })
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
