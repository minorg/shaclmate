import { xsd } from "@tpluscode/rdf-ns-builders";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export const sharedSnippetDeclarations = {
  deduplicateSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}deduplicateSparqlWherePatterns`,
    `\
function ${syntheticNamePrefix}deduplicateSparqlWherePatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
  const deduplicatedPatterns: sparqljs.Pattern[] = [];
  const deduplicatePatternStrings = new Set<string>();
  for (const pattern of patterns) {
    const patternString = JSON.stringify(pattern);
    if (!deduplicatePatternStrings.has(patternString)) {
      deduplicatePatternStrings.add(patternString);
      deduplicatedPatterns.push(pattern);
    }
  }
  return deduplicatedPatterns;
}`,
  ),

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
    if (typeof filter.datatypeIn !== "undefined" && (value.termType !== "Literal" || !filter.datatypeIn.some(inDatatype => inDatatype.equals(value.datatype)))) {
      return false;
    }

    if (typeof filter.in !== "undefined" && !filter.in.some(inTerm => inTerm.equals(value))) {
      return false;
    }

  
    if (typeof filter.languageIn !== "undefined" && (value.termType !== "Literal" || !filter.languageIn.some(inLanguage => inLanguage === value.language))) {
      return false;
    }
  
    if (typeof filter.typeIn !== "undefined" && !filter.typeIn.some(inType => inType === value.termType)) {
      return false;
    }
    
    return true;
  }`,
  ),

  IdentifierSet: singleEntryRecord(
    `${syntheticNamePrefix}IdentifierSet`,
    `\
class ${syntheticNamePrefix}IdentifierSet {
  private readonly blankNodeValues = new Set<string>();
  private readonly namedNodeValues = new Set<string>();

  add(identifier: rdfjs.BlankNode | rdfjs.NamedNode): this {
    switch (identifier.termType) {
      case "BlankNode":
        this.blankNodeValues.add(identifier.value);
        return this;
      case "NamedNode":
        this.namedNodeValues.add(identifier.value);
        return this;
    }
  }

  has(identifier: rdfjs.BlankNode | rdfjs.NamedNode): boolean {
    switch (identifier.termType) {
      case "BlankNode":
        return this.blankNodeValues.has(identifier.value);
      case "NamedNode":
        return this.namedNodeValues.has(identifier.value);
    }
  }
}`,
  ),

  insertSeedSparqlWherePattern: singleEntryRecord(
    `${syntheticNamePrefix}insertSeedSparqlWherePattern`,
    `\
/**
 * Insert a seed SPARQL where pattern if necessary.
 * 
 * A SPARQL WHERE block that solely consists of OPTIONAL blocks won't match anything. OPTIONAL is a left join.
 * In that situation the solution is to insert a VALUES () { () } seed as the first pattern in order to match the entire store.
 */
function ${syntheticNamePrefix}insertSeedSparqlWherePattern(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
  if (patterns.every(pattern => pattern.type === "optional")) {
    return [{ values: [{}], type: "values" }, ...patterns];
  }
  return patterns;
}`,
  ),

  optimizeSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}optimizeSparqlWherePatterns`,
    `\
function ${syntheticNamePrefix}optimizeSparqlWherePatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
  if (patterns.length === 0) {
    return patterns;
  }

  const filterPatterns: sparqljs.Pattern[] = [];
  const valuesPatterns: sparqljs.Pattern[] = [];
  const otherPatterns: sparqljs.Pattern[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "bgp": {
        if (pattern.triples.length === 0) {
          continue;
        }
        const lastPattern = otherPatterns.at(-1);
        if (lastPattern && lastPattern.type === "bgp") {
          // Coalesce adjacent BGP patterns
          lastPattern.triples.push(...pattern.triples);
        } else {
          otherPatterns.push(pattern);
        }
        break;
      }
      case "bind":
      case "query":
        otherPatterns.push(pattern);
        break;
      case "filter":
        filterPatterns.push(pattern);
        break;
      case "group":
        // Flatten groups outside unions
        otherPatterns.push(...${syntheticNamePrefix}optimizeSparqlWherePatterns(pattern.patterns));
        break;
      case "values":
        valuesPatterns.push(pattern);
        break;
      case "graph":
      case "minus":
      case "optional":
      case "service": {
        const optimizedPatterns = ${syntheticNamePrefix}optimizeSparqlWherePatterns(pattern.patterns);
        if (optimizedPatterns.length > 0) {
          otherPatterns.push({ ...pattern, patterns: optimizedPatterns.concat() });
        }
        break;
      }
      case "union": {
        const unionPatterns = ${syntheticNamePrefix}deduplicateSparqlWherePatterns(pattern.patterns.flatMap(pattern => {
          switch (pattern.type) {
            case "group":
              // Don't flatten the groups in a union
            case "graph":
            case "minus":
            case "optional":
            case "service": {
              const optimizedPatterns = ${syntheticNamePrefix}optimizeSparqlWherePatterns(pattern.patterns);
              if (optimizedPatterns.length > 0) {
                return [{ ...pattern, patterns: optimizedPatterns.concat() }];
              }
              return [] as sparqljs.Pattern[];
            }
            default:
              return [pattern];
          }
        }));

        switch (unionPatterns.length) {
          case 0:
            break;
          case 1:
            otherPatterns.push(...${syntheticNamePrefix}optimizeSparqlWherePatterns([unionPatterns[0]]));
            break;
          default:
            otherPatterns.push({...pattern, patterns: unionPatterns.concat() });
            break;
        }
        break;
      }
      default:
        pattern satisfies never;
    }
  }

  return ${syntheticNamePrefix}deduplicateSparqlWherePatterns(valuesPatterns.concat(otherPatterns).concat(filterPatterns));
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
  readonly datatypeIn?: readonly rdfjs.NamedNode[];
  readonly in?: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}`,
  ),

  TermFilter_sparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}TermFilter.sparqlWherePatterns`,
    `\
namespace ${syntheticNamePrefix}TermFilter {
  export function ${syntheticNamePrefix}sparqlWherePatterns(filter: ${syntheticNamePrefix}TermFilter | undefined, value: rdfjs.Variable): readonly sparqljs.Pattern[] {
    const patterns: sparqljs.Pattern[] = [];

    if (!filter) {
      return patterns;
    }
  
    if (typeof filter.datatypeIn !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "in",
          args: [{ args: [value], operator: "datatype", type: "operation" }, filter.datatypeIn.concat()]
        }
      });
    }

    if (typeof filter.in !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "in",
          args: [value, filter.in.concat()],
        }
      });
    }
  
    if (typeof filter.languageIn !== "undefined") {
      patterns.push({
        type: "filter",
        expression: {
          type: "operation",
          operator: "in",
          args: [{ args: [value], operator: "lang", type: "operation" }, filter.languageIn.map(value => dataFactory.literal(value))]
        }
      });
    }
  
    if (typeof filter.typeIn !== "undefined") {
      const typeInExpressions = filter.typeIn.map(inType => {
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
      }).map(operator => ({
        type: "operation" as const,
        operator,
        args: [value]
      }));

      switch (typeInExpressions.length) {
        case 0:
          break;
        case 1:
          patterns.push({ type: "filter", expression: typeInExpressions[0] });
          break;
        default:
          patterns.push({
            type: "filter",
            expression: {
              type: "operation",
              operator: "||",
              args: typeInExpressions
            }
          });
      }
    }

    return patterns;
  }
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
