import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertWithDefaultValue: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertWithDefaultValue`,
    code`\
function ${syntheticNamePrefix}convertWithDefaultValue<DefaultValueT extends ItemSourceT, ItemSchemaT, ItemSourceT, ItemTargetT>(convertToItem: (schema: ItemSchemaT, value: ItemSourceT) => ItemTargetT) {
  return (schema: ${snippets.DefaultValueSchema}<DefaultValueT, ItemSchemaT>, value: ItemSourceT | undefined): ItemTargetT => {
    if (typeof value === "undefined") {
      return convertToItem(schema.item(), schema.defaultValue);
    }
    return convertToItem(schema.item(), value);
  }
}`,
  );
