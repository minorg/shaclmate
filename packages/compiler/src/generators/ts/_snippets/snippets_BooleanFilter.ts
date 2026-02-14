import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_BooleanFilter = conditionalOutput(
  `${syntheticNamePrefix}BooleanFilter`,
  code`\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
);
