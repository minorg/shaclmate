import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BooleanSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BooleanSchema`,
    code`\
interface ${syntheticNamePrefix}BooleanSchema {
  readonly kind: "Boolean";
  readonly in?: readonly boolean[];
}`,
  );
