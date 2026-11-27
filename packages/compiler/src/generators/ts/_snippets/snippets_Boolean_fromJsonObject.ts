import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_fromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.fromJsonObject`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export function fromJsonObject<BooleanT extends boolean>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonFunction}<${snippets.TypedLiteralJsonObject}, BooleanT, ${snippets.Boolean_Schema}<BooleanT>>>[1]): ${imports.Either}<Error, BooleanT> {
    const { schema } = options;
    return ${snippets.literalFromJsonObject}(jsonObject)
      .chain(${imports.LiteralDecoder}.decodeBooleanLiteral)
      .chain(value => ${snippets.constrainPrimitive}<BooleanT, boolean>(value, schema.in)) as ${imports.Either}<Error, BooleanT>;
  }
}`,
  );
