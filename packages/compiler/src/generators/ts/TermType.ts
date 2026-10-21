import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractTermType } from "./AbstractTermType.js";
import type { FunctionLike } from "./FunctionLike.js";
import { FunctionReference } from "./FunctionReference.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class TermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractTermType {
  override readonly conversionFunction: Maybe<AbstractTermType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new FunctionReference(
    this.reusables.snippets.filterTerm,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Term";
  override readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly valueSparqlWherePatternsFunction = new FunctionReference(
    this.reusables.snippets.termSparqlWherePatterns,
  );

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

  @Memoize()
  override get filterType(): Code {
    return code`${this.reusables.snippets.TermFilter}<${this.expression}>`;
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): FunctionLike {
    return new FunctionReference(
      code`${this.reusables.snippets.termFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override get graphqlType(): AbstractTermType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.TermSchema}<${this.expression}>`;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return code`(${joinCode(
      [...this.nodeKinds]
        .map((nodeKind) => {
          switch (nodeKind) {
            case "BlankNode":
              return this.reusables.imports.BlankNode;
            case "IRI":
              return this.reusables.imports.NamedNode;
            case "Literal":
              return this.reusables.imports.Literal;
            default:
              nodeKind satisfies never;
              throw new RangeError(nodeKind);
          }
        })
        .map((import_) => code`${import_}`),
      { on: " | " },
    )})`;
  }

  protected override get schemaInitializers() {
    return super.schemaInitializers.concat(
      code`types: ${arrayOf(...[...this.nodeKinds].map(NodeKind.toTermType))}`,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractTermType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${[
      ...this.nodeKinds,
    ].reduce(
      (combinedFromJsonExpression, nodeKind) => {
        let fromJsonExpression: Code;
        switch (nodeKind) {
          case "BlankNode":
            fromJsonExpression = code`${this.reusables.imports.dataFactory}.blankNode(${variables.value}["@id"].substring(2))`;
            break;
          case "IRI":
            fromJsonExpression = code`${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@id"])`;
            break;
          case "Literal":
            fromJsonExpression = code`${this.reusables.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined))`;
            break;
          default:
            throw new RangeError(nodeKind);
        }
        return combinedFromJsonExpression == null
          ? fromJsonExpression
          : code`((${variables.value}.${this.configuration.objectDiscriminantProperty.jsonName} === "${NodeKind.toTermType(nodeKind)}") ? (${fromJsonExpression}) : (${combinedFromJsonExpression}))`;
      },
      null as Code | null,
    )!})`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractTermType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonType(): AbstractTermType.JsonType {
    return this.jsonTypeFactory.createJsonDiscriminatedUnionType(
      [...this.nodeKinds].map((nodeKind) => {
        const discriminantProperty = singleEntryRecord(
          this.configuration.objectDiscriminantProperty.jsonName,
          {
            type: this.jsonTypeFactory.createJsonStringType({
              in_: [NodeKind.toTermType(nodeKind)],
            }),
          },
        );
        switch (nodeKind) {
          case "BlankNode":
          case "IRI":
            return this.jsonTypeFactory.createJsonObjectType({
              ...discriminantProperty,
              "@id": {
                type: this.jsonTypeFactory.createJsonStringType({
                  minLength: 1n,
                }),
              },
            });
          case "Literal":
            return this.jsonTypeFactory.createJsonObjectType({
              ...discriminantProperty,
              "@language": {
                optional: true,
                type: this.jsonTypeFactory.createJsonStringType(),
              },
              "@type": {
                optional: true,
                type: this.jsonTypeFactory.createJsonStringType(),
              },
              "@value": {
                type: this.jsonTypeFactory.createJsonStringType(),
              },
            });
          default:
            nodeKind satisfies never;
            throw new RangeError(nodeKind);
        }
      }),
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractTermType["toJsonExpression"]>[0]): Code {
    return [...this.nodeKinds].reduce(
      (combinedToJsonExpression, nodeKind) => {
        const toJsonExpression: Record<string, Code> = {};
        toJsonExpression[
          this.configuration.objectDiscriminantProperty.jsonName
        ] = code`${literalOf(NodeKind.toTermType(nodeKind))} as const`;
        switch (nodeKind) {
          case "BlankNode":
            toJsonExpression["@id"] = code`\`_:\${${variables.value}.value}\``;
            break;
          case "IRI":
            toJsonExpression["@id"] = code`${variables.value}.value`;
            break;
          case "Literal":
            toJsonExpression["@language"] =
              code`${variables.value}.language.length > 0 ? ${variables.value}.language : undefined`;
            toJsonExpression["@type"] =
              code`${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined`;
            toJsonExpression["@value"] = code`${variables.value}.value`;
            break;
        }

        return combinedToJsonExpression === null
          ? code`${toJsonExpression}`
          : code`(${variables.value}.termType === "${NodeKind.toTermType(nodeKind)}") ? ${toJsonExpression} : ${combinedToJsonExpression}`;
      },
      null as Code | null,
    )!;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractTermType["toLoggableExpression"]>[0]): Code {
    return this.toJsonExpression({ form: "expanded", variables });
  }
}
