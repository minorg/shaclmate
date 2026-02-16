import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_StringFilter = conditionalOutput(
  `${syntheticNamePrefix}StringFilter`,
  code`\
interface ${syntheticNamePrefix}StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}`,
);
