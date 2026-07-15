export function requireString(value: unknown, maxLength = 1000) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
    ? value.trim()
    : null;
}

export function optionalString(value: unknown, maxLength = 1000) {
  return typeof value === 'string' && value.trim().length <= maxLength ? value.trim() : '';
}

export function requireUrl(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

export function booleanValue(value: unknown, defaultValue = false) {
  return typeof value === 'boolean' ? value : defaultValue;
}

export function integerValue(value: unknown, defaultValue = 0) {
  return typeof value === 'number' && Number.isInteger(value) ? value : defaultValue;
}
