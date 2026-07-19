import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToArraySet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToArraySet`,
    code`\
function ${syntheticNamePrefix}convertToArraySet<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<readonly ItemSourceT[] | undefined, readonly ItemTargetT[]> {
  return (value) => (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(convertToItem))) as ${imports.Either}<Error, readonly ItemTargetT[]>;
}`,
  );
