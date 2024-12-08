import { Maybe } from "purify-ts";
import { toRdf } from "rdf-literal";
import { Type } from "./Type.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";

export abstract class PrimitiveType<
  ValueT extends boolean | string | number,
> extends Type {
  readonly defaultValue: Maybe<ValueT>;
  readonly hasValue: Maybe<ValueT>;
  readonly in_: Maybe<readonly ValueT[]>;

  constructor({
    defaultValue,
    hasValue,
    in_,
    ...superParameters
  }: {
    defaultValue: Maybe<ValueT>;
    hasValue: Maybe<ValueT>;
    in_: Maybe<readonly ValueT[]>;
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
    this.hasValue = hasValue;
    this.in_ = in_;
  }

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  override get importStatements(): readonly string[] {
    return [];
  }

  override propertyEqualsFunction(): string {
    return "purifyHelpers.Equatable.strictEquals";
  }

  override propertyFromRdfExpression({
    variables,
  }: Parameters<Type["propertyFromRdfExpression"]>[0]): string {
    const chain: string[] = [`${variables.resourceValues}.head()`];
    this.hasValue.ifJust(() => {
      throw new Error("re-implement from RdfjsTermType");
    });
    this.defaultValue.ifJust((defaultValue) => {
      chain.push(
        `alt(purify.Either.of(new rdfjsResource.Resource.Value({ subject: ${variables.resource}, predicate: ${variables.predicate}, object: ${rdfjsTermExpression(toRdf(defaultValue), this.configuration)} })))`,
      );
    });
    chain.push(
      `chain(_value => ${this.fromRdfResourceValueExpression({
        variables: {
          predicate: variables.predicate,
          resource: variables.resource,
          resourceValue: "_value",
        },
      })})`,
    );
    return chain.join(".");
  }

  propertyHashStatements({
    variables,
  }: Parameters<Type["propertyHashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }

  override propertySparqlGraphPatternExpression({
    variables,
  }: Parameters<
    Type["propertySparqlGraphPatternExpression"]
  >[0]): Type.SparqlGraphPatternExpression {
    let expression = super
      .propertySparqlGraphPatternExpression({
        variables,
      })
      .toSparqlGraphPatternExpression()
      .toString();
    if (this.defaultValue.isJust()) {
      expression = `sparqlBuilder.GraphPattern.optional(${expression})`;
    }
    return new Type.SparqlGraphPatternExpression(expression);
  }

  protected abstract fromRdfResourceValueExpression({
    variables,
  }: {
    variables: { predicate: string; resource: string; resourceValue: string };
  }): string;
}
