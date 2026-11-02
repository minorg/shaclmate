import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveToJsonValue: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveToJsonValue`,
    code`\
function ${syntheticNamePrefix}primitiveToJsonValue<PrimitiveT extends boolean | number | string>(primitive: PrimitiveT): PrimitiveT {
  return primitive;
}`,
  );
