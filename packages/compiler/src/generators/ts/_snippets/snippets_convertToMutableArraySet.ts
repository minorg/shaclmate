import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMutableArraySet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMutableArraySet`,
    code`\
function ${syntheticNamePrefix}convertToMutableArraySet<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<readonly ItemSourceT[] | undefined, ItemTargetT[]> {
  return (value) => (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(convertToItem))) as ${imports.Either}<Error, ItemTargetT[]>;
}`,
  );
