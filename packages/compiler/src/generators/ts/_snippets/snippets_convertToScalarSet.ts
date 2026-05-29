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
  type EitherR = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: ItemSourceT | readonly ItemSourceT[] | undefined): ${imports.Either}<Error, EitherR> => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of<Error, EitherR>([]);
    }
    if (Array.isArray(value)) {
      return ${imports.Either}.sequence<Error, EitherR>(value.map(convertToItem));
    }
    return ${imports.Either}.of<Error, EitherR>(convertToItem(value));
  };
}`,
  );
