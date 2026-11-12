import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LangStringType extends AbstractLiteralType {
  private readonly languageIn: readonly string[];

  protected override readonly inlineExpression =
    code`${this.reusables.imports.Literal}`;

  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToLangString}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.Literal}`,
          jsType: { instanceof: "Object", typeof: "object" },
        },
      ],
    });
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterLiteral,
  );
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.langStringFromJsonObject,
  );
  override readonly fromJsonValueFunction = this.fromJsonObjectFunction;
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.langStringFromRdfResourceValues,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly jsonObjectType: AbstractLiteralType["jsonObjectType"] =
    this.jsonTypeFactory.createJsonObjectType(
      {
        "@language": {
          type: this.jsonTypeFactory.createJsonStringType({ minLength: 1n }),
        },
        "@value": { type: this.jsonTypeFactory.createJsonStringType() },
      },
      { snippet: this.reusables.snippets.LangStringJsonObject },
    );
  override readonly jsonValueType: AbstractLiteralType["jsonValueType"] =
    this.jsonObjectType;
  override readonly kind = "LangString";
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.langStringToJsonObject,
  );
  override readonly toJsonValueFunction = this.toJsonObjectFunction;
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
    this.reusables.snippets.langStringSparqlWherePatterns,
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

  @Memoize()
  override get discriminatedType(): Maybe<AbstractLiteralType.DiscriminatedType> {
    return Maybe.of({
      discriminantProperty: {
        jsonName: "termType",
        name: "termType",
        values: [...this.termTypes],
      },
      expression: this.expression,
    });
  }

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get schema(): SchemaObject {
    return new SchemaObject({
      properties:
        this.languageIn.length > 0
          ? super.schema.properties.concat(
              code`languageIn: ${arrayOf(...this.languageIn)}`,
            )
          : super.schema.properties,
      type: new SchemaObject.Type({
        members:
          this.languageIn.length > 0
            ? super.schema.type.members.concat(
                code`languageIn: readonly string[]`,
              )
            : super.schema.type.members,
        name: Maybe.of(code`${this.reusables.snippets.LangStringSchema}`),
      }),
      variable: super.schema.variable,
    });
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractLiteralType["toLoggableExpression"]>[0]): Code {
    return code`\`\${JSON.stringify(${variables.value}.value)}@\${${variables.value}.language}\``;
  }

  override valueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }
}
