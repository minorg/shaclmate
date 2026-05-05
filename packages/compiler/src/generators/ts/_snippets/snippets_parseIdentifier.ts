import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_parseIdentifier = conditionalOutput(
  `${syntheticNamePrefix}parseIdentifier`,
  code`\
const ${syntheticNamePrefix}parseIdentifier = ${imports.NTriplesIdentifier}.parser(${imports.dataFactory});`,
);
