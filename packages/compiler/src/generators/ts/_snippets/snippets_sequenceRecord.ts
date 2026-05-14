import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sequenceRecord: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}sequenceRecord`,
    code`\
function ${syntheticNamePrefix}sequenceRecord<T extends Record<string, unknown>>(
  record: { [K in keyof T]: ${imports.Either}<Error, T[K]> }
): ${imports.Either}<Error, T> {
  const result: { [K in keyof T]?: T[K] } = {};

  for (const key of globalThis.Object.keys(record) as Array<keyof T>) {
    const either = record[key];
    if (either.isLeft()) {
      return either as unknown as ${imports.Either}<Error, T>;
    }
    result[key] = either.extract() as T[typeof key];
  }

  return ${imports.Right}(result as T);
}`,
  );
