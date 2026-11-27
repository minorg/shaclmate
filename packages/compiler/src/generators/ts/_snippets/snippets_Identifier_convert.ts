import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_convert: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.convert`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export function convert<DefaultNamespaceT extends ${imports.NamespaceBuilder} = ${imports.NamespaceBuilder}>(value: ${snippets.Identifier} | (keyof DefaultNamespaceT & string) | undefined, { defaultNamespace }: { defaultNamespace: DefaultNamespaceT | undefined }): ${imports.Either}<Error, ${snippets.Identifier}> {
    switch (typeof value) {
      case "object":
        return ${imports.Either}.of(value);
      case "string":
        return ${imports.expandIri}(value, { dataFactory: ${imports.dataFactory}, defaultNamespace });
      case "undefined":
        return ${imports.Either}.of(${imports.dataFactory}.blankNode());
    }
  }
}`,
  );
