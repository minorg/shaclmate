import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNodeSchema = conditionalOutput(
  `${syntheticNamePrefix}BlankNodeSchema`,
  code`\
interface ${syntheticNamePrefix}BlankNodeSchema {
  readonly kind: "BlankNodeType";
}`,
);
