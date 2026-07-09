export interface Book {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description: string;
  imageUrl: string;
  createdAt: string;
}
