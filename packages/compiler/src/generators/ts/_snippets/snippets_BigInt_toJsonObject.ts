import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigInt_toJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigInt.toJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BigInt {    
  export function toJsonObject(datatype: ${imports.NamedNode}): ${snippets.ToJsonFunction}<bigint, ${snippets.TypedLiteralJsonObject}> {
    return (value) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.bigint(value, datatype));
  }
}`,
  );
