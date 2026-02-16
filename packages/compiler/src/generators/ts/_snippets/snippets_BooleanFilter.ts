import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BooleanFilter = conditionalOutput(
  `${syntheticNamePrefix}BooleanFilter`,
  code`\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
);
