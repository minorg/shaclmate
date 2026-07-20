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
function ${syntheticNamePrefix}convertToMutableArraySet<DefaultNamespaceT extends ${snippets.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<readonly ItemSourceT[] | undefined, ItemTargetT[], DefaultNamespaceT> {
  return (value, defaultNamespace) => (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(value => convertToItem(value, defaultNamespace)))) as ${imports.Either}<Error, ItemTargetT[]>;
}`,
  );
