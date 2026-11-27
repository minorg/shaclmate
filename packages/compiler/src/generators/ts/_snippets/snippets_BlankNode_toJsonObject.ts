import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_toJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.toJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const toJsonObject: ${snippets.ToJsonFunction}<${imports.BlankNode}, ${snippets.IdentifierJsonObject}> =
    (blankNode) => ({ "@id": ${snippets.BlankNode_toJsonString}(blankNode) });
}`,
  );
