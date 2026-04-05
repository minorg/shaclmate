import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_SparqlConstructTriplesFunctionParameters =
  conditionalOutput(
    `${syntheticNamePrefix}SparqlConstructTriplesFunctionParameters`,
    code`\
type ${syntheticNamePrefix}SparqlConstructTriplesFunctionParameters<FilterT, SchemaT> = Readonly<{
  filter?: FilterT;
  ignoreRdfType?: boolean;
  schema: SchemaT;
  valueVariable: ${imports.Variable};
  variablePrefix: string;
}>;`,
  );
