import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBlankNodeIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBlankNodeIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToBlankNodeIdentifierProperty(identifier: (() => ${imports.BlankNode}) | ${imports.BlankNode} | undefined): ${imports.Either}<Error, (() => ${imports.BlankNode})> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = ${imports.dataFactory}.blankNode();
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
