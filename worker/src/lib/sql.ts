export function boolToInt(value: boolean) {
  return value ? 1 : 0;
}

export function intToBool(value: number | boolean | null | undefined) {
  return value === true || value === 1;
}
