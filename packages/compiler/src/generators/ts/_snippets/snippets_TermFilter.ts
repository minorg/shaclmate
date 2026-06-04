import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermFilter: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermFilter`,
    code`\
interface ${syntheticNamePrefix}TermFilter<T extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}> {
  readonly datatypeIn?: readonly ${imports.NamedNode}[];
  readonly in?: readonly Exclude<T, ${imports.BlankNode}>[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly T["termType"][];
}`,
  );
