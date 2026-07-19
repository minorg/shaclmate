import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIri`,
    code`\
function ${syntheticNamePrefix}convertToIri<IriT extends string, DefaultNamespaceT extends ${snippets.NamespaceBuilder} = ${snippets.NamespaceBuilder}>(value: IriT | ${imports.NamedNode}<IriT>, _defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(${imports.dataFactory}.namedNode<IriT>(value));
  }
}`,
  );
