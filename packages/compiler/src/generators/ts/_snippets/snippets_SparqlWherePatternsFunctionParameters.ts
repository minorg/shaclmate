import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_SparqlWherePatternsFunctionParameters = conditionalOutput(
  `${syntheticNamePrefix}SparqlWherePatternsFunctionParameters`,
  code`\
type ${syntheticNamePrefix}SparqlWherePatternsFunctionParameters<FilterT, SchemaT> = Readonly<{
  filter?: FilterT;
  ignoreRdfType?: boolean;
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly ${imports.sparqljs}.BgpPattern[];
  schema: SchemaT;
  valueVariable: ${imports.Variable};
  variablePrefix: string;
}>;`,
);
