import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class StringType extends AbstractPrimitiveType<string> {
  private readonly languageIn: readonly string[];

  override readonly filterFunction =
    code`${this.reusables.snippets.filterString}`;
  override readonly filterType = code`${this.reusables.snippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLString}`,
    this.reusables,
  );
  override readonly hashFunction = code`${this.reusables.snippets.hashString}`;
  override readonly jsTypes = [
    {
      typeof: "string",
    },
  ] as const;
  override readonly kind = "String";
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.stringSparqlWherePatterns}`;

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
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.stringFromRdfResourceValues}<${this.expression}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.StringSchema}<${this.expression}>`;
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

  override jsonSchema(
    parameters: Parameters<AbstractPrimitiveType<string>["jsonSchema"]>[0],
  ): Code {
    if (this.decodedIn.length > 1) {
      return code`${this.reusables.imports.z}.enum(${arrayOf(...this.decodedIn)})`;
    }
    return super.jsonSchema(parameters);
  }

  override literalValueExpression(literal: Literal | string): Code {
    return code`${literalOf(typeof literal === "string" ? literal : literal.value)}`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.string(${variables.value}${!this.datatype.equals(xsd.string) ? `, ${this.rdfjsTermExpression(this.datatype)}` : ""})]`;
  }
}
