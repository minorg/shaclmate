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
  return (value: ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | readonly ResolvedObjectT[] | undefined): ${imports.Either}<Error, ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazyObjectSet}) {
          return ${imports.Either}.of(value);
        }

        const captureValue = value;
        return ${imports.Either}.of(new ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partials: value.map(resolvedToPartial),
          resolver: async () => ${imports.Right}(captureValue)
        }));
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazyObjectSet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partials: [],
          resolver: async () => ${imports.Right}([])
        }));
    }
  };
}`,
  );
