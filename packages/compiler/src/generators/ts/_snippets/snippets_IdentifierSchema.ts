import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierSchema`,
    code`\
interface ${syntheticNamePrefix}IdentifierSchema {
  readonly kind: "Identifier";
}`,
  );
