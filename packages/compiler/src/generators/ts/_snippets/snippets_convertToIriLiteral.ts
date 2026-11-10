import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIriLiteral: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIriLiteral`,
    code`\
function ${syntheticNamePrefix}convertToIriLiteral<IriT extends string>(value: IriT | ${imports.NamedNode}<IriT>, _defaultNamespace?: ${snippets.NamespaceBuilder}): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(${imports.dataFactory}.namedNode<IriT>(value));
  }
}`,
  );
