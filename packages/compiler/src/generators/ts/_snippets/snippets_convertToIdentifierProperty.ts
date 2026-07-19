import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifierProperty: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToIdentifierProperty<DefaultNamespaceT extends ${snippets.NamespaceBuilder} = ${snippets.NamespaceBuilder}>(identifier: (() => ${imports.BlankNode} | ${imports.NamedNode}) | ${imports.BlankNode} | ${imports.NamedNode} | (keyof DefaultNamespaceT & string) | undefined, defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, () => ${imports.BlankNode} | ${imports.NamedNode}> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = defaultNamespace ? defaultNamespace(identifier) : ${imports.dataFactory}.namedNode(identifier);
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = ${imports.dataFactory}.blankNode();
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
