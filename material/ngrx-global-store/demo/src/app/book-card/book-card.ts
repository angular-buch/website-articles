import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Book } from '../shared/book';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCard {
  readonly book = input.required<Book>();
  readonly like = output<Book>();
  readonly remove = output<string>();

  likeBook(): void {
    this.like.emit(this.book());
  }

  removeBook(): void {
    this.remove.emit(this.book().isbn);
  }
}
