import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IriSchema = conditionalOutput(
  `${syntheticNamePrefix}IriSchema`,
  code`\
interface ${syntheticNamePrefix}IriSchema {
  readonly in?: readonly ${imports.NamedNode}[];
  readonly kind: "Iri";
}`,
);
