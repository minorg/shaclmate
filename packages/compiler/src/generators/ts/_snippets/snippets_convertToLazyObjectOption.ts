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
  return (schema: unknown, value: ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | ${imports.Maybe}<ResolvedObjectT> | ResolvedObjectT | undefined): ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyObjectOption}) {
          return value;
        }

        if (${imports.Maybe}.isMaybe(value)) {
          return new ${snippets.LazyObjectOption}({
            partial: value.map(resolvedToPartial),
            resolver: async () => ${imports.Right}(value)
          });
        }

        return new ${snippets.LazyObjectOption}({
          partial: ${imports.Maybe}.of(resolvedToPartial(value)),
          resolver: async () => ${imports.Right}(${imports.Maybe}.of(value))
        });
      }
      case "undefined":
        return new ${snippets.LazyObjectOption}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partial: ${imports.Maybe}.empty(),
          resolver: async () => ${imports.Right}(${imports.Maybe}.empty())
        });
    }
  };
}`,
  );
