import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifier: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifier`,
    code`\
function ${syntheticNamePrefix}convertToIdentifier(schema: ${snippets.IdentifierSchema}, value: ${imports.BlankNode} | ${imports.NamedNode} | string | undefined): ${imports.BlankNode} | ${imports.NamedNode} {
  switch (typeof value) {
    case "object":
      return value;
    case "string":
      return ${imports.dataFactory}.namedNode(value);
    case "undefined":
      return ${imports.dataFactory}.blankNode();
  }
}`,
  );
