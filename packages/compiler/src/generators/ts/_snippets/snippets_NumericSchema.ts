import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericSchema = conditionalOutput(
  `${syntheticNamePrefix}NumericSchema`,
  code`\
interface ${syntheticNamePrefix}NumericSchema<T> {
  readonly in?: readonly T[];
  readonly kind: "BigDecimal" | "BigInt" | "Float" | "Int";
}`,
);
