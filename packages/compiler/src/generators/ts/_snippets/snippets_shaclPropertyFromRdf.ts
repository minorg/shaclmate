import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_shaclPropertyFromRdf: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}shaclPropertyFromRdf`,
    code`\
function ${syntheticNamePrefix}shaclPropertyFromRdf<TypeT, TypeSchemaT>(typeFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<TypeT, TypeSchemaT>): ${snippets.FromRdfResourceValuesFunction}<TypeT, TypeSchemaT> {
  return ({ focusResource, graph, propertySchema, ...otherParameters }) =>
    focusResource.values(propertySchema.path, { graph, unique: true }))\
        .chain(resourceValues => typeFromRdfResourceValues(resourceValues, { focusResource, graph, propertySchema, ...otherParameters })\
        .chain(resourceValues => resourceValues.head());
}`,
  );
