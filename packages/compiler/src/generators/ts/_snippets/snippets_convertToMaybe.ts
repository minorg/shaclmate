import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToMaybe: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToMaybe`,
    code`\
function ${syntheticNamePrefix}convertToMaybe<ItemSchemaT, ItemSourceT, ItemTargetT>(convertToItem: (schema: ItemSchemaT, value: ItemSourceT) => ${imports.Either}<Error, ItemTargetT>) {
  return (schema: ${snippets.MaybeSchema}<ItemSchemaT>, value: ItemSourceT | ${imports.Maybe}<ItemTargetT> | undefined): ${imports.Either}<Error, ${imports.Maybe}<ItemTargetT>> => {
    switch (typeof value) {
      case "object": {
        if (${imports.Maybe}.isMaybe(value)) {
          return ${imports.Either}.of(value as ${imports.Maybe}<ItemTargetT>);
        }
        break;
      }
      case "undefined":
        return ${imports.Either}.of(${imports.Maybe}.empty());
    }

    return ${imports.Either}.of(${imports.Maybe}.of(convertToItem(schema.item(), value)));
  }
}`,
  );
