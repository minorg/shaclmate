import { xsd } from "@tpluscode/rdf-ns-builders";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export const sharedSnippetDeclarations = {
  EqualsResult: singleEntryRecord(
    `${syntheticNamePrefix}EqualsResult`,
    `\
export type ${syntheticNamePrefix}EqualsResult = purify.Either<${syntheticNamePrefix}EqualsResult.Unequal, true>;

export namespace ${syntheticNamePrefix}EqualsResult {
  export const Equal: ${syntheticNamePrefix}EqualsResult = purify.Either.of<Unequal, true>(true);

  export function fromBooleanEqualsResult(
    left: any,
    right: any,
    equalsResult: boolean | ${syntheticNamePrefix}EqualsResult,
  ): ${syntheticNamePrefix}EqualsResult {
    if (typeof equalsResult !== "boolean") {
      return equalsResult;
    }

    if (equalsResult) {
      return Equal;
    }

    return purify.Left({ left, right, type: "BooleanEquals" });
  }

  export type Unequal =
  | {
    readonly left: {
      readonly array: readonly any[];
      readonly element: any;
      readonly elementIndex: number;
    };
    readonly right: {
      readonly array: readonly any[];
      readonly unequals: readonly Unequal[];
    };
    readonly type: "ArrayElement";
  }
  | {
    readonly left: readonly any[];
    readonly right: readonly any[];
    readonly type: "ArrayLength";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "BooleanEquals";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "LeftError";
  }
  | {
    readonly right: any;
    readonly type: "LeftNull";
  }
  | {
    readonly left: bigint | boolean | number | string;
    readonly right: bigint | boolean | number | string;
    readonly type: "Primitive";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly propertyName: string;
    readonly propertyValuesUnequal: Unequal;
    readonly type: "Property";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "RightError";
  }
  | {
    readonly left: any;
    readonly type: "RightNull";
  };
}`,
  ),

  filterTerm: singleEntryRecord(
    `${syntheticNamePrefix}filterTerm`,
    `\
  function ${syntheticNamePrefix}filterTerm(filter: ${syntheticNamePrefix}TermFilter, value: rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode): boolean {
    if (typeof filter.in !== "undefined" && !filter.in.some(in_ => {
      if (typeof in_.datatype !== "undefined" && (value.termType !== "Literal" || value.datatype.value !== in_.datatype)) {
        return false;
      }
  
      if (typeof in_.language !== "undefined" && (value.termType !== "Literal" || value.language !== in_.language)) {
        return false;
      }
  
      if (typeof in_.type !== "undefined" && value.termType !== in_.type) {
        return false;
      }
  
      if (typeof in_.value !== "undefined" && value.value !== in_.value) {
        return false;
      }
  
      return true;
    })) {
      return false;
    }
  
    if (typeof filter.datatypeIn !== "undefined" && (value.termType !== "Literal" || !filter.datatypeIn.some(inDatatype => inDatatype === value.datatype.value))) {
      return false;
    }
  
    if (typeof filter.languageIn !== "undefined" && (value.termType !== "Literal" || !filter.languageIn.some(inLanguage => inLanguage === value.language))) {
      return false;
    }
  
    if (typeof filter.typeIn !== "undefined" && !filter.typeIn.some(inType => inType === value.termType)) {
      return false;
    }
  
    if (typeof filter.valueIn !== "undefined" && !filter.valueIn.some(inValue => inValue === value.value)) {
      return false;
    }
  
    return true;
  }`,
  ),

  finalizeSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}finalizeSparqlWherePatterns`,
    `\
function ${syntheticNamePrefix}finalizeSparqlWherePatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
  if (patterns.length === 0) {
    return patterns;
  }

  const requiredPatterns: sparqljs.Pattern[] = [];
  const otherPatterns: sparqljs.Pattern[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "bgp":
        requiredPatterns.push(pattern);
        break;
      case "values":
        requiredPatterns.unshift(pattern);
        break;
      case "optional":
      case "union":
        otherPatterns.push(pattern);
        break;
      default:
        throw new RangeError(\`unrecognized SPARQL WHERE pattern type: \${pattern.type}\`);
    }
  }

  if (requiredPatterns.length === 0) {
    // A WHERE block must have at least one required pattern in order to match anything.
    // The usual solution is to insert a VALUES () { () } seed as the first pattern in order to
    // match the entire store. OPTIONAL is a left join.
    requiredPatterns.push({ values: [{}], type: "values" });
  }

  return requiredPatterns.concat(otherPatterns);
}`,
  ),

  RdfVocabularies: singleEntryRecord(
    `${syntheticNamePrefix}RdfVocabularies`,
    `\
namespace ${syntheticNamePrefix}RdfVocabularies {
  export namespace rdf {
    export const first = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const date = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const decimal = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#decimal");
    export const double = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#double");
    export const integer = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  }
}`,
  ),

  strictEquals: singleEntryRecord(
    `${syntheticNamePrefix}strictEquals`,
    `\
/**
 * Compare two values for strict equality (===), returning an ${syntheticNamePrefix}EqualsResult rather than a boolean.
 */
function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}`,
  ),

  TermFilter: singleEntryRecord(
    `${syntheticNamePrefix}TermFilter`,
    `\
interface ${syntheticNamePrefix}TermFilter {
  readonly datatypeIn?: readonly string[];
  readonly in?: readonly { readonly datatype?: string; readonly language?: string; readonly type?: string; readonly value?: string; }[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
  readonly valueIn?: readonly string[];
}`,
  ),

  toLiteral: singleEntryRecord(
    `${syntheticNamePrefix}toLiteral`,
    `\
function ${syntheticNamePrefix}toLiteral(value: boolean | Date | number | string, datatype?: rdfjs.NamedNode): rdfjs.Literal {
  switch (typeof value) {
    case "boolean":
      return dataFactory.literal(value.toString(), ${rdfjsTermExpression(xsd.boolean)});
    case "object": {
      if (value instanceof Date) {
        if (datatype) {
          if (datatype.equals(${rdfjsTermExpression(xsd.date)})) {
            return dataFactory.literal(value.toISOString().replace(/T.*$/, ''), datatype);
          } else if (datatype.equals(${rdfjsTermExpression(xsd.dateTime)})) {
            return dataFactory.literal(value.toISOString(), datatype);             
          } else {
            throw new RangeError(datatype.value);
          }
        }
          
        return dataFactory.literal(value.toISOString(), ${rdfjsTermExpression(xsd.dateTime)});
      }
      value satisfies never;
      throw new Error("should never happen");
    }
    case "number": {
      if (datatype) {
        return dataFactory.literal(value.toString(10), datatype);
      }

      // Convert the number to a literal following SPARQL rules = tests on the lexical form
      const valueString = value.toString(10);
      if (/^[+-]?[0-9]+$/.test(valueString)) {
        // No decimal point, no exponent: xsd:integer
        return dataFactory.literal(valueString, ${rdfjsTermExpression(xsd.integer)});
      }
      if (/^[+-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)[eE][+-]?[0-9]+$/.test(valueString)) {
        // Has exponent: xsd:double
        return dataFactory.literal(valueString, ${rdfjsTermExpression(xsd.double)});
      }
      // Default: xsd:decimal
      return dataFactory.literal(valueString, ${rdfjsTermExpression(xsd.decimal)});
    }
    case "string":
      return dataFactory.literal(value, datatype);
  }
}`,
  ),
};

export namespace SnippetDeclarations {}
