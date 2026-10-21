import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { FunctionLike } from "./FunctionLike.js";
import { FunctionReference } from "./FunctionReference.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeBooleanLiteral(in_).unsafeCoerce(),
  );
  override readonly compactJsonType: AbstractPrimitiveType.JsonType =
    this.jsonTypeFactory.createJsonBooleanType({ in_: this.decodedIn });
  override readonly conversionFunction: Maybe<AbstractPrimitiveType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new FunctionReference(
    this.reusables.snippets.filterBoolean,
  );
  override readonly filterType = code`${this.reusables.snippets.BooleanFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLBoolean}`,
    this.reusables,
  );
  override readonly hashFunction = new FunctionReference(
    this.reusables.snippets.hashBoolean,
  );
  override readonly jsTypes = [{ typeof: "boolean" }] as const;
  override readonly kind = "Boolean";
  override readonly schemaType =
    code`${this.reusables.snippets.BooleanSchema}<${this.expression}>`;
  override readonly valueSparqlWherePatternsFunction = new FunctionReference(
    this.reusables.snippets.booleanSparqlWherePatterns,
  );

  @Memoize()
  override get fromRdfResourceValuesFunction(): FunctionLike {
    return new FunctionReference(
      code`${this.reusables.snippets.booleanFromRdfResourceValues}<${this.expression}>`,
    );
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.boolean(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }

  override valueExpression(literal: boolean | Literal): Code {
    return code`${typeof literal === "boolean" ? literal : LiteralDecoder.decodeBooleanLiteral(literal).unsafeCoerce()}`;
  }
}
