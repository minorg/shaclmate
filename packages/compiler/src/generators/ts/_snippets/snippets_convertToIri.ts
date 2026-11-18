import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIri: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIri`,
    code`\
function ${syntheticNamePrefix}convertToIri<DefaultNamespaceT extends ${imports.NamespaceBuilder} = ${imports.NamespaceBuilder}>(value: ${imports.NamedNode} | (keyof DefaultNamespaceT & string), defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, ${imports.NamedNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.expandIri}(value, { dataFactory: ${imports.dataFactory}, defaultNamespace });
  }
}`,
  );
