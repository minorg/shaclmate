import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_NumberFilter = conditionalOutput(
  `${syntheticNamePrefix}NumberFilter`,
  code`\
interface ${syntheticNamePrefix}NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
}`,
);
