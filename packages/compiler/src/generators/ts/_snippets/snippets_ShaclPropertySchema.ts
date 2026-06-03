import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ShaclPropertySchema: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ShaclPropertySchema`,
    code`\
export interface ${syntheticNamePrefix}ShaclPropertySchema<TypeSchemaT> {
  readonly kind: "Shacl";
  readonly path: ${snippets.PropertyPath};
  readonly type: TypeSchemaT;
}`,
  );
