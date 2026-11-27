import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_toJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.toJsonString`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const toJsonString: ${snippets.ToJsonFunction}<${imports.BigDecimal}, string> =
    (bigDecimal) => bigDecimal.toFixed();
}`,
  );
