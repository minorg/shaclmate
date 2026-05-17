import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBlankNode: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBlankNode`,
    code`\
function ${syntheticNamePrefix}convertToBlankNode(_schema: ${snippets.BlankNodeSchema}, value: ${imports.BlankNode} | undefined): ${imports.Either}<Error, ${imports.BlankNode}> {
  switch (typeof value) {
    case "object":
      return ${imports.Either}.of(value);
    case "undefined":
      return ${imports.Either}.of(${imports.dataFactory}.blankNode());
  }
}`,
  );
