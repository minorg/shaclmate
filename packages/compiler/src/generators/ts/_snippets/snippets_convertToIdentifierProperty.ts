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
const ${syntheticNamePrefix}convertToIdentifierProperty: ${snippets.ConversionFunction}<(() => ${imports.BlankNode} | ${imports.NamedNode}) | ${imports.BlankNode} | ${imports.NamedNode} | string | undefined, () => ${imports.BlankNode} | ${imports.NamedNode}> = (identifier) => {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = ${imports.dataFactory}.namedNode(identifier);
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "undefined": {
      const captureIdentifier = ${imports.dataFactory}.blankNode();
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
