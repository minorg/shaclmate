import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for AbstractCompoundType and StructType.
 */
export abstract class AbstractStructuredType extends AbstractType {
  @Memoize()
  override get equalsFunction(): Code {
    return this.name
      .map((name) => code`${name}.equals`)
      .orDefault(this.equalsFunctionExpression());
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(this.filterFunctionExpression());
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(this.filterTypeExpression());
  }

  @Memoize()
  get fromJsonFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromJson`)
      .orDefault(this.fromJsonFunctionExpression());
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefaultLazy(() => this.fromRdfResourceValuesFunctionExpression());
  }

  @Memoize()
  override get hashFunction(): Code {
    return this.name
      .map((name) => code`${name}.hash`)
      .orDefault(this.hashFunctionExpression());
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefault(this.schemaTypeExpression());
  }

  @Memoize()
  get toJsonFunction() {
    return this.name
      .map((name) => code`${name}.toJson`)
      .orDefault(this.toJsonFunctionExpression());
  }

  @Memoize()
  get toLoggableFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toLoggable`,
      )
      .orDefault(this.toLoggableFunctionExpression());
  }

  @Memoize()
  get toRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.toRdfResourceValues`)
      .orDefault(this.toRdfResourceValuesFunctionExpression());
  }

  @Memoize()
  get toStringFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toString`,
      )
      .orDefault(this.toStringFunctionExpression());
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlConstructTriples`)
      .orDefault(this.valueSparqlConstructTriplesFunctionExpression());
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(this.valueSparqlWherePatternsFunctionExpression());
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.fromJsonFunction}(${variables.value})`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.toJsonFunction}(${variables.value})`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractType["toLoggableExpression"]>[0]): Code {
    return code`${this.toLoggableFunction}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.toRdfResourceValuesFunction}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.toStringFunction}(${variables.value})`;
  }

  protected abstract equalsFunctionExpression(): Code;

  protected abstract filterFunctionExpression(): Code;

  protected abstract filterTypeExpression(): Code;

  protected abstract fromJsonFunctionExpression(): Code;

  protected abstract fromRdfResourceValuesFunctionExpression(): Code;

  protected abstract hashFunctionExpression(): Code;

  protected abstract schemaTypeExpression(): Code;

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    if (this.configuration.features.has("Object.equals")) {
      staticModuleDeclarations["equals"] =
        code`export const equals = ${this.equalsFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${this.filterTypeExpression()};`;
      staticModuleDeclarations["filter"] =
        code`export const filter = ${this.filterFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations["hash"] =
        code`export const hash = ${this.hashFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      this.jsonType({ form: "expanded" }).declaration.ifJust(
        (jsonTypeDeclaration) => {
          staticModuleDeclarations["JSON"] = jsonTypeDeclaration;
        },
      );
    }

    if (this.configuration.features.has("Object.fromJson")) {
      staticModuleDeclarations["fromJson"] =
        code`export const fromJson = ${this.fromJsonFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations["fromRdfResourceValues"] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${this.fromRdfResourceValuesFunctionExpression()};`;
    }
    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["valueSparqlConstructTriples"] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlConstructTriplesFunctionExpression()};`;

      staticModuleDeclarations["valueSparqlWherePatterns"] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlWherePatternsFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations["toJson"] =
        code`export const toJson = ${this.toJsonFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toLoggable`] =
        code`export const ${syntheticNamePrefix}toLoggable = ${this.toLoggableFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues = ${this.toRdfResourceValuesFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${this.toStringFunctionExpression()};`;
    }

    return staticModuleDeclarations;
  }

  protected abstract toJsonFunctionExpression(): Code;

  protected abstract toLoggableFunctionExpression(): Code;

  protected abstract toRdfResourceValuesFunctionExpression(): Code;

  protected abstract toStringFunctionExpression(): Code;

  protected abstract valueSparqlConstructTriplesFunctionExpression(): Code;

  protected abstract valueSparqlWherePatternsFunctionExpression(): Code;
}
