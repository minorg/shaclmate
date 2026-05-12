import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_SparqlPattern: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}SparqlPattern`,
    code`type ${syntheticNamePrefix}SparqlPattern = Exclude<${this.imports.sparqljs}.Pattern, ${this.imports.sparqljs}.FilterPattern> | ${this.snippets.SparqlFilterPattern};`,
  );
