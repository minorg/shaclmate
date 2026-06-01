import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazy: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazy`,
    code`\
function ${syntheticNamePrefix}convertToLazy<PartialT, ResolvedT>(resolvedToPartial: (resolved: ResolvedT) => PartialT) {
  return (value: ${snippets.Lazy}<PartialT, ResolvedT> | ResolvedT): ${imports.Either}<Error, ${snippets.Lazy}<PartialT, ResolvedT>> => {
    if (value instanceof ${snippets.Lazy}) {
      return ${imports.Either}.of(value);
    }

    return ${imports.Either}.of(new ${snippets.Lazy}({
      partial: resolvedToPartial(value),
      resolver: async () => ${imports.Right}(value)
    }));
  };
}`,
  );
