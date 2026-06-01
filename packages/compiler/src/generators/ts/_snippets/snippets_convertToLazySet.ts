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
function ${syntheticNamePrefix}convertToLazySet<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (value: ${snippets.LazySet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | readonly ResolvedObjectT[] | undefined): ${imports.Either}<Error, ${snippets.LazySet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    switch (typeof value) {
      case "object": {
        if (value instanceof ${snippets.LazySet}) {
          return ${imports.Either}.of(value);
        }

        const captureValue = value;
        return ${imports.Either}.of(new ${snippets.LazySet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partials: value.map(resolvedToPartial),
          resolver: async () => ${imports.Right}(captureValue)
        }));
      }
      case "undefined":
        return ${imports.Either}.of(new ${snippets.LazySet}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>({
          partials: [],
          resolver: async () => ${imports.Right}([])
        }));
    }
  };
}`,
  );
