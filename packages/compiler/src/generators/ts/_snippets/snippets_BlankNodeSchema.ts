import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNodeSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNodeSchema`,
    code`\
interface ${syntheticNamePrefix}BlankNodeSchema {
  readonly kind: "BlankNode";
}`,
  );
