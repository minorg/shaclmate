import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_SparqlWherePatternsFunctionParameters = conditionalOutput(
  `${syntheticNamePrefix}SparqlWherePatternsFunctionParameters`,
  code`\
type ${syntheticNamePrefix}SparqlWherePatternsFunctionParameters<FilterT, SchemaT> = Readonly<{
  filter: FilterT | undefined;
  ignoreRdfType: boolean;
  preferredLanguages: readonly string[] | undefined;
  propertyPatterns: readonly ${snippets_SparqlPattern}[];
  schema: SchemaT;
  valueVariable: ${imports.Variable};
  variablePrefix: string;
}>;`,
);
