import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import * as BookActions from '../store/book.actions';
import { selectAllBooks, selectBooksError, selectBooksLoading } from '../store/book.selectors';
import { Book } from '../shared/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html'
})
export class BookList {
  private store = inject(Store);

  books = this.store.selectSignal(selectAllBooks);
  loading = this.store.selectSignal(selectBooksLoading);
  error = this.store.selectSignal(selectBooksError);

  constructor() {
    this.store.dispatch(BookActions.loadBooks());
  }

  deleteBook(isbn: string): void {
    this.store.dispatch(BookActions.deleteBook({ isbn }));
  }

  addBook(book: Book): void {
    this.store.dispatch(BookActions.createBook({ book }));
  }
}
