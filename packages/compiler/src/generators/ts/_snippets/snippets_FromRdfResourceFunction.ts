import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfResourceFunction = conditionalOutput(
  `${syntheticNamePrefix}FromRdfResourceFunction`,
  code`\
type ${syntheticNamePrefix}FromRdfResourceFunction<T> = (
  resource: ${imports.Resource},
  options?: {
    context?: unknown;
    graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
    ignoreRdfType?: boolean;
    objectSet?: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
  }
) => ${imports.Either}<Error, T>`,
);
