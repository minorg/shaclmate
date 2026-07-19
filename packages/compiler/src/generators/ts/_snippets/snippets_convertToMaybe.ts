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
function ${syntheticNamePrefix}convertToMaybe<DefaultNamespaceT extends ${snippets.NamespaceBuilder}, ItemSourceT, ItemTargetT>(convertToItem: ${snippets.ConversionFunction}<ItemSourceT, ItemTargetT, DefaultNamespaceT>): ${snippets.ConversionFunction}<ItemSourceT | ${imports.Maybe}<ItemTargetT> | undefined, ${imports.Maybe}<ItemTargetT>, DefaultNamespaceT> {
  return (value, defaultNamespace) => {
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

    return convertToItem(value, defaultNamespace).map(${imports.Maybe}.of);
  }
}`,
  );
