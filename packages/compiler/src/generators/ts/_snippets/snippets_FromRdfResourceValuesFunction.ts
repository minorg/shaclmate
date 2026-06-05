import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfResourceValuesFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromRdfResourceValuesFunction`,
    code`\
export type ${syntheticNamePrefix}FromRdfResourceValuesFunction<ValueT, ValueSchemaT> = (
  resourceValues: ${imports.Resource}.Values,
  options: {
    context?: unknown;
    graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
    focusResource: ${imports.Resource};
    ignoreRdfType?: boolean;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    preferredLanguages?: readonly string[];
    propertyPath: ${syntheticNamePrefix}PropertyPath;
    schema: ValueSchemaT;
  }
) => ${imports.Either}<Error, ${imports.Resource}.Values<ValueT>>;`,
  );
