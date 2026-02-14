import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_NamedNodeFilter = conditionalOutput(
  `${syntheticNamePrefix}NamedNodeFilter`,
  code`\
interface ${syntheticNamePrefix}NamedNodeFilter {
  readonly in?: readonly ${imports.NamedNode}[];
}`,
);
