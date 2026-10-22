import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Callable } from "./Callable.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
import { InlineCallable } from "./InlineCallable.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for AbstractCompoundType and StructType.
 */
export abstract class AbstractStructuredType extends AbstractType {
  @Memoize()
  override get equalsFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.EqualsFunction}<${this.expression}>`,
    };
    const unannotatedExpression = () => this.equalsFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "equals"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get filterFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.FilterFunction}<${this.filterType}, ${this.expression}>`,
    };
    const unannotatedExpression = () => this.filterFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "filter"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefaultLazy(() => this.filterTypeExpression());
  }

  @Memoize()
  get fromJsonFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.FromJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`,
    };
    const unannotatedExpression = () => this.fromJsonFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "fromJson"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>`,
    };
    const unannotatedExpression = () =>
      this.fromRdfResourceValuesFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "fromRdfResourceValues"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get hashFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.HashFunction}<${this.expression}>`,
    };
    const unannotatedExpression = () => this.hashFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "hash"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefaultLazy(() => this.schemaTypeExpression());
  }

  @Memoize()
  get toJsonFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ToJsonFunction}<${this.expression}, ${this.jsonType({ form: "expanded" }).expression}>`,
    };
    const unannotatedExpression = () => this.toJsonFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "toJson"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  get toLoggableFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ToLoggableFunction}<${this.expression}>`,
    };
    const unannotatedExpression = () => this.toLoggableFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "toLoggable"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  get toRdfResourceValuesFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}, ${this.toRdfResourceValueTypesExpression}>`,
    };
    const unannotatedExpression = () =>
      this.toRdfResourceValuesFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "toRdfResourceValues"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  get toStringFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ToStringFunction}<${this.expression}>`,
    };
    const unannotatedExpression = () => this.toStringFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [
              name,
              `${this.configuration.syntheticNamePrefix}toString`,
            ],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>`,
    };
    const unannotatedExpression = () =>
      this.valueSparqlConstructTriplesFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "valueSparqlConstructTriples"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    const type = {
      expression: code`${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>`,
    };
    const unannotatedExpression = () =>
      this.valueSparqlWherePatternsFunctionExpression();

    return this.name
      .map<Callable>(
        (name) =>
          new DeclaredCallable({
            qualifiedName: [name, "valueSparqlWherePatterns"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new InlineCallable(unannotatedExpression, { type }));
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

  protected abstract toLoggableFunctionExpression(): Code;

  protected abstract toRdfResourceValuesFunctionExpression(): Code;

  protected abstract toStringFunctionExpression(): Code;

  protected abstract valueSparqlConstructTriplesFunctionExpression(): Code;

  protected abstract valueSparqlWherePatternsFunctionExpression(): Code;
}
