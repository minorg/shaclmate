import type { SnippetFactory } from "../SnippetFactory.js";
import { imports } from "../this.imports.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

const ReturnT = code`${this.imports.BlankNode} | ${this.imports.Literal} | ${this.imports.NamedNode}`;

export const snippets_ToRdfResourceValuesFunction: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToRdfResourceValuesFunction`,
    code`\
export type ${syntheticNamePrefix}ToRdfResourceValuesFunction<ValueT, ReturnT extends ${ReturnT} = ${ReturnT}> =
  (value: ValueT,
   options: {
     graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>;
     ignoreRdfType?: boolean;
     propertyPath: ${this.snippets.PropertyPath};
     resource: ${this.imports.Resource};
     resourceSet: ${this.imports.ResourceSet};
   }
  ) => ReturnT[];`,
  );
