import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ObjectTypeGuardFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ObjectTypeGuardFunction`,
    code`\
export type ${syntheticNamePrefix}ObjectTypeGuardFunction<ObjectT extends ${syntheticNamePrefix}Object> = (object: ${syntheticNamePrefix}Object) => object is ObjectT;`,
  );
