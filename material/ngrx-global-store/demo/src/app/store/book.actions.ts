import { createAction, props } from '@ngrx/store';
import { Book } from '../shared/book';

export const loadBooks = createAction('[Book] Load Books');
export const loadBooksSuccess = createAction('[Book] Load Books Success', props<{ data: Book[] }>());
export const loadBooksFailure = createAction('[Book] Load Books Failure', props<{ error: string }>());

export const createBook = createAction('[Book] Create Book', props<{ book: Book }>());
export const createBookSuccess = createAction('[Book] Create Book Success', props<{ book: Book }>());
export const createBookFailure = createAction('[Book] Create Book Failure', props<{ error: string }>());

export const updateBook = createAction('[Book] Update Book', props<{ book: Book }>());
export const updateBookSuccess = createAction('[Book] Update Book Success', props<{ book: Book }>());
export const updateBookFailure = createAction('[Book] Update Book Failure', props<{ error: string }>());

export const deleteBook = createAction('[Book] Delete Book', props<{ isbn: string }>());
export const deleteBookSuccess = createAction('[Book] Delete Book Success', props<{ isbn: string }>());
export const deleteBookFailure = createAction('[Book] Delete Book Failure', props<{ error: string }>());
