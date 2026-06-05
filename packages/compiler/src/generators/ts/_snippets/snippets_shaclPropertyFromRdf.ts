import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_shaclPropertyFromRdf: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}shaclPropertyFromRdf`,
    code`\
function ${syntheticNamePrefix}shaclPropertyFromRdf<TypeT, TypeSchemaT>(
  { focusResource, graph, propertySchema, typeFromRdfResourceValues, ...otherParameters }:
    {
      propertySchema: ${snippets.ShaclPropertySchema}<TypeSchemaT>;
      typeFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<TypeT, TypeSchemaT>;
    } & Omit<Parameters<${snippets.FromRdfResourceValuesFunction}<TypeT, TypeSchemaT>>[1], "propertyPath" | "schema">
): ${imports.Either}<Error, TypeT> {
  return \
      typeFromRdfResourceValues(
        focusResource.values(propertySchema.path, { graph, unique: true }),
        { ...otherParameters, focusResource, graph, propertyPath: propertySchema.path, schema: propertySchema.type }
      )
      .chain(values => values.head());
}`,
  );
