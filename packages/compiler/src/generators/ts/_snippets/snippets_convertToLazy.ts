import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLazy: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLazy`,
    code`\
function ${syntheticNamePrefix}convertToLazy<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: () => ObjectIdentifierT }>(resolvedToPartial: (resolved: ResolvedObjectT) => PartialObjectT) {
  return (value: ${snippets.Lazy}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT> | ResolvedObjectT): ${imports.Either}<Error, ${snippets.Lazy}<ObjectIdentifierT, PartialObjectT, ResolvedObjectT>> => {
    if (value instanceof ${snippets.Lazy}) {
      return ${imports.Either}.of(value);
    }

    return ${imports.Either}.of(new ${snippets.Lazy}({
      partial: resolvedToPartial(value),
      resolver: async () => ${imports.Right}(value)
    }));
  };
}`,
  );
