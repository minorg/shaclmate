import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToList: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToList`,
    code`\
function ${syntheticNamePrefix}convertToList<ItemSourceT, ItemTargetT, Readonly extends boolean>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT>, _readonly: Readonly) {
  type ItemTargetArrayT = Readonly extends true ? ReadonlyArray<ItemTargetT> : Array<ItemTargetT>;
  return (value: readonly ItemSourceT[]): ${imports.Either}<Error, ItemTargetArrayT> => ${imports.Either}.sequence(value.map(convertToItem)) as ${imports.Either}<Error, ItemTargetArrayT>;
}`,
  );
