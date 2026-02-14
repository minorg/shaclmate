import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_BlankNodeFilter = conditionalOutput(
  `${syntheticNamePrefix}BlankNodeFilter`,
  code`\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
);
