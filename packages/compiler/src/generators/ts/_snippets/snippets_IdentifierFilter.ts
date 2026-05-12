import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierFilter: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierFilter`,
    code`\
interface ${syntheticNamePrefix}IdentifierFilter {
  readonly in?: readonly (${imports.BlankNode} | ${imports.NamedNode})[];
  readonly type?: "BlankNode" | "NamedNode";
}`,
  );
