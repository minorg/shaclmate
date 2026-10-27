import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import type { Typeof } from "./Typeof.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  private readonly languageIn: readonly string[];

  protected override readonly inlineExpression =
    code`${this.reusables.imports.Literal}`;

  override readonly expandedJsonType: AbstractLiteralType["expandedJsonType"] =
    this.jsonTypeFactory.createJsonObjectType(
      {
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
      },
      {
        snippet: this.reusables.snippets.LiteralExpandedJson,
      },
    );
  override readonly compactedJsonType: AbstractLiteralType["compactedJsonType"] =
    this.expandedJsonType;
  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToLiteral}`,
      sourceTypes: [
        ...(
          ["bigint", "boolean", "number", "string"] satisfies readonly Typeof[]
        ).map((typeof_) => ({
          expression: code`${typeof_}`,
          jsType: { typeof: typeof_ },
        })),
        {
          expression: code`Date`,
          jsType: { instanceof: "Date", typeof: "object" },
        },
        {
          expression: code`${this.reusables.imports.Literal}`,
          jsType: { instanceof: "Object", typeof: "object" },
        },
      ],
    });
  override readonly filterFunction = new ReferenceCallable(
    this.reusables.snippets.filterLiteral,
  );
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.literalFromExpandedJson,
  );
  override readonly fromCompactedJsonFunction = this.fromExpandedJsonFunction;
  override readonly fromRdfResourceValuesFunction = new ReferenceCallable(
    this.reusables.snippets.literalFromRdfResourceValues,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Literal";
  override readonly schemaType = code`${this.reusables.snippets.LiteralSchema}`;
  override readonly toExpandedJsonFunction = new ReferenceCallable(
    this.reusables.snippets.literalToExpandedJson,
  );
  override readonly toCompactedJsonFunction = this.toExpandedJsonFunction;
  override readonly valueSparqlWherePatternsFunction = new ReferenceCallable(
    this.reusables.snippets.literalSparqlWherePatterns,
  );

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & ConstructorParameters<
    typeof AbstractLiteralType
  >[0]) {
    super(superParameters);
    this.languageIn = languageIn;
  }

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.languageIn.length > 0) {
      initializers = initializers.concat(
        code`languageIn: ${arrayOf(...this.languageIn)}`,
      );
    }
    return initializers;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractLiteralType["toLoggableExpression"]>[0]): Code {
    return code`{ datatype: ${variables.value}.datatype.value, language: ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, value: ${variables.value}.value }`;
  }

  override valueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }
}
