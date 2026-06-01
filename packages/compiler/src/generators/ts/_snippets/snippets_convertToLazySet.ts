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
function ${syntheticNamePrefix}convertToLazySet<PartialT, ResolvedT>(resolvedToPartial: (resolved: ResolvedT) => PartialT) {
  return (value: ${snippets.LazySet}<PartialT, ResolvedT> | readonly ResolvedT[] | undefined): ${imports.Either}<Error, ${snippets.LazySet}<PartialT, ResolvedT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazySet}) {
          return ${imports.Either}.of(value);
        }

        const captureValue = value;
        return ${imports.Either}.of(new ${snippets.LazySet}<PartialT, ResolvedT>({
          partials: value.map(resolvedToPartial),
          resolver: async () => ${imports.Right}(captureValue)
        }));
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazySet}<PartialT, ResolvedT>({
          partials: [],
          resolver: async () => ${imports.Right}([])
        }));
    }
  };
}`,
  );
