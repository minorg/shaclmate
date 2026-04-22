import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_PropertyPath } from "./snippets_PropertyPath.js";

export const snippets_ShaclPropertySchema = conditionalOutput(
  `${syntheticNamePrefix}ShaclPropertySchema`,
  code`\
export interface ${syntheticNamePrefix}ShaclPropertySchema<TypeSchemaT = object> {
  readonly kind: "Shacl";
  readonly path: ${snippets_PropertyPath};
  readonly type: () => TypeSchemaT;
}`,
);
