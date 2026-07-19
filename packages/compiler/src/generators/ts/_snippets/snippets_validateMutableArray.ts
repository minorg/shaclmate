import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_validateMutableArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}validateMutableArray`,
    code`\
function ${syntheticNamePrefix}validateMutableArray<ItemSchemaT, ItemValueT>(validateItem: ${snippets.ValidationFunction}<ItemSchemaT, ItemValueT>): ${snippets.ValidationFunction}<${snippets.CollectionSchema}<ItemSchemaT>, ItemValueT[]> {
  return (schema, valueArray) => {
    if (schema.minCount !== undefined && valueArray.length < schema.minCount) {
      return ${imports.Left}(new Error(\`value array has length (\${valueArray.length}) less than minCount (\${schema.minCount})\`)) as ${imports.Either}<Error, ItemValueT[]>;
    }

    return ${imports.Either}.sequence(valueArray.map(value => validateItem(schema.itemType, value))) as ${imports.Either}<Error, ItemValueT[]>;
  }
}`,
  );
