import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToIdentifier: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToIdentifier`,
    code`\
function ${syntheticNamePrefix}convertToIdentifier(value: ${imports.BlankNode} | ${imports.NamedNode} | string | undefined): ${imports.Either}<Error, ${imports.BlankNode} | ${imports.NamedNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "string":
      return ${imports.Either}.of(${imports.dataFactory}.namedNode(value));
    case "undefined":
      return ${imports.Either}.of(${imports.dataFactory}.blankNode());
  }
}`,
  );
