import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_parseIri: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}parseIri`,
    code`\
export function ${syntheticNamePrefix}parseIri(identifier: string): ${imports.Either}<Error, ${imports.NamedNode}> {
  return \
    ${snippets.parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "NamedNode") ? ${imports.Right}(identifier) : ${imports.Left}(new Error("expected identifier to be NamedNode"))) \
    as ${imports.Either}<Error, ${imports.NamedNode}>;
}`,
  );
