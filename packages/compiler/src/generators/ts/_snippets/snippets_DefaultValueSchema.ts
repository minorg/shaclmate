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
  readonly defaultValue: ${this.imports.Literal} | ${this.imports.NamedNode};
  readonly item: () => ItemSchemaT;
  readonly kind: "DefaultValue";
}`,
  );
