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
function ${syntheticNamePrefix}convertToLazy<PartialSourceT, PartialTargetT, ResolvedSourceT, ResolvedTargetT>(
  convertToPartial: (object: PartialSourceT) => PartialTargetT,
  convertToResolved: (object: ResolvedSourceT) => ResolvedTargetT,
  isPartialSource: (object: PartialSourceT | ResolvedSourceT): object is PartialSourceT,
  resolvedToPartial: (resolved: ResolvedTargetT) => PartialTargetT
) {
  return (value: ${snippets.Lazy}<PartialTargetT, ResolvedTargetT> | PartialSourceT | ResolvedSourceT): ${imports.Either}<Error, ${snippets.Lazy}<PartialTargetT, ResolvedTargetT>> => {
    if (value instanceof ${snippets.Lazy}) {
      return ${imports.Either}.of(value);
    }

    if (isPartialSource(value)) {
      return ${imports.Either}.of(new ${snippets.Lazy}({
        partial: convertToPartial(value),
        resolver: async () => ${imports.Left}(new Error("unable to resolve"))
      }));
    }

    const resolved = convertToResolved(value);
    return ${imports.Either}.of(new ${snippets.Lazy}({
      partial: resolvedToPartial(resolved),
      resolver: async () => ${imports.Right}(resolved)
    }));
  };
}`,
  );
