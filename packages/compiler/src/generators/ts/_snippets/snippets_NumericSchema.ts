import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericSchema = conditionalOutput(
  `${syntheticNamePrefix}NumericSchema`,
  code`\
interface ${syntheticNamePrefix}NumericSchema<T extends bigint | number> {
  readonly in?: readonly T[];
  readonly kind: "BigInt" | "Float" | "Int";
}`,
);
