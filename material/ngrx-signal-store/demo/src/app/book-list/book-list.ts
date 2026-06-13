import { Component, inject } from '@angular/core';
import { BookStore } from '../book.store';
import { Book } from '../shared/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html'
})
export class BookList {
  protected store = inject(BookStore);

  deleteBook(isbn: string): void {
    this.store.deleteBook(isbn);
  }

  addBook(book: Book): void {
    this.store.addBook(book);
  }
}
