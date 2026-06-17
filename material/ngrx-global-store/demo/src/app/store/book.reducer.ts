import { createReducer, on } from '@ngrx/store';
import { Book } from '../shared/book';
import * as BookActions from './book.actions';

export const bookFeatureKey = 'book';

export interface State {
  books: Book[];
  loading: boolean;
  error: string | null;
  likedBooks: Book[];
}

export const initialState: State = {
  books: [],
  loading: false,
  error: null,
  likedBooks: []
};

export const reducer = createReducer(
  initialState,

  on(BookActions.loadBooks, (state): State => ({ ...state, loading: true, error: null })),
  on(BookActions.loadBooksSuccess, (state, action): State => ({
    ...state,
    books: action.data,
    loading: false
  })),
  on(BookActions.loadBooksFailure, (state, action): State => ({
    ...state,
    loading: false,
    error: action.error
  })),

  on(BookActions.clearError, (state): State => ({ ...state, error: null })),

  // Schreibvorgänge: beim Auslösen eine alte Fehlermeldung zurücksetzen.
  on(BookActions.createBook, BookActions.deleteBook, (state): State => ({ ...state, error: null })),

  on(BookActions.createBookSuccess, (state, action): State => ({
    ...state,
    books: [...state.books, action.book]
  })),
  on(BookActions.deleteBookSuccess, (state, action): State => ({
    ...state,
    books: state.books.filter(b => b.isbn !== action.isbn)
  })),

  on(
    BookActions.createBookFailure,
    BookActions.deleteBookFailure,
    (state, action): State => ({ ...state, error: action.error })
  ),

  // Favoriten – reiner Client-State, dedupliziert anhand der ISBN, kein Effect nötig.
  on(BookActions.likeBook, (state, action): State =>
    state.likedBooks.some(b => b.isbn === action.book.isbn)
      ? state
      : { ...state, likedBooks: [...state.likedBooks, action.book] }
  ),
  on(BookActions.clearLikedBooks, (state): State => ({ ...state, likedBooks: [] }))
);
