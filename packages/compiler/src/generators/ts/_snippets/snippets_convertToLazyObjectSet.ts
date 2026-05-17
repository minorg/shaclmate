import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazyObjectSet: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazyObjectSet`,
    code`\
function ${syntheticNamePrefix}convertToLazyObjectSet<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (schema: unknown, value: ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | readonly ResolvedObjectT[] | undefined): ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyObjectSet}) {
          return value;
        }

        return new ${snippets.LazyObjectSet}({
          partials: value.map(resolvedToPartial),
          resolver: async () => ${imports.Right}(value)
        });
      }
      case "undefined":
        return new ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partials: [],
          resolver: async () => ${imports.Right}([]])
        });
    }
  };
}`,
  );
