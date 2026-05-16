import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBlankIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBlankIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToBlankIdentifierProperty(identifier: (() => ${imports.BlankNode}) | ${imports.BlankNode} | undefined): () => ${imports.BlankNode} {
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
