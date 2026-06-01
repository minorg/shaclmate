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
function ${syntheticNamePrefix}convertToLazyOption<PartialT, ResolvedT>(resolvedToPartial: (resolved: ResolvedT) => PartialT) {
  return (value: ${snippets.LazyOption}<PartialT, ResolvedT> | ${imports.Maybe}<ResolvedT> | ResolvedT | undefined): ${imports.Either}<Error, ${snippets.LazyOption}<PartialT, ResolvedT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyOption}) {
          return ${imports.Either}.of(value);
        }

        if (${imports.Maybe}.isMaybe(value)) {
          return ${imports.Either}.of(new ${snippets.LazyOption}<PartialT, ResolvedT>({
            partial: value.map(resolvedToPartial),
            resolver: async () => ${imports.Right}(value.unsafeCoerce())
          }));
        }

        break;
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazyOption}<PartialT, ResolvedT>({
          partial: ${imports.Maybe}.empty(),
          resolver: async () => { throw new Error("should never be called"); }
        }));
    }

    return ${imports.Either}.of(new ${snippets.LazyOption}<PartialT, ResolvedT>({
      partial: ${imports.Maybe}.of(resolvedToPartial(value)),
      resolver: async () => ${imports.Right}(value)
    }));
  };
}`,
  );
