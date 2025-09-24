import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

/**
 * Abstract base class for IdentifierType and LiteralType.
 *
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
> extends Type {
  readonly defaultValue: Maybe<ConstantTermT>;
  readonly equalsFunction: string = `${syntheticNamePrefix}booleanEquals`;
  readonly hasValues: readonly ConstantTermT[];
  readonly in_: readonly ConstantTermT[];
  readonly mutable: boolean = false;
  readonly nodeKinds: Set<RuntimeTermT["termType"]>;
  readonly typeof: "boolean" | "number" | "object" | "string" = "object";

  constructor({
    defaultValue,
    hasValues,
    in_,
    nodeKinds,
  }: {
    defaultValue: Maybe<ConstantTermT>;
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
    nodeKinds: Set<RuntimeTermT["termType"]>;
  }) {
    super();
    this.defaultValue = defaultValue;
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = new Set([...nodeKinds]);
    invariant(this.nodeKinds.size > 0);
  }

  @Memoize()
  get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];

    if (this.nodeKinds.has("Literal")) {
      conversions.push(
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: "dataFactory" })})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "boolean"`,
          sourceTypeName: "boolean",
        },
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: "dataFactory" })})`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof Date`,
          sourceTypeName: "Date",
        },
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: "dataFactory" })})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "number"`,
          sourceTypeName: "number",
        },
        {
          conversionExpression: (value) => `dataFactory.literal(${value})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
          sourceTypeName: "string",
        },
      );
    }

    this.defaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => rdfjsTermExpression(defaultValue),
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });

    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
      sourceTypeName: this.name,
    });

    return conversions;
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of({
      name: "termType",
      ownValues: [...this.nodeKinds],
      descendantValues: [],
      type: "string" as const,
    });
  }

  override get graphqlName(): Type.GraphqlName {
    throw new Error("not implemented");
  }

  @Memoize()
  get jsonName(): Type.JsonName {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
    return new Type.JsonName(
      `{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
        .filter((nodeKind) => nodeKind !== "Literal")
        .map((nodeKind) => `"${nodeKind}"`)
        .join(
          " | ",
        )} } | { readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string, readonly termType: "Literal" }`,
    );
  }

  @Memoize()
  override get name(): string {
    return `(${[...this.nodeKinds]
      .map((nodeKind) => `rdfjs.${nodeKind}`)
      .join(" | ")})`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
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

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    // invariant(
    //   this.nodeKinds.has("Literal") &&
    //     (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
    //   "IdentifierType and LiteralType should override",
    // );

    const chain = this.fromRdfExpressionChain(parameters);
    const { variables } = parameters;
    return [
      variables.resourceValues,
      chain.defaultValue,
      chain.hasValues,
      chain.languageIn,
      chain.valueTo,
    ]
      .filter((_) => typeof _ !== "undefined")
      .join(".");
  }

  protected fromRdfExpressionChain({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): {
    defaultValue?: string;
    hasValues?: string;
    languageIn?: string;
    valueTo?: string;
  } {
    let valueToExpression =
      "purify.Either.of<Error, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>(value.toTerm())";
    if (this.nodeKinds.size < 3) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      valueToExpression = `${valueToExpression}.chain(term => {
  switch (term.termType) {
  ${[...this.nodeKinds].map((nodeKind) => `case "${nodeKind}":`).join("\n")} return purify.Either.of${eitherTypeParameters}(term);
  default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: "term", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })}));         
}})`;
    }

    return {
      defaultValue: this.defaultValue
        .map(
          (defaultValue) =>
            `map(values => values.length > 0 ? values : new rdfjsResource.Resource.Value(${objectInitializer({ subject: variables.resource, predicate: variables.predicate, object: rdfjsTermExpression(defaultValue) })}).toValues())`,
        )
        .extract(),
      hasValues:
        this.hasValues.length > 0
          ? `chain(values => {
  for (const hasValue of [${this.hasValues.map(rdfjsTermExpression).join(", ")}]) {
    const findResult = values.find(value => value.toTerm().equals(hasValue));
    if (findResult.isLeft()) {
      return findResult;
    }
  }
  return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.Value>>(values);
})`
          : undefined,
      valueTo: `chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }

  override graphqlResolveExpression(
    _parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.termType);`,
      `${variables.hasher}.update(${variables.value}.value);`,
    ];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
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

  override snippetDeclarations({
    features,
  }: Parameters<Type["snippetDeclarations"]>[0]): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.booleanEquals);
    }
    return snippetDeclarations;
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return this.defaultValue
          .map(
            () =>
              [
                `{ patterns: [${super.sparqlWherePatterns(parameters).join(", ")}], type: "optional" }`,
              ] as readonly string[],
          )
          .orDefault(super.sparqlWherePatterns(parameters));
      case "subject":
        return super.sparqlWherePatterns(parameters);
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
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

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return this.defaultValue
      .map(
        (defaultValue) =>
          `!${variables.value}.equals(${rdfjsTermExpression(defaultValue)}) ? ${variables.value} : undefined`,
      )
      .orDefault(variables.value);
  }

  override useImports(): readonly Import[] {
    const imports = [Import.RDFJS_TYPES];
    if (this.nodeKinds.has("Literal")) {
      imports.push(Import.RDF_LITERAL);
    }
    return imports;
  }
}
