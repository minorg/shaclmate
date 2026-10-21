import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for AbstractCompoundType and StructType.
 */
export abstract class AbstractStructuredType extends AbstractType {
  @Memoize()
  override get equalsFunction(): Code {
    return this.name
      .map((name) => code`${name}.equals`)
      .orDefaultLazy(() => this.equalsFunctionExpression());
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefaultLazy(() => this.filterFunctionExpression());
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefaultLazy(() => this.filterTypeExpression());
  }

  @Memoize()
  get fromJsonFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromJson`)
      .orDefaultLazy(() => this.fromJsonFunctionExpression());
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
      .orDefaultLazy(() => this.hashFunctionExpression());
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefaultLazy(() => this.schemaTypeExpression());
  }

  @Memoize()
  get toJsonFunction() {
    return this.name
      .map((name) => code`${name}.toJson`)
      .orDefaultLazy(() => this.toJsonFunctionExpression());
  }

  @Memoize()
  get toLoggableFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toLoggable`,
      )
      .orDefaultLazy(() => this.toLoggableFunctionExpression());
  }

  @Memoize()
  get toRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.toRdfResourceValues`)
      .orDefaultLazy(() => this.toRdfResourceValuesFunctionExpression());
  }

  @Memoize()
  get toStringFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toString`,
      )
      .orDefaultLazy(() => this.toStringFunctionExpression());
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlConstructTriples`)
      .orDefaultLazy(() =>
        this.valueSparqlConstructTriplesFunctionExpression(),
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefaultLazy(() => this.valueSparqlWherePatternsFunctionExpression());
  }

  @Memoize()
  protected get toRdfResourceValueTypesExpression(): Code {
    return joinCode(
      [...this.toRdfResourceValueTypes].map((toRdfResourceValueType) => {
        switch (toRdfResourceValueType) {
          case "BlankNode":
            return code`${this.reusables.imports.BlankNode}`;
          case "Literal":
            return code`${this.reusables.imports.Literal}`;
          case "NamedNode":
            return code`${this.reusables.imports.NamedNode}`;
          default:
            toRdfResourceValueType satisfies never;
            throw new Error();
        }
      }),
      { on: " | " },
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.fromJsonFunction}(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
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
        code`export const equals: ${this.reusables.snippets.EqualsFunction}<${this.expression}> = ${this.equalsFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${this.filterTypeExpression()};`;
      staticModuleDeclarations["filter"] =
        code`export const filter: (filter: ${this.filterType}, value: ${this.expression}) => boolean = ${this.filterFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      // Hash functions take a generic parameter and const declaration like this can't have type parameters.
      staticModuleDeclarations["hash"] =
        code`export const hash: ${this.reusables.snippets.HashFunction}<${this.expression}> = ${this.hashFunctionExpression()};`;
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
        code`export const fromJson: (json: ${this.jsonType({ form: "expanded" }).expression}) => ${this.reusables.imports.Either}<Error, ${this.expression}> = ${this.fromJsonFunctionExpression()};`;
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
        code`export const toJson: ${this.reusables.snippets.ToJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}> = ${this.toJsonFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toLoggable`] =
        code`export const ${syntheticNamePrefix}toLoggable: ${this.reusables.snippets.ToLoggableFunction}<${this.expression}> = ${this.toLoggableFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues: ${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}, ${this.toRdfResourceValueTypesExpression}> = ${this.toRdfResourceValuesFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString: ${this.reusables.snippets.ToStringFunction}<${this.expression}> = ${this.toStringFunctionExpression()};`;
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
