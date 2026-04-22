import { Maybe } from "purify-ts";

import type { AbstractType } from "./AbstractType.js";
import { AbstractUnionType } from "./AbstractUnionType.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class AnonymousUnionType extends AbstractUnionType<Type> {
  override readonly declaration: Maybe<Code> = Maybe.empty();
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  override readonly kind = "AnonymousUnionType";

  override get equalsFunction(): Code {
    return this.inlineEqualsFunction;
  }

  override get filterFunction(): Code {
    return this.inlineFilterFunction;
  }

  get filterType(): Code {
    return this.inlineFilterType;
  }

  override get graphqlType(): AbstractType.GraphqlType {
    throw new Error("GraphQL doesn't support scalar unions");
  }

  override get name(): Code {
    return this.inlineName;
  }

  override get valueSparqlConstructTriplesFunction(): Code {
    return this.inlineValueSparqlConstructTriplesFunction;
  }

  override get valueSparqlWherePatternsFunction(): Code {
    return this.inlineValueSparqlWherePatternsFunction;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.inlineFromJsonFunction}(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues: resourceValuesVariable, ...otherVariables } =
      variables;
    return code`${this.inlineFromRdfResourceValuesFunction}(${resourceValuesVariable}, ${otherVariables})`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override hashStatements(
    parameters: Parameters<AbstractType["hashStatements"]>[0],
  ): readonly Code[] {
    return this.inlineHashStatements(parameters);
  }

  override jsonType(): AbstractType.JsonType {
    return this.inlineJsonType;
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): Code {
    return this.inlineJsonZodSchema;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.inlineToJsonFunction}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.inlineToRdfResourceValuesFunction}(${valueVariable}, ${otherVariables})`;
  }
}
