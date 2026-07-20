import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identityConversionFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identityConversionFunction`,
    code`\
function ${syntheticNamePrefix}identityConversionFunction<T>(value: T, _defaultNamespace?: ${snippets.NamespaceBuilder}): ${imports.Either}<Error, T> {
  return ${imports.Either}.of(value);
}`,
  );
