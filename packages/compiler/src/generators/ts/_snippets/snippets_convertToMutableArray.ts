import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMutableArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMutableArray`,
    code`\
function ${syntheticNamePrefix}convertToMutableArray<ItemSchemaT, ItemSourceT, ItemTargetT>(convertToItem: (schema: ItemSchemaT, value: ItemSourceT) => ItemTargetT) {
  return (schema: ${snippets.CollectionSchema}<ItemSchemaT>, value: readonly ItemSourceT[] | undefined): ItemTargetT[] => {
    if (typeof value === "undefined") {
      return [];
    }
    return value.map(item => convertToItem(schema.item(), item));
  }
}`,
  );
