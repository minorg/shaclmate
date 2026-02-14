import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_StringSchema = conditionalOutput(
  `${syntheticNamePrefix}StringSchema`,
  code`\
interface ${syntheticNamePrefix}StringSchema {
  readonly kind: "StringType";
  readonly in?: readonly string[];
}`,
);
