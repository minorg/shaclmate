import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_toJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.toJsonString`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const toJsonString: ${snippets.ToJsonFunction}<${imports.BlankNode}, string> =
    (blankNode) => \`_:\${blankNode.value}\`;
}`,
  );
