import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMutableList: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMutableList`,
    code`\
function ${syntheticNamePrefix}convertToMutableList<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<readonly ItemSourceT[], ItemTargetT[]> {
  return (value) => ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, ItemTargetT[]>;
}`,
  );
