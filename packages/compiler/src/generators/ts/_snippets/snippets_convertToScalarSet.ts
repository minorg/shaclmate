import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToScalarSet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToScalarSet`,
    code`\
function ${syntheticNamePrefix}convertToScalarSet<ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>): ${snippets.ConversionFunction}<ItemSourceT | readonly ItemSourceT[] | undefined, readonly ItemTargetT[]> {
  return (value) => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of<Error, readonly ItemTargetT[]>([] as unknown as readonly ItemTargetT[]);
    }
    if (Array.isArray(value)) {
      return ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, readonly ItemTargetT[]>;
    }
    return convertToItem(value as ItemSourceT).map(value => [value]) as ${imports.Either}<Error, readonly ItemTargetT[]>;
  };
}`,
  );
