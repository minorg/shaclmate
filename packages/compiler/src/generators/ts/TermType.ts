import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

/**
 * ConstantTermT is the type of sh:defaultValue, sh:hasValue, and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:defaultValue et al.
 */
export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly filterFunction = `${syntheticNamePrefix}filterTerm`;
  override readonly filterType = `${syntheticNamePrefix}TermFilter`;
  override readonly kind = "TermType";

  constructor(
    superParameters: ConstructorParameters<
      typeof AbstractTermType<ConstantTermT, RuntimeTermT>
    >[0],
  ) {
    super(superParameters);
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "should be IdentifierType or LiteralType",
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  get schema(): string {
    return objectInitializer(this.schemaObject);
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.in_.length > 0 ? this.in_.map(rdfjsTermExpression) : undefined,
    };
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": `rdfjs.Literal | rdfjs.NamedNode`,
      "in?": `readonly (rdfjs.Literal | rdfjs.NamedNode)[]`,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractTermType["fromJsonExpression"]>[0]): string {
    return [...this.nodeKinds].reduce((expression, nodeKind) => {
      let valueToNodeKind: string;
      switch (nodeKind) {
        case "BlankNode":
          valueToNodeKind = `dataFactory.blankNode(${variables.value}["@id"].substring(2))`;
          break;
        case "Literal":
          valueToNodeKind = `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
          break;
        case "NamedNode":
          valueToNodeKind = `dataFactory.namedNode(${variables.value}["@id"])`;
          break;
        default:
          throw new RangeError(nodeKind);
      }
      return expression.length === 0
        ? valueToNodeKind
        : `((${variables.value}.termType === "${nodeKind}") ? (${valueToNodeKind}) : (${expression}))`;
    }, "");
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonType(): AbstractTermType.JsonType {
    return new AbstractTermType.JsonType(
      `{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
        .filter((nodeKind) => nodeKind !== "Literal")
        .map((nodeKind) => `"${nodeKind}"`)
        .join(
          " | ",
        )} } | { readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string, readonly termType: "Literal" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractTermType["jsonZodSchema"]>[0]): ReturnType<
    AbstractTermType["jsonZodSchema"]
  > {
    return `${variables.zod}.discriminatedUnion("termType", [${[
      ...this.nodeKinds,
    ]
      .map((nodeKind) => {
        switch (nodeKind) {
          case "BlankNode":
          case "NamedNode":
            return `${variables.zod}.object({ "@id": ${variables.zod}.string().min(1), termType: ${variables.zod}.literal("${nodeKind}") })`;
          case "Literal":
            return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional(), "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string(), termType: ${variables.zod}.literal("Literal") })`;
          default:
            throw new RangeError(nodeKind);
        }
      })
      .join(", ")}])`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractTermType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      sharedSnippetDeclarations.filterTerm,
      sharedSnippetDeclarations.TermFilter,
      parameters.features.has("sparql")
        ? singleEntryRecord(`${syntheticNamePrefix}termSparqlWherePatterns`, {
            code: `\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}TermFilter, ${syntheticNamePrefix}TermSchema> =
  (parameters) => ${syntheticNamePrefix}termSchemaSparqlWherePatterns({ filterPatterns: ${syntheticNamePrefix}termFilterSparqlPatterns(parameters), ...parameters })`,
            dependencies: {
              ...sharedSnippetDeclarations.termFilterSparqlPatterns,
              ...sharedSnippetDeclarations.termSchemaSparqlWherePatterns,
            },
          } satisfies SnippetDeclaration)
        : {},
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractTermType["toJsonExpression"]>[0]): string {
    return [...this.nodeKinds].reduce((expression, nodeKind) => {
      let valueToNodeKind: string;
      switch (nodeKind) {
        case "BlankNode":
          valueToNodeKind = `{ "@id": \`_:\${${variables.value}.value}\`, termType: "${nodeKind}" as const }`;
          break;
        case "Literal":
          valueToNodeKind = `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value, termType: "${nodeKind}" as const }`;
          break;
        case "NamedNode":
          valueToNodeKind = `{ "@id": ${variables.value}.value, termType: "${nodeKind}" as const }`;
          break;
        default:
          throw new RangeError(nodeKind);
      }
      return expression.length === 0
        ? valueToNodeKind
        : `(${variables.value}.termType === "${nodeKind}") ? ${valueToNodeKind} : ${expression}`;
    }, "");
  }
}
