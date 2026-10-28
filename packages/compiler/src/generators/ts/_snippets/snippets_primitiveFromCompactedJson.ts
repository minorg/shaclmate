import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}primitiveFromCompactedJson<PrimitiveT extends boolean | number | string>(compactedJson: PrimitiveT, options: Parameters<${snippets.FromCompactedJsonFunction}<FloatT, { readonly in?: readonly PrimitiveT[] }>>[1]): ${imports.Either}<Error, PrimitiveT> {
  return ${imports.Either}.of<Error, PrimitiveT>(primitive)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
