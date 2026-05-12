import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_parseBlankNode: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}parseBlankNode`,
    code`\
export function ${syntheticNamePrefix}parseBlankNode(identifier: string): ${this.imports.Either}<Error, ${this.imports.BlankNode}> {
  return \
    ${this.snippets.parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${this.imports.Right}(identifier) : ${this.imports.Left}(new Error("expected identifier to be BlankNode"))) \
    as ${this.imports.Either}<Error, ${this.imports.BlankNode}>;
}`,
  );
