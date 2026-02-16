import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DateFilter = conditionalOutput(
  `${syntheticNamePrefix}DateFilter`,
  code`\
interface ${syntheticNamePrefix}DateFilter {
  readonly in?: readonly Date[];
  readonly maxExclusive?: Date;
  readonly maxInclusive?: Date;
  readonly minExclusive?: Date;
  readonly minInclusive?: Date;
}`,
);
