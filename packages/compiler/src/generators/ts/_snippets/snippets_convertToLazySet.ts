import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazySet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazySet`,
    code`\
function ${syntheticNamePrefix}convertToLazySet<PartialT, ResolvedT>(
  resolvedToPartial: (resolved: ResolvedT) => PartialT
): ${snippets.ConversionFunction}<${snippets.LazySet}<PartialT, ResolvedT> | readonly ResolvedT[] | ResolvedT | undefined, ${snippets.LazySet}<PartialT, ResolvedT>>  {
  return (value) => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of(new ${snippets.LazySet}<PartialT, ResolvedT>({
        partials: [],
        resolver: async () => ${imports.Right}([])
      }));
    }

    if (value instanceof ${snippets.LazySet}) {
      return ${imports.Either}.of(value);
    }

    const resolved = (Array.isArray(value) ? value : [value]) as readonly ResolvedT[];
    return ${imports.Either}.of(
      new ${snippets.LazySet}<PartialT, ResolvedT>({
        partials: resolved.map(resolvedToPartial),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
