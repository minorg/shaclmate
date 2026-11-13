import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromJsonValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromJsonValue`,
    code`\
const ${syntheticNamePrefix}bigDecimalFromJsonValue: ${snippets.FromJsonFunction}<number | string, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
  (jsonValue) => ${imports.Either}.encase(() => new ${imports.BigDecimal}(jsonValue));`,
  );
