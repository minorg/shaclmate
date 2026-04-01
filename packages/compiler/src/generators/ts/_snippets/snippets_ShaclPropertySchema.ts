import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ShaclPropertySchema = conditionalOutput(
  `${syntheticNamePrefix}ShaclPropertySchema`,
  code`\
export interface ${syntheticNamePrefix}ShaclPropertySchema<TypeSchemaT = object> {
  readonly identifier: ${imports.NamedNode};
  readonly kind: "Shacl";
  readonly type: () => TypeSchemaT;
}`,
);
