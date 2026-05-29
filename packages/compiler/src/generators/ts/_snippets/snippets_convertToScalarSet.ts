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
function ${syntheticNamePrefix}convertToScalarSet<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, _readonly: Readonly) {
  type ItemTargetArrayT = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: ItemSourceT | readonly ItemSourceT[] | undefined): ${imports.Either}<Error, ItemTargetArrayT> => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of<Error, ItemTargetArrayT>([] as unknown as ItemTargetArrayT);
    }
    if (Array.isArray(value)) {
      return ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, ItemTargetArrayT>;
    }
    return convertToItem(value as ItemSourceT).map(value => [value]) as ${imports.Either}<Error, ItemTargetArrayT>;
  };
}`,
  );
