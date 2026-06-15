import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import * as BookActions from '../store/book.actions';
import { selectAllBooks, selectBooksError, selectBooksLoading } from '../store/book.selectors';
import { Book } from '../shared/book';

@Component({
  selector: 'bm-book-list',
  templateUrl: './book-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookList {
  private store = inject(Store);

  books = this.store.selectSignal(selectAllBooks);
  loading = this.store.selectSignal(selectBooksLoading);
  error = this.store.selectSignal(selectBooksError);

  constructor() {
    this.store.dispatch(BookActions.loadBooks());
  }

  addBook(isbn: HTMLInputElement, title: HTMLInputElement): void {
    if (!isbn.value || !title.value) {
      return;
    }
    this.store.dispatch(BookActions.createBook({ book: { isbn: isbn.value, title: title.value, rating: 0 } }));
    isbn.value = '';
    title.value = '';
  }

  rateUp(book: Book): void {
    const rating = Math.min((book.rating ?? 0) + 1, 5);
    this.store.dispatch(BookActions.updateBook({ book: { ...book, rating } }));
  }

  deleteBook(isbn: string): void {
    this.store.dispatch(BookActions.deleteBook({ isbn }));
  }

  clearError(): void {
    this.store.dispatch(BookActions.clearError());
  }
}
