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
function ${syntheticNamePrefix}sparqlValueInPattern({ lift, valueIn, valueVariable }: { lift?: boolean, valueIn: readonly (bigint | boolean | Date | number | string | ${this.imports.Literal} | ${this.imports.NamedNode})[], valueVariable: ${this.imports.Variable}}): ${this.snippets.SparqlFilterPattern} {
  if (valueIn.length === 0) {
    throw new RangeError("expected valueIn not to be empty");
  }

  return {
    expression: {
      args: [valueVariable, valueIn.map(inValue => {
        if (typeof inValue !== "object" || inValue instanceof Date) {
          return ${this.snippets.literalFactory}.primitive(inValue);
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
