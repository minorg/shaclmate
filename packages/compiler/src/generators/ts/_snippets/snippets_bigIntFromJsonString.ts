import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromJsonString`,
    code`\
function ${syntheticNamePrefix}bigIntFromJsonString<JsonValueT extends string, BigIntT extends bigint>(jsonValue: JsonValueT, options: Parameters<${snippets.FromJsonValueFunction}<string, BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
  const { schema } = options;
  return ${imports.Either}.encase(() => BigInt(jsonValue) as BigIntT)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
