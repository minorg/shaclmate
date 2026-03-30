import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ShaclPropertySchema = conditionalOutput(
  `${syntheticNamePrefix}PropertySchema`,
  code`\
export interface ShaclPropertySchema {
  readonly identifier: ${imports.NamedNode};
  readonly kind: "Shacl";
}`,
);
