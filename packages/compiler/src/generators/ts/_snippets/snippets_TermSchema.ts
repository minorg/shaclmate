import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermSchema`,
    code`\
interface ${syntheticNamePrefix}TermSchema<T extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}> {
  readonly hasValues?: readonly Exclude<T, ${imports.BlankNode}>[];
  readonly in?: readonly Exclude<T, ${imports.BlankNode}>[];
  readonly kind: "Term";
  readonly types: readonly T["termType"][];
}`,
  );
