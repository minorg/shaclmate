import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_identifierFromString = conditionalOutput(
  `${syntheticNamePrefix}identifierFromString`,
  code`\
function ${syntheticNamePrefix}identifierFromString(identifier: string): ${imports.Either}<Error, ${imports.BlankNode} | ${imports.NamedNode}> {
  return ${imports.Either}.encase(() => ${imports.Resource}.Identifier.fromString({ ${imports.dataFactory}, identifier }));
}`,
);
