import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermSchema`,
    code`\
interface ${syntheticNamePrefix}TermSchema {
  readonly in?: readonly (${imports.Literal} | ${imports.NamedNode})[];
  readonly kind: "Term";
}`,
  );
