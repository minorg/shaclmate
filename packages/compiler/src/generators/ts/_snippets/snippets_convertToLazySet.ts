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
  isPartial: (object: PartialT | ResolvedT) => object is PartialT,
  resolvedToPartial: (resolved: ResolvedT) => PartialT
) {
  return (value: ${snippets.LazySet}<PartialT, ResolvedT> | readonly PartialT[] | readonly ResolvedT[] | PartialT | ResolvedT | undefined): ${imports.Either}<Error, ${snippets.LazySet}<PartialT, ResolvedT>> => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of(new ${snippets.LazySet}<PartialT, ResolvedT>({
        partials: [],
        resolver: async () => ${imports.Right}([])
      }));
    }

    if (value instanceof ${snippets.LazySet}) {
      return ${imports.Either}.of(value);
    }

    const arrayValue = (Array.isArray(value) ? value : [value]) as readonly PartialT[] | readonly ResolvedT[];

    if (arrayValue.every(isPartial)) {
      const partials: readonly PartialT[] = arrayValue;
      return ${imports.Either}.of(
        new ${snippets.LazySet}<PartialT, ResolvedT>({
          partials,
          resolver: async () => ${imports.Left}(new Error("unable to resolve"))
        })
      );
    }

    const resolved: readonly ResolvedT[] = arrayValue;
    return ${imports.Either}.of(
      new ${snippets.LazySet}<PartialT, ResolvedT>({
        partials: resolved.map(resolvedToPartial),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
