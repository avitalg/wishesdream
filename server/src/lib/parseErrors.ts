export type ParseErrorCode =
  | 'INVALID_URL'
  | 'BLOCKED_URL'
  | 'TOO_MANY_REDIRECTS'
  | 'REDIRECT_LOOP'
  | 'FETCH_FAILED'
  | 'NO_PRODUCT_DATA'
  | 'PARSE_FAILED';

export class ParseUrlError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message: string) {
    super(message);
    this.name = 'ParseUrlError';
    this.code = code;
  }
}

const ERROR_MESSAGES: Record<ParseErrorCode, string> = {
  INVALID_URL: 'That link does not look like a valid product URL.',
  BLOCKED_URL: 'This URL cannot be fetched for security reasons.',
  TOO_MANY_REDIRECTS: 'The store redirected too many times. Try the direct product page link.',
  REDIRECT_LOOP: 'The store kept redirecting in a loop. Try the direct product page link.',
  FETCH_FAILED: 'We could not reach that page. Check the link and try again.',
  NO_PRODUCT_DATA: 'We opened the page but could not find product details. You can enter them manually.',
  PARSE_FAILED: 'We could not read product details from that link. You can enter them manually.',
};

export function parseErrorMessage(code: ParseErrorCode): string {
  return ERROR_MESSAGES[code];
}

export function toParseUrlError(error: unknown): ParseUrlError {
  if (error instanceof ParseUrlError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message === 'Too many redirects') {
      return new ParseUrlError('TOO_MANY_REDIRECTS', parseErrorMessage('TOO_MANY_REDIRECTS'));
    }
    if (error.message === 'Redirect loop detected') {
      return new ParseUrlError('REDIRECT_LOOP', parseErrorMessage('REDIRECT_LOOP'));
    }
    if (error.message === 'Invalid URL' || error.message.includes('HTTP and HTTPS')) {
      return new ParseUrlError('INVALID_URL', parseErrorMessage('INVALID_URL'));
    }
    if (error.message.includes('not allowed')) {
      return new ParseUrlError('BLOCKED_URL', parseErrorMessage('BLOCKED_URL'));
    }
    if (error.message.startsWith('Failed to fetch URL')) {
      return new ParseUrlError('FETCH_FAILED', parseErrorMessage('FETCH_FAILED'));
    }
    return new ParseUrlError('PARSE_FAILED', parseErrorMessage('PARSE_FAILED'));
  }

  return new ParseUrlError('PARSE_FAILED', parseErrorMessage('PARSE_FAILED'));
}

export function isIncompleteProduct(data: {
  title?: string;
  image_url?: string | null;
}): boolean {
  const title = data.title?.trim() ?? '';
  return !title || title === 'Untitled Product' || title === 'Gift Item';
}
