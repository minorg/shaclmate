import type { BlankNode, NamedNode } from "@rdfjs/types";
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

const nodeKinds: ReadonlySet<"NamedNode"> = new Set(["NamedNode"]);

export class NamedNodeType extends AbstractIdentifierType<NamedNode> {
  readonly kind = "NamedNodeType";

  constructor(
    parameters: Omit<
      ConstructorParameters<typeof AbstractIdentifierType<NamedNode>>[0],
      "nodeKinds"
    >,
  ) {
    super({ ...parameters, nodeKinds });
  }

  @Memoize()
  get filterFunction() {
    return `${syntheticNamePrefix}filterNamedNode`;
  }

  @Memoize()
  get filterType(): string {
    return `${syntheticNamePrefix}NamedNodeFilter`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.in_.length > 0
          ? this.in_.map(rdfjsTermExpression).concat()
          : undefined,
    };
  }

  override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": "rdfjs.NamedNode",
      "in?": "readonly rdfjs.NamedNode[]",
    };
  }

  @Memoize()
  get fromStringFunctionDeclaration(): FunctionDeclarationStructure {
    const expressions: string[] = [
      "purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory, identifier }))",
      `chain((identifier) => (identifier.termType === "NamedNode") ? purify.Either.of(identifier) : purify.Left(new Error("expected identifier to be NamedNode")))`,
    ];

    if (this.in_.length > 0) {
      expressions.push(
        `chain((identifier) => { switch (identifier.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of(identifier as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left(new Error("expected NamedNode identifier to be one of ${this.in_.map((iri) => iri.value).join(" ")}")); } })`,
      );
    }

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
      returnType: `purify.Either<Error, ${this.name}>`,
      statements: [
        `return ${expressions.join(".")} as purify.Either<Error, ${this.name}>;`,
      ],
    };
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}namedNodeSparqlWherePatterns`;
  }

  @Memoize()
  override get name(): string {
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return `rdfjs.NamedNode<${this.in_
        .map((iri) => `"${iri.value}"`)
        .join(" | ")}>`;
    }

    return "rdfjs.NamedNode";
  }

  @Memoize()
  override get schema(): string {
    if (this.constrained) {
      return objectInitializer(this.schemaObject);
    }
    return `${syntheticNamePrefix}namedNodeIdentifierTypeSchema`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): string {
    return `dataFactory.namedNode(${variables.value}["@id"])`;
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "NamedNode"`
      : "";

    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return new AbstractTermType.JsonType(
        `{ readonly "@id": ${this.in_.map((iri) => `"${iri.value}"`).join(" | ")}${discriminantProperty} }`,
      );
    }

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
    let idSchema: string;
    if (this.in_.length > 0) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      idSchema = `${variables.zod}.enum(${JSON.stringify(this.in_.map((iri) => iri.value))})`;
    } else {
      idSchema = `${variables.zod}.string().min(1)`;
    }

    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("NamedNode")`
      : "";

    return `${variables.zod}.object({ "@id": ${idSchema}${discriminantProperty} })`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractTermType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}filterNamedNode`,
        `\
function ${syntheticNamePrefix}filterNamedNode(filter: ${syntheticNamePrefix}NamedNodeFilter, value: rdfjs.NamedNode) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}NamedNodeFilter`,
        `\
interface ${syntheticNamePrefix}NamedNodeFilter {
  readonly in?: readonly rdfjs.NamedNode[];
}`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}namedNodeSparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}namedNodeSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${syntheticNamePrefix}SparqlFilterPattern[] = [];

    if (typeof filter?.in !== "undefined" && filter.in.length > 0) {
      filterPatterns.push(${syntheticNamePrefix}sparqlValueInPattern({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${syntheticNamePrefix}termSchemaSparqlWherePatterns({ filterPatterns, valueVariable, ...otherParameters });
  }`,
              dependencies: {
                ...sharedSnippetDeclarations.sparqlValueInPattern,
                ...sharedSnippetDeclarations.termSchemaSparqlWherePatterns,
                ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
              },
            },
          )
        : {},

      !this.constrained
        ? singleEntryRecord(
            `${syntheticNamePrefix}namedNodeIdentifierTypeSchema`,
            `const ${syntheticNamePrefix}namedNodeIdentifierTypeSchema = ${objectInitializer(this.schemaObject)};`,
          )
        : {},
    );
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["toJsonExpression"]
  >[0]): string {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.value}.termType`
      : "";
    return `{ "@id": ${variables.value}.value${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    let valueToExpression = "value.toIri()";
    if (this.in_.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      valueToExpression = `${valueToExpression}.chain(iri => { switch (iri.value) { ${this.in_.map((iri) => `case "${iri.value}": return purify.Either.of${eitherTypeParameters}(iri as rdfjs.NamedNode<"${iri.value}">);`).join(" ")} default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError({ actualValue: iri, expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } } )`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }
}
