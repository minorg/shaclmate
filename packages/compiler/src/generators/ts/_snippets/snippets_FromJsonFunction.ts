import type { SnippetFactory } from "../SnippetFactory.js";
import {
  type Code,
  code,
  conditionalOutput,
  joinCode,
} from "../ts-poet-wrapper.js";

export const snippets_FromJsonFunction: SnippetFactory = ({
  configuration,
  imports,
  snippets,
  syntheticNamePrefix,
}) => {
  const options: Code[] = [code`context?: unknown;`];
  options.push(code`defaultNamespace?: ${snippets.NamespaceBuilder};`);
  if (configuration.features.has("ObjectSet")) {
    options.push(code`objectSet?: ${syntheticNamePrefix}ObjectSet;`);
  }
  options.push(code`prefixMap?: ${imports.PrefixMap};`);
  const joinedOptions = joinCode(
    options.map((option) => code`        ${option}`),
    { on: "\n" },
  );

  return conditionalOutput(
    `${syntheticNamePrefix}FromJsonFunction`,
    code`\
export type ${syntheticNamePrefix}FromJsonFunction<JsonValueT, ValueT, ValueSchemaT> = 
  [ValueSchemaT] extends [undefined]
  ? (
      jsonValue: JsonValueT,
      options?: {
${joinedOptions}
        schema?: unknown;
      },
    ) => ${imports.Either}<Error, ValueT>
  : (
      jsonValue: JsonValueT,
      options: {
${joinedOptions}
        schema: ValueSchemaT;
      },
    ) => ${imports.Either}<Error, ValueT>;`,
  );
};
