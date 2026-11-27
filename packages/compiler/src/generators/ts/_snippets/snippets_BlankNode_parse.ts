import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_parse: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.parse`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {    
  export function parse(identifier: string): ${imports.Either}<Error, ${imports.BlankNode}> {
    return \
      ${snippets.Identifier_parse}(identifier)\
        .chain((identifier) => (identifier.termType === "BlankNode") ? ${imports.Right}(identifier) : ${imports.Left}(new Error("expected identifier to be BlankNode"))) \
      as ${imports.Either}<Error, ${imports.BlankNode}>;
  }
}`,
  );
