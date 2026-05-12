import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_isReadonlyObjectArray: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}isReadonlyObjectArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyObjectArray(x: unknown): x is readonly object[] {
  return Array.isArray(x) && x.every(z => typeof z === "object");
}`,
  );
