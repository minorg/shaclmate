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
function ${syntheticNamePrefix}convertToLazy<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT
): ${snippets.ConversionFunction}<${snippets.Lazy}<PartialT, ResolvedT> | ResolvedT, ${snippets.Lazy}<PartialT, ResolvedT>> {
  return (value) => {
    if (value instanceof ${snippets.Lazy}) {
      return ${imports.Either}.of(value);
    }

    const resolved = value as ResolvedT;
    return ${imports.Either}.of(
      new ${snippets.Lazy}({
        partial: resolvedToPartial(resolved),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
