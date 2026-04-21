import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfResourceValuesFunction = conditionalOutput(
  `${syntheticNamePrefix}ToRdfResourceValuesFunction`,
  code`\
export type ${syntheticNamePrefix}ToRdfResourceValuesFunction<T> =
  (value: T,
   options: {
     graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
     ignoreRdfType?: boolean;
     propertyPath: ${imports.PropertyPath};
     resource: ${imports.Resource};
     resourceSet: ${imports.ResourceSet};
   }
  ) => readonly (bigint | boolean | number | string | ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode})[];`,
);
