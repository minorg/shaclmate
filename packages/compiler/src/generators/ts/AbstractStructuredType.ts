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
      .orDefaultLazy(
        () =>
          code`((${this.equalsFunctionExpression()}) satisfies ${this.equalsFunctionTypeExpression})`,
      );
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefaultLazy(
        () =>
          code`((${this.filterFunctionExpression()}) satisfies ${this.filterFunctionTypeExpression})`,
      );
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
      .orDefaultLazy(
        () =>
          code`((${this.fromJsonFunctionExpression()}) satisfies ${this.fromJsonFunctionTypeExpression})`,
      );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefaultLazy(
        () =>
          code`((${this.fromRdfResourceValuesFunctionExpression()}) satisfies ${this.fromRdfResourceValuesFunctionTypeExpression})`,
      );
  }

  @Memoize()
  override get hashFunction(): Code {
    return this.name
      .map((name) => code`${name}.hash`)
      .orDefaultLazy(
        () =>
          code`((${this.hashFunctionExpression()}) satisfies ${this.hashFunctionTypeExpression})`,
      );
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
      .orDefaultLazy(
        () =>
          code`((${this.toJsonFunctionExpression()}) satisfies ${this.toJsonFunctionTypeExpression})`,
      );
  }

  @Memoize()
  get toLoggableFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toLoggable`,
      )
      .orDefaultLazy(
        () =>
          code`(${this.toLoggableFunctionExpression()}) satisfies ${this.toLoggableFunctionTypeExpression})`,
      );
  }

  @Memoize()
  get toRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.toRdfResourceValues`)
      .orDefaultLazy(
        () =>
          code`((${this.toRdfResourceValuesFunctionExpression()}) satisfies ${this.toRdfResourceValuesFunctionTypeExpression})`,
      );
  }

  @Memoize()
  get toStringFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toString`,
      )
      .orDefaultLazy(
        () =>
          code`((${this.toStringFunctionExpression()}) satisfies ${this.toStringFunctionTypeExpression})`,
      );
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlConstructTriples`)
      .orDefaultLazy(
        () =>
          code`((${this.valueSparqlConstructTriplesFunctionExpression()}) satisfies ${this.valueSparqlConstructTriplesFunctionTypeExpression})`,
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefaultLazy(
        () =>
          code`((${this.valueSparqlWherePatternsFunctionExpression()}) satisfies ${this.valueSparqlWherePatternsFunctionTypeExpression})`,
      );
  }

  @Memoize()
  protected get equalsFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.EqualsFunction}<${this.expression}>`;
  }

  @Memoize()
  protected get filterFunctionTypeExpression(): Code {
    return code`((filter: ${this.filterType}, value: ${this.expression}) => boolean)`;
  }

  @Memoize()
  protected get fromJsonFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.FromJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`;
  }

  @Memoize()
  protected get fromRdfResourceValuesFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>`;
  }

  @Memoize()
  protected get hashFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.HashFunction}<${this.expression}>`;
  }

  @Memoize()
  protected get toJsonFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ToJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`;
  }

  @Memoize()
  protected get toLoggableFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ToLoggableFunction}<${this.expression}>`;
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

  @Memoize()
  protected get toRdfResourceValuesFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}, ${this.toRdfResourceValueTypesExpression}>`;
  }

  @Memoize()
  protected get toStringFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ToStringFunction}<${this.expression}>`;
  }

  @Memoize()
  protected get valueSparqlConstructTriplesFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>`;
  }

  @Memoize()
  protected get valueSparqlWherePatternsFunctionTypeExpression(): Code {
    return code`${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>`;
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
        code`export const equals: ${this.equalsFunctionTypeExpression} = ${this.equalsFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${this.filterTypeExpression()};`;
      staticModuleDeclarations["filter"] =
        code`export const filter: ${this.filterFunctionTypeExpression} = ${this.filterFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      // Hash functions take a generic parameter and const declaration like this can't have type parameters.
      staticModuleDeclarations["hash"] =
        code`export const hash: ${this.hashFunctionTypeExpression} = ${this.hashFunctionExpression()};`;
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
        code`export const fromJson: ${this.fromJsonFunctionTypeExpression} = ${this.fromJsonFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations["fromRdfResourceValues"] =
        code`export const fromRdfResourceValues: ${this.fromRdfResourceValuesFunctionTypeExpression} = ${this.fromRdfResourceValuesFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["valueSparqlConstructTriples"] =
        code`export const valueSparqlConstructTriples: ${this.valueSparqlConstructTriplesFunctionTypeExpression} = ${this.valueSparqlConstructTriplesFunctionExpression()};`;

      staticModuleDeclarations["valueSparqlWherePatterns"] =
        code`export const valueSparqlWherePatterns: ${this.valueSparqlWherePatternsFunctionTypeExpression} = ${this.valueSparqlWherePatternsFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations["toJson"] =
        code`export const toJson: ${this.toJsonFunctionTypeExpression} = ${this.toJsonFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toLoggable`] =
        code`export const ${syntheticNamePrefix}toLoggable: ${this.toLoggableFunctionTypeExpression} = ${this.toLoggableFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues: ${this.toRdfResourceValuesFunctionTypeExpression} = ${this.toRdfResourceValuesFunctionExpression()};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString: ${this.toStringFunctionTypeExpression} = ${this.toStringFunctionExpression()};`;
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
