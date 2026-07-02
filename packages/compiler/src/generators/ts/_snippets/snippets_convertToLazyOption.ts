import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazyOption: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazyOption`,
    code`\
function ${syntheticNamePrefix}convertToLazyOption<PartialSourceT, PartialTargetT, ResolvedSourceT, ResolvedTargetT>(
  convertToPartial: (object: PartialSourceT) => ${imports.Either}<Error, PartialTargetT>,
  convertToResolved: (object: ResolvedSourceT) => ${imports.Either}<Error, ResolvedTargetT>,
  isPartialSource: (object: PartialSourceT | ResolvedSourceT) => object is PartialSourceT,
  resolvedToPartial: (resolved: ResolvedTargetT) => PartialTargetT
) {
  return (value: ${snippets.LazyOption}<PartialTargetT, ResolvedTargetT> | ${imports.Maybe}<PartialSourceT> | ${imports.Maybe}<ResolvedSourceT> | PartialSourceT | ResolvedSourceT | undefined): ${imports.Either}<Error, ${snippets.LazyOption}<PartialTargetT, ResolvedTargetT>> => {
    if (value instanceof ${snippets.LazyOption}) {
      return ${imports.Either}.of(value);
    }

    let extractedValue: PartialSourceT | ResolvedSourceT | undefined;
    if (typeof value === "undefined") {
      extractedValue = value;
    } else if (${imports.Maybe}.isMaybe(value)) {
      extractedValue = value.extract();
    } else {
      extractedValue = value;
    }

    if (typeof extractedValue === "undefined") {
      return ${imports.Either}.of(new ${snippets.LazyOption}<PartialTargetT, ResolvedTargetT>({
        partial: ${imports.Maybe}.empty(),
        resolver: async () => { throw new Error("should never be called"); }
      }));
    }

    if (isPartialSource(extractedValue)) {
      return convertToPartial(extractedValue).map(partial => 
        new ${snippets.LazyOption}({
          partial: ${imports.Maybe}.of(partial),
          resolver: async () => ${imports.Left}(new Error("unable to resolve"))
        })
      );
    }

    return convertToResolved(extractedValue).map(resolved =>
      new ${snippets.LazyOption}({
        partial: ${imports.Maybe}.of(resolvedToPartial(resolved)),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
