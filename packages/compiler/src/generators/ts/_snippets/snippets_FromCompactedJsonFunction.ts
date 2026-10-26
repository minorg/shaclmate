import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromCompactedJsonFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromCompactedJsonFunction`,
    code`\
export type ${syntheticNamePrefix}FromCompactedJsonFunction<CompactedJsonT, ValueT, ValueSchemaT> = (
  compactedJson: CompactedJsonT,
  options: {
    context?: unknown;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    schema: ValueSchemaT;
  }
) => ${imports.Either}<Error, ValueT>;`,
  );
