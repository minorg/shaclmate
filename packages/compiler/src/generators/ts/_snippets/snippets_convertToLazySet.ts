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
function ${syntheticNamePrefix}convertToLazySet<PartialSourceT, PartialTargetT, ResolvedSourceT, ResolvedTargetT>(
  convertToPartial: (object: PartialSourceT) => ${imports.Either}<Error, PartialTargetT>,
  convertToResolved: (object: ResolvedSourceT) => ${imports.Either}<Error, ResolvedTargetT>,
  isPartialSource: (object: PartialSourceT | ResolvedSourceT) => object is PartialSourceT,
  resolvedToPartial: (resolved: ResolvedTargetT) => PartialTargetT
) {
  return (value: ${snippets.LazySet}<PartialTargetT, ResolvedTargetT> | readonly PartialSourceT[] | readonly ResolvedSourceT[] | PartialSourceT | ResolvedSourceT | undefined): ${imports.Either}<Error, ${snippets.LazySet}<PartialTargetT, ResolvedTargetT>> => {
    if (typeof value === "undefined") {
      return ${imports.Either}.of(new ${snippets.LazySet}<PartialTargetT, ResolvedTargetT>({
        partials: [],
        resolver: async () => ${imports.Right}([])
      }));
    }

    if (value instanceof ${snippets.LazySet}) {
      return ${imports.Either}.of(value);
    }

    const arrayValue = (Array.isArray(value) ? value : [value]) as readonly PartialSourceT[] | readonly ResolvedSourceT[];

    if (arrayValue.every(isPartialSource)) {
      return ${imports.Either}.sequence(arrayValue.map(convertToPartial)).map(partials =>
        new ${snippets.LazySet}<PartialTargetT, ResolvedTargetT>({
          partials,
          resolver: async () => ${imports.Left}(new Error("unable to resolve"))
        })
      );
    }

    return ${imports.Either}.sequence(arrayValue.map(convertToResolved)).map(resolved =>
      new ${snippets.LazySet}<PartialTargetT, ResolvedTargetT>({
        partials: resolved.map(resolvedToPartial),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
