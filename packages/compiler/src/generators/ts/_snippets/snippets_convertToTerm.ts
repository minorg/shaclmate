import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToTerm: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToTerm`,
    code`\
function ${syntheticNamePrefix}convertToTerm<ValueT extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(_schema: ${snippets.TermSchema}, value: ValueT): ValueT {
  return value;
}`,
  );
