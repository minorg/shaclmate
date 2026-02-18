import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_StringSchema = conditionalOutput(
  `${syntheticNamePrefix}StringSchema`,
  code`\
interface ${syntheticNamePrefix}StringSchema {
  readonly in?: readonly string[];
  readonly kind: "StringType";
}`,
);
