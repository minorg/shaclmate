import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractTermType } from "./AbstractTermType.js";

import { rdfjsTermExpression } from "./rdfjsTermExpression.js";

import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly filterFunction = code`${this.snippets.filterTerm}`;
  override readonly filterType = code`${this.snippets.TermFilter}`;
  override readonly kind = "TermType";
  override readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly schemaType = code`${this.snippets.TermSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.snippets.termSparqlWherePatterns}`;

  constructor({
    nodeKinds,
    ...superParameters
  }: ConstructorParameters<
    typeof AbstractTermType<ConstantTermT, RuntimeTermT>
  >[0] & {
    nodeKinds: ReadonlySet<NodeKind>;
  }) {
    super(superParameters);
    this.nodeKinds = nodeKinds;
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("IRI")),
      "should be IdentifierType or LiteralType",
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get name(): Code {
    return code`(${joinCode(
      [...this.nodeKinds]
        .map((nodeKind) => {
          switch (nodeKind) {
            case "BlankNode":
              return this.imports.BlankNode;
            case "IRI":
              return this.imports.NamedNode;
            case "Literal":
              return this.imports.Literal;
            default:
              nodeKind satisfies never;
              throw new RangeError(nodeKind);
          }
        })
        .map((import_) => code`${import_}`),
      { on: " | " },
    )})`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.in_.length > 0
          ? this.in_.map((in_) =>
              rdfjsTermExpression(in_, { logger: this.logger }),
            )
          : undefined,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractTermType["fromJsonExpression"]>[0]): Code {
    return [...this.nodeKinds].reduce(
      (expression, nodeKind) => {
        let valueToNodeKind: Code;
        switch (nodeKind) {
          case "BlankNode":
            valueToNodeKind = code`${this.imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2))`;
            break;
          case "IRI":
            valueToNodeKind = code`${this.imports.dataFactory}.namedNode(${variables.value}["@id"])`;
            break;
          case "Literal":
            valueToNodeKind = code`${this.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined))`;
            break;
          default:
            throw new RangeError(nodeKind);
        }
        return expression == null
          ? valueToNodeKind
          : code`((${variables.value}.termType === "${NodeKind.toTermType(nodeKind)}") ? (${valueToNodeKind}) : (${expression}))`;
      },
      null as Code | null,
    )!;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonType(): AbstractTermType.JsonType {
    return new AbstractTermType.JsonType(
      code`{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
        .filter((nodeKind) => nodeKind !== "Literal")
        .map((nodeKind) => `"${NodeKind.toTermType(nodeKind)}"`)
        .join(
          " | ",
        )} } | { readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string, readonly termType: "Literal" }`,
    );
  }

  override jsonSchema(
    _parameters: Parameters<AbstractTermType["jsonSchema"]>[0],
  ): Code {
    return code`${this.imports.z}.discriminatedUnion("termType", [${joinCode(
      [...this.nodeKinds].map((nodeKind) => {
        switch (nodeKind) {
          case "BlankNode":
          case "IRI":
            return code`${this.imports.z}.object({ "@id": ${this.imports.z}.string().min(1), termType: ${this.imports.z}.literal("${NodeKind.toTermType(nodeKind)}") })`;
          case "Literal":
            return code`${this.imports.z}.object({ "@language": ${this.imports.z}.string().optional(), "@type": ${this.imports.z}.string().optional(), "@value": ${this.imports.z}.string(), termType: ${this.imports.z}.literal("Literal") })`;
          default:
            throw new RangeError(nodeKind);
        }
      }),
      { on: "," },
    )}])`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractTermType["toJsonExpression"]>[0]): Code {
    return [...this.nodeKinds].reduce(
      (expression, nodeKind) => {
        let valueToNodeKind: Code;
        switch (nodeKind) {
          case "BlankNode":
            valueToNodeKind = code`{ "@id": \`_:\${${variables.value}.value}\`, termType: "${NodeKind.toTermType(nodeKind)}" as const }`;
            break;
          case "IRI":
            valueToNodeKind = code`{ "@id": ${variables.value}.value, termType: "${NodeKind.toTermType(nodeKind)}" as const }`;
            break;
          case "Literal":
            valueToNodeKind = code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value, termType: "${NodeKind.toTermType(nodeKind)}" as const }`;
            break;
          default:
            throw new RangeError(nodeKind);
        }
        return expression === null
          ? valueToNodeKind
          : code`(${variables.value}.termType === "${NodeKind.toTermType(nodeKind)}") ? ${valueToNodeKind} : ${expression}`;
      },
      null as Code | null,
    )!;
  }
}
