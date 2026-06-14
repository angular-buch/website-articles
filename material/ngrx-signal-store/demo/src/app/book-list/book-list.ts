import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BookStore } from '../book.store';
import { Book } from '../shared/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookList {
  protected store = inject(BookStore);

  addBook(isbn: string, title: string): void {
    if (!isbn || !title) {
      return;
    }
    this.store.addBook({ isbn, title, rating: 0 });
  }

  rateUp(book: Book): void {
    const rating = Math.min((book.rating ?? 0) + 1, 5);
    this.store.updateBook({ ...book, rating });
  }

  deleteBook(isbn: string): void {
    this.store.deleteBook(isbn);
  }
}
