---
title: "NgRx v8 – das neue Major-Release ist da"
author: Ferdinand Malcher
mail: mail@fmalcher.de
published: 2019-06-07
lastModified: 2019-06-07
keywords:
  - NgRx
  - Redux
  - Angular
  - State Management
language: de
header: ngrx8.jpg
sticky: false
hidden: false
---

Pünktlich zum Pfingstwochenende wurde am 7. Juni 2019 die neue Major-Version von NgRx veröffentlicht!
Das neue Release 8.0.0 bringt einige Neuerungen mit sich, die vor allem die Produktivität des Entwicklers verbessern sollen.
Das wahrscheinlich wichtigste Feature sind die neuen Creator-Funktionen für Actions, Reducer und Effects.
Dazu kommt eine Reihe von kleineren Features, die wir in diesem Blogartikel vorstellen möchten.

Lesen Sie dazu auch den offiziellen [V8 Migration Guide](https://ngrx.io/guide/migration/v8) in der NgRx-Dokumentation.


## Update auf NgRx 8

Um eine bestehende Anwendung auf das neue NgRx 8 zu aktualisieren, wird ein Update-Skript für die Angular CLI bereitgestellt:

```bash
ng update @ngrx/store
```

Das Beispielprojekt [`book-monkey3-ngrx`](https://github.com/angular-buch/book-monkey3-ngrx) aus dem Angular-Buch haben wir auf diese Weise ebenfalls aktualisiert.


## Creator-Funktionen für Actions, Reducer und Effects

Ein großer Kritikpunkt an NgRx war seine Verbosität: Um die Features der Bibliothek zu nutzen, musste verhältnismäßig viel Code geschrieben werden.
Ein Beispiel sind *Actions*, die stets aus einem String-Enum, einer Klasse und einem exportierten Union-Type bestehen:

```typescript
export enum BookActionTypes {
  LoadBooks = '[Book] Load Books',
  LoadBooksSuccess = '[Book] Load Books Success'
}

export class LoadBooks implements Action {
  readonly type = BookActionTypes.LoadBooks;
}

export class LoadBooksSuccess implements Action {
  readonly type = BookActionTypes.LoadBooksSuccess;
  constructor(public payload: { books: Book[] }) { }
}

export type BookActions = LoadBooks | LoadBooksSuccess;
```

Bei der Umsetzung dieses Patterns kann man Fehler machen: Vergisst oder vertauscht man ein Detail, so gibt es später einen Fehler, der nicht immer leicht zu erkennen ist. Erstellt man z.B. eine weitere Action durch Copy & Paste und versäumt, es den Type anzupassen – so ergibt sich ein schwer zu identifizierender Bug:

```typescript
// vorher – Achtung Fehler!
export class LoadBookSuccess implements Action {
  readonly type = BookActionTypes.LoadBooksSuccess;
  constructor(public payload: { book: Book }) { }
}
```

Am meisten fällt aber die Menge an Code auf: Das Anlegen einer Action ist vergleichsweise aufwendig.

Um dieses Problem zu lösen, wurden aus der Commmunity heraus verschiedene Bibliotheken entwickelt, um die Erzeugung von Actions (und Reducern und Effects) ausdrucksstärker zu gestalten – darunter die Projekte [`ts-action`](https://github.com/cartant/ts-action/blob/master/packages/ts-action/README.md) und [`ngrx-ducks`](https://github.com/co-IT/ngrx-ducks).
Die Ideen von `ts-action` wurden mit dem neuen Release schließlich fest in NgRx integriert.

In Anlehnung an die Funktion `createSelector()` zum Erstellen von Selektoren kommen nun die neuen Funktionen `createAction()`, `createReducer()` und `createEffect()` hinzu, um die Implementierung von Actions, Reducern und Effects zu vereinfachen.
Wir möchten einmal alle Bausteine in alter und neuer Schreibweise gegenüberstellen.

Das Beispielprojekt `book-monkey3-ngrx` haben wir [auf dem separaten Branch `ng8creators`](https://github.com/angular-buch/book-monkey3-ngrx/tree/ng8creators) bereits auf die neue API migriert, sodass Sie den Code am Beispiel nachvollziehen können.


### Schematics: Code mit Creator-Funktionen generieren

Obwohl die neuen Funktionen nun fest in NgRx integriert sind, müssen Sie keinesfalls sofort umsteigen – Sie können weiterhin den herkömmlichen Weg verwenden.
Auch in den Schematics zu NgRx versteckt sich das neue Feature hinter einem Flag.
Möchten Sie Code mit Creator-Funktionen erzeugen, können Sie die Option `--creators` einsetzen:

```bash
ng g action foo --creators
ng g reducer foo --creators
ng g effect foo --creators

ng g feature foo --creators
```


### Actions mit `createAction()`

Zum Anlegen einer Action waren bisher stets ein Eintrag im Enum für den Action-Typen, eine Action-Creator-Klasse und ein Eintrag im exportierten Union-Type nötig:

```typescript
// vorher
import { Action } from '@ngrx/store';

export enum BookActionTypes {
  LoadBooks = '[Book] Load Books',
  LoadBooksSuccess = '[Book] Load Books Success'
}

export class LoadBooks implements Action {
  readonly type = BookActionTypes.LoadBooks;
}

export class LoadBooksSuccess implements Action {
  readonly type = BookActionTypes.LoadBooksSuccess;
  constructor(public payload: { books: Book[] }) { }
}

export type BookActions = LoadBooks | LoadBooksSuccess;
```

Diese drei Bestandteile werden mit `createAction()` in einem einzigen Aufruf kombiniert.
Die Struktur des Payloads wird mittels Typparameter über die Funktion `props()` definiert.

```typescript
// nachher
import { createAction, props } from '@ngrx/store';

export const loadBooks = createAction('[Book] Load Books');

export const loadBooksSuccess = createAction(
  '[Book] Load Books Success',
  props<{ books: Book[] }>()
);
```

#### Struktur des Payloads

Bitte beachten Sie, dass die Payload-Propertys direkt in das Action-Objekt integriert werden – die Daten werden nicht automatisch in ein Unterproperty `payload` geschachtelt.
Die Action `LoadBooksSuccess` hat also in diesem Beispiel die folgende Struktur:

```typescript
{
  type: '[Book] Load Books Success',
  books: Book[]
}
```

Womöglich haben Sie den `payload` mittlerweile lieb gewonnen – oder Sie haben bestehenden Code, der aufwendig migriert werden müsste.
Natürlich können Sie auch weiterhin mit dem alten Property arbeiten, wenn Sie den Type entsprechend definieren:

```typescript
export const loadBooksSuccess = createAction(
  '[Book] Load Books Success',
  props<{ payload: { books: Book[] } }>()
);
```

#### Action dispatchen

Um eine Action zu dispatchen, musste bisher eine Instanz der Action-Klasse erstellt werden.
Mit `createAction()` verkürzt sich diese Schreibweise zu einem einfachen Funktionsaufruf:

```typescript
// vorher
this.store.dispatch(new LoadBook(isbn));

// nachher
this.store.dispatch(loadBook(isbn));
```


### Reducer mit `createReducer()`

Ein Reducer entscheidet anhand einer eintreffenden Action, in welcher Weise der aktuelle State neu berechnet werden muss.
Für diese Unterscheidung wird traditionell im Reducer ein *switch/case*-Statement eingesetzt, um auf bestimmte Action-Typen zu reagieren.
Diese Lösung ist pragmatisch, erfordert aber einiges an Aufmerksamkeit und Vorwissen: Wir können nicht die Action-Klasse zur Unterscheidung verwenden, sondern nur den Action-*Typ*.
Wichtig ist hier besonders, nicht den `default`-Fall zu vergessen, da sonst das System nicht korrekt funktioniert.

```typescript
// vorher – Achtung Fehler!
export function reducer(state = initialState, action: BookActions): State {
  switch (action.type) {

    case BookActionTypes.LoadBooks: {
      return { ...state, loading: true };
    }

    case BookActionTypes.LoadBooksSuccess: {
      return {
        ...state,
        books: action.payload.books,
        loading: false
      };
    }
    
    // default vergessen! :-(
}
```

Mit NgRx 8 und der neuen Funktion `createReducer()` wird diese Schreibweise verkürzt und auf die wesentlichen Bestandteile reduziert:

```typescript
// nachher
import { createReducer, on } from '@ngrx/store';
import * as BookActions from '../actions/book.actions';

const bookReducer = createReducer(
  initialState,

  on(BookActions.loadBooks, state => {
    return { ...state, loading: true };
  }),

  on(BookActions.loadBooksSuccess, (state, action) => {
    return {
      ...state,
      books: action.books,
      loading: false
    };
  })
);

export function reducer(state: State | undefined, action: Action): State {
  return bookReducer(state, action);
}
```

Der Import `BookActions` stellt alle exportierten Actions zur Verfügung, die zuvor mithilfe von `createAction()` definiert wurden.
Beachten Sie auch, dass wir aufgrund der neuen Struktur den Payload der Action nicht mehr aus dem Property `payload` beziehen, sondern direkt aus dem Action-Objekt.

### Effects mit `createEffect()`

Der Vollständigkeit halber wird auch für Effects eine Creator-Funktion bereitgestellt.
Damit wird im Wesentlichen der Decorator `@Effect()` eingespart.

```typescript
// vorher
import { Actions, ofType, Effect } from '@ngrx/effects';

@Injectable()
export class BookEffects {
  
  @Effect()
  loadBooks$ = this.actions$.pipe(
    ofType(BookActionTypes.LoadBooks),
    switchMap(() =>
      this.bs.getAll().pipe(
        map(books => new LoadBooksSuccess({ books })),
        catchError(error => of(new LoadBooksFailure({ error }))))
    )
  );

  constructor(
    private actions$: Actions<BookActions>,
    private bs: BookStoreService,
  ) {}
}
```

```typescript
// nachher
import { Actions, ofType, createEffect } from '@ngrx/effects';
import * as BookActions from '../actions/book.actions';

@Injectable()
export class BookEffects {
  
  loadBooks$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.loadBooks),
    switchMap(() =>
      this.bs.getAll().pipe(
        map(books => BookActions.loadBooksSuccess({ books })),
        catchError(error => of(BookActions.loadBooksFailure({ error }))))
    )
  ));

  constructor(
    private actions$: Actions,
    private bs: BookStoreService,
  ) {}
}
```

Bitte beachten Sie, dass die Actions hier wieder als Funktionen verwendet werden, nicht mehr als Klassen (ähnlich wie beim Dispatchen).
Durch das neue Action-Format erübrigt sich auch die Typisierung für das `Actions`-Observable, das in den Constructor injiziert wird.

#### Einstellungen für Effects

Die Option `{ dispatch: false }`, die bisher als Argument an den Decorator übergeben wurde, kann nun im zweiten Argument von `createEffect()` notiert werden.

```typescript
// vorher
@Effect({ dispatch: false }) loadBooks$ = /* ... */

// nachher
loadBooks$ = createEffect(
  () => /* ... */,
  { dispatch: false }
);
```

## Effects: Wiederaufnahme bei Fehlern

Ein Datenstrom aus einem Observable wird bei Fehlern beendet – das ist eine der grundlegenden Eigenschaften eines Observables.
Das gilt auch für Effects; hier allerdings kann es zu Problemen führen, wenn ein Fehler in einem Effect nicht korrekt gefangen wird.
Wird das Observable beendet, ist der Effect inaktiv und kann nicht wiederbelebt werden.

Dieses Problem ließ sich bisher nur mit Disziplin oder unschönen Hilfsmitteln lösen, z.B. ein Operator, der Fehler verschluckt und damit das Observable am Leben hält ([siehe Beispiel](https://gist.github.com/JohannesHoppe/6c52f721c42f19b8c63cf563f5665a81)).

Mit NgRx in Version 8 wurde dieses Verhalten geändert: Tritt ein Fehler im Effect auf, so wird automatisch eine neue Subscription erzeugt, sodass der Effect weiter aktiv ist.
Diese Änderung ist ein Breaking Change!
Benötigen Sie einen Effect ohne Resubscribe, so können Sie die Einstellung deaktivieren:

```typescript
loadBooks$ = createEffect(
  () => /* ... */,
  { resubscribeOnError: false }
);
```



## Runtime Checks: Immutability und Serialisierbarkeit

Zwei wichtige Eigenschaften von NgRx sind *Immutability* und *Serialisierbarkeit*.
Das bedeutet, dass Actions und Zustände niemals verändert werden dürfen.
Stattdessen müssen wir z.B. im Reducer stets einen *neuen* State erzeugen, anstatt den aktuellen zu ändern.

Das Thema Serialisierbarkeit von Actions und State sorgt schließlich dafür, dass diese Objekte stets problemlos in JSON serialisiert werden können, ohne dass Informationen verloren gehen.

Die Einhaltung dieser beiden "Auflagen" ist essentiell für NgRx.
Beide Regeln sind allerdings nicht immer offensichtlich.
Das Paket `ngrx-store-freeze` half deshalb bisher dabei, unbeabsichtigte Mutationen zu entdecken.
Diese Funktionalität und weitere Prüfungen wurden nun direkt in NgRx integriert, und es werden *Runtime Checks* durchgeführt.
Dabei können vier verschiedene Regeln geprüft werden:

* `strictStateImmutability`: State muss immutable behandelt werden
* `strictActionImmutability`: Actions müssen immutable behandelt werden
* `strictStateSerializability`: State muss serialisierbar sein
* `strictActionSerializability`: Actions müssen serialisierbar sein

Die Einstellungen werden einzeln aktiviert:

```typescript
// Runtime Checks aktivieren
@NgModule({
  imports: [
    // ...
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
      metaReducers
    })
  ]
})
export class AppModule { }
```

Voraussichtlich mit Version 9 werden die Immutability-Checks im Entwicklungsmodus standardmäßig aktiviert.
Mehr Infos zu den Runtime Checks und Beispiele finden Sie in der [Dokumentation von NgRx](https://ngrx.io/guide/store/configuration/runtime-checks).



## Router Store: Selektoren und `forRoot()`

Das Modul `@ngrx/router-store` ermöglicht es, den Zustand des Routers ebenfalls über NgRx zu verwalten.
Hier gibt es im neuen Release zwei wichtige Änderungen.

### Modul-Import mit `forRoot()` 

Das `StoreRouterConnectingModule` muss ab sofort mit der Methode `forRoot()` importiert werden.
Damit wird dieser Import an die herrschende Konvention angeglichen, dass ein gemeinsam genutztes Modul nur Providers mitbringt, wenn es mit `forRoot()` aufgerufen wird.

```typescript
// vorher
@NgModule({
  imports: [
    StoreRouterConnectingModule
  ],
  // ...
})
export class AppModule { }
```

```typescript
// nachher
@NgModule({
  imports: [
    StoreRouterConnectingModule.forRoot()
  ],
  // ...
})
export class AppModule { }
```

### Selektoren für Router-State

Zusätzlich werden ab sofort einige Selektoren mitgeliefert, um den Router-State effizient auszulesen.
So können mit den neuen Selektoren unter anderem die URL und Routenparameter erfasst werden, um sie in Selektoren und Komponenten zu verwenden.

```typescript
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
    
export const selectRouter =
  createFeatureSelector<State, RouterReducerState<any>>('router');
    
const {
  selectRouteParams,
  selectQueryParams,
  selectRouteData,
  selectUrl
} = getSelectors(selectRouter);
```


## Sonstiges

Das neue Release bringt noch einige weitere Änderungen und Neuigkeiten mit sich.
Wir möchten deshalb auf den [offiziellen Migrationsleitfaden](https://ngrx.io/guide/migration/v8) und auf den [Changelog von NgRx](https://github.com/ngrx/platform/blob/master/CHANGELOG.md) verweisen, wo Sie stets Informationen zu neuen Features erhalten.


<small>Vielen Dank an **Johannes Hoppe** für Review und Ergänzungen!</small><br>
<small>**Titelbild:** Zabriskie Point, Death Valley National Park, California, 2019. Foto von Ferdinand Malcher</small>
