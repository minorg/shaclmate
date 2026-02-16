import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_BlankNodeFilter } from "./snippets_BlankNodeFilter.js";
import { snippets_BlankNodeSchema } from "./snippets_BlankNodeSchema.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";

export const snippets_blankNodeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_BlankNodeFilter}, ${snippets_BlankNodeSchema}> =
  ({ propertyPatterns }) => propertyPatterns;`,
);
