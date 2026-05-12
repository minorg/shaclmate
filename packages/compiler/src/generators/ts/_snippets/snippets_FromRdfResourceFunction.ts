import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfResourceFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromRdfResourceFunction`,
    code`\
export type ${syntheticNamePrefix}FromRdfResourceFunction<T> = (
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
