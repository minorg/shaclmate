import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_parseBlankNode: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}parseBlankNode`,
    code`\
export function ${syntheticNamePrefix}parseBlankNode(identifier: string): ${imports.Either}<Error, ${imports.BlankNode}> {
  return \
    ${snippets.parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${imports.Right}(identifier) : ${imports.Left}(new Error("expected identifier to be BlankNode"))) \
    as ${imports.Either}<Error, ${imports.BlankNode}>;
}`,
  );
