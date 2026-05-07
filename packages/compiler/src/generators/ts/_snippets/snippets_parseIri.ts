import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_parseIdentifier } from "./snippets_parseIdentifier.js";

export const snippets_parseIri = conditionalOutput(
  `${syntheticNamePrefix}parseIri`,
  code`\
export function ${syntheticNamePrefix}parseIri(identifier: string): ${imports.Either}<Error, ${imports.NamedNode}> {
  return \
    ${snippets_parseIdentifier}(identifier)\
      .chain((identifier) => (identifier.termType === "NamedNode") ? ${imports.Right}(identifier) : ${imports.Left}(new Error("expected identifier to be NamedNode"))) \
    as ${imports.Either}<Error, ${imports.NamedNode}>;
}`,
);
