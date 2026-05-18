import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identityValidationFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identityValidationFunction`,
    code`\
function ${syntheticNamePrefix}identityValidationFunction<T>(_schema: unknown, value: T): ${imports.Either}<Error, T> {
  return ${imports.Either}.of(value);
}`,
  );
