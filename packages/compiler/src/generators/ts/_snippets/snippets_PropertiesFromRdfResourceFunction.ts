import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_PropertiesFromRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}PropertiesFromRdfResourceFunction`,
    code`\
type ${syntheticNamePrefix}PropertiesFromRdfResourceFunction<T> = (
  resource: ${this.imports.Resource},
  options: {
    context: undefined | unknown;
    graph: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}> | undefined;
    ignoreRdfType: boolean;
    objectSet: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
  }
) => ${this.imports.Either}<Error, T>;`,
  );
