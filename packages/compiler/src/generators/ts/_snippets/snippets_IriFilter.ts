import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IriFilter = conditionalOutput(
  `${syntheticNamePrefix}IriFilter`,
  code`\
interface ${syntheticNamePrefix}IriFilter {
  readonly in?: readonly ${imports.NamedNode}[];
}`,
);
