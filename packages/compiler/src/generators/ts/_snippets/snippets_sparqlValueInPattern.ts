import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_toLiteral } from "./snippets_toLiteral.js";

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
        switch (typeof inValue) {
          case "boolean":
          case "number":
          case "string":
            return ${snippets_toLiteral}(inValue)
          case "object":
            if (inValue instanceof Date) {
              return ${snippets_toLiteral}(inValue)
            }

            return inValue;
          default:
            inValue satisfies never;
            throw new Error("should never reach this point");
          }
        }
      )],
      operator: "in",
      type: "operation",
    },
    lift,
    type: "filter",
  };
}`,
);
