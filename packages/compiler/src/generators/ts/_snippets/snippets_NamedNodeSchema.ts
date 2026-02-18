import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_NamedNodeSchema = conditionalOutput(
  `${syntheticNamePrefix}NamedNodeSchema`,
  code`\
interface ${syntheticNamePrefix}NamedNodeSchema {
  readonly in?: readonly ${imports.NamedNode}[];
  readonly kind: "NamedNodeType";
}`,
);
