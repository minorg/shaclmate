import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BooleanSchema = conditionalOutput(
  `${syntheticNamePrefix}BooleanSchema`,
  code`\
interface ${syntheticNamePrefix}BooleanSchema {
  readonly kind: "BooleanType";
  readonly in?: readonly boolean[];
}`,
);
