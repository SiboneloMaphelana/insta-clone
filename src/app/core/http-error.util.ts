import { HttpErrorResponse } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeMessage(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase().startsWith('<!doctype')) {
    return null;
  }

  return trimmed;
}

function readServerMessage(body: unknown): string | null {
  if (typeof body === 'string') {
    return normalizeMessage(body);
  }

  if (!isRecord(body)) {
    return null;
  }

  const keys = ['message', 'error', 'title', 'detail'];
  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string') {
      const message = normalizeMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return `We couldn't connect to the app server at ${API_BASE_URL}. Start "npm run server" and try again.`;
    }

    const serverMessage = readServerMessage(error.error);
    if (serverMessage) {
      return serverMessage;
    }

    switch (error.status) {
      case 400:
        return 'That request looks incomplete. Please review your details and try again.';
      case 401:
        return 'Your session is no longer valid. Please log in again.';
      case 403:
        return 'You do not have permission to do that right now.';
      case 404:
        return 'We could not find what you were looking for. Refresh and try again.';
      case 409:
        return 'That information is already in use. Please try something different.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'The server ran into a problem. Please wait a moment and try again.';
      default:
        break;
    }
  }

  if (error instanceof Error) {
    const message = normalizeMessage(error.message);
    if (message) {
      return message;
    }
  }

  return fallback;
}
