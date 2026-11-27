import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_Schema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.Schema`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export interface Schema {
    readonly kind: "BlankNode";
  }
}`,
  );
