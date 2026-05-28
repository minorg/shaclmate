import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToListSet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToListSet`,
    code`\
function ${syntheticNamePrefix}convertToListSet<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, _readonly: Readonly) {
  type EitherR = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: readonly ItemSourceT[] | undefined): ${imports.Either}<Error, EitherR> => 
    (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(convertToItem))) as ${imports.Either}<Error, EitherR>;
}`,
  );
