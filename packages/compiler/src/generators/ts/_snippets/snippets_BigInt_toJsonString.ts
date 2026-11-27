import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigInt_toJsonString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigInt.toJsonString`,
    code`\
namespace ${syntheticNamePrefix}BigInt {    
  export const toJsonString: ${snippets.ToJsonFunction}<bigint, string> =
    (bigInt) => bigInt.toString();
}`,
  );
