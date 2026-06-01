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
function ${syntheticNamePrefix}convertToLazyOption<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (value: ${snippets.LazyOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | ${imports.Maybe}<ResolvedObjectT> | ResolvedObjectT | undefined): ${imports.Either}<Error, ${snippets.LazyOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyOption}) {
          return ${imports.Either}.of(value);
        }

        if (${imports.Maybe}.isMaybe(value)) {
          return ${imports.Either}.of(new ${snippets.LazyOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
            partial: value.map(resolvedToPartial),
            resolver: async () => ${imports.Right}(value.unsafeCoerce())
          }));
        }

        return ${imports.Either}.of(new ${snippets.LazyOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partial: ${imports.Maybe}.of(resolvedToPartial(value)),
          resolver: async () => ${imports.Right}(value)
        }));
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazyOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partial: ${imports.Maybe}.empty(),
          resolver: async () => { throw new Error("should never be called"); }
        }));
    }
  };
}`,
  );
