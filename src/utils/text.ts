const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g; // C0 controls + DEL

/**
 * Sanitize free-text input: strip C0 control chars + DEL, trim leading/trailing
 * whitespace, then hard-truncate to `maxLength`. Pure and SSR-safe.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return value.replace(CONTROL_CHARS, '').trim().slice(0, maxLength);
}