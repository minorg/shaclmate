import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumberSchema = conditionalOutput(
  `${syntheticNamePrefix}NumberSchema`,
  code`\
interface ${syntheticNamePrefix}NumberSchema {
  readonly in?: readonly number[];
  readonly kind: "Float" | "Int";
}`,
);
