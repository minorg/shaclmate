export function singleEntryRecord<ValueT>(
  key: string,
  value: ValueT,
): Record<string, ValueT> {
  const result: Record<string, ValueT> = {};
  result[key] = value;
  return result;
}
