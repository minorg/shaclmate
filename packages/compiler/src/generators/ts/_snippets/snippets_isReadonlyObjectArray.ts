import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_isReadonlyObjectArray = conditionalOutput(
  `${syntheticNamePrefix}isReadonlyObjectArray`,
  code`\
function ${syntheticNamePrefix}isReadonlyObjectArray(x: unknown): x is readonly object[] {
  return Array.isArray(x) && x.every(z => typeof z === "object");
}`,
);
