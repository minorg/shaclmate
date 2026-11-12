import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import type { Callable } from "./Callable.js";
import { SchemaObject } from "./SchemaObject.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class StringType extends AbstractPrimitiveType<string> {
  private readonly languageIn: readonly string[];

  protected override readonly decodedIn = this.in_.map((in_) =>
    LiteralDecoder.decodeStringLiteral(in_).unsafeCoerce(),
  );

  override readonly conversionFunction: Maybe<AbstractPrimitiveType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterString,
  );
  override readonly filterType = code`${this.reusables.snippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = new BuiltinCallable(
    this.reusables.snippets.hashString,
  );
  override readonly jsTypes = [
    {
      typeof: "string",
    },
  ] as const;
  override readonly jsonValueType: AbstractPrimitiveType.JsonType =
    this.jsonTypeFactory.createJsonStringType({
      in_: this.decodedIn,
      inReference:
        this.name.isJust() && this.configuration.features.has("Object.schema")
          ? code`${this.name.extract()!}.schema.in`
          : undefined,
    });
  override readonly kind = "String";
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.stringSparqlWherePatterns,
  );

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & ConstructorParameters<
    typeof AbstractPrimitiveType<string>
  >[0]) {
    super(superParameters);
    this.languageIn = languageIn;
  }

  @Memoize()
  get fromJsonObjectFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.stringFromJsonObject}<${this.expression}>`,
    );
  }

  @Memoize()
  override get fromJsonValueFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.stringFromJsonString}<${this.expression}>`,
    );
  }

  @Memoize()
  get fromRdfResourceValuesFunction(): Callable {
    return new BuiltinCallable(
      code`${this.reusables.snippets.stringFromRdfResourceValues}<${this.expression}>`,
    );
  }

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      properties:
        this.languageIn.length > 0
          ? super.schema.properties.concat(
              code`languageIn: ${arrayOf(...this.languageIn)}`,
            )
          : super.schema.properties,
      type: new SchemaObject.BuiltinType(
        code`${this.reusables.snippets.StringSchema}<${this.expression}>`,
      ),
      variable: super.schema.variable,
    });
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.string(${variables.value}${!this.datatype.equals(xsd.string) ? `, ${this.rdfjsTermExpression(this.datatype)}` : ""})]`;
  }

  override valueExpression(literal: Literal | string): Code {
    return code`${literalOf(typeof literal === "string" ? literal : literal.value)}`;
  }
}
