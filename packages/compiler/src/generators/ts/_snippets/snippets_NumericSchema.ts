import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}NumericSchema`,
    code`\
interface ${syntheticNamePrefix}NumericSchema<T> {
  readonly in?: readonly T[];
  readonly kind: "BigDecimal" | "BigInt" | "Float" | "Int";
}`,
  );
