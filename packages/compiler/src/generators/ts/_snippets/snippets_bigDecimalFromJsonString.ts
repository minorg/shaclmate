import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromJsonString`,
    code`\
const ${syntheticNamePrefix}bigDecimalFromJsonString: ${snippets.FromJsonValueFunction}<string, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
  (jsonValue) => ${imports.Either}.encase(() => new ${imports.BigDecimal}(jsonValue));`,
  );
