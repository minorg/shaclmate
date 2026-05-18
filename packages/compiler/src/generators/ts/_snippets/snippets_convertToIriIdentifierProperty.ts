import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIriIdentifierProperty: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIriIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToIriIdentifierProperty<IriT extends string = string>(identifier: (() => ${imports.NamedNode}<IriT>) | ${imports.NamedNode}<IriT> | IriT): ${imports.Either}<Error, (() => ${imports.NamedNode}<IriT>)> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = ${imports.dataFactory}.namedNode<IriT>(identifier);
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
