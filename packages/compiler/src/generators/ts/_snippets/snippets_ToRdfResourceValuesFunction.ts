import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToRdfResourceValuesFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) => {
  const ReturnT = code`${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}`;

  return conditionalOutput(
    `${syntheticNamePrefix}ToRdfResourceValuesFunction`,
    code`\
export type ${syntheticNamePrefix}ToRdfResourceValuesFunction<ValueT, ReturnT extends ${ReturnT} = ${ReturnT}> =
  (value: ValueT,
   options: {
     graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
     ignoreRdfType?: boolean;
     propertyPath: ${snippets.PropertyPath};
     resource: ${imports.Resource};
     resourceSet: ${imports.ResourceSet};
   }
  ) => ReturnT[];`,
  );
};
