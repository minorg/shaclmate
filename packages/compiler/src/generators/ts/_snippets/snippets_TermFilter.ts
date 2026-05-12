import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermFilter: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermFilter`,
    code`\
interface ${syntheticNamePrefix}TermFilter {
  readonly datatypeIn?: readonly ${imports.NamedNode}[];
  readonly in?: readonly (${imports.Literal} | ${imports.NamedNode})[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}`,
  );
