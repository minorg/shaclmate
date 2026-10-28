import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}bigIntFromCompactedJson<CompactedJsonT extends string, BigIntT extends bigint>(compactedJson: CompactedJsonT, options: Parameters<${snippets.FromExpandedJsonFunction}<BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
  const { schema } = options;
  return ${imports.Either}.encase(() => BigInt(compactedJson) as BigIntT)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
