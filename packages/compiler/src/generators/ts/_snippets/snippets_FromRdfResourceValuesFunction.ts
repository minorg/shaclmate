import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromRdfResourceValuesFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromRdfResourceValuesFunction`,
    code`\
export type ${syntheticNamePrefix}FromRdfResourceValuesFunction<T> = (
  resourceValues: ${this.imports.Either}<Error, ${this.imports.Resource}.Values>,
  options: {
    context?: unknown;
    graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>;
    ignoreRdfType?: boolean;
    objectSet?: ${syntheticNamePrefix}ObjectSet;
    preferredLanguages?: readonly string[];
    propertyPath: ${syntheticNamePrefix}PropertyPath;
    resource: ${this.imports.Resource};
  }
) => ${this.imports.Either}<Error, ${this.imports.Resource}.Values<T>>;`,
  );
