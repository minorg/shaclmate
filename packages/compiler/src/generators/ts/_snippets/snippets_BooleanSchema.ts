import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_BooleanSchema = conditionalOutput(
  `${syntheticNamePrefix}BooleanSchema`,
  code`\
interface ${syntheticNamePrefix}BooleanSchema {
  readonly in?: readonly boolean[];
}`,
);
