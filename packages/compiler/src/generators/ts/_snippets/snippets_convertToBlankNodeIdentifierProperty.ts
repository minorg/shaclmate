import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBlankNodeIdentifierProperty: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBlankNodeIdentifierProperty`,
    code`\
const ${syntheticNamePrefix}convertToBlankNodeIdentifierProperty: ${snippets.ConversionFunction}<(() => ${imports.BlankNode}) | ${imports.BlankNode} | undefined, () => ${imports.BlankNode}> = (identifier) => {
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
