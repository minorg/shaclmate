import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalToJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalToJsonString`,
    code`\
const ${syntheticNamePrefix}bigDecimalToJsonString: ${snippets.ToJsonValueFunction}<${imports.BigDecimal}, string> =
  (bigDecimal) => bigDecimal.toFixed();`,
  );
