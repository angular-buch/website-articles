import { HttpErrorResponse } from '@angular/common/http';

/**
 * Wandelt einen unbekannten Fehler sicher in eine lesbare Meldung um.
 * Der Fehler ist als `unknown` typisiert – wir prüfen die Form, statt sie
 * blind anzunehmen. Die BookManager-API liefert ihre Fehler als `{ error: string }`
 * (z. B. HTTP 409 bei doppelter ISBN), verpackt in einer `HttpErrorResponse`.
 * Da der Response-Body untypisiert ist, prüfen wir auch ihn zur Laufzeit.
 */
export function toMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const apiError = (error.error as { error?: unknown } | null)?.error;
    return typeof apiError === 'string' && apiError ? apiError : error.message;
  }
  return error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';
}
