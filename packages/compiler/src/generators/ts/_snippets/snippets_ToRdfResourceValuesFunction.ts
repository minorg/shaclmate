import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_PropertyPath } from "./snippets_PropertyPath.js";

export const snippets_ToRdfResourceValuesFunction = conditionalOutput(
  `${syntheticNamePrefix}ToRdfResourceValuesFunction`,
  code`\
export type ${syntheticNamePrefix}ToRdfResourceValuesFunction<T> =
  (value: T,
   options: {
     graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
     ignoreRdfType?: boolean;
     propertyPath: ${snippets_PropertyPath};
     resource: ${imports.Resource};
     resourceSet: ${imports.ResourceSet};
   }
  ) => (bigint | boolean | number | string | ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode})[];`,
);
