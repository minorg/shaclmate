import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalFactory = conditionalOutput(
  `${syntheticNamePrefix}literalFactory`,
  code`const ${syntheticNamePrefix}literalFactory = new ${imports.LiteralFactory}({ dataFactory: ${imports.dataFactory} });`,
);
