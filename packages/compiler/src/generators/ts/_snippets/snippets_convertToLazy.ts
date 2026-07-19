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
  isPartial: (object: PartialT | ResolvedT) => object is PartialT,
  resolvedToPartial: (resolved: ResolvedT) => PartialT
): ${snippets.ConversionFunction}<${snippets.Lazy}<PartialT, ResolvedT> | PartialT | ResolvedT, ${snippets.Lazy}<PartialT, ResolvedT>>
  return (value) => {
    if (value instanceof ${snippets.Lazy}) {
      return ${imports.Either}.of(value);
    }

    if (isPartial(value)) {
      const partial: PartialT = value;
      return ${imports.Either}.of(
        new ${snippets.Lazy}({
          partial,
          resolver: async () => ${imports.Left}(new Error("unable to resolve"))
        })
      );
    }

    const resolved: ResolvedT = value;
    return ${imports.Either}.of(
      new ${snippets.Lazy}({
        partial: resolvedToPartial(resolved),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
