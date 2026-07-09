import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Book } from '../shared/book';
import { BookSignalStore } from '../book.store';
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
    this.store.addBook(this.#newBook(isbn.value, title.value));
    isbn.value = '';
    title.value = '';
  }

  deleteBook(isbn: string): void {
    this.store.deleteBook(isbn);
  }

  likeBook(book: Book): void {
    this.store.likeBook(book);
  }

  // Ein vollständiges Buch mit sinnvollen Defaults, damit die echte API den POST annimmt.
  #newBook(isbn: string, title: string): Book {
    return {
      isbn,
      title,
      authors: ['Unbekannt'],
      description: 'Über die Demo angelegt.',
      imageUrl: 'https://cdn.ng-buch.de/cover-placeholder.png',
      createdAt: new Date().toISOString()
    };
  }
}
