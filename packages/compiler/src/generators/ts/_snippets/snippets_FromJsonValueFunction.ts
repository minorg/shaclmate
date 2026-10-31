import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromJsonValueFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromJsonValueFunction`,
    code`\
export type ${syntheticNamePrefix}FromJsonValueFunction<JsonValueT, ValueT, ValueSchemaT> = (
  jsonValue: JsonValueT,
  options: {
    context?: unknown;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    schema: ValueSchemaT;
  }
) => ${imports.Either}<Error, ValueT>;`,
  );
