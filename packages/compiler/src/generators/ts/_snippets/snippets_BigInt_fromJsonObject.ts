import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigInt_fromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigInt.fromJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BigInt {
  export function fromJsonObject<BigIntT extends bigint>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonFunction}<${snippets.TypedLiteralJsonObject}, BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
    const { schema } = options;
    return ${snippets.literalFromJsonObject}(jsonObject)
      .chain(${imports.LiteralDecoder}.decodeBigIntLiteral)
      .chain(value => ${snippets.constrainPrimitive}<BigIntT, bigint>(value, schema.in)) as ${imports.Either}<Error, BigIntT>;
  }
}`,
  );
