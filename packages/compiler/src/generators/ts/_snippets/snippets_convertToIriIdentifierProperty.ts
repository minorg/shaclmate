import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIriIdentifierProperty: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIriIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToIriIdentifierProperty<DefaultNamespaceT extends ${snippets.NamespaceBuilder} = ${snippets.NamespaceBuilder}>(identifier: (() => ${imports.NamedNode}) | ${imports.NamedNode} | (keyof DefaultNamespaceT & string), defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, (() => ${imports.NamedNode})> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string": {
      return ${snippets.iriFromString}(identifier, { defaultNamespace }).map(iri => (() => iri));
    }
  }
}`,
  );
