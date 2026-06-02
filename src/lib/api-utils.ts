export function isString(value) {
  return typeof value === 'string';
}

export function toSafeString(value) {
  if (isString(value)) return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if ('$oid' in value && typeof value['$oid'] === 'string') return value['$oid'];
    if (typeof (value as any).toHexString === 'function') return (value as any).toHexString();
    if ('_id' in value && typeof (value as any)._id === 'string') return (value as any)._id;
    if ('id' in value && typeof (value as any).id === 'string') return (value as any).id;
  }
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
