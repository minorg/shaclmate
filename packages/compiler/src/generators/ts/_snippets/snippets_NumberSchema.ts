import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_NumberSchema = conditionalOutput(
  `${syntheticNamePrefix}NumberSchema`,
  code`\
interface ${syntheticNamePrefix}NumberSchema {
  readonly kind: "FloatType" | "IntType";
  readonly in?: readonly number[];
}`,
);
