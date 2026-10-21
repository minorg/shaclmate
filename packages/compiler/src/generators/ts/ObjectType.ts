import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectType_createFunctionExpression } from "./_ObjectType/ObjectType_createFunctionExpression.js";
import { ObjectType_DiscriminantProperty } from "./_ObjectType/ObjectType_DiscriminantProperty.js";
import { ObjectType_equalsFunctionExpression } from "./_ObjectType/ObjectType_equalsFunctionExpression.js";
import { ObjectType_filterFunctionExpression } from "./_ObjectType/ObjectType_filterFunctionExpression.js";
import { ObjectType_filterTypeExpression } from "./_ObjectType/ObjectType_filterTypeExpression.js";
import { ObjectType_focusSparqlConstructTriplesFunctionExpression } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunctionExpression.js";
import { ObjectType_focusSparqlWherePatternsFunctionExpression } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunctionExpression.js";
import { ObjectType_fromJsonFunctionExpression } from "./_ObjectType/ObjectType_fromJsonFunctionExpression.js";
import { ObjectType_fromRdfResourceFunctionExpression } from "./_ObjectType/ObjectType_fromRdfResourceFunctionExpression.js";
import { ObjectType_fromRdfResourceValuesFunctionExpression } from "./_ObjectType/ObjectType_fromRdfResourceValuesFunctionExpression.js";
import { ObjectType_graphqlTypeExpression } from "./_ObjectType/ObjectType_graphqlTypeExpression.js";
import { ObjectType_hashFunctionExpression } from "./_ObjectType/ObjectType_hashFunctionExpression.js";
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
import { ObjectType_toJsonFunctionExpression } from "./_ObjectType/ObjectType_toJsonFunctionExpression.js";
import { ObjectType_toLoggableFunctionExpression } from "./_ObjectType/ObjectType_toLoggableFunctionExpression.js";
import { ObjectType_toRdfResourceFunctionExpression } from "./_ObjectType/ObjectType_toRdfResourceFunctionExpression.js";
import { ObjectType_toRdfResourceValuesFunctionExpression } from "./_ObjectType/ObjectType_toRdfResourceValuesFunctionExpression.js";
import { ObjectType_toStringFunctionExpression } from "./_ObjectType/ObjectType_toStringFunctionExpression.js";
import { ObjectType_toStringRecordFunctionExpression } from "./_ObjectType/ObjectType_toStringRecordFunctionExpression.js";
import { ObjectType_typeGuardFunctionExpression } from "./_ObjectType/ObjectType_typeGuardFunctionExpression.js";
import { ObjectType_valueSparqlConstructTriplesFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlConstructTriplesFunctionExpression.js";
import { ObjectType_valueSparqlWherePatternsFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlWherePatternsFunctionExpression.js";
import { AbstractStructuredType } from "./AbstractStructuredType.js";
import { AbstractType } from "./AbstractType.js";
import { AnonymousFunction } from "./AnonymousFunction.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import { codeEquals } from "./codeEquals.js";
import { DeclaredFunction } from "./DeclaredFunction.js";
import type { FunctionLike } from "./FunctionLike.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class ObjectType extends AbstractStructuredType {
  private readonly rdfTypeProperty: Maybe<ObjectType.RdfTypeProperty>;

  protected override equalsFunctionExpression =
    ObjectType_equalsFunctionExpression;
  protected override filterFunctionExpression =
    ObjectType_filterFunctionExpression;
  protected override filterTypeExpression = ObjectType_filterTypeExpression;
  protected override fromJsonFunctionExpression =
    ObjectType_fromJsonFunctionExpression;
  protected override fromRdfResourceValuesFunctionExpression =
    ObjectType_fromRdfResourceValuesFunctionExpression;
  protected override hashFunctionExpression = ObjectType_hashFunctionExpression;
  protected override schemaTypeExpression = ObjectType_schemaTypeExpression;
  protected override toJsonFunctionExpression =
    ObjectType_toJsonFunctionExpression;
  protected override toLoggableFunctionExpression =
    ObjectType_toLoggableFunctionExpression;
  protected override toRdfResourceValuesFunctionExpression =
    ObjectType_toRdfResourceValuesFunctionExpression;
  protected override toStringFunctionExpression =
    ObjectType_toStringFunctionExpression;
  protected override valueSparqlConstructTriplesFunctionExpression =
    ObjectType_valueSparqlConstructTriplesFunctionExpression;
  protected override valueSparqlWherePatternsFunctionExpression =
    ObjectType_valueSparqlWherePatternsFunctionExpression;

  override readonly discriminantProperty: Maybe<ObjectType.DiscriminantProperty>;
  readonly extern: boolean;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierProperty: Maybe<ObjectType.IdentifierProperty>;
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Object";
  override readonly recursive: boolean;
  readonly synthetic: boolean;
  override readonly validationFunction: AbstractType["validationFunction"] =
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
  } & ConstructorParameters<typeof AbstractType>[0]) {
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
  override get conversionFunction(): Maybe<AbstractType.ConversionFunction> {
    if (this.name.isJust()) {
      return Maybe.empty();
    }

    const sourceTypePropertySignatures: Code[] = [];
    for (const property of this.properties) {
      property.constructorParameter.ifJust((propertyConstructorParameter) => {
        sourceTypePropertySignatures.push(
          propertyConstructorParameter.signature,
        );
      });
    }
    const sourceTypeExpression = code`{ ${joinCode(sourceTypePropertySignatures)} }`;
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    return Maybe.of({
      code: code`(<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(value: ${sourceTypeExpression}, ${syntheticNamePrefix}defaultNamespace?: ${syntheticNamePrefix}DefaultNamespaceT) => ${this.createFunction}({ ...value, ${syntheticNamePrefix}defaultNamespace }))`,
      sourceTypes: [
        {
          expression: sourceTypeExpression,
          jsType: {
            instanceof: "Object",
            typeof: "object",
          },
        },
      ],
    });
  }

  override get declaration(): Maybe<Code> {
    return !this.extern ? super.declaration : Maybe.empty();
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
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
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
  get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    return new Set([...this.identifierType.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    return code`${this.reusables.imports.Resource}${this.identifierType.kind === "Iri" ? code`<${this.reusables.imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  get toStringRecordFunction(): FunctionLike {
    const type = {
      expression: code`(${this.thisVariable}: ${this.expression}) => Record<string, string>`,
    };
    const unannotatedExpression =
      ObjectType_toStringRecordFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "toStringRecord"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  get typeGuardFunction(): Maybe<Code> {
    return ObjectType_typeGuardFunctionExpression.call(this).map((expression) =>
      this.name.map((name) => code`${name}.is${name}`).orDefault(expression),
    );
  }

  @Memoize()
  protected get constructorParameters(): {
    hasQuestionToken: boolean;
    signature: Code;
    type: {
      expression: Code;
    };
    variable: Code;
  } {
    let hasQuestionToken: boolean = true;
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    const propertySignatures: Code[] = [
      code`readonly ${syntheticNamePrefix}defaultNamespace?: ${syntheticNamePrefix}DefaultNamespaceT;`,
    ];
    for (const property of this.properties) {
      property.constructorParameter.ifJust((propertyConstructorParameter) => {
        hasQuestionToken =
          hasQuestionToken && propertyConstructorParameter.hasQuestionToken;
        propertySignatures.push(propertyConstructorParameter.signature);
      });
    }

    const typeExpression = code`{ ${joinCode(propertySignatures)} }`;

    return {
      hasQuestionToken,
      signature: code`parameters${hasQuestionToken ? "?" : ""}: ${typeExpression}`,
      type: {
        expression: typeExpression,
      },
      variable: code`parameters`,
    };
  }

  @Memoize()
  protected get createFunction(): FunctionLike {
    const type = {
      expression: code`<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.constructorParameters.signature}) => ${this.reusables.imports.Either}<Error, ${this.expression}>`,
    };
    const unannotatedExpression =
      ObjectType_createFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "create"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  protected get createUnsafeFunction(): FunctionLike {
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    const type = {
      expression: code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.constructorParameters.signature}) => ${this.expression}`,
    };
    const unannotatedExpression = code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.constructorParameters.signature}): ${this.expression} => create(${this.constructorParameters.variable}).unsafeCoerce()`;

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "createUnsafe"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  protected get fromRdfResourceFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets.FromRdfResourceFunction}<${this.expression}>`,
    };
    const unannotatedExpression = code`${this.reusables.snippets.wrap_FromRdfResourceFunction}(${this._fromRdfResourceFunction.usage});`;

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "fromRdfResource"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
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

  @Memoize()
  protected get toRdfResourceFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets.ToRdfResourceFunction}<${this.expression}, ${this.identifierTypeAlias}>`,
    };
    const unannotatedExpression = code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${this.identifierType.expression}, ${this.expression}>(${this._toRdfResourceFunction.usage})`;

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "toRdfResource"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  protected get toRdfTypesVariable(): Maybe<Code> {
    return this.rdfTypeProperty.map((rdfTypeProperty) =>
      this.schemaVariable
        .map(
          (schemaVariable) =>
            code`${schemaVariable}.properties.${rdfTypeProperty.name}.toRdfTypes`,
        )
        .orDefaultLazy(
          () =>
            code`${arrayOf(...rdfTypeProperty.toRdfTypes.map((toRdfType) => this.rdfjsTermExpression(toRdfType)))}`,
        ),
    );
  }

  @Memoize()
  private get _fromRdfResourceFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets._FromRdfResourceFunction}<${this.expression}>`,
    };
    const unannotatedExpression =
      ObjectType_fromRdfResourceFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "_fromRdfResource"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  private get _toRdfResourceFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets._ToRdfResourceFunction}<${this.identifierTypeAlias}, ${this.expression}>`,
    };
    const unannotatedExpression =
      ObjectType_toRdfResourceFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "_toRdfResourceFunction"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  private get focusSparqlConstructTriplesFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}>`,
    };
    const unannotatedExpression =
      ObjectType_focusSparqlConstructTriplesFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "focusSparqlConstructTriples"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  @Memoize()
  private get focusSparqlWherePatternsFunction(): FunctionLike {
    const type = {
      expression: code`${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}>`,
    };
    const unannotatedExpression =
      ObjectType_focusSparqlWherePatternsFunctionExpression.call(this);

    return this.name
      .map<FunctionLike>(
        (name) =>
          new DeclaredFunction({
            qualifiedName: [name, "focusSparqlWherePatterns"],
            type,
            unannotatedExpression,
          }),
      )
      .orDefault(new AnonymousFunction(unannotatedExpression, { type }));
  }

  override jsonType({
    discriminantProperty,
  }: Parameters<AbstractType["jsonType"]>[0]): AbstractType.JsonType {
    const jsonObjectTypeMembers = this.properties.flatMap((property) =>
      property.jsonObjectMember.toList(),
    );

    if (discriminantProperty) {
      const discriminantPropertyName = Object.keys(discriminantProperty)[0];
      invariant(discriminantPropertyName);
      const discriminantPropertyType =
        discriminantProperty[discriminantPropertyName].type;
      invariant(discriminantPropertyType);

      invariant(
        discriminantPropertyType.kind === "JsonNumber" ||
          discriminantPropertyType.kind === "JsonString",
      );
      const discriminantPropertyValue = discriminantPropertyType.in_[0];
      invariant(typeof discriminantPropertyValue !== "undefined");

      const thisDiscriminantProperty = this.discriminantProperty.extract();
      if (thisDiscriminantProperty) {
        if (
          discriminantPropertyName !== thisDiscriminantProperty.name ||
          discriminantPropertyValue !== thisDiscriminantProperty.value
        ) {
          throw new Error(
            `${this.shapeIdentifier}: overriding the discriminant property is unsupported`,
          );
        }
      } else {
        jsonObjectTypeMembers.unshift({
          description: Maybe.empty(),
          label: Maybe.empty(),
          name: discriminantPropertyName,
          optional: false,
          recursive: false,
          type: discriminantPropertyType,
          uiSchemaElement: Maybe.empty(),
        });
      }
    }

    return this.jsonTypeFactory.createJsonObjectType(jsonObjectTypeMembers, {
      name: this.name.map((name) => [name, "Json"]).extract(),
    });
  }

  override toJsonExpression({
    discriminantProperty,
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    if (discriminantProperty) {
      const discriminantPropertyName = Object.keys(discriminantProperty)[0];
      invariant(discriminantPropertyName);
      const thisDiscriminantProperty = this.discriminantProperty.extract();
      const discriminantPropertyValue =
        discriminantProperty[discriminantPropertyName];
      invariant(discriminantPropertyValue);
      if (thisDiscriminantProperty) {
        if (
          discriminantPropertyName !== thisDiscriminantProperty.name ||
          !codeEquals(
            discriminantPropertyValue,
            code`${literalOf(thisDiscriminantProperty.value)}`,
          )
        ) {
          throw new Error(
            `${this.shapeIdentifier}: overriding the discriminant property is unsupported`,
          );
        }
      }
    }

    return code`${this.toJsonFunction.usage}(${variables.value})`;
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    let staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    function addFunctionDeclaration(function_: FunctionLike) {
      invariant(function_ instanceof DeclaredFunction);
      staticModuleDeclarations[function_.unqualifiedName] =
        function_.declaration;
    }

    // create
    if (this.configuration.features.has("Object.create")) {
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
