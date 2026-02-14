import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_isReadonlyNumberArray = conditionalOutput(
  `${syntheticNamePrefix}isReadonlyNumberArray`,
  code`\
function ${syntheticNamePrefix}isReadonlyNumberArray(x: unknown): x is readonly number[] {
  return Array.isArray(x) && x.every(z => typeof z === "number");
}`,
);
