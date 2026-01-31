import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "NamedNode",
]);

export class IdentifierType extends AbstractIdentifierType<
  BlankNode | NamedNode
> {
  readonly kind = "IdentifierType";

  constructor(
    parameters: Pick<
      ConstructorParameters<
        typeof AbstractIdentifierType<BlankNode | NamedNode>
      >[0],
      "comment" | "defaultValue" | "label"
    >,
  ) {
    super({
      ...parameters,
      hasValues: [],
      in_: [],
      nodeKinds,
    });
  }

  @Memoize()
  get filterFunction() {
    return `${syntheticNamePrefix}filterIdentifier`;
  }

  @Memoize()
  get filterType(): string {
    return `${syntheticNamePrefix}IdentifierFilter`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}identifierSparqlWherePatterns`;
  }

  @Memoize()
  override get name(): string {
    return `(${[...this.nodeKinds]
      .map((nodeKind) => `rdfjs.${nodeKind}`)
      .join(" | ")})`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      defaultValue: this.defaultValue.map(rdfjsTermExpression).extract(),
      in:
        this.in_.length > 0
          ? this.in_.map(rdfjsTermExpression).concat()
          : undefined,
    };
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": "rdfjs.NamedNode",
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): string {
    return `(${variables.value}["@id"].startsWith("_:") ? dataFactory.blankNode(${variables.value}["@id"].substring(2)) : dataFactory.namedNode(${variables.value}["@id"]))`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode" | "NamedNode"`
      : "";

    return new AbstractTermType.JsonType(
      `{ readonly "@id": string${discriminantProperty} }`,
    );
  }

  override jsonZodSchema({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  >[0]): ReturnType<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["jsonZodSchema"]
  > {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.enum(${JSON.stringify([...this.nodeKinds])})`
      : "";

    return `${variables.zod}.object({ "@id": ${variables.zod}.string().min(1)${discriminantProperty} })`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractTermType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      singleEntryRecord(
        `${syntheticNamePrefix}filterIdentifier`,
        `\
function ${syntheticNamePrefix}filterIdentifier(filter: ${syntheticNamePrefix}IdentifierFilter, value: rdfjs.BlankNode | rdfjs.NamedNode) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  if (typeof filter.type !== "undefined" && value.termType !== filter.type) {
    return false;
  }

  return true;
}`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}IdentifierFilter`,
        `\
interface ${syntheticNamePrefix}IdentifierFilter {
  readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[];
  readonly type?: "BlankNode" | "NamedNode";
}`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}identifierSparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}identifierSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlFilterPattern[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined") {
        filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: filter.in.filter(identifier => identifier.termType === "NamedNode") }));
      }

      if (typeof filter.type !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: filter.type === "BlankNode" ? "isBlank" : "isIRI",
            args: [valueVariable],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${syntheticNamePrefix}termLikeSparqlWherePatterns({ filterPatterns, valueVariable, ...otherParameters });
  }`,
              dependencies: {
                ...sharedSnippetDeclarations.sparqlValueInPattern,
                ...sharedSnippetDeclarations.termLikeSparqlWherePatterns,
                ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
              },
            },
          )
        : {},

      !this.constrained
        ? singleEntryRecord(
            `${syntheticNamePrefix}identifierTypeSchema`,
            `const ${syntheticNamePrefix}identifierTypeSchema = ${objectInitializer(this.schemaObject)};`,
          )
        : {},
    );
  }

  @Memoize()
  get fromStringFunctionDeclaration(): FunctionDeclarationStructure {
    // Wrap rdfjsResource.Resource.Identifier.fromString
    return {
      isExported: true,
      kind: StructureKind.Function,
      name: "fromString",
      parameters: [
        {
          name: "identifier",
          type: "string",
        },
      ],
      returnType: "purify.Either<Error, rdfjsResource.Resource.Identifier>",
      statements: [
        "return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory, identifier }));",
      ],
    };
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): string {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.value}.termType as ${[...this.nodeKinds].map((nodeKind) => `"${nodeKind}"`).join(" | ")}`
      : "";
    const valueToBlankNode = `{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
    const valueToNamedNode = `{ "@id": ${variables.value}.value${discriminantProperty} }`;
    return `(${variables.value}.termType === "BlankNode" ? ${valueToBlankNode} : ${valueToNamedNode})`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => value.toIdentifier()))`,
    };
  }
}
