import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BooleanSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BooleanSchema`,
    code`\
interface ${syntheticNamePrefix}BooleanSchema<BooleanT extends boolean> {
  readonly hasValues?: readonly ${imports.Literal}[];
  readonly in?: readonly BooleanT[];
  readonly kind: "Boolean";
}`,
  );
