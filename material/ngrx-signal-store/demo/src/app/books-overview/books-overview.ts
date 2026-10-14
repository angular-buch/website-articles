import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { newBook } from '../shared/book';
import { BookSignalStore } from '../book-signal-store';
import { BookCard } from '../book-card/book-card';

@Component({
  selector: 'app-books-overview',
  imports: [BookCard],
  templateUrl: './books-overview.html',
  styleUrl: './books-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksOverview {
  protected store = inject(BookSignalStore);

  addBook(isbn: HTMLInputElement, title: HTMLInputElement): void {
    if (!isbn.value || !title.value) {
      return;
    }
    this.store.addBook(newBook(isbn.value, title.value));
    isbn.value = '';
    title.value = '';
  }
}
