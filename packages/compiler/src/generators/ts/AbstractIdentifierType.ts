import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { AbstractTermType } from "./AbstractTermType.js";
import type { Callable } from "./Callable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractIdentifierType<
  IdentifierT extends BlankNode | NamedNode,
> extends AbstractTermType<NamedNode, IdentifierT> {
  override readonly graphqlType = new AbstractTermType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  abstract override readonly kind: "BlankNode" | "Identifier" | "Iri";
  abstract override readonly nodeKinds: ReadonlySet<IdentifierNodeKind>;
  abstract readonly parseFunction: Callable;

  override fromJsonExpression({
    form,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, IdentifierT>["fromJsonExpression"]
  >[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${this.fromCompactedJsonExpression(
      {
        variables: {
          value:
            form === "compact"
              ? variables.value
              : code`${variables.value}["@id"]`,
        },
      },
    )})`;
  }

  override toJsonExpression({
    discriminantProperty,
    form,
    variables,
  }: Parameters<
    AbstractTermType<NamedNode, IdentifierT>["toJsonExpression"]
  >[0]): Code {
    const toCompactedJsonExpression = this.toCompactedJsonExpression({
      variables,
    });
    switch (form) {
      case "compact":
        return toCompactedJsonExpression;
      case "expanded":
        return code`${{ ...discriminantProperty, "@id": toCompactedJsonExpression }}`;
    }
  }

  override jsonType({
    discriminantProperty,
    form,
  }: Parameters<
    AbstractTermType<NamedNode, IdentifierT>["jsonType"]
  >[0]): AbstractTermType.JsonType {
    const compactedJsonType = this.jsonTypeFactory.createJsonStringType({
      in_: this.in_.map((in_) => in_.value),
      inReference:
        this.name.isJust() && this.configuration.features.has("Object.schema")
          ? code`${this.name.extract()!}.schema.in.map(_ => _.value)`
          : undefined,
      minLength: 1n,
    });

    switch (form) {
      case "compact":
        return compactedJsonType;
      case "expanded":
        return this.jsonTypeFactory.createJsonObjectType({
          ...discriminantProperty,
          "@id": { type: compactedJsonType },
        });
    }
  }

  protected abstract fromCompactedJsonExpression(parameters: {
    variables: { value: Code };
  }): Code;

  protected abstract toCompactedJsonExpression(parameters: {
    variables: { value: Code };
  }): Code;

  override graphqlResolveExpression({
    variables: { value },
  }: Parameters<AbstractTermType["graphqlResolveExpression"]>[0]): Code {
    return code`${this.reusables.imports.NTriplesIdentifier}.stringify(${value})`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractTermType<NamedNode>["toLoggableExpression"]>[0]): Code {
    return code`${variables.value}.value`;
  }
}

export namespace AbstractIdentifierType {
  export type ConversionFunction = AbstractTermType.ConversionFunction;
  export type JsonType = AbstractTermType.JsonType;
}
