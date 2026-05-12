import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.BlankNodeFilter}, ${snippets.BlankNodeSchema}> =
  ({ propertyPatterns }) => propertyPatterns;`,
  );
