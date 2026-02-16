import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNodeFilter = conditionalOutput(
  `${syntheticNamePrefix}BlankNodeFilter`,
  code`\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
);
