import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfResourceValuesFunction = conditionalOutput(
  `${syntheticNamePrefix}FromRdfResourceValuesFunction`,
  code`\
type ${syntheticNamePrefix}FromRdfResourceValuesFunction<T> = (
  resourceValues: ${imports.Either}<Error, ${imports.Resource}.Values>,
  options: {
    context?: unknown;
    graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
    ignoreRdfType?: boolean;
    objectSet?: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: ${imports.PropertyPath};
    resource: ${imports.Resource};
  }
) => ${imports.Either}<Error, ${imports.Resource}.Values<T>>;`,
);
