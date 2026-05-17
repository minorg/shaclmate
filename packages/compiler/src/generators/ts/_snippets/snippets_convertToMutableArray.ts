import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMutableArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMutableArray`,
    code`\
function ${syntheticNamePrefix}convertToMutableArray<ItemSchemaT, ItemSourceT, ItemTargetT>(convertToItem: (schema: ItemSchemaT, value: ItemSourceT) => ${imports.Either}<Error, ItemTargetT>) {
  return (schema: ${snippets.CollectionSchema}<ItemSchemaT>, value: readonly ItemSourceT[] | undefined): ${imports.Either}<Error, ItemTargetT[]> => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of([]);
    }
    return ${imports.Either}.sequence(value.map(item => convertToItem(schema.item(), item)));
  }
}`,
  );
