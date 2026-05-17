import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToReadonlyArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToReadonlyArray`,
    code`\
function ${syntheticNamePrefix}convertToReadonlyArray<ItemSchemaT, ItemSourceT, ItemTargetT>(convertToItem: (schema: ItemSchemaT, value: ItemSourceT) => ItemTargetT) {
  return (schema: ${snippets.CollectionSchema}<ItemSchemaT>, value: readonly ItemSourceT[] | undefined): readonly ItemTargetT[] => {
    if (typeof value === "undefined") {
      return [];
    }
    return value.map(item => convertToItem(schema.item(), item));
  }
}`,
  );
