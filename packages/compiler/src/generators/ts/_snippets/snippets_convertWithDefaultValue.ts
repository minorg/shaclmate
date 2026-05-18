import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertWithDefaultValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertWithDefaultValue`,
    code`\
function ${syntheticNamePrefix}convertWithDefaultValue<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, defaultValue: ItemSourceT) {
  return (value: ItemSourceT | undefined): ${imports.Either}<Error, ItemTargetT> => {
    if (typeof value === "undefined") {
      return convertToItem(defaultValue);
    }
    return convertToItem(value);
  }
}`,
  );
