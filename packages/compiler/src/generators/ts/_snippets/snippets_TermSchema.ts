import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermSchema`,
    code`\
interface ${syntheticNamePrefix}TermSchema<TermT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}> {
  readonly hasValues?: readonly Exclude<TermT, ${imports.BlankNode}>[];
  readonly in?: readonly Exclude<TermT, ${imports.BlankNode}>[];
  readonly kind: "Term";
  readonly types: readonly TermT["termType"][];
}`,
  );
