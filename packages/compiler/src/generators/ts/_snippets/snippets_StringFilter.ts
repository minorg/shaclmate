import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_StringFilter = conditionalOutput(
  `${syntheticNamePrefix}StringFilter`,
  code`\
interface ${syntheticNamePrefix}StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}`,
);
