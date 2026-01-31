import { xsd } from "@tpluscode/rdf-ns-builders";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const EqualsResult = singleEntryRecord(
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
);

const SparqlWherePatternTypes = singleEntryRecord(
  `SparqlWherePatternTypes`,
  `\
type ${syntheticNamePrefix}SparqlWhereFilterPattern = sparqljs.FilterPattern & { lift: boolean };
type ${syntheticNamePrefix}SparqlWherePattern = Exclude<sparqljs.Pattern, sparqljs.FilterPattern> | ${syntheticNamePrefix}SparqlWhereFilterPattern;
type ${syntheticNamePrefix}SparqlWherePatternsFunctionParameters<FilterT, SchemaT> = Readonly<{
  filter?: FilterT;
  ignoreRdfType?: boolean;
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly sparqljs.BgpPattern[];
  schema: SchemaT;
  valueVariable: rdfjs.Variable;
  variablePrefix: string;
}>;
type ${syntheticNamePrefix}SparqlWherePatternsFunction<FilterT, SchemaT> = (parameters: ${syntheticNamePrefix}SparqlWherePatternsFunctionParameters<FilterT, SchemaT>) => readonly ${syntheticNamePrefix}SparqlWherePattern[];
`,
);

const toLiteral = singleEntryRecord(
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
);

const sparqlValueInPattern = singleEntryRecord(
  `${syntheticNamePrefix}sparqlValueInPattern`,
  {
    code: `\
function ${syntheticNamePrefix}sparqlValueInPattern({ lift, valueIn, valueVariable }: { lift: boolean, valueIn: readonly (boolean | Date | number | string | rdfjs.Literal | rdfjs.NamedNode)[], valueVariable: rdfjs.Variable}): ${syntheticNamePrefix}SparqlWhereFilterPattern {
  return {
    expression: {
      args: [valueVariable, valueIn.map(inValue => {
        switch (typeof inValue) {
          case "boolean":
          case "number":
          case "string":
            return ${syntheticNamePrefix}toLiteral(inValue)
          case "object":
            if (inValue instanceof Date) {
              return ${syntheticNamePrefix}toLiteral(inValue)
            }

            return inValue;
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
    dependencies: toLiteral,
  } satisfies SnippetDeclaration,
);

const TermFilter = singleEntryRecord(
  `${syntheticNamePrefix}TermFilter`,
  `\
interface ${syntheticNamePrefix}TermFilter {
  readonly datatypeIn?: readonly rdfjs.NamedNode[];
  readonly in?: readonly (rdfjs.Literal | rdfjs.NamedNode)[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}`,
);

const termLikeSparqlWherePatterns = singleEntryRecord(
  `${syntheticNamePrefix}termLikeSparqlWherePatterns`,
  {
    code: `\
function ${syntheticNamePrefix}termLikeSparqlWherePatterns({
  filterPatterns,
  preferredLanguages,
  propertyPatterns,
  schema,
  valueVariable
}: {
  filterPatterns: readonly ${syntheticNamePrefix}SparqlWhereFilterPattern[],
  preferredLanguages?: readonly string[];
  propertyPatterns: readonly sparqljs.BgpPattern[];
  schema: Readonly<{
    defaultValue?: boolean | Date | string | number | rdfjs.Literal | rdfjs.NamedNode;
    in?: readonly (boolean | Date | string | number | rdfjs.Literal | rdfjs.NamedNode)[];
  }>,
  valueVariable: rdfjs.Variable;
}): readonly ${syntheticNamePrefix}SparqlWherePattern[] {
  if (filterPatterns.length === 0 && typeof schema.defaultValue !== "undefined") {
    // Filter patterns make the property required
    propertyPatterns = [{ patterns: propertyPatterns, type: "optional" }];
  }

  const schemaPatterns: ${syntheticNamePrefix}SparqlWhereFilterPattern[] = [];
  if (schema.in) {
    schemaPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: false, valueVariable, valueIn: schema.in }));
  }

  if (preferredLanguages && preferredLanguages.length > 0) {
    schemaPatterns.push({
      expression: {
        args: [{ args: [value], operator: "lang", type: "operation" }, preferredLanguages.map(dataFactory.literal)],
        operator: "in",
        type: "operation"
      },
      lift: false,
      type: "filter",
    });
  }

  return propertyPatterns.concat(schemaPatterns).concat(liftedFilterPatterns);
}`,
    dependencies: { ...sparqlValueInPattern, ...SparqlWherePatternTypes },
  } satisfies SnippetDeclaration,
);

export const sharedSnippetDeclarations = {
  arrayIntersection: singleEntryRecord(
    `${syntheticNamePrefix}arrayIntersection`,
    `\
function ${syntheticNamePrefix}arrayIntersection<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  if (left.length === 0) {
    return right;
  }
  if (right.length === 0) {
    return left;
  }

  const intersection = new Set<T>();
  if (left.length <= right.length) {
    const rightSet = new Set(right);
    for (const leftElement of left) {
      if (rightSet.has(leftElement)) {
        intersection.add(leftElement);
      }
    }
  } else {
    const leftSet = new Set(left);
    for (const rightElement of right) {
      if (leftSet.has(rightElement)) {
        intersection.add(rightElement);
      }  
    }
  }
  return [...intersection];
}`,
  ),

  EqualsResult,

  filterTerm: singleEntryRecord(`${syntheticNamePrefix}filterTerm`, {
    code: `\
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
    dependencies: TermFilter,
  } satisfies SnippetDeclaration),

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

  liftSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}liftSparqlWherePatterns`,
    `\
function ${syntheticNamePrefix}liftSparqlWherePatterns(sparqlWherePatterns: Iterable<${syntheticNamePrefix}SparqlWherePattern>): [readonly ${syntheticNamePrefix}SparqlWherePattern[], readonly ${syntheticNamePrefix}SparqlWhereFilterPattern[]] {
  const liftedSparqlWherePatterns: ${syntheticNamePrefix}SparqlWhereFilterPattern[] = [];
  const unliftedSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePattern[] = [];
  for (const sparqlWherePattern of sparqlWherePatterns) {
    if (sparqlWherePattern.type === "filter" && sparqlWherePattern.lift) {
      liftedSparqlWherePatterns.push(sparqlWherePattern);
    } else {
      unliftedSparqlWherePatterns.push(sparqlWherePattern); 
    }
  }
  return [unliftedSparqlWherePatterns, liftedSparqlWherePatterns];
}`,
  ),

  normalizeSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}normalizeSparqlWherePatterns`,
    `\
function ${syntheticNamePrefix}normalizeSparqlWherePatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
  function isSolutionGeneratingPattern(pattern: sparqljs.Pattern): boolean {
    switch (pattern.type) {
      case "bind":
      case "bgp":        
      case "service":
      case "values":
        return true;
      
      case "graph":
      case "group":
        return pattern.patterns.some(isSolutionGeneratingPattern);

      case "filter":
      case "minus":
      case "optional":
        return false;

      case "union":
        // A union pattern is solution-generating if every branch is solution-generating
        return pattern.patterns.every(isSolutionGeneratingPattern);

      default:
        throw new RangeError(\`unable to determine whether "\${pattern.type}" pattern is solution-generating\`);
    }
  }

  function normalizePatternsRecursive(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
    if (patterns.length === 0) {
      return patterns;
    }

    function deduplicatePatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
      if (patterns.length === 0) {
        return patterns;
      }

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
    }

    function sortPatterns(patterns: readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {
      const filterPatterns: sparqljs.Pattern[] = [];
      const otherPatterns: sparqljs.Pattern[] = [];
      const valuesPatterns: sparqljs.Pattern[] = [];

      for (const pattern of patterns) {
        switch (pattern.type) {
          case "filter":
            filterPatterns.push(pattern);
            break;
          case "values":
            valuesPatterns.push(pattern);
            break;
          default:
            otherPatterns.push(pattern);
            break;
        }
      }

      return valuesPatterns.concat(otherPatterns).concat(filterPatterns);
    }    

    const compactedPatterns: sparqljs.Pattern[] = [];
    for (const pattern of deduplicatePatterns(patterns)) {
      switch (pattern.type) {
        case "bgp": {
          if (pattern.triples.length === 0) {
            continue;
          }
          const lastPattern = compactedPatterns.at(-1);
          if (lastPattern && lastPattern.type === "bgp") {
            // Coalesce adjacent BGP patterns
            lastPattern.triples.push(...pattern.triples);
          } else {
            compactedPatterns.push(pattern);
          }
          break;
        }
        case "bind":
        case "filter":
        case "query":
        case "values":
          compactedPatterns.push(pattern);
          break;
        case "group":
          // Flatten groups outside unions
          compactedPatterns.push(...normalizePatternsRecursive(pattern.patterns));
          break;
        case "graph":
        case "minus":
        case "optional":
        case "service": {
          const patterns_ = normalizePatternsRecursive(pattern.patterns);
          if (patterns_.length > 0) {
            compactedPatterns.push({ ...pattern, patterns: patterns_.concat() });
          }
          break;
        }
        case "union": {
          const unionPatterns = deduplicatePatterns(pattern.patterns.flatMap(pattern => {
            switch (pattern.type) {
              case "group":
                // Don't flatten the groups in a union
              case "graph":
              case "minus":
              case "optional":
              case "service": {
                const patterns_ = normalizePatternsRecursive(pattern.patterns);
                if (patterns_.length > 0) {
                  return [{ ...pattern, patterns: patterns_.concat() }];
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
              compactedPatterns.push(...normalizePatternsRecursive([unionPatterns[0]]));
              break;
            default:
              compactedPatterns.push({ ...pattern, patterns: unionPatterns.concat() });
              break;
          }
          break;
        }
        default:
          pattern satisfies never;
      }
    }

    return sortPatterns(deduplicatePatterns(compactedPatterns));
  }

  const normalizedPatterns = normalizePatternsRecursive(patterns);
  if (!normalizedPatterns.some(isSolutionGeneratingPattern)) {
    throw new Error("SPARQL WHERE patterns must have at least one solution-generating pattern");
  }

  return normalizedPatterns;
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

  sparqlValueInPattern,

  SparqlWherePatternTypes,

  strictEquals: singleEntryRecord(`${syntheticNamePrefix}strictEquals`, {
    code: `\
/**
 * Compare two values for strict equality (===), returning an ${syntheticNamePrefix}EqualsResult rather than a boolean.
 */
function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}`,
    dependencies: EqualsResult,
  } satisfies SnippetDeclaration),

  TermFilter,

  termLikeSparqlWherePatterns,

  termSparqlWherePatterns: singleEntryRecord(
    `${syntheticNamePrefix}termSparqlWherePatterns`,
    {
      code: `\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}TermFilter, ${syntheticNamePrefix}TermSchema> =
  ({ filter, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlWhereFilterPattern[] = [];

    if (filter) {
      if (typeof filter.datatypeIn !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "in",
            args: [{ args: [valueVariable], operator: "datatype", type: "operation" }, filter.datatypeIn.concat()]
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.in !== "undefined") {
        filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern(valueVariable, filter.in);
      }

      if (typeof filter.languageIn !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "in",
            args: [{ args: [valueVariable], operator: "lang", type: "operation" }, filter.languageIn.map(value => dataFactory.literal(value))]
          },
          lift: true,
          type: "filter",
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
          args: [valueVariable]
        }));

        switch (typeInExpressions.length) {
          case 0:
            break;
          case 1:
            filterPatterns.push({ expression: typeInExpressions[0], lift: true, type: "filter" });
            break;
          default:
            filterPatterns.push({
              expression: {
                type: "operation",
                operator: "||",
                args: typeInExpressions
              },
              lift: true,
              type: "filter",
            });
        }
      }
    }

    return ${syntheticNamePrefix}termLikeSparqlWherePatterns({ filterPatterns, ...otherParameters });
  }`,
      dependencies: { ...sparqlValueInPattern, ...termLikeSparqlWherePatterns },
    } satisfies SnippetDeclaration,
  ),

  toLiteral,
};

export namespace SnippetDeclarations {}
