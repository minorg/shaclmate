import { xsd } from "@tpluscode/rdf-ns-builders";
import { imports } from "../imports.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_toLiteral = conditionalOutput(
  `${syntheticNamePrefix}toLiteral`,
  code`\
function ${syntheticNamePrefix}toLiteral(value: boolean | Date | number | ${imports.Literal} | string, datatype?: ${imports.NamedNode}): ${imports.Literal} {
  switch (typeof value) {
    case "boolean":
      return ${imports.dataFactory}.literal(value.toString(), ${rdfjsTermExpression(xsd.boolean)});
    case "object": {
      if (value instanceof Date) {
        if (datatype) {
          if (datatype.equals(${rdfjsTermExpression(xsd.date)})) {
            return ${imports.dataFactory}.literal(value.toISOString().replace(/T.*$/, ''), datatype);
          } else if (datatype.equals(${rdfjsTermExpression(xsd.dateTime)})) {
            return ${imports.dataFactory}.literal(value.toISOString(), datatype);             
          } else {
            throw new RangeError(datatype.value);
          }
        }
          
        return ${imports.dataFactory}.literal(value.toISOString(), ${rdfjsTermExpression(xsd.dateTime)});
      }

      return value;
    }
    case "number": {
      if (datatype) {
        return ${imports.dataFactory}.literal(value.toString(10), datatype);
      }

      // Convert the number to a literal following SPARQL rules = tests on the lexical form
      const valueString = value.toString(10);
      if (/^[+-]?[0-9]+$/.test(valueString)) {
        // No decimal point, no exponent: xsd:integer
        return ${imports.dataFactory}.literal(valueString, ${rdfjsTermExpression(xsd.integer)});
      }
      if (/^[+-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)[eE][+-]?[0-9]+$/.test(valueString)) {
        // Has exponent: xsd:double
        return ${imports.dataFactory}.literal(valueString, ${rdfjsTermExpression(xsd.double)});
      }
      // Default: xsd:decimal
      return ${imports.dataFactory}.literal(valueString, ${rdfjsTermExpression(xsd.decimal)});
    }
    case "string":
      return ${imports.dataFactory}.literal(value, datatype);
  }
}`,
);
