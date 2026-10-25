import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Callable } from "./Callable.js";
import type { CodeThunk } from "./CodeThunk.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
import { InlineCallable } from "./InlineCallable.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for AbstractCompoundType and StructType.
 */
export abstract class AbstractStructuredType extends AbstractType {
  @Memoize()
  override get equalsFunction(): Callable {
    return this._function({
      type: () => this.equalsFunctionType(),
      unannotatedExpression: () => this.equalsFunctionExpression(),
      unqualifiedName: "equals",
    });
  }

  @Memoize()
  override get filterFunction(): Callable {
    return this._function({
      type: () => this.filterFunctionType(),
      unannotatedExpression: this.filterFunctionExpression(),
      unqualifiedName: "filter",
    });
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefaultLazy(() => this.filterTypeExpression());
  }

  @Memoize()
  get fromJsonFunction(): Callable {
    return this._function({
      type: () => this.fromJsonFunctionType(),
      unannotatedExpression: () => this.fromJsonFunctionExpression(),
      unqualifiedName: "fromJson",
    });
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return this._function({
      type: () => this.fromRdfResourceValuesFunctionType(),
      unannotatedExpression: () =>
        this.fromRdfResourceValuesFunctionExpression(),
      unqualifiedName: "fromRdfResourceValues",
    });
  }

  @Memoize()
  override get hashFunction(): Callable {
    return this._function({
      type: () => this.hashFunctionType(),
      unannotatedExpression: () => this.hashFunctionExpression(),
      unqualifiedName: "hash",
    });
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefaultLazy(() => this.schemaTypeExpression());
  }

  @Memoize()
  get toJsonFunction(): Callable {
    return this._function({
      type: () => this.toJsonFunctionType(),
      unannotatedExpression: () => this.toJsonFunctionExpression(),
      unqualifiedName: "toJson",
    });
  }

  @Memoize()
  get toLoggableFunction(): Callable {
    return this._function({
      type: () => this.toLoggableFunctionType(),
      unannotatedExpression: () => this.toLoggableFunctionExpression(),
      unqualifiedName: "toLoggable",
    });
  }

  @Memoize()
  get toRdfResourceValuesFunction(): Callable {
    return this._function({
      type: () => this.toRdfResourceValuesFunctionType(),
      unannotatedExpression: () => this.toRdfResourceValuesFunctionExpression(),
      unqualifiedName: "toRdfResourceValues",
    });
  }

  @Memoize()
  get toStringFunction(): Callable {
    return this._function({
      type: () => this.toStringFunctionType(),
      unannotatedExpression: () => this.toStringFunctionExpression(),
      unqualifiedName: `${this.configuration.syntheticNamePrefix}toString`,
    });
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    return this._function({
      type: () => this.valueSparqlConstructTriplesType(),
      unannotatedExpression: () =>
        this.valueSparqlConstructTriplesFunctionExpression(),
      unqualifiedName: "valueSparqlConstructTriples",
    });
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    return this._function({
      type: () => this.valueSparqlWherePatternsFunctionType(),
      unannotatedExpression: () =>
        this.valueSparqlWherePatternsFunctionExpression(),
      unqualifiedName: "valueSparqlWherePatterns",
    });
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
    return code`${this.fromJsonFunction.unannotatedUsage}(${variables.value})`;
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
    return code`${this.toJsonFunction.unannotatedUsage}(${variables.value})`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractType["toLoggableExpression"]>[0]): Code {
    return code`${this.toLoggableFunction.unannotatedUsage}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.toRdfResourceValuesFunction.unannotatedUsage}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.toStringFunction.unannotatedUsage}(${variables.value})`;
  }

  protected _function({
    type,
    unannotatedExpression,
    unqualifiedName,
  }: {
    type: CodeThunk;
    unannotatedExpression: CodeThunk;
    unqualifiedName: string;
  }): Callable {
    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, unqualifiedName],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  protected abstract equalsFunctionExpression(): Code;

  protected equalsFunctionType(): Code {
    return code`${this.reusables.snippets.EqualsFunction}<${this.expression}>`;
  }

  protected abstract filterFunctionExpression(): Code;

  protected filterFunctionType(): Code {
    return code`${this.reusables.snippets.FilterFunction}<${this.filterType}, ${this.expression}>`;
  }

  protected abstract filterTypeExpression(): Code;

  protected abstract fromJsonFunctionExpression(): Code;

  protected fromJsonFunctionType(): Code {
    return code`${this.reusables.snippets.FromJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`;
  }

  protected abstract fromRdfResourceValuesFunctionExpression(): Code;

  protected fromRdfResourceValuesFunctionType(): Code {
    return code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>`;
  }

  protected abstract hashFunctionExpression(): Code;

  protected hashFunctionType(): Code {
    return code`${this.reusables.snippets.HashFunction}<${this.expression}>`;
  }

  protected abstract schemaTypeExpression(): Code;

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    function addFunctionDeclaration(function_: Callable) {
      invariant(function_ instanceof DeclaredCallable);
      staticModuleDeclarations[function_.unqualifiedName] =
        code`export ${function_.declaration}`;
    }

    if (this.configuration.features.has("Object.equals")) {
      addFunctionDeclaration(this.equalsFunction);
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${this.filterTypeExpression()};`;
      addFunctionDeclaration(this.filterFunction);
    }

    if (this.configuration.features.has("Object.hash")) {
      // Hash functions take a generic parameter and const declaration like this can't have type parameters.
      addFunctionDeclaration(this.hashFunction);
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      this.jsonType({ form: "expanded" }).declaration.ifJust(
        (jsonTypeDeclaration) => {
          staticModuleDeclarations["JSON"] = jsonTypeDeclaration;
        },
      );
    }

    if (this.configuration.features.has("Object.fromJson")) {
      addFunctionDeclaration(this.fromJsonFunction);
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      addFunctionDeclaration(this.fromRdfResourceValuesFunction);
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      addFunctionDeclaration(this.valueSparqlConstructTriplesFunction);
      addFunctionDeclaration(this.valueSparqlWherePatternsFunction);
    }

    if (this.configuration.features.has("Object.toJson")) {
      addFunctionDeclaration(this.toJsonFunction);
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      addFunctionDeclaration(this.toLoggableFunction);
    }

    if (this.configuration.features.has("Object.toRdf")) {
      addFunctionDeclaration(this.toRdfResourceValuesFunction);
    }

    if (this.configuration.features.has("Object.toString")) {
      addFunctionDeclaration(this.toStringFunction);
    }

    return staticModuleDeclarations;
  }

  protected abstract toJsonFunctionExpression(): Code;

  protected toJsonFunctionType(): Code {
    return code`${this.reusables.snippets.ToJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`;
  }

  protected abstract toLoggableFunctionExpression(): Code;

  protected toLoggableFunctionType() {
    return code`${this.reusables.snippets.ToLoggableFunction}<${this.expression}>`;
  }

  protected abstract toRdfResourceValuesFunctionExpression(): Code;

  protected toRdfResourceValuesFunctionType(): Code {
    return code`${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}, ${this.toRdfResourceValueTypesExpression}>`;
  }

  protected abstract toStringFunctionExpression(): Code;

  protected toStringFunctionType(): Code {
    return code`${this.reusables.snippets.ToStringFunction}<${this.expression}>`;
  }

  protected abstract valueSparqlConstructTriplesFunctionExpression(): Code;

  protected valueSparqlConstructTriplesType(): Code {
    return code`${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>`;
  }

  protected abstract valueSparqlWherePatternsFunctionExpression(): Code;

  protected valueSparqlWherePatternsFunctionType(): Code {
    return code`${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>`;
  }
}

export namespace AbstractStructuredType {
  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export namespace DiscriminantProperty {
    export type Value = AbstractType.DiscriminantProperty.Value;
  }
  export type GraphqlType = AbstractType.GraphqlType;
  export type JsonType = AbstractType.JsonType;
  export type JsType = AbstractType.JsType;
}
