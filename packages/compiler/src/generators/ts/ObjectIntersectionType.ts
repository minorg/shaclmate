import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectIntersectionType__fromRdfResourceFunction } from "./_ObjectIntersectionType/ObjectIntersectionType__fromRdfResourceFunction.js";
import { ObjectIntersectionType__toRdfResourceFunction } from "./_ObjectIntersectionType/ObjectIntersectionType__toRdfResourceFunction.js";
import { ObjectIntersectionType_createFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_createFunction.js";
import { ObjectIntersectionType_createFunctionParameters } from "./_ObjectIntersectionType/ObjectIntersectionType_createFunctionParameters.js";
import { ObjectIntersectionType_createUnsafeFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_createUnsafeFunction.js";
import { ObjectIntersectionType_focusSparqlConstructTriplesFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_focusSparqlConstructTriplesFunction.js";
import { ObjectIntersectionType_focusSparqlWherePatternsFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_focusSparqlWherePatternsFunction.js";
import {
  ObjectIntersectionType_fromJsonObjectFunctionExpression,
  ObjectIntersectionType_fromJsonObjectFunctionType,
} from "./_ObjectIntersectionType/ObjectIntersectionType_fromJsonObjectFunction.js";
import { ObjectIntersectionType_fromRdfResourceFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_fromRdfResourceFunction.js";
import {
  ObjectIntersectionType_fromRdfResourceValuesFunctionExpression,
  ObjectIntersectionType_fromRdfResourceValuesFunctionType,
} from "./_ObjectIntersectionType/ObjectIntersectionType_fromRdfResourceValuesFunction.js";
import { ObjectIntersectionType_toJsonObjectFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_toJsonObjectFunction.js";
import { ObjectIntersectionType_toRdfResourceFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_toRdfResourceFunction.js";
import { ObjectIntersectionType_toRdfResourceValuesFunctionExpression } from "./_ObjectIntersectionType/ObjectIntersectionType_toRdfResourceValuesFunction.js";
import { ObjectIntersectionType_typeGuardFunction } from "./_ObjectIntersectionType/ObjectIntersectionType_typeGuardFunction.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunction } from "./_ObjectType/ObjectType_sparqlConstructQueryFunction.js";
import { ObjectType_sparqlConstructQueryStringFunction } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunction.js";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Callable } from "./Callable.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { ObjectType } from "./ObjectType.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

export class ObjectIntersectionType extends AbstractIntersectionType<ObjectType> {
  protected override fromJsonObjectFunctionExpression =
    ObjectIntersectionType_fromJsonObjectFunctionExpression;
  protected override fromJsonObjectFunctionType =
    ObjectIntersectionType_fromJsonObjectFunctionType;
  protected override fromRdfResourceValuesFunctionExpression =
    ObjectIntersectionType_fromRdfResourceValuesFunctionExpression;
  protected override fromRdfResourceValuesFunctionType =
    ObjectIntersectionType_fromRdfResourceValuesFunctionType;
  protected override toJsonObjectFunctionExpression =
    ObjectIntersectionType_toJsonObjectFunctionExpression;
  protected override toRdfResourceValuesFunctionExpression =
    ObjectIntersectionType_toRdfResourceValuesFunctionExpression;

  readonly discriminatedType: Maybe<AbstractIntersectionType.DiscriminatedType>;
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "ObjectIntersection";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & ConstructorParameters<typeof AbstractIntersectionType<ObjectType>>[0]) {
    super(superParameters);
    this.discriminatedType = this.name.map((name) => ({
      discriminantProperty: {
        name: this.configuration.objectDiscriminantProperty.name,
        values: [name],
      },
      expression: code`${name}.Discriminated`,
    }));
    this.identifierType = identifierType;
  }

  @Memoize()
  get _fromRdfResourceFunction(): Callable {
    return ObjectIntersectionType__fromRdfResourceFunction.call(this);
  }

  @Memoize()
  get _toRdfResourceFunction(): Callable {
    return ObjectIntersectionType__toRdfResourceFunction.call(this);
  }

  @Memoize()
  get createFunction(): Callable {
    return ObjectIntersectionType_createFunction.call(this);
  }

  @Memoize()
  get createFunctionParameters(): ObjectType.CreateFunctionParameters {
    return ObjectIntersectionType_createFunctionParameters.call(this);
  }

  @Memoize()
  get focusSparqlConstructTriplesFunction(): Callable {
    return ObjectIntersectionType_focusSparqlConstructTriplesFunction.call(
      this,
    );
  }

  @Memoize()
  get focusSparqlWherePatternsFunction(): Callable {
    return ObjectIntersectionType_focusSparqlWherePatternsFunction.call(this);
  }

  @Memoize()
  get fromRdfResourceFunction(): Callable {
    return ObjectIntersectionType_fromRdfResourceFunction.call(this);
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return this.name.map((name) => code`${name}.Identifier`).unsafeCoerce();
  }

  @Memoize()
  override get jsonObjectType(): AbstractIntersectionType<ObjectType>["jsonObjectType"] {
    return this.jsonTypeFactory.createJsonIntersectionType(
      this.members.map((member) => member.type.jsonObjectType),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }

  get jsonValueType(): AbstractIntersectionType<ObjectType>["jsonValueType"] {
    return this.jsonObjectType;
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return ObjectType_objectSetMethodNames.call({
      name: this.name.unsafeCoerce(),
      configuration: this.configuration,
    });
  }

  @Memoize()
  get sparqlConstructQueryFunction(): Callable {
    return ObjectType_sparqlConstructQueryFunction.call({
      configuration: this.configuration,
      filterType: this.filterType,
      _function: this._function.bind(this),
      focusSparqlConstructTriplesFunction:
        this.focusSparqlConstructTriplesFunction,
      focusSparqlWherePatternsFunction: this.focusSparqlWherePatternsFunction,
      name: this.name,
      reusables: this.reusables,
    });
  }

  @Memoize()
  get sparqlConstructQueryStringFunction(): Callable {
    return ObjectType_sparqlConstructQueryStringFunction.call({
      configuration: this.configuration,
      filterType: this.filterType,
      _function: this._function.bind(this),
      sparqlConstructQueryFunction: this.sparqlConstructQueryFunction,
      reusables: this.reusables,
    });
  }

  @Memoize()
  get toRdfResourceFunction(): Callable {
    return ObjectIntersectionType_toRdfResourceFunction.call(this);
  }

  @Memoize()
  get typeGuardFunction(): Maybe<Callable> {
    return ObjectIntersectionType_typeGuardFunction.call(this);
  }

  @Memoize()
  protected get createUnsafeFunction(): Callable {
    return ObjectIntersectionType_createUnsafeFunction.call(this);
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
      ...ObjectType_identifierTypeDeclarations.call(this),
    };

    function addFunctionDeclaration(function_: Callable) {
      invariant(function_ instanceof DeclaredCallable);
      staticModuleDeclarations[function_.unqualifiedName] =
        code`export ${function_.declaration}`;
    }

    if (this.configuration.features.has("Object.create")) {
      staticModuleDeclarations["CreateParameters"] =
        code`export type CreateParameters<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}> = ${this.createFunctionParameters.type.inlineExpression};`;
      addFunctionDeclaration(this.createFunction);
      addFunctionDeclaration(this.createUnsafeFunction);
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      addFunctionDeclaration(this._fromRdfResourceFunction);
      addFunctionDeclaration(this.fromRdfResourceFunction);
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      addFunctionDeclaration(this.focusSparqlConstructTriplesFunction);
      addFunctionDeclaration(this.focusSparqlWherePatternsFunction);
      addFunctionDeclaration(this.sparqlConstructQueryFunction);
      addFunctionDeclaration(this.sparqlConstructQueryStringFunction);
    }

    if (this.configuration.features.has("Object.toRdf")) {
      addFunctionDeclaration(this._toRdfResourceFunction);
      addFunctionDeclaration(this.toRdfResourceFunction);
    }

    if (this.configuration.features.has("Object.type")) {
      this.discriminatedType.ifJust(({ discriminantProperty }) => {
        staticModuleDeclarations["Discriminated"] =
          code`export type Discriminated = ${name} & { readonly ${discriminantProperty.name}: ${literalOf(discriminantProperty.values[0])} };`;
      });
      this.typeGuardFunction.ifJust(addFunctionDeclaration);
    }

    return staticModuleDeclarations;
  }
}
