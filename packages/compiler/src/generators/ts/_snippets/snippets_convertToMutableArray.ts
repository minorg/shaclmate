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
    return (typeof value === "undefined" ? ${imports.Either}.of<Error, ItemTargetT[]>([]) : ${imports.Either}.sequence(value.map(item => convertToItem(schema.item(), item))))
      .chain(array => {
        if (schema.minCount !== undefined && array.length < schema.minCount) {
          return ${imports.Left}(new Error(\`array has length (\${array.length}) less than minCount (\${schema.minCount})\`));
        }
        return ${imports.Either}.of(array);
      });
  }
}`,
  );
