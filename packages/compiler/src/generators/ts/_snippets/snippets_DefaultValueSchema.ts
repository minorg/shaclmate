import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DefaultValueSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}DefaultValueSchema`,
    code`\
interface ${syntheticNamePrefix}DefaultValueSchema<ItemSchemaT> {
  readonly defaultValue: ${imports.Literal} | ${imports.NamedNode};
  readonly itemType: ItemSchemaT;
  readonly kind: "DefaultValue";
}`,
  );
