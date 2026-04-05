import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";

export const snippets_shaclPropertyFromRdf = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertyFromRdf`,
  code`\
function ${syntheticNamePrefix}shaclPropertyFromRdf<T>({ graph, propertySchema, resource, typeFromRdf }: {
  graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
  propertySchema: ${snippets_ShaclPropertySchema};
  resource: ${imports.Resource};
  typeFromRdf: (resourceValues: ${imports.Either}<Error, ${imports.Resource}.Values>) => ${imports.Either}<Error, ${imports.Resource}.Values<T>>;
}): ${imports.Either}<Error, T> {
  return typeFromRdf(${imports.Either}.of<Error, ${imports.Resource}.Values>(resource.values(propertySchema.identifier, { graph, unique: true }))).chain(values => values.head());
}`,
);
