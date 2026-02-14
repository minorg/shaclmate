import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_TermFilter } from "./snippets_TermFilter.js";

export const snippets_termFilterSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}termFilterSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}termFilterSparqlPatterns({ filter, valueVariable }: { filter?: ${snippets_TermFilter}; valueVariable: ${imports.Variable} }): readonly ${snippets_SparqlFilterPattern}[] {
  if (!filter) {
    return [];
  }

  const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

  if (
    typeof filter.datatypeIn !== "undefined" &&
    filter.datatypeIn.length > 0
  ) {
    filterPatterns.push({
      expression: {
        type: "operation",
        operator: "in",
        args: [
          { args: [valueVariable], operator: "datatype", type: "operation" },
          filter.datatypeIn.concat(),
        ],
      },
      lift: true,
      type: "filter",
    });
  }

  if (typeof filter.in !== "undefined" && filter.in.length > 0) {
    filterPatterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
  }

  if (
    typeof filter.languageIn !== "undefined" &&
    filter.languageIn.length > 0
  ) {
    filterPatterns.push({
      expression: {
        type: "operation",
        operator: "in",
        args: [{ args: [valueVariable], operator: "lang", type: "operation" }, filter.languageIn.map(value => ${imports.dataFactory}.literal(value))]
      },
      lift: true,
      type: "filter",
    });
  }

  if (typeof filter.typeIn !== "undefined") {
    const typeInExpressions = filter.typeIn
      .map((inType) => {
        switch (inType) {
          case "BlankNode":
            return "isBlank";
          case "Literal":
            return "isLiteral";
          case "NamedNode":
            return "isIRI";
          default:
            inType satisfies never;
            throw new RangeError(inType);
        }
      })
      .map((operator) => ({
        type: "operation" as const,
        operator,
        args: [valueVariable],
      }));

    switch (typeInExpressions.length) {
      case 0:
        break;
      case 1:
        filterPatterns.push({
          expression: typeInExpressions[0],
          lift: true,
          type: "filter",
        });
        break;
      default:
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "||",
            args: typeInExpressions,
          },
          lift: true,
          type: "filter",
        });
    }
  }

  return filterPatterns;
}`,
);
