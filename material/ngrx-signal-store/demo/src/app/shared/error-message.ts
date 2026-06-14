/**
 * Wandelt einen unbekannten Fehler (z. B. aus `tapResponse`) sicher in eine
 * lesbare Meldung um. Der Fehler ist als `unknown` typisiert – wir prüfen die
 * Form, statt sie blind anzunehmen.
 *
 * Hinweis: Eine `HttpErrorResponse` ist KEIN `instanceof Error` und liefe hier
 * in den Fallback. Für ein echtes HttpClient-Backend würden wir die Prüfung
 * erweitern, z. B. `if (error instanceof HttpErrorResponse) return error.message;`.
 */
export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
}
