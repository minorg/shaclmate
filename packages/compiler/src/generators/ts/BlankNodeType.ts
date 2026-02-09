import type { BlankNode, NamedNode } from "@rdfjs/types";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { Memoize } from "typescript-memoize";
import { AbstractIdentifierType } from "./AbstractIdentifierType.js";
import { AbstractTermType } from "./AbstractTermType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippets.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

export class BlankNodeType extends AbstractIdentifierType<BlankNode> {
  readonly kind = "BlankNodeType";

  constructor(
    superParameters: Pick<
      ConstructorParameters<typeof AbstractIdentifierType<BlankNode>>[0],
      "comment" | "label"
    >,
  ) {
    super({
      ...superParameters,
      hasValues: [],
      in_: [],
      nodeKinds,
    });
  }

  @Memoize()
  get filterFunction() {
    return `${syntheticNamePrefix}filterBlankNode`;
  }

  @Memoize()
  get filterType(): string {
    return `${syntheticNamePrefix}BlankNodeFilter`;
  }

  override get name(): string {
    return "rdfjs.BlankNode";
  }

  @Memoize()
  override get schema(): string {
    if (this.constrained) {
      return objectInitializer(this.schemaObject);
    }

    return `${syntheticNamePrefix}blankNodeIdentifierTypeSchema`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}blankNodeSparqlWherePatterns`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, BlankNode | NamedNode>["fromJsonExpression"]
  >[0]): string {
    return `dataFactory.blankNode(${variables.value}["@id"].substring(2))`;
  }

  @Memoize()
  get fromStringFunctionDeclaration(): FunctionDeclarationStructure {
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
        `return ${[
          "purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory, identifier }))",
          `chain((identifier) => (identifier.termType === "BlankNode") ? purify.Either.of(identifier) : purify.Left(new Error("expected identifier to be BlankNode")))`,
        ].join(".")} as purify.Either<Error, ${this.name}>;`,
      ],
    };
  }

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractTermType["jsonType"]>[0],
  ): AbstractTermType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "BlankNode"`
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
      ? `, termType: ${variables.zod}.literal("BlankNode")`
      : "";

    return `${variables.zod}.object({ "@id": ${variables.zod}.string().min(1)${discriminantProperty} })`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractTermType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    const { features } = parameters;

    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}BlankNodeFilter`,
        `\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}filterBlankNode`,
        `\
function ${syntheticNamePrefix}filterBlankNode(_filter: ${syntheticNamePrefix}BlankNodeFilter, _value: rdfjs.BlankNode) {
  return true;
}`,
      ),

      features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}blankNodeSparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}blankNodeSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  ({ propertyPatterns }) => propertyPatterns;`,
              dependencies:
                sharedSnippetDeclarations.SparqlWherePatternsFunction,
            },
          )
        : {},

      singleEntryRecord(
        `${syntheticNamePrefix}blankNodeIdentifierTypeSchema`,
        `const ${syntheticNamePrefix}blankNodeIdentifierTypeSchema = ${objectInitializer(this.schemaObject)};`,
      ),
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
    return `{ "@id": \`_:\${${variables.value}.value}\`${discriminantProperty} }`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<AbstractTermType["fromRdfExpressionChain"]>[0]): ReturnType<
    AbstractTermType["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => value.toBlankNode()))`,
    };
  }
}
