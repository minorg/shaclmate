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
function ${syntheticNamePrefix}convertToArraySet<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, _readonly: Readonly) {
  type ItemTargetArrayT = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: readonly ItemSourceT[] | undefined): ${imports.Either}<Error, ItemTargetArrayT> => 
    (typeof value === "undefined" ? ${imports.Either}.of([]) : ${imports.Either}.sequence(value.map(convertToItem))) as ${imports.Either}<Error, ItemTargetArrayT>;
}`,
  );
