import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/index.js";
import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

/**
 * Abstract base class for IdentifierType and LiteralType.
 */
export class TermType<
  TermT extends BlankNode | Literal | NamedNode,
> extends Type {
  readonly defaultValue: Maybe<TermT>;
  readonly equalsFunction: string = "$booleanEquals";
  readonly hasValues: readonly TermT[];
  readonly in_: readonly TermT[];
  readonly mutable: boolean = false;
  readonly nodeKinds: Set<TermT["termType"]>;

  constructor({
    defaultValue,
    hasValues,
    in_,
    nodeKinds,
    ...superParameters
  }: {
    defaultValue: Maybe<TermT>;
    hasValues: readonly TermT[];
    in_: readonly TermT[];
    nodeKinds: Set<TermT["termType"]>;
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = new Set([...nodeKinds]);
    invariant(this.nodeKinds.size > 0);
  }

  get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];

    if (this.nodeKinds.has("Literal")) {
      conversions.push(
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: this.dataFactoryVariable })})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "boolean"`,
          sourceTypeName: "boolean",
        },
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: this.dataFactoryVariable })})`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof Date`,
          sourceTypeName: "Date",
        },
        {
          conversionExpression: (value) =>
            `rdfLiteral.toRdf(${value}, ${objectInitializer({ dataFactory: this.dataFactoryVariable })})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "number"`,
          sourceTypeName: "number",
        },
        {
          conversionExpression: (value) =>
            `${this.dataFactoryVariable}.literal(${value})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
          sourceTypeName: "string",
        },
      );
    }

    this.defaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => this.rdfjsTermExpression(defaultValue),
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

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of({
      name: "termType",
      type: "string" as const,
      values: [...this.nodeKinds],
    });
  }

  get jsonName(): string {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
    return `{ readonly "@id": string, readonly termType: ${[...this.nodeKinds]
      .filter((nodeKind) => nodeKind !== "Literal")
      .map((nodeKind) => `"${nodeKind}"`)
      .join(
        " | ",
      )} } | { readonly "@language": string | undefined, readonly "@type": string | undefined, readonly "@value": string, readonly termType: "Literal" }`;
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
          valueToNodeKind = `${this.dataFactoryVariable}.blankNode(${variables.value}["@id"].substring(2))`;
          break;
        case "Literal":
          valueToNodeKind = `${this.dataFactoryVariable}.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
          break;
        case "NamedNode":
          valueToNodeKind = `${this.dataFactoryVariable}.namedNode(${variables.value}["@id"])`;
          break;
        default:
          throw new RangeError(nodeKind);
      }
      return expression.length === 0
        ? valueToNodeKind
        : `((${variables.value}.termType === "${nodeKind}") ? (${valueToNodeKind}) : (${expression}))`;
    }, "");
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    const chain: string[] = [
      this.propertyFilterRdfResourceValuesExpression({ variables }),
    ];
    // Have an rdfjsResource.Resource.Values here
    if (this.hasValues.length === 1) {
      chain.push(
        `find(_value => _value.toTerm().equals(${this.rdfjsTermExpression(this.hasValues[0])}))`,
      );
    } else {
      chain.push("head()");
    }
    // Have an rdfjsResource.Resource.Value here
    this.defaultValue.ifJust((defaultValue) => {
      // alt the default value before trying to convert the rdfjsResource.Resource.Value to the type
      chain.push(
        `alt(purify.Either.of(new rdfjsResource.Resource.Value(${objectInitializer({ subject: variables.resource, predicate: variables.predicate, object: this.rdfjsTermExpression(defaultValue) })})))`,
      );
    });
    // Last step: convert the rdfjsResource.Resource.Value to the type
    chain.push(
      `chain(_value => ${this.propertyFromRdfResourceValueExpression({
        variables: {
          predicate: variables.predicate,
          resource: variables.resource,
          resourceValue: "_value",
        },
      })})`,
    );
    return chain.join(".");
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.termType);`,
      `${variables.hasher}.update(${variables.value}.value);`,
    ];
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

  override snippetDeclarations(features: Set<TsFeature>): readonly string[] {
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
      case "property":
        return this.defaultValue
          .map(
            () =>
              [
                `{ patterns: [${super.sparqlWherePatterns(parameters).join(", ")}], type: "optional" }`,
              ] as readonly string[],
          )
          .orDefault(super.sparqlWherePatterns(parameters));
      case "type":
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
          `!${variables.value}.equals(${this.rdfjsTermExpression(defaultValue)}) ? ${variables.value} : undefined`,
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

  /**
   * Filter the rdfjsResource.Resource.Values to those that are relevant to the type.
   *
   * This is done before
   */
  protected propertyFilterRdfResourceValuesExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return variables.resourceValues;
  }

  /**
   * Convert an rdfjsResource.Resource.Value to a value of this type.
   * @param variables
   * @protected
   */
  protected propertyFromRdfResourceValueExpression({
    variables,
  }: {
    variables: { predicate: string; resource: string; resourceValue: string };
  }): string {
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
      "IdentifierType and LiteralType should override",
    );
    let expression = `purify.Either.of(${variables.resourceValue}.toTerm())`;
    if (this.nodeKinds.size < 3) {
      expression = `${expression}.chain(term => {
  switch (term.termType) {
  ${[...this.nodeKinds].map((nodeKind) => `case "${nodeKind}":`).join("\n")} return purify.Either.of(term);
  default: return purify.Left(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: "term", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })}));         
}})`;
    }
    return expression;
  }
}
