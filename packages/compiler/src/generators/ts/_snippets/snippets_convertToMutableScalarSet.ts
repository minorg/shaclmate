import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMutableScalarSet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMutableScalarSet`,
    code`\
function ${syntheticNamePrefix}convertToMutableScalarSet<DefaultNamespaceT extends ${snippets.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<ItemSourceT | readonly ItemSourceT[] | undefined, ItemTargetT[], DefaultNamespaceT> {
  return (value, defaultNamespace) => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of<Error, ItemTargetT[]>([] as unknown as ItemTargetT[]);
    }
    if (Array.isArray(value)) {
      return ${imports.Either}.sequence(value.map(value => convertToItem(value, defaultNamespace))) as ${imports.Either}<Error, ItemTargetT[]>;
    }
    return convertToItem(value as ItemSourceT, defaultNamespace).map(value => [value]) as ${imports.Either}<Error, ItemTargetT[]>;
  };
}`,
  );
