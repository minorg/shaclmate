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
function ${syntheticNamePrefix}convertToIdentifierProperty<DefaultNamespaceT extends ${imports.NamespaceBuilder} = ${imports.NamespaceBuilder}>(identifier: (() => ${snippets.Identifier}) | ${snippets.Identifier} | (keyof DefaultNamespaceT & string) | undefined, { defaultNamespace }: { defaultNamespace: DefaultNamespaceT | undefined }): ${imports.Either}<Error, () => ${snippets.Identifier}> {
  switch (typeof identifier) {
    case "function":
      return ${imports.Either}.of(identifier);
    case "object": {
      const captureIdentifier = identifier;
      return ${imports.Either}.of(() => captureIdentifier);
    }
    case "string":
      return ${imports.expandIri}(identifier, { dataFactory: ${imports.dataFactory}, defaultNamespace }).map(iri => (() => iri));
    case "undefined": {
      const captureIdentifier = ${imports.dataFactory}.blankNode();
      return ${imports.Either}.of(() => captureIdentifier);
    }
  }
}`,
  );
