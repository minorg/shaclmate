import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToList: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToList`,
    code`\
function ${syntheticNamePrefix}convertToList<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<readonly ItemSourceT[], readonly ItemTargetT[]> {
  return (value) => ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, readonly ItemTargetT[]>;
}`,
  );
