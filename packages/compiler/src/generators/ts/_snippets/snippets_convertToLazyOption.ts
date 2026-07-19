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
function ${syntheticNamePrefix}convertToLazyOption<PartialT, ResolvedT>(
  isPartial: (object: PartialT | ResolvedT) => object is PartialT,
  resolvedToPartial: (resolved: ResolvedT) => PartialT
): ${snippets.ConversionFunction}<${snippets.LazyOption}<PartialT, ResolvedT> | ${imports.Maybe}<PartialT> | ${imports.Maybe}<ResolvedT> | PartialT | ResolvedT | undefined, ${snippets.LazyOption}<PartialT, ResolvedT>> {
  return (value) => {
    if (value instanceof ${snippets.LazyOption}) {
      return ${imports.Either}.of(value);
    }

    let extractedValue: PartialT | ResolvedT | undefined;
    if (typeof value === "undefined") {
      extractedValue = value;
    } else if (${imports.Maybe}.isMaybe(value)) {
      extractedValue = value.extract();
    } else {
      extractedValue = value;
    }

    if (typeof extractedValue === "undefined") {
      return ${imports.Either}.of(new ${snippets.LazyOption}<PartialT, ResolvedT>({
        partial: ${imports.Maybe}.empty(),
        resolver: async () => { throw new Error("should never be called"); }
      }));
    }

    if (isPartial(extractedValue)) {
      const partial: PartialT = extractedValue;
      return ${imports.Either}.of(
        new ${snippets.LazyOption}({
          partial: ${imports.Maybe}.of(partial),
          resolver: async () => ${imports.Left}(new Error("unable to resolve"))
        })
      );
    }

    const resolved: ResolvedT = extractedValue;
    return ${imports.Either}.of(
      new ${snippets.LazyOption}({
        partial: ${imports.Maybe}.of(resolvedToPartial(resolved)),
        resolver: async () => ${imports.Right}(resolved)
      })
    );
  };
}`,
  );
