import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectType__fromRdfResourceFunction } from "./_ObjectType/ObjectType__fromRdfResourceFunction.js";
import { ObjectType__toRdfResourceFunction } from "./_ObjectType/ObjectType__toRdfResourceFunction.js";
import { ObjectType_conversionFunction } from "./_ObjectType/ObjectType_conversionFunction.js";
import { ObjectType_createFunction } from "./_ObjectType/ObjectType_createFunction.js";
import { ObjectType_createFunctionParameters } from "./_ObjectType/ObjectType_createFunctionParameters.js";
import { ObjectType_createUnsafeFunction } from "./_ObjectType/ObjectType_createUnsafeFunction.js";
import { ObjectType_DiscriminantProperty } from "./_ObjectType/ObjectType_DiscriminantProperty.js";
import {
  ObjectType_equalsFunctionExpression,
  ObjectType_equalsFunctionType,
} from "./_ObjectType/ObjectType_equalsFunction.js";
import {
  ObjectType_filterFunctionExpression,
  ObjectType_filterFunctionType,
} from "./_ObjectType/ObjectType_filterFunction.js";
import { ObjectType_filterTypeExpression } from "./_ObjectType/ObjectType_filterTypeExpression.js";
import { ObjectType_focusSparqlConstructTriplesFunction } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunction.js";
import { ObjectType_focusSparqlWherePatternsFunction } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunction.js";
import {
  ObjectType_fromExpandedJsonFunctionExpression,
  ObjectType_fromExpandedJsonFunctionType,
} from "./_ObjectType/ObjectType_fromExpandedJsonFunction.js";
import { ObjectType_fromRdfResourceFunction } from "./_ObjectType/ObjectType_fromRdfResourceFunction.js";
import {
  ObjectType_fromRdfResourceValuesFunctionExpression,
  ObjectType_fromRdfResourceValuesFunctionType,
} from "./_ObjectType/ObjectType_fromRdfResourceValuesFunction.js";
import { ObjectType_graphqlTypeExpression } from "./_ObjectType/ObjectType_graphqlType.js";
import {
  ObjectType_hashFunctionExpression,
  ObjectType_hashFunctionType,
} from "./_ObjectType/ObjectType_hashFunction.js";
import { ObjectType_IdentifierProperty } from "./_ObjectType/ObjectType_IdentifierProperty.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import type { ObjectType_Property } from "./_ObjectType/ObjectType_Property.js";
import { ObjectType_RdfTypeProperty } from "./_ObjectType/ObjectType_RdfTypeProperty.js";
import { ObjectType_ShaclProperty } from "./_ObjectType/ObjectType_ShaclProperty.js";
import { ObjectType_schemaExpression } from "./_ObjectType/ObjectType_schemaExpression.js";
import { ObjectType_schemaTypeExpression } from "./_ObjectType/ObjectType_schemaTypeExpression.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import {
  ObjectType_toExpandedJsonFunctionExpression,
  ObjectType_toExpandedJsonFunctionType,
} from "./_ObjectType/ObjectType_toExpandedJsonFunction.js";
import {
  ObjectType_toLoggableFunctionExpression,
  ObjectType_toLoggableFunctionType,
} from "./_ObjectType/ObjectType_toLoggableFunction.js";
import { ObjectType_toRdfResourceFunction } from "./_ObjectType/ObjectType_toRdfResourceFunction.js";
import {
  ObjectType_toRdfResourceValuesFunctionExpression,
  ObjectType_toRdfResourceValuesFunctionType,
} from "./_ObjectType/ObjectType_toRdfResourceValuesFunction.js";
import {
  ObjectType_toStringFunctionExpression,
  ObjectType_toStringFunctionType,
} from "./_ObjectType/ObjectType_toStringFunction.js";
import { ObjectType_toStringRecordFunction } from "./_ObjectType/ObjectType_toStringRecordFunction.js";
import { ObjectType_typeGuardFunctionExpression } from "./_ObjectType/ObjectType_typeGuardFunction.js";
import { ObjectType_valueSparqlConstructTriplesFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlConstructTriplesFunction.js";
import { ObjectType_valueSparqlWherePatternsFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlWherePatternsFunction.js";
import { AbstractStructuredType } from "./AbstractStructuredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { Callable } from "./Callable.js";
import { DeclaredCallable } from "./DeclaredCallable.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class ObjectType extends AbstractStructuredType {
  private readonly rdfTypeProperty: Maybe<ObjectType.RdfTypeProperty>;

  protected override equalsFunctionExpression =
    ObjectType_equalsFunctionExpression;
  protected override equalsFunctionType = ObjectType_equalsFunctionType;
  protected override filterFunctionExpression =
    ObjectType_filterFunctionExpression;
  protected override filterFunctionType = ObjectType_filterFunctionType;
  protected override filterTypeExpression = ObjectType_filterTypeExpression;
  protected override fromExpandedJsonFunctionExpression =
    ObjectType_fromExpandedJsonFunctionExpression;
  protected override fromExpandedJsonFunctionType =
    ObjectType_fromExpandedJsonFunctionType;
  protected override fromRdfResourceValuesFunctionExpression =
    ObjectType_fromRdfResourceValuesFunctionExpression;
  protected override fromRdfResourceValuesFunctionType =
    ObjectType_fromRdfResourceValuesFunctionType;
  protected override hashFunctionExpression = ObjectType_hashFunctionExpression;
  protected override hashFunctionType = ObjectType_hashFunctionType;
  protected override schemaTypeExpression = ObjectType_schemaTypeExpression;
  protected override toExpandedJsonFunctionExpression =
    ObjectType_toExpandedJsonFunctionExpression;
  protected override toExpandedJsonFunctionType =
    ObjectType_toExpandedJsonFunctionType;
  protected override toLoggableFunctionExpression =
    ObjectType_toLoggableFunctionExpression;
  protected override toLoggableFunctionType = ObjectType_toLoggableFunctionType;
  protected override toRdfResourceValuesFunctionExpression =
    ObjectType_toRdfResourceValuesFunctionExpression;
  protected override toRdfResourceValuesFunctionType =
    ObjectType_toRdfResourceValuesFunctionType;
  protected override toStringFunctionExpression =
    ObjectType_toStringFunctionExpression;
  protected override toStringFunctionType = ObjectType_toStringFunctionType;
  protected override valueSparqlConstructTriplesFunctionExpression =
    ObjectType_valueSparqlConstructTriplesFunctionExpression;
  protected override valueSparqlWherePatternsFunctionExpression =
    ObjectType_valueSparqlWherePatternsFunctionExpression;

  override readonly discriminantProperty: Maybe<ObjectType.DiscriminantProperty>;
  readonly extern: boolean;
  override readonly graphqlArgs: AbstractStructuredType["graphqlArgs"] =
    Maybe.empty();
  readonly identifierProperty: Maybe<ObjectType.IdentifierProperty>;
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Object";
  override readonly recursive: boolean;
  readonly synthetic: boolean;
  override readonly validationFunction: AbstractStructuredType["validationFunction"] =
    Maybe.empty();

  constructor({
    discriminantProperty,
    extern,
    identifierProperty,
    identifierType,
    lazyProperties,
    rdfTypeProperty,
    recursive,
    synthetic,
    ...superParameters
  }: {
    discriminantProperty: Maybe<ObjectType.DiscriminantProperty>;
    comment: Maybe<string>;
    extern: boolean;
    identifierProperty: Maybe<ObjectType.IdentifierProperty>;
    identifierType: BlankNodeType | IdentifierType | IriType;
    label: Maybe<string>;
    lazyProperties: (objectType: ObjectType) => readonly ObjectType.Property[];
    rdfTypeProperty: Maybe<ObjectType.RdfTypeProperty>;
    recursive: boolean;
    synthetic: boolean;
  } & ConstructorParameters<typeof AbstractStructuredType>[0]) {
    super(superParameters);
    this.discriminantProperty = discriminantProperty;
    this.extern = extern;
    this.identifierProperty = identifierProperty;
    this.identifierType = identifierType;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyProperties = lazyProperties;
    this.rdfTypeProperty = rdfTypeProperty;
    this.recursive = recursive;
    this.synthetic = synthetic;
  }

  @Memoize()
  get _fromRdfResourceFunction(): Callable {
    return ObjectType__fromRdfResourceFunction.call(this);
  }

  @Memoize()
  get _toRdfResourceFunction(): Callable {
    return ObjectType__toRdfResourceFunction.call(this);
  }

  get compactedJsonType(): AbstractStructuredType["expandedJsonType"] {
    return this.expandedJsonType;
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractStructuredType.ConversionFunction> {
    return ObjectType_conversionFunction.call(this);
  }

  @Memoize()
  get createFunction(): Callable {
    return ObjectType_createFunction.call(this);
  }

  @Memoize()
  get createFunctionParameters(): ObjectType.CreateFunctionParameters {
    return ObjectType_createFunctionParameters.call(this);
  }

  @Memoize()
  get createUnsafeFunction(): Callable {
    return ObjectType_createUnsafeFunction.call(this);
  }

  override get declaration(): Maybe<Code> {
    return !this.extern ? super.declaration : Maybe.empty();
  }

  /**
   * Expression of this type including the discriminant property, if available.
   */
  @Memoize()
  get discriminatedExpression(): Code {
    return this.name
      .map((name) => code`${name}.Discriminated`)
      .orDefault(this.inlineExpression);
  }

  @Memoize()
  override get expandedJsonType(): AbstractStructuredType["expandedJsonType"] {
    return this.jsonTypeFactory.createJsonObjectType(
      this.properties.flatMap((property) => property.jsonObjectMember.toList()),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
      },
    );
  }

  @Memoize()
  get focusSparqlConstructTriplesFunction(): Callable {
    return ObjectType_focusSparqlConstructTriplesFunction.call(this);
  }

  @Memoize()
  get focusSparqlWherePatternsFunction(): Callable {
    return ObjectType_focusSparqlWherePatternsFunction.call(this);
  }

  @Memoize()
  get fromRdfResourceFunction(): Callable {
    return ObjectType_fromRdfResourceFunction.call(this);
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.rdfTypeProperty.map((rdfTypeProperty) =>
      this.name
        .map(
          (name) =>
            code`${name}.schema.properties.${rdfTypeProperty.name}.fromRdfType`,
        )
        .orDefaultLazy(() =>
          this.rdfjsTermExpression(rdfTypeProperty.fromRdfType),
        ),
    );
  }

  @Memoize()
  get graphqlType(): AbstractStructuredType.GraphqlType {
    return new AbstractStructuredType.GraphqlType(
      this.name
        .map((name) => code`${name}.GraphQL`)
        .orDefaultLazy(() => ObjectType_graphqlTypeExpression.call(this)),
      this.reusables,
    );
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.name.unsafeCoerce()}.Identifier`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return ObjectType_objectSetMethodNames.call({
      name: this.name.unsafeCoerce(),
      configuration: this.configuration,
    });
  }

  @Memoize()
  get properties(): readonly ObjectType.Property[] {
    const properties = this.lazyProperties(this);
    invariant(
      properties.length > 0,
      `${this.name.extract()}: empty properties`,
    );
    return properties;
  }

  @Memoize()
  get referencesNamedType(): boolean {
    return (
      this.name.isJust() ||
      this.properties.some((property) => {
        switch (property.kind) {
          case "Identifier":
          case "Shacl":
            return property.type.referencesNamedType;
          default:
            return false;
        }
      })
    );
  }

  @Memoize()
  override get schemaExpression(): Code {
    return ObjectType_schemaExpression.call(this);
  }

  @Memoize()
  get schemaVariable(): Maybe<Code> {
    return this.name.map((name) => code`${name}.schema`);
  }

  @Memoize()
  get toRdfResourceFunction(): Callable {
    return ObjectType_toRdfResourceFunction.call(this);
  }

  @Memoize()
  get toRdfResourceValueTypes(): AbstractStructuredType["toRdfResourceValueTypes"] {
    return new Set([...this.identifierType.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    return code`${this.reusables.imports.Resource}${this.identifierType.kind === "Iri" ? code`<${this.reusables.imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  get toStringRecordFunction(): Callable {
    return ObjectType_toStringRecordFunction.call(this);
  }

  @Memoize()
  get typeGuardFunction(): Maybe<Code> {
    return ObjectType_typeGuardFunctionExpression.call(this).map((expression) =>
      this.name.map((name) => code`${name}.is${name}`).orDefault(expression),
    );
  }

  protected override get inlineExpression(): Code {
    return code`{ ${joinCode(
      this.properties.flatMap((property) => property.declaration.toList()),
      { on: "\n\n" },
    )} }`;
  }

  @Memoize()
  protected get thisVariable(): Code {
    return this.name
      .map((name) => code`_${camelCase(name)}`)
      .orDefault(code`_object`);
  }

  protected propertySubsetExpression(
    propertyFilter: (property: ObjectType.Property) => boolean,
  ): Code {
    return this.name
      .map((name) => {
        const declaredProperties: ObjectType.Property[] = [];
        const omitDeclaredProperties: ObjectType.Property[] = [];
        const pickDeclaredProperties: ObjectType.Property[] = [];
        for (const property of this.properties) {
          if (property.declaration.isNothing()) {
            continue;
          }
          declaredProperties.push(property);
          if (propertyFilter(property)) {
            pickDeclaredProperties.push(property);
          } else {
            omitDeclaredProperties.push(property);
          }
        }

        if (pickDeclaredProperties.length === 0) {
          return code`object`;
        }

        if (pickDeclaredProperties.length === declaredProperties.length) {
          return this.expression;
        }

        if (pickDeclaredProperties.length <= declaredProperties.length / 2) {
          const pickPropertyNames = pickDeclaredProperties.map(
            (property) => code`${literalOf(property.name)}`,
          );
          if (pickPropertyNames.length === 0) {
            return code`object`;
          }
          return code`Pick<${name}, ${joinCode(pickPropertyNames, {
            on: " | ",
          })}>`;
        } else {
          const omitPropertyNames = omitDeclaredProperties.flatMap(
            (property) => code`${literalOf(property.name)}`,
          );
          if (omitPropertyNames.length === 0) {
            return this.expression;
          }
          return code`Omit<${name}, ${joinCode(omitPropertyNames, {
            on: " | ",
          })}>`;
        }
      })
      .orDefaultLazy(() => {
        const propertyDeclarations = this.properties.flatMap((property) =>
          propertyFilter(property) ? property.declaration.toList() : [],
        );
        if (propertyDeclarations.length === 0) {
          return code`object`;
        }
        return code`{ ${joinCode(propertyDeclarations, { on: "\n\n" })} }`;
      });
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    let staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    function addFunctionDeclaration(function_: Callable) {
      invariant(function_ instanceof DeclaredCallable);
      staticModuleDeclarations[function_.unqualifiedName] =
        code`export ${function_.declaration}`;
    }

    // create
    if (this.configuration.features.has("Object.create")) {
      staticModuleDeclarations["CreateParameters"] =
        code`export type CreateParameters<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}> = ${this.createFunctionParameters.type.inlineExpression};`;
      addFunctionDeclaration(this.createFunction);
      addFunctionDeclaration(this.createUnsafeFunction);
    }

    // GraphQL
    if (this.configuration.features.has("GraphQL") && !this.synthetic) {
      staticModuleDeclarations["GraphQL"] =
        code`export const GraphQL = ${ObjectType_graphqlTypeExpression.call(this)};`;
    }

    // focusSparqlConstructTriples / focusSparqlWherePatterns
    if (this.configuration.features.has("Object.SPARQL")) {
      addFunctionDeclaration(this.focusSparqlConstructTriplesFunction);
      addFunctionDeclaration(this.focusSparqlWherePatternsFunction);
    }

    // fromRdfResource
    if (this.configuration.features.has("Object.fromRdf")) {
      addFunctionDeclaration(this._fromRdfResourceFunction);
      addFunctionDeclaration(this.fromRdfResourceFunction);
    }

    // Identifier
    if (this.configuration.features.has("Object.type")) {
      staticModuleDeclarations = {
        ...staticModuleDeclarations,
        ...ObjectType_identifierTypeDeclarations.call(this),
      };
      this.discriminantProperty.ifJust((discriminantProperty) => {
        staticModuleDeclarations["Discriminated"] =
          code`export type Discriminated = ${name} & { readonly ${discriminantProperty.name}: ${literalOf(discriminantProperty.value)} };`;
      });
    }

    // Type guard
    ObjectType_typeGuardFunctionExpression.call(this).ifJust(
      (typeGuardFunctionExpression) => {
        staticModuleDeclarations[`is${name}`] =
          code`export const is${name} = ${typeGuardFunctionExpression};`;
      },
    );

    // schema / Schema
    if (this.configuration.features.has("Object.schema")) {
      staticModuleDeclarations["schema"] =
        code`export const schema = ${ObjectType_schemaExpression.call(this)};`;
      staticModuleDeclarations["Schema"] =
        code`export type Schema = typeof schema;`;
    }

    // sparqlConstructQuery / sparqlConstructQueryString
    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["sparqlConstructQuery"] =
        ObjectType_sparqlConstructQueryFunctionDeclaration.call({
          name,
          configuration: this.configuration,
          filterType: this.filterType,
          reusables: this.reusables,
        });

      staticModuleDeclarations["sparqlConstructQueryString"] =
        ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
          name,
          configuration: this.configuration,
          filterType: this.filterType,
          reusables: this.reusables,
        });
    }

    // toRdfResource
    if (this.configuration.features.has("Object.toRdf")) {
      addFunctionDeclaration(this._toRdfResourceFunction);
      addFunctionDeclaration(this.toRdfResourceFunction);
    }

    // toStringRecord
    if (this.configuration.features.has("Object.toString")) {
      addFunctionDeclaration(this.toStringRecordFunction);
    }

    return staticModuleDeclarations;
  }

  private readonly lazyProperties: (
    namedObjectType: ObjectType,
  ) => readonly ObjectType.Property[];
}

export namespace ObjectType {
  export interface CreateFunctionParameters {
    readonly hasQuestionToken: boolean;
    readonly signature: Code;
    readonly type: {
      readonly inlineExpression: Code;
      readonly expression: Code;
    };
    readonly variable: Code;
  }

  export const IdentifierProperty = ObjectType_IdentifierProperty;
  export type IdentifierProperty = ObjectType_IdentifierProperty;
  export type ObjectSetMethodNames = {
    readonly object: string;
    readonly objectCount: string;
    readonly objectIdentifiers: string;
    readonly objects: string;
  };
  export type Property = ObjectType_Property;
  export const ShaclProperty = ObjectType_ShaclProperty;
  export type ShaclProperty<TypeT extends Type> =
    ObjectType_ShaclProperty<TypeT>;
  export const DiscriminantProperty = ObjectType_DiscriminantProperty;
  export type DiscriminantProperty = ObjectType_DiscriminantProperty;
  export const RdfTypeProperty = ObjectType_RdfTypeProperty;
  export type RdfTypeProperty = ObjectType_RdfTypeProperty;
}
