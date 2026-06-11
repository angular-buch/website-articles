---
title: "State Management mit NgRx – Teil 2: Global Store mit NgRx"
published: "2026-06-11"
lastModified: "2026-06-11"
hidden: true
---

**Zusatzmaterial zum Buch *Angular: Das große Praxisbuch (4. Auflage)* von Ferdinand Malcher, Danny Koppenhagen und Johannes Hoppe.**

Dieser Artikel ist **Teil 2** einer zweiteiligen Serie zum Thema State Management mit NgRx.

- Teil 1: Wie kommen wir zu zentralem State Management? → [zum Artikel](/material/ngrx-intro)
- Teil 2: Global Store mit NgRx (dieser Artikel)

[[toc]]

Im ersten Teil haben wir ein eigenes Modell für zentrales State Management entwickelt und die Grundprinzipien von Redux kennengelernt. Jetzt setzen wir das Ganze mit **NgRx** in die Praxis um.

## NgRx: Reactive Extensions for Angular

NgRx ist ein Set von Bibliotheken, das Redux-Architektur mit den reaktiven Möglichkeiten von RxJS in Angular integriert.

### Projekt vorbereiten

Wir arbeiten mit der BookMonkey-Variante `16e-ngrx`.

Installiere die notwendigen Pakete:

```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### Store einrichten

Im `AppModule` binden wir den Store ein:

```ts
// app.module.ts
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

@NgModule({
  imports: [
    // ...
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode()
    })
  ],
  // ...
})
export class AppModule { }
```

### Feature anlegen

Wir legen für das Books-Feature einen eigenen Store-Bereich an.

```ts
// books/store/book.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { Book } from '../../shared/book';
import * as BookActions from './book.actions';

export const bookFeatureKey = 'book';

export interface State {
  books: Book[];
  loading: boolean;
}

export const initialState: State = {
  books: [],
  loading: false
};

export const reducer = createReducer(
  initialState,

  on(BookActions.loadBooks, (state): State => {
    return { ...state, loading: true };
  }),

  on(BookActions.loadBooksSuccess, (state, action): State => {
    return {
      ...state,
      books: action.data,
      loading: false
    };
  }),

  on(BookActions.loadBooksFailure, (state): State => {
    return { ...state, loading: false };
  })
);
```

### Actions definieren

```ts
// books/store/book.actions.ts
import { createAction, props } from '@ngrx/store';
import { Book } from '../../shared/book';

export const loadBooks = createAction('[Book] Load Books');

export const loadBooksSuccess = createAction(
  '[Book] Load Books Success',
  props<{ data: Book[] }>()
);

export const loadBooksFailure = createAction(
  '[Book] Load Books Failure',
  props<{ error: string }>()
);
```

### Reducer im Feature-Module registrieren

```ts
// books/books.module.ts
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromBook from './store/book.reducer';
import { BookEffects } from './store/book.effects';

@NgModule({
  imports: [
    // ...
    StoreModule.forFeature(fromBook.bookFeatureKey, fromBook.reducer),
    EffectsModule.forFeature([BookEffects])
  ]
})
export class BooksModule { }
```

### Selectors schreiben

```ts
// books/store/book.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromBook from './book.reducer';

export const selectBookState = createFeatureSelector<fromBook.State>(
  fromBook.bookFeatureKey
);

export const selectBooksLoading = createSelector(
  selectBookState,
  state => state.loading
);

export const selectAllBooks = createSelector(
  selectBookState,
  state => state.books
);
```

### Komponente mit Store verbinden

```ts
// books/book-list/book-list.component.ts
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Book } from '../../shared/book';
import { loadBooks } from '../store/book.actions';
import { selectAllBooks, selectBooksLoading } from '../store/book.selectors';

@Component({
  selector: 'bm-book-list',
  templateUrl: './book-list.component.html'
})
export class BookListComponent {
  books$: Observable<Book[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    this.books$ = this.store.select(selectAllBooks);
    this.loading$ = this.store.select(selectBooksLoading);

    this.store.dispatch(loadBooks());
  }
}
```

Template:

```html
<h1>Books</h1>
<ul *ngIf="books$ | async as books">
  <li *ngFor="let book of books">
    <bm-book-list-item [book]="book"></bm-book-list-item>
  </li>
</ul>

<div class="loader" *ngIf="loading$ | async">Loading ...</div>
```

### Effects für HTTP-Seiteneffekte

```ts
// books/store/book.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as BookActions from './book.actions';
import { BookStoreService } from '../../shared/book-store.service';

@Injectable()
export class BookEffects {

  loadBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BookActions.loadBooks),
      switchMap(() =>
        this.service.getAll().pipe(
          map(data => BookActions.loadBooksSuccess({ data })),
          catchError(error => of(BookActions.loadBooksFailure({ error: error.message })))
        )
      )
    );
  });

  constructor(
    private actions$: Actions,
    private service: BookStoreService
  ) {}
}
```

### Debugging mit Redux DevTools

Nach der Installation von `StoreDevtoolsModule` kannst du die Redux DevTools im Browser nutzen. Du siehst alle dispatched Actions, den State vor und nach der Action und kannst Time-Travel-Debugging betreiben.

### Weiterführende Themen

Im Buch werden außerdem behandelt:

- `createActionGroup` für gruppierte Actions
- Entity-Management mit `@ngrx/entity`
- Testing von Reducers, Selectors und Effects (auch mit Marble-Tests)
- `@ngrx/component` und `@ngrx/component-store`
- Facades zur Abstraktion des Stores

---

**Zurück zu Teil 1:** [Wie kommen wir zu zentralem State Management?](/material/ngrx-intro)

*Dieser Artikel ist ein möglichst literaler Port des Kapitels „State Management mit Redux und NgRx“ aus dem Buch „Angular: Das große Praxisbuch (4. Auflage)“.*
```