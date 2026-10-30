import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveFromJsonValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveFromJsonValue`,
    code`\
function ${syntheticNamePrefix}primitiveFromJsonValue<PrimitiveT extends boolean | number | string>(jsonValue: PrimitiveT, options: Parameters<${snippets.FromJsonValueFunction}<PrimitiveT, PrimitiveT, { readonly in?: readonly PrimitiveT[] }>>[1]): ${imports.Either}<Error, PrimitiveT> {
  return ${imports.Either}.of<Error, PrimitiveT>(jsonValue)
    .chain(primitiveValue => ${snippets.constrainPrimitive}(primitiveValue, options.schema.in));
}`,
  );
