import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BookList } from './book-list/book-list';

@Component({
  selector: 'bm-root',
  imports: [BookList],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
