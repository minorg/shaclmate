import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromExpandedJsonFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromExpandedJsonFunction`,
    code`\
export type ${syntheticNamePrefix}FromExpandedJsonFunction<ExpandedJsonT, ValueT, ValueSchemaT> = (
  expandedJson: ExpandedJsonT,
  options: {
    context?: unknown;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    schema: ValueSchemaT;
  }
) => ${imports.Either}<Error, ValueT>;`,
  );
