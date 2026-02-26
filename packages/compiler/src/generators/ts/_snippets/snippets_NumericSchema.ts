import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericSchema = conditionalOutput(
  `${syntheticNamePrefix}NumericSchema`,
  code`\
interface ${syntheticNamePrefix}NumericSchema {
  readonly in?: readonly number[];
  readonly kind: "Float" | "Int";
}`,
);
