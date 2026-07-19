import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_validateArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}validateArray`,
    code`\
function ${syntheticNamePrefix}validateArray<ItemSchemaT, ItemValueT>(validateItem: ${snippets.ValidationFunction}<ItemSchemaT, ItemValueT>): ${snippets.ValidationFunction}<${snippets.CollectionSchema}<ItemSchemaT>, readonly ItemValueT[]> {
  return (schema, valueArray) => {
    if (schema.minCount !== undefined && valueArray.length < schema.minCount) {
      return ${imports.Left}(new Error(\`value array has length (\${valueArray.length}) less than minCount (\${schema.minCount})\`)) as ${imports.Either}<Error, readonly ItemValueT[]>;
    }

    return ${imports.Either}.sequence(valueArray.map(value => validateItem(schema.itemType, value))) as ${imports.Either}<Error, readonly ItemValueT[]>;
  }
}`,
  );
