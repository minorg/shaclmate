import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.BlankNodeFilter}, ${this.snippets.BlankNodeSchema}> =
  ({ propertyPatterns }) => propertyPatterns;`,
  );
