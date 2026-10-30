import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromJsonObjectFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromJsonObjectFunction`,
    code`\
export type ${syntheticNamePrefix}FromJsonObjectFunction<JsonObjectT, ValueT, ValueSchemaT> = (
  jsonObject: JsonObjectT,
  options: {
    context?: unknown;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    schema: ValueSchemaT;
  }
) => ${imports.Either}<Error, ValueT>;`,
  );
