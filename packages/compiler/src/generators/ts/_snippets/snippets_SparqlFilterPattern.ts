import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_SparqlFilterPattern: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}SparqlFilterPattern`,
    code`type ${syntheticNamePrefix}SparqlFilterPattern = ${imports.sparqljs}.FilterPattern & { lift?: boolean };`,
  );
