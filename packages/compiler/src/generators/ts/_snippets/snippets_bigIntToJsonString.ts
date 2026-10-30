import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntToJsonString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntToJsonString`,
    code`\
const ${syntheticNamePrefix}bigIntToJsonString: ${snippets.ToJsonValueFunction}<bigint, string> =
  (bigInt) => bigInt.toString();`,
  );
