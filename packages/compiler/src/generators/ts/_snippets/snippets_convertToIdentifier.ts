import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifier: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifier`,
    code`\
function ${syntheticNamePrefix}convertToIdentifier<DefaultNamespaceT extends ${snippets.NamespaceBuilder} = ${snippets.NamespaceBuilder}>(value: (keyof DefaultNamespaceT & string) | ${imports.BlankNode} | ${imports.NamedNode} | undefined, defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, ${imports.BlankNode} | ${imports.NamedNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(defaultNamespace ? defaultNamespace(value) : ${imports.dataFactory}.namedNode(value));
    case "undefined":
      return ${imports.Either}.of(${imports.dataFactory}.blankNode());
  }
}`,
  );
