import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_floatFromJsonNumber: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}floatFromJsonNumber`,
    code`\
function ${syntheticNamePrefix}floatFromJsonNumber<FloatT extends number>(jsonNumber: FloatT, _options: Parameters<${snippets.FromJsonValueFunction}<FloatT, FloatT, ${snippets.NumericSchema}<FloatT>>>[1]): ${imports.Either}<Error, FloatT> {
  return ${imports.Either}.of(jsonNumber);
}`,
  );
