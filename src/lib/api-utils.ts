export function isString(value) {
  return typeof value === 'string';
}

export function toSafeString(value) {
  if (isString(value)) return value;
  if (value === null || value === undefined) return '';
  if (typeof value.toString === 'function') return value.toString();
  return String(value);
}

export function toSafeLowerCase(value) {
  return isString(value) ? value.toLowerCase() : '';
}

export function normalizeId(value) {
  return toSafeString(value);
}

export function normalizeEntityId(entity) {
  return toSafeString(entity?._id ?? entity?.id ?? entity);
}
