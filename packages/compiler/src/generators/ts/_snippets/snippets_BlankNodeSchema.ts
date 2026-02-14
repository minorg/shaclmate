import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_BlankNodeSchema = conditionalOutput(
  `${syntheticNamePrefix}BlankNodeSchema`,
  code`\
interface ${syntheticNamePrefix}BlankNodeSchema {
}`,
);
