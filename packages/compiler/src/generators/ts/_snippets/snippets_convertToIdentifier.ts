import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifier: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifier`,
    code`\
function ${syntheticNamePrefix}convertToIdentifier<DefaultNamespaceT extends ${imports.NamespaceBuilder} = ${imports.NamespaceBuilder}>(value: ${imports.BlankNode} | ${imports.NamedNode} | (keyof DefaultNamespaceT & string) | undefined, { defaultNamespace }: { defaultNamespace: DefaultNamespaceT | undefined }): ${imports.Either}<Error, ${imports.BlankNode} | ${imports.NamedNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.expandIri}(value, { dataFactory: ${imports.dataFactory}, defaultNamespace });
    case "undefined":
      return ${imports.Either}.of(${imports.dataFactory}.blankNode());
  }
}`,
  );
