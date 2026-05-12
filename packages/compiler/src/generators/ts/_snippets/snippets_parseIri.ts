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
export function ${syntheticNamePrefix}parseIri(identifier: string): ${this.imports.Either}<Error, ${this.imports.NamedNode}> {
  return \
    ${this.snippets.parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "NamedNode") ? ${this.imports.Right}(identifier) : ${this.imports.Left}(new Error("expected identifier to be NamedNode"))) \
    as ${this.imports.Either}<Error, ${this.imports.NamedNode}>;
}`,
  );
