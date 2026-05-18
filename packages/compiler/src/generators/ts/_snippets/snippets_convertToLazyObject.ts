import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazyObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazyObject`,
    code`\
function ${syntheticNamePrefix}convertToLazyObject<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (value: ${snippets.LazyObject}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | ResolvedObjectT): ${imports.Either}<Error, ${snippets.LazyObject}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    if (value instanceof ${snippets.LazyObject}) {
      return ${imports.Either}.of(value);
    }

    return ${imports.Either}.of(new ${snippets.LazyObject}({
      partial: resolvedToPartial(value),
      resolver: async () => ${imports.Right}(value)
    }));
  };
}`,
  );
