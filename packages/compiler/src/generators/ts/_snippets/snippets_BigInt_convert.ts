import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigInt_convert: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigInt.convert`,
    code`\
namespace ${syntheticNamePrefix}BigInt {
  export const convert: ${snippets.ConversionFunction}<bigint | number | string, bigint> = (value) =>
    ${imports.Either}.encase(() => BigInt(value));
}`,
  );
