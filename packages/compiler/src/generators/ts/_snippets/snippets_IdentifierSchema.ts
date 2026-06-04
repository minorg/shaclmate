import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierSchema`,
    code`\
interface ${syntheticNamePrefix}IdentifierSchema {
  readonly hasValues?: readonly (${imports.BlankNode} | ${imports.NamedNode})[];
  readonly kind: "Identifier";
}`,
  );
