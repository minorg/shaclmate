import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_toJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.toJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {   
  export function toJsonObject(datatype: ${imports.NamedNode}): ${snippets.ToJsonFunction}<${imports.BigDecimal}, ${snippets.TypedLiteralJsonObject}> {
    return (value) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.bigdecimal(value, datatype));
  }
}`,
  );
