import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_isReadonlyBigintArray = conditionalOutput(
  `${syntheticNamePrefix}isReadonlyBigintArray`,
  code`\
function ${syntheticNamePrefix}isReadonlyBigintArray(x: unknown): x is readonly bigint[] {
  return Array.isArray(x) && x.every(z => typeof z === "bigint");
}`,
);
