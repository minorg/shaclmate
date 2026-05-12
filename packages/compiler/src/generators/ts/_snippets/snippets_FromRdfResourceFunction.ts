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
  resource: ${this.imports.Resource},
  options?: {
    context?: unknown;
    graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>;
    ignoreRdfType?: boolean;
    objectSet?: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
  }
) => ${this.imports.Either}<Error, T>`,
  );
