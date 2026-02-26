import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericFilter = conditionalOutput(
  `${syntheticNamePrefix}NumericFilter`,
  code`\
interface ${syntheticNamePrefix}NumericFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
}`,
);
