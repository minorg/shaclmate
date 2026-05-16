import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBlankNodeIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBlankNodeIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToBlankNodeIdentifierProperty(identifier: (() => ${imports.BlankNode}) | ${imports.BlankNode} | undefined): () => ${imports.BlankNode} {
  switch (typeof identifier) {
    case "function":
      return identifier;
    case "object":
      return () => identifier;
    case "undefined": {
      identifier = ${imports.dataFactory}.blankNode();
      return identifier;
    }
  }
}`,
  );
