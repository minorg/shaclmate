import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazyObjectOption: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazyObjectOption`,
    code`\
function ${syntheticNamePrefix}convertToLazyObjectOption<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (_schema: unknown, value: ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | ${imports.Maybe}<ResolvedObjectT> | ResolvedObjectT | undefined): ${imports.Either}<Error, ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyObjectOption}) {
          return ${imports.Either}.of(value);
        }

        if (${imports.Maybe}.isMaybe(value)) {
          return ${imports.Either}.of(new ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
            partial: value.map(resolvedToPartial),
            resolver: async () => ${imports.Right}(value.unsafeCoerce())
          }));
        }

        return ${imports.Either}.of(new ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partial: ${imports.Maybe}.of(resolvedToPartial(value)),
          resolver: async () => ${imports.Right}(value)
        }));
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partial: ${imports.Maybe}.empty(),
          resolver: async () => { throw new Error("should never be called"); }
        }));
    }
  };
}`,
  );
