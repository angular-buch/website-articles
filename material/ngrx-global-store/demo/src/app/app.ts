import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BooksOverview } from './books-overview/books-overview';

@Component({
  selector: 'app-root',
  imports: [BooksOverview],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
