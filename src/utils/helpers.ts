export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.filter(v => v !== undefined && v !== null);
      } else if (typeof value === 'object') {
        result[key] = stripUndefined(value);
      } else {
        result[key] = value;
      }
    }
  });
  return result as T;
}

export function safeStr(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val : val !== undefined && val !== null ? String(val) : fallback;
  return str.slice(0, maxLen);
}
