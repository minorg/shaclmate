import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToIdentifierProperty(identifier: (() => ${imports.BlankNode} | ${imports.NamedNode}) | ${imports.BlankNode} | ${imports.NamedNode} | undefined): () => ${imports.BlankNode} | ${imports.NamedNode} {
  switch (typeof identifier) {
    case "function":
      return identifier;
    case "object":
      return () => identifier;
    case "undefined": {
      identifier = ${imports.dataFactory}.blankNode();
      return () => identifier;
    }
  }
}`,
  );
