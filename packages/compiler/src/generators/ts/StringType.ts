import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class StringType extends AbstractPrimitiveType<string> {
  private readonly languageIn: readonly string[];

  override readonly conversionFunction: Maybe<AbstractPrimitiveType.ConversionFunction> =
    Maybe.empty();
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterString,
  );
  override readonly filterType = code`${this.reusables.snippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = new ReferenceCallable(
    this.reusables.snippets.hashString,
  );
  override readonly jsTypes = [
    {
      typeof: "string",
    },
  ] as const;
  override readonly kind = "String";
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
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
  get fromRdfResourceValuesFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.stringFromRdfResourceValues}<${this.expression}>`,
    );
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.StringSchema}<${this.expression}>`;
  }

  @Memoize()
  protected override get compactedJsonType(): AbstractPrimitiveType.JsonType {
    return this.jsonTypeFactory.createJsonStringType({
      in_: this.decodedIn,
      inReference:
        this.name.isJust() && this.configuration.features.has("Object.schema")
          ? code`${this.name.extract()!}.schema.in`
          : undefined,
    });
  }

  @Memoize()
  protected override get decodedIn(): readonly string[] {
    return this.in_.map((in_) =>
      LiteralDecoder.decodeStringLiteral(in_).unsafeCoerce(),
    );
  }

  protected override get schemaInitializers(): readonly Code[] {
    let initializers = super.schemaInitializers;
    if (this.languageIn.length > 0) {
      initializers = initializers.concat(
        code`languageIn: ${arrayOf(...this.languageIn)}`,
      );
    }
    return initializers;
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
