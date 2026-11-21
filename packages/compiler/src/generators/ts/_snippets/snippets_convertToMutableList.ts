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
function ${syntheticNamePrefix}convertToMutableList<DefaultNamespaceT extends ${imports.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<readonly ItemSourceT[], ItemTargetT[], DefaultNamespaceT> {
  return (value, options) => ${imports.Either}.sequence(value.map(value => convertToItem(value, options))) as ${imports.Either}<Error, ItemTargetT[]>;
}`,
  );
