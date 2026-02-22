import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";

export const snippets_sparqlValueInPattern = conditionalOutput(
  `${syntheticNamePrefix}sparqlValueInPattern`,
  code`\
function ${syntheticNamePrefix}sparqlValueInPattern({ lift, valueIn, valueVariable }: { lift?: boolean, valueIn: readonly (boolean | Date | number | string | ${imports.Literal} | ${imports.NamedNode})[], valueVariable: ${imports.Variable}}): ${snippets_SparqlFilterPattern} {
  if (valueIn.length === 0) {
    throw new RangeError("expected valueIn not to be empty");
  }

  return {
    expression: {
      args: [valueVariable, valueIn.map(inValue => {
        if (typeof inValue !== "object" || inValue instanceof Date) {
          return ${snippets_literalFactory}.primitive(inValue);
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
