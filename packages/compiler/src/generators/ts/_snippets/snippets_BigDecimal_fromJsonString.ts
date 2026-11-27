import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_fromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.fromJsonString`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const fromJsonString: ${snippets.FromJsonFunction}<string, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
    (jsonValue) => ${imports.Either}.encase(() => new ${imports.BigDecimal}(jsonValue));
}`,
  );
