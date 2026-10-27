import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveToCompactedJson: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveToCompactedJson`,
    code`\
function ${syntheticNamePrefix}primitiveToCompactedJson<PrimitiveT extends boolean | number | string>(primitive: PrimitiveT): PrimitiveT {
  return primitive;
}`,
  );
