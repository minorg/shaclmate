import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_isReadonlyStringArray = conditionalOutput(
  `${syntheticNamePrefix}isReadonlyStringArray`,
  code`\
function ${syntheticNamePrefix}isReadonlyStringArray(x: unknown): x is readonly string[] {
  return Array.isArray(x) && x.every(z => typeof z === "string");
}`,
);
