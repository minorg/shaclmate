import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromJsonValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromJsonString`,
    code`\
function ${syntheticNamePrefix}bigIntFromJsonString<JsonValueT extends number | string, BigIntT extends bigint>(jsonValue: JsonValueT, options: Parameters<${snippets.FromJsonFunction}<string, BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
  const { schema } = options;
  return ${imports.Either}.encase(() => BigInt(jsonValue) as BigIntT)
    .chain(value => ${snippets.constrainPrimitive}<BigIntT, bigint>(value, schema.in)) as ${imports.Either}<Error, BigIntT>;
}`,
  );
