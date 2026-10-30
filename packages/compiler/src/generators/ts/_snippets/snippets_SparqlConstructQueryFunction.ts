import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_SparqlConstructQueryFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}SparqlConstructQueryFunction`,
    code`\
type ${syntheticNamePrefix}SparqlConstructQueryFunction<FilterT> =
  (parameters: {
    filter?: FilterT;
    ignoreRdfType?: boolean;
    prefixes?: { [prefix: string]: string };
    preferredLanguages?: readonly string[];
    subject: ${imports.NamedNode} | ${imports.Variable}
   } & Omit<${imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type">
  ) => ${imports.sparqljs}.ConstructQuery;`,
  );
