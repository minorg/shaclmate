import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ValueSparqlConstructTriplesFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ValueSparqlConstructTriplesFunction`,
    code`\
type ${syntheticNamePrefix}ValueSparqlConstructTriplesFunction<FilterT, SchemaT> = 
  (parameters: {
    filter: FilterT | undefined;
    ignoreRdfType: boolean;
    schema: SchemaT;
    valueVariable: ${imports.Variable};
    variablePrefix: string;
  }) => readonly ${imports.sparqljs}.Triple[];`,
  );
