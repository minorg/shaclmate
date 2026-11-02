import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_intFromJsonNumber: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}intFromJsonNumber`,
    code`\
function ${syntheticNamePrefix}intFromJsonNumber<IntT extends number>(jsonNumber: IntT, _options: Parameters<${snippets.FromJsonValueFunction}<IntT, IntT, ${snippets.NumericSchema}<IntT>>>[1]): ${imports.Either}<Error, IntT> {
  return ${imports.Either}.of(jsonNumber);
}`,
  );
