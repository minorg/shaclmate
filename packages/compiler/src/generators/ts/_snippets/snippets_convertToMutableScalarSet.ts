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
function ${syntheticNamePrefix}convertToMutableScalarSet<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<ItemSourceT | readonly ItemSourceT[] | undefined, ItemTargetT[]> {
  return (value) => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of<Error, ItemTargetT[]>([] as unknown as ItemTargetT[]);
    }
    if (Array.isArray(value)) {
      return ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, ItemTargetT[]>;
    }
    return convertToItem(value as ItemSourceT).map(value => [value]) as ${imports.Either}<Error, ItemTargetT[]>;
  };
}`,
  );
