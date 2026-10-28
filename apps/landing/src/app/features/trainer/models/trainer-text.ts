const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;
const NON_BREAKING_SPACE = ' ';
const DECIMAL_COMMA = ',';
const RATING_DIGITS = 1;
const DESCRIPTION_LIMIT = 160;
const ELLIPSIS = '…';
const WHITESPACE = /\s+/g;

export function formatSum(value: number): string {
  return String(Math.round(value)).replace(THOUSANDS, NON_BREAKING_SPACE);
}

export function formatRating(value: number): string {
  return value.toFixed(RATING_DIGITS).replace('.', DECIMAL_COMMA);
}

export function shortDescription(text: string): string {
  const flat = text.replace(WHITESPACE, ' ').trim();
  if (flat.length <= DESCRIPTION_LIMIT) {
    return flat;
  }
  return `${flat.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}${ELLIPSIS}`;
}

export function initialsOf(name: string): string {
  return name
    .split(WHITESPACE)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
