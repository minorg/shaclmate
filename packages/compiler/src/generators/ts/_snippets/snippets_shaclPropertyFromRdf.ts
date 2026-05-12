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
  graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>;
  propertySchema: ${this.snippets.ShaclPropertySchema};
  resource: ${this.imports.Resource};
  typeFromRdf: (resourceValues: ${this.imports.Either}<Error, ${this.imports.Resource}.Values>) => ${this.imports.Either}<Error, ${this.imports.Resource}.Values<T>>;
}): ${this.imports.Either}<Error, T> {
  return typeFromRdf(${this.imports.Right}(resource.values(propertySchema.path, { graph, unique: true }))).chain(values => values.head());
}`,
  );
