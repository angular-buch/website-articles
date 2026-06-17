import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BookStore } from './book-store';
import { Book } from './book';

const API = 'https://api1.angular-buch.com';
const b = (isbn: string, title = `Titel ${isbn}`): Book => ({
  isbn,
  title,
  authors: ['Autor'],
  description: 'Beschreibung',
  imageUrl: 'https://example.com/cover.png',
  createdAt: '2026-01-01T00:00:00.000Z'
});

describe('BookStore (HTTP)', () => {
  let store: BookStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    store = TestBed.inject(BookStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll lädt die Bücher per GET', () => {
    const books = [b('1'), b('2')];
    let result: Book[] | undefined;
    store.getAll().subscribe(r => (result = r));

    const req = httpMock.expectOne(`${API}/books`);
    expect(req.request.method).toBe('GET');
    req.flush(books);

    expect(result).toEqual(books);
  });

  it('create schickt einen POST und liefert das angelegte Buch', () => {
    const book = b('3', 'Neu');
    let result: Book | undefined;
    store.create(book).subscribe(r => (result = r));

    const req = httpMock.expectOne(`${API}/books`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(book);
    req.flush(book);

    expect(result).toEqual(book);
  });

  it('create reicht einen Fehler bei doppelter ISBN (HTTP 409) durch', () => {
    let failed = false;
    store.create(b('1')).subscribe({ error: () => (failed = true) });

    httpMock
      .expectOne(`${API}/books`)
      .flush({ error: 'ISBN already exists' }, { status: 409, statusText: 'Conflict' });

    expect(failed).toBe(true);
  });

  it('remove schickt einen DELETE auf die ISBN', () => {
    let done = false;
    store.remove('1').subscribe(() => (done = true));

    const req = httpMock.expectOne(`${API}/books/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(done).toBe(true);
  });
});
