import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DefaultValueSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}DefaultValueSchema`,
    code`\
interface ${syntheticNamePrefix}DefaultValueSchema<DefaultValueT, ItemSchemaT> {
  readonly defaultValue: DefaultValueT;
  readonly item: () => ItemSchemaT;
  readonly kind: "DefaultValue";
}`,
  );
