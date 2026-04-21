import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_PropertiesFromRdfResourceFunction = conditionalOutput(
  `${syntheticNamePrefix}PropertiesFromRdfResourceFunction`,
  code`\
type ${syntheticNamePrefix}PropertiesFromRdfResourceFunction<T> = (
  resource: ${imports.Resource},
  options: {
    context: undefined | unknown;
    graph: Exclude<${imports.Quad_Graph}, ${imports.Variable}> | undefined;
    ignoreRdfType: boolean;
    objectSet: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
  }
) => ${imports.Either}<Error, T>;`,
);
