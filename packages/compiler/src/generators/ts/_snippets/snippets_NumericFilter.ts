import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NumericFilter = conditionalOutput(
  `${syntheticNamePrefix}NumericFilter`,
  code`\
interface ${syntheticNamePrefix}NumericFilter<T> {
  readonly in?: readonly T[];
  readonly maxExclusive?: T;
  readonly maxInclusive?: T;
  readonly minExclusive?: T;
  readonly minInclusive?: T;
}`,
);
