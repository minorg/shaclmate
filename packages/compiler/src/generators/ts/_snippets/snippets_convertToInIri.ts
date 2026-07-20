import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToInIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToInIri`,
    code`\
function ${syntheticNamePrefix}convertToInIri<IriT extends string>(value: IriT | ${imports.NamedNode}<IriT>, _defaultNamespace?: ${snippets.NamespaceBuilder}): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(${imports.dataFactory}.namedNode<IriT>(value));
  }
}`,
  );
