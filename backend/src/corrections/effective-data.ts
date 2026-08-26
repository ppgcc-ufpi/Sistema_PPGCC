type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function applyChanges(base: unknown, changes: unknown): JsonObject {
  const result: JsonObject = isObject(base) ? structuredClone(base) : {};
  if (!isObject(changes)) return result;
  for (const [key, value] of Object.entries(changes)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) continue;
    if (value === null) delete result[key];
    else if (isObject(value) && isObject(result[key])) {
      result[key] = applyChanges(result[key], value);
    } else result[key] = structuredClone(value);
  }
  return result;
}
