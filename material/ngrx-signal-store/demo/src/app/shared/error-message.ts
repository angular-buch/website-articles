/**
 * Wandelt einen unbekannten Fehler (z. B. aus `tapResponse`) sicher in eine
 * lesbare Meldung um. Der Fehler ist als `unknown` typisiert – wir prüfen die
 * Form, statt sie blind anzunehmen.
 *
 * Bei einem echten HttpClient-Backend wäre der Fehler in der Regel eine
 * `HttpErrorResponse`, die ebenfalls eine `message`-Eigenschaft trägt; die
 * Prüfung ließe sich dafür leicht erweitern.
 */
export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
}
