import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveFromCompactedJson: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}primitiveFromCompactedJson<PrimitiveT extends boolean | number | string>(compactedJson: PrimitiveT): PrimitiveT {
  return primitive;
}`,
  );
