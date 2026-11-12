import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import type { Typeof } from "./Typeof.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  private readonly languageIn: readonly string[];

  protected override readonly inlineExpression =
    code`${this.reusables.imports.Literal}`;

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
  override readonly filterFunction = new BuiltinCallable(
    this.reusables.snippets.filterLiteral,
  );
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.literalFromJsonObject,
  );
  override readonly fromJsonValueFunction = this.fromJsonObjectFunction;
  override readonly fromRdfResourceValuesFunction = new BuiltinCallable(
    this.reusables.snippets.literalFromRdfResourceValues,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly jsonValueType: AbstractLiteralType["jsonValueType"] =
    this.jsonObjectType;
  override readonly kind = "Literal";
  override readonly toJsonObjectFunction = new BuiltinCallable(
    this.reusables.snippets.literalToJsonObject,
  );
  override readonly toJsonValueFunction = this.toJsonObjectFunction;
  override readonly valueSparqlWherePatternsFunction = new BuiltinCallable(
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
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    return new SchemaObject({
      properties:
        this.languageIn.length > 0
          ? {
              ...super.schema.properties,
              languageIn: code`languageIn: ${arrayOf(...this.languageIn)}`,
            }
          : super.schema.properties,
      type: new SchemaObject.BuiltinType(this.reusables.snippets.LiteralSchema),
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
    return code`{ datatype: ${variables.value}.datatype.value, language: ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, value: ${variables.value}.value }`;
  }

  override valueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }
}
