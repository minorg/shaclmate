import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets__FromRdfResourceFunction: SnippetFactory = ({
  configuration,
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}_FromRdfResourceFunction`,
    code`\
type ${syntheticNamePrefix}_FromRdfResourceFunction<T> = (
  resource: ${imports.Resource},
  options: {
    context: undefined | unknown;
    graph: Exclude<${imports.Quad_Graph}, ${imports.Variable}> | undefined;
    ignoreRdfType: boolean;
    ${configuration.features.has("ObjectSet") ? code`objectSet: ${syntheticNamePrefix}ObjectSet;` : ""}
    preferredLanguages: readonly string[] | undefined;
  }
) => ${imports.Either}<Error, T>;`,
  );
