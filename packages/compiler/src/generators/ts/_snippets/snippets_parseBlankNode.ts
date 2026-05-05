import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_parseIdentifier } from "./snippets_parseIdentifier.js";

export const snippets_parseBlankNode = conditionalOutput(
  `${syntheticNamePrefix}parseBlankNode`,
  code`\
export function ${syntheticNamePrefix}parseBlankNode(identifier: string): ${imports.Either}<Error, ${imports.BlankNode}> {
  return \
    ${snippets_parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${imports.Right}(identifier) : ${imports.Left}(new Error("expected identifier to be BlankNode"))) \
    as ${imports.Either}<Error, ${imports.BlankNode}>;
}`,
);
