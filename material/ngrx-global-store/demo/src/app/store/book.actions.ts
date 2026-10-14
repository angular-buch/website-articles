import { createAction, props } from '@ngrx/store';
import { Book } from '../shared/book';

// Laden
export const loadBooks = createAction('[Book] Load Books');
export const loadBooksSuccess = createAction('[Book] Load Books Success', props<{ data: Book[] }>());
export const loadBooksFailure = createAction('[Book] Load Books Failure', props<{ error: string }>());

// Anlegen
export const createBook = createAction('[Book] Create Book', props<{ book: Book }>());
export const createBookSuccess = createAction('[Book] Create Book Success', props<{ book: Book }>());
export const createBookFailure = createAction('[Book] Create Book Failure', props<{ error: string }>());

// Löschen
export const deleteBook = createAction('[Book] Delete Book', props<{ isbn: string }>());
export const deleteBookSuccess = createAction('[Book] Delete Book Success', props<{ isbn: string }>());
export const deleteBookFailure = createAction('[Book] Delete Book Failure', props<{ error: string }>());

export const clearError = createAction('[Book] Clear Error');

// Favoriten – reiner Client-State, ganz ohne Seiteneffekt
export const likeBook = createAction('[Book] Like Book', props<{ book: Book }>());
export const clearLikedBooks = createAction('[Book] Clear Liked Books');
