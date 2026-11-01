import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import * as BookActions from '../store/book.actions';
import {
  selectAllBooks,
  selectBooksError,
  selectBooksLoading,
  selectLikedBooks
} from '../store/book.selectors';
import { Book, newBook } from '../shared/book';
import { BookCard } from '../book-card/book-card';

@Component({
  selector: 'app-books-overview',
  imports: [BookCard],
  templateUrl: './books-overview.html',
  styleUrl: './books-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksOverview {
  private store = inject(Store);

  books = this.store.selectSignal(selectAllBooks);
  loading = this.store.selectSignal(selectBooksLoading);
  error = this.store.selectSignal(selectBooksError);
  likedBooks = this.store.selectSignal(selectLikedBooks);

  constructor() {
    this.store.dispatch(BookActions.loadBooks());
  }

  addBook(isbn: HTMLInputElement, title: HTMLInputElement): void {
    if (!isbn.value || !title.value) {
      return;
    }
    this.store.dispatch(BookActions.createBook({ book: newBook(isbn.value, title.value) }));
    isbn.value = '';
    title.value = '';
  }

  deleteBook(isbn: string): void {
    this.store.dispatch(BookActions.deleteBook({ isbn }));
  }

  likeBook(book: Book): void {
    this.store.dispatch(BookActions.likeBook({ book }));
  }

  clearLikedBooks(): void {
    this.store.dispatch(BookActions.clearLikedBooks());
  }

  clearError(): void {
    this.store.dispatch(BookActions.clearError());
  }
}
