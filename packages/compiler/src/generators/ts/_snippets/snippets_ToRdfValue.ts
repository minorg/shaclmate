import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfValue = conditionalOutput(
  `${syntheticNamePrefix}ToRdfValue`,
  code`type ${syntheticNamePrefix}ToRdfValue = bigint | boolean | number | string | ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode};`,
);
