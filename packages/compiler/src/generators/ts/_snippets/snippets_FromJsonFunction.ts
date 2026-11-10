import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromJsonFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromJsonFunction`,
    code`\
export type ${syntheticNamePrefix}FromJsonFunction<JsonValueT, ValueT, ValueSchemaT> = 
  [ValueSchemaT] extends [undefined]
  ? (
      jsonValue: JsonValueT,
      options?: {
        context?: unknown;
        ${configuration.features.has("ObjectSet") ? code`objectSet?: ${syntheticNamePrefix}ObjectSet;` : ""}
        schema?: unknown;
      },
    ) => ${imports.Either}<Error, ValueT>
  : (
      jsonValue: JsonValueT,
      options: {
        context?: unknown;
        ${configuration.features.has("ObjectSet") ? code`objectSet?: ${syntheticNamePrefix}ObjectSet;` : ""}
        schema: ValueSchemaT;
      },
    ) => ${imports.Either}<Error, ValueT>;`,
  );
