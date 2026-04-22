export function singleEntryRecord<T>(key: string, value: T): Record<string, T> {
  const record: Record<string, T> = {};
  record[key] = value;
  return record;
}
