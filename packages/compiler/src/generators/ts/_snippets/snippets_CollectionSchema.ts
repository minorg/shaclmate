import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_CollectionSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}CollectionSchema`,
    code`\
interface ${syntheticNamePrefix}CollectionSchema<ItemSchemaT> {
  readonly itemType: ItemSchemaT;
  readonly kind: "List" | "Set";
  readonly minCount?: number;
}`,
  );
