import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_blankNodeFromString = conditionalOutput(
  `${syntheticNamePrefix}blankNodeFromString`,
  code`\
export function ${syntheticNamePrefix}blankNodeFromString(identifier: string): ${imports.Either}<Error, ${imports.BlankNode}> {
    return \
      ${imports.Either}.encase(() => ${imports.Resource}.Identifier.fromString({ ${imports.dataFactory}, identifier }))
      .chain((identifier) => (identifier.termType === "BlankNode") ? ${imports.Either}.of(identifier) : ${imports.Left}(new Error("expected identifier to be BlankNode")))
      as ${imports.Either}<Error, ${imports.BlankNode}>;
}`,
);
