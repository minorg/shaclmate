import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToInIriIdentifierProperty: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToInIriIdentifierProperty`,
    code`\
function ${syntheticNamePrefix}convertToInIriIdentifierProperty<InIriT extends string>(identifier: (() => ${imports.NamedNode}<InIriT>) | ${imports.NamedNode}<InIriT> | InIriT, _defaultNamespace?: ${snippets.NamespaceBuilder}): ${imports.Either}<Error, (() => ${imports.NamedNode}<InIriT>)> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string": {
      const captureIdentifier = ${imports.dataFactory}.namedNode<InIriT>(identifier);
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
