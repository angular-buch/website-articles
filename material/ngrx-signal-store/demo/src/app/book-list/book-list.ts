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

  addBook(isbn: HTMLInputElement, title: HTMLInputElement): void {
    if (!isbn.value || !title.value) {
      return;
    }
    this.store.addBook({ isbn: isbn.value, title: title.value, rating: 0 });
    isbn.value = '';
    title.value = '';
  }

  rateUp(book: Book): void {
    const rating = Math.min((book.rating ?? 0) + 1, 5);
    this.store.updateBook({ ...book, rating });
  }

  deleteBook(isbn: string): void {
    this.store.deleteBook(isbn);
  }
}
