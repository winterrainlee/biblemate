import { parse, parseISO, isValid } from 'date-fns';

export function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
}

export function parseDateInput(value) {
  if (!value) return null;

  if (typeof value !== 'string') {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDateOnly(value);
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value)) {
    const isoLike = value.replace(' ', 'T');
    const date = parseISO(isoLike);
    return isValid(date) ? date : null;
  }

  const date = new Date(value);
  return isValid(date) ? date : null;
}
