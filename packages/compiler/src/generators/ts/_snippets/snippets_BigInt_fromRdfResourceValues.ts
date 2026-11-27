import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigInt_fromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigInt.fromRdfResourceValues`,
    code`\
namespace ${syntheticNamePrefix}BigInt {
  export function fromRdfResourceValues<BigIntT extends bigint>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<BigIntT>> {
    return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toBigInt(options.schema.in) : value.toBigInt() as ${imports.Either}<Error, BigIntT>));
  }
}`,
  );
