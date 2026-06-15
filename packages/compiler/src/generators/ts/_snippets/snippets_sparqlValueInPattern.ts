import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sparqlValueInPattern: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}sparqlValueInPattern`,
    code`\
function ${syntheticNamePrefix}sparqlValueInPattern({ lift, valueIn, valueVariable }: { lift?: boolean, valueIn: readonly (bigint | boolean | Date | number | string | ${imports.Literal} | ${imports.NamedNode})[], valueVariable: ${imports.Variable}}): ${snippets.SparqlFilterPattern} {
  if (valueIn.length === 0) {
    throw new RangeError("expected valueIn not to be empty");
  }

  return {
    expression: {
      args: [valueVariable, valueIn.map(inValue => {
        if (typeof inValue !== "object") {
          return ${snippets.literalFactory}.primitive(inValue);
        }
        if (inValue instanceof Date) {
          return ${snippets.literalFactory}.date(inValue);
        }
        return inValue;
      })],
      operator: "in",
      type: "operation",
    },
    lift,
    type: "filter",
  };
}`,
  );
