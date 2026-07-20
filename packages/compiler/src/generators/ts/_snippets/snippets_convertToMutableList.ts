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
function ${syntheticNamePrefix}convertToMutableList<DefaultNamespaceT extends ${snippets.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<readonly ItemSourceT[], ItemTargetT[], DefaultNamespaceT> {
  return (value, defaultNamespace) => ${imports.Either}.sequence(value.map(value => convertToItem(value, defaultNamespace))) as ${imports.Either}<Error, ItemTargetT[]>;
}`,
  );
