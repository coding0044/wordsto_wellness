export function formatDate(value: string | number | Date | null | undefined, defaultValue = ''): string {
  if (value === undefined || value === null || value === '') return defaultValue;

  let date = new Date(value);
  if (isNaN(date.getTime())) {
    const alt = String(value).replace(' ', 'T');
    date = new Date(alt);

    if (isNaN(date.getTime())) {
      const match = String(value).match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        date = new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6]);
      }
    }
  }

  if (isNaN(date.getTime())) return defaultValue;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
