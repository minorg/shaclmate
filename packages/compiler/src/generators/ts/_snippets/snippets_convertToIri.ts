import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIri`,
    code`\
function ${syntheticNamePrefix}convertToIri<DefaultNamespaceT extends ${snippets.NamespaceBuilder} = ${snippets.NamespaceBuilder}>(value: (keyof DefaultNamespaceT & string) | ${imports.NamedNode}, defaultNamespace?: DefaultNamespaceT): ${imports.Either}<Error, ${imports.NamedNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(defaultNamespace ? defaultNamespace(value) : ${imports.dataFactory}.namedNode(value));
  }
}`,
  );
