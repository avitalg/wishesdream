export function slugify(title: string): string {
  return title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function formatShortDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
