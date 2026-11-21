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
function ${syntheticNamePrefix}convertToList<DefaultNamespaceT extends ${imports.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<readonly ItemSourceT[], readonly ItemTargetT[], DefaultNamespaceT> {
  return (value, options) => ${imports.Either}.sequence(value.map(value => convertToItem(value, options))) as ${imports.Either}<Error, readonly ItemTargetT[]>;
}`,
  );
