export interface Book {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description: string;
  imageUrl: string;
  createdAt: string;
}

/**
 * Erzeugt aus ISBN und Titel ein vollständiges Buch mit sinnvollen Defaults,
 * damit die BookManager-API den POST akzeptiert. Die Factory wohnt bewusst
 * beim Modell: Jede Komponente, die Bücher anlegt, nutzt dieselben Defaults.
 */
export function newBook(isbn: string, title: string): Book {
  return {
    isbn,
    title,
    authors: ['Unbekannt'],
    description: 'Über die Demo angelegt.',
    imageUrl: 'https://cdn.ng-buch.de/kochen.jpg',
    createdAt: new Date().toISOString()
  };
}
