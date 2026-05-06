import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_PropertyPath } from "./snippets_PropertyPath.js";

const ReturnT = code`${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}`;

export const snippets_ToRdfResourceValuesFunction = conditionalOutput(
  `${syntheticNamePrefix}ToRdfResourceValuesFunction`,
  code`\
export type ${syntheticNamePrefix}ToRdfResourceValuesFunction<ValueT, ReturnT extends ${ReturnT} = ${ReturnT}> =
  (value: ValueT,
   options: {
     graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
     ignoreRdfType?: boolean;
     propertyPath: ${snippets_PropertyPath};
     resource: ${imports.Resource};
     resourceSet: ${imports.ResourceSet};
   }
  ) => ReturnT[];`,
);
