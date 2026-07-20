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
function ${syntheticNamePrefix}convertToArraySet<DefaultNamespaceT extends ${snippets.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<readonly ItemSourceT[] | undefined, readonly ItemTargetT[], DefaultNamespaceT> {
  return (value, defaultNamespace) => (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(value => convertToItem(value, defaultNamespace)))) as ${imports.Either}<Error, readonly ItemTargetT[]>;
}`,
  );
