import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_NamedNodeSchema = conditionalOutput(
  `${syntheticNamePrefix}NamedNodeSchema`,
  code`\
interface ${syntheticNamePrefix}NamedNodeSchema {
  readonly kind: "NamedNodeType";
  readonly in?: readonly ${imports.NamedNode}[];
}`,
);
