import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_isReadonlyBooleanArray = conditionalOutput(
  `${syntheticNamePrefix}isReadonlyBooleanArray`,
  code`\
function ${syntheticNamePrefix}isReadonlyBooleanArray(x: unknown): x is readonly boolean[] {
  return Array.isArray(x) && x.every(z => typeof z === "boolean");
}`,
);
