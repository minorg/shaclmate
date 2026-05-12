import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_isReadonlyBigIntArray: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}isReadonlyBigIntArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyBigIntArray(x: unknown): x is readonly bigint[] {
  return Array.isArray(x) && x.every(z => typeof z === "bigint");
}`,
  );
