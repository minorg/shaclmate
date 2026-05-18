import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToArray`,
    code`\
function ${syntheticNamePrefix}convertToArray<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, readonly: Readonly) {
  return (value: readonly ItemSourceT[] | undefined): ${imports.Either}<Error, Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>> => 
    typeof value === "undefined" ? ${imports.Either}.of<Error, Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>>([]) : ${imports.Either}.sequence(value.map(convertToItem));
}`,
  );
