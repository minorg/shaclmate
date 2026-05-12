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
function ${syntheticNamePrefix}shaclPropertyFromRdf<T>({ graph, propertySchema, resource, typeFromRdf }: {
  graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
  propertySchema: ${snippets.ShaclPropertySchema};
  resource: ${imports.Resource};
  typeFromRdf: (resourceValues: ${imports.Either}<Error, ${imports.Resource}.Values>) => ${imports.Either}<Error, ${imports.Resource}.Values<T>>;
}): ${imports.Either}<Error, T> {
  return typeFromRdf(${imports.Right}(resource.values(propertySchema.path, { graph, unique: true }))).chain(values => values.head());
}`,
  );
