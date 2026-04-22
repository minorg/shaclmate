import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/TsFeature.js";
import type { TsObjectDeclarationType } from "../../enums/TsObjectDeclarationType.js";
import { DiscriminantProperty as _DiscriminantProperty } from "./_ObjectType/DiscriminantProperty.js";
import { IdentifierPrefixProperty as _IdentifierPrefixProperty } from "./_ObjectType/IdentifierPrefixProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { identifierTypeDeclarations } from "./_ObjectType/identifierTypeDeclarations.js";
import { ObjectType_classDeclaration } from "./_ObjectType/ObjectType_classDeclaration.js";
import { ObjectType_createFunctionDeclaration } from "./_ObjectType/ObjectType_createFunctionDeclaration.js";
import { ObjectType_equalsFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_equalsFunctionOrMethodDeclaration.js";
import { ObjectType_filterFunctionDeclaration } from "./_ObjectType/ObjectType_filterFunctionDeclaration.js";
import { ObjectType_filterTypeDeclaration } from "./_ObjectType/ObjectType_filterTypeDeclaration.js";
import { ObjectType_focusSparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_focusSparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunctionDeclaration.js";
import { ObjectType_fromJsonFunctionDeclaration } from "./_ObjectType/ObjectType_fromJsonFunctionDeclaration.js";
import { ObjectType_fromRdfResourceFunctionDeclaration } from "./_ObjectType/ObjectType_fromRdfResourceFunctionDeclaration.js";
import { ObjectType_fromRdfResourceValuesFunctionDeclaration } from "./_ObjectType/ObjectType_fromRdfResourceValuesFunctionDeclaration.js";
import { ObjectType_fromRdfTypeVariableStatement } from "./_ObjectType/ObjectType_fromRdfTypeVariableStatement.js";
import { ObjectType_graphqlTypeVariableStatement } from "./_ObjectType/ObjectType_graphqlTypeVariableStatement.js";
import { ObjectType_hashFunctionOrMethodDeclarations } from "./_ObjectType/ObjectType_hashFunctionOrMethodDeclarations.js";
import { ObjectType_interfaceDeclaration } from "./_ObjectType/ObjectType_interfaceDeclaration.js";
import { ObjectType_isTypeFunctionDeclaration } from "./_ObjectType/ObjectType_isTypeFunctionDeclaration.js";
import { ObjectType_jsonParseFunctionDeclaration } from "./_ObjectType/ObjectType_jsonParseFunctionDeclaration.js";
import { ObjectType_jsonSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonSchemaFunctionDeclaration.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonUiSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonUiSchemaFunctionDeclaration.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_propertiesFromJsonFunctionDeclaration } from "./_ObjectType/ObjectType_propertiesFromJsonFunctionDeclaration.js";
import { ObjectType_propertiesFromRdfResourceFunctionDeclaration } from "./_ObjectType/ObjectType_propertiesFromRdfResourceFunctionDeclaration.js";
import { ObjectType_schemaVariableStatement } from "./_ObjectType/ObjectType_schemaVariableStatement.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { ObjectType_toJsonFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_toJsonFunctionOrMethodDeclaration.js";
import { ObjectType_toRdfResourceFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_toRdfResourceFunctionOrMethodDeclaration.js";
import { ObjectType_valueSparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_valueSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_valueSparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_valueSparqlWherePatternsFunctionDeclaration.js";
import type { Property as _Property } from "./_ObjectType/Property.js";
import { ShaclProperty as _ShaclProperty } from "./_ObjectType/ShaclProperty.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

export class ObjectType extends AbstractType {
  private readonly imports: readonly string[];

  protected readonly toRdfTypes: readonly NamedNode[];

  readonly abstract: boolean;
  readonly declarationType: TsObjectDeclarationType;
  readonly extern: boolean;
  readonly features: ReadonlySet<TsFeature>;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "ObjectType";
  override readonly name: string;
  override readonly recursive: boolean;
  readonly staticModuleName: string;
  readonly synthetic: boolean;
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    abstract,
    declarationType,
    extern,
    features,
    fromRdfType,
    identifierType,
    imports,
    lazyAncestorObjectTypes,
    lazyChildObjectTypes,
    lazyDescendantObjectTypes,
    lazyDiscriminantProperty,
    lazyIdentifierProperty,
    lazyParentObjectTypes,
    lazyProperties,
    name,
    recursive,
    staticModuleName,
    synthetic,
    toRdfTypes,
    ...superParameters
  }: {
    abstract: boolean;
    comment: Maybe<string>;
    declarationType: TsObjectDeclarationType;
    extern: boolean;
    features: ReadonlySet<TsFeature>;
    fromRdfType: Maybe<NamedNode>;
    identifierType: BlankNodeType | IdentifierType | IriType;
    imports: readonly string[];
    label: Maybe<string>;
    lazyAncestorObjectTypes: () => readonly ObjectType[];
    lazyChildObjectTypes: () => readonly ObjectType[];
    lazyDiscriminantProperty: (
      objectType: ObjectType,
    ) => ObjectType.DiscriminantProperty;
    lazyIdentifierProperty: (
      objectType: ObjectType,
    ) => ObjectType.IdentifierProperty;
    lazyDescendantObjectTypes: () => readonly ObjectType[];
    lazyParentObjectTypes: () => readonly ObjectType[];
    lazyProperties: (objectType: ObjectType) => readonly ObjectType.Property[];
    name: string;
    recursive: boolean;
    staticModuleName: string;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.abstract = abstract;
    this.declarationType = declarationType;
    this.extern = extern;
    this.features = features;
    this.fromRdfType = fromRdfType;
    this.identifierType = identifierType;
    this.imports = imports;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyAncestorObjectTypes = lazyAncestorObjectTypes;
    this.lazyChildObjectTypes = lazyChildObjectTypes;
    this.lazyDescendantObjectTypes = lazyDescendantObjectTypes;
    this.lazyDiscriminantProperty = lazyDiscriminantProperty;
    this.lazyIdentifierProperty = lazyIdentifierProperty;
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.name = name;
    this.recursive = recursive;
    this.staticModuleName = staticModuleName;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  get _discriminantProperty(): ObjectType.DiscriminantProperty {
    return this.lazyDiscriminantProperty(this);
  }

  @Memoize()
  get ancestorObjectTypes(): readonly ObjectType[] {
    return this.lazyAncestorObjectTypes();
  }

  @Memoize()
  get childObjectTypes(): readonly ObjectType[] {
    return this.lazyChildObjectTypes();
  }

  @Memoize()
  override get conversions(): readonly AbstractType.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object" && ${value} instanceof ${this.name}`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      },
    ];
  }

  override get declaration(): Maybe<Code> {
    const declarations: Code[] = [];

    for (const import_ of this.imports) {
      declarations.push(code`${import_}`);
    }

    if (!this.extern) {
      const staticModuleDeclarations: Code[] = [];

      switch (this.declarationType) {
        case "class": {
          declarations.push(ObjectType_classDeclaration.call(this));
          break;
        }
        case "interface": {
          declarations.push(ObjectType_interfaceDeclaration.call(this));
          staticModuleDeclarations.push(
            ...ObjectType_createFunctionDeclaration.call(this).toList(),
            ...ObjectType_equalsFunctionOrMethodDeclaration.bind(
              this,
            )().toList(),
            ...ObjectType_hashFunctionOrMethodDeclarations.call(this),
          );
          break;
        }
      }

      const jsonModuleDeclarations: Code[] = [
        ...ObjectType_jsonParseFunctionDeclaration.call(this).toList(),
        ...ObjectType_jsonSchemaFunctionDeclaration.call(this).toList(),
        ...ObjectType_jsonUiSchemaFunctionDeclaration.call(this).toList(),
      ];

      staticModuleDeclarations.push(
        ...ObjectType_graphqlTypeVariableStatement.call(this).toList(),
        ...identifierTypeDeclarations.call(this),
        ...ObjectType_jsonTypeAliasDeclaration.call(this).toList(),
        ...(jsonModuleDeclarations.length > 0
          ? [
              code`export namespace ${syntheticNamePrefix}Json { ${joinCode(jsonModuleDeclarations, { on: "\n\n" })} }`,
            ]
          : []),
        ObjectType_filterFunctionDeclaration.call(this),
        ObjectType_filterTypeDeclaration.call(this),
        ...ObjectType_focusSparqlConstructTriplesFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_focusSparqlWherePatternsFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_fromJsonFunctionDeclaration.call(this).toList(),
        ...ObjectType_fromRdfResourceFunctionDeclaration.call(this).toList(),
        ...ObjectType_fromRdfResourceValuesFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_fromRdfTypeVariableStatement.call(this).toList(),
        ObjectType_isTypeFunctionDeclaration.call(this),
        ...ObjectType_propertiesFromJsonFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_propertiesFromRdfResourceFunctionDeclaration.bind(
          this,
        )().toList(),
        ObjectType_schemaVariableStatement.call(this),
        ...ObjectType_sparqlConstructQueryFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(
          this,
        )().toList(),
        ...(this.declarationType === "interface"
          ? ObjectType_toJsonFunctionOrMethodDeclaration.call(this).toList()
          : []),
        ...(this.declarationType === "interface"
          ? ObjectType_toRdfResourceFunctionOrMethodDeclaration.call(
              this,
            ).toList()
          : []),
        ...ObjectType_valueSparqlConstructTriplesFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_valueSparqlWherePatternsFunctionDeclaration.bind(
          this,
        )().toList(),
      );

      if (staticModuleDeclarations.length > 0) {
        declarations.push(code`\
export namespace ${def(this.staticModuleName)} {
${joinCode(staticModuleDeclarations, { on: "\n\n" })}
}`);
      }
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  get descendantFromRdfTypeVariables(): readonly Code[] {
    return this.descendantObjectTypes.flatMap((descendantObjectType) =>
      descendantObjectType.fromRdfTypeVariable.toList(),
    );
  }

  @Memoize()
  get descendantFromRdfTypes(): readonly NamedNode[] {
    return this.descendantObjectTypes.flatMap((descendantObjectType) =>
      descendantObjectType.fromRdfType.toList(),
    );
  }

  @Memoize()
  get descendantObjectTypes(): readonly ObjectType[] {
    return this.lazyDescendantObjectTypes();
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    return Maybe.of({
      name: this._discriminantProperty.name,
      ownValues: this._discriminantProperty.type.ownValues,
      descendantValues: this._discriminantProperty.type.descendantValues,
    });
  }

  @Memoize()
  get discriminantValue(): string {
    return this.name;
  }

  @Memoize()
  override get equalsFunction(): Code {
    switch (this.declarationType) {
      case "class":
        return code`((left, right) => left.${syntheticNamePrefix}equals(right))`;
      case "interface":
        return code`${this.staticModuleName}.${syntheticNamePrefix}equals`;
      default:
        throw new RangeError(this.declarationType);
    }
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}Filter`;
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.fromRdfType.map(
      () => code`${this.staticModuleName}.${syntheticNamePrefix}fromRdfType`,
    );
  }

  @Memoize()
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this.staticModuleName}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierProperty(): ObjectType.IdentifierProperty {
    return this.lazyIdentifierProperty(this);
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return ObjectType_objectSetMethodNames.call(this);
  }

  @Memoize()
  get ownProperties(): readonly ObjectType.Property[] {
    if (this.parentObjectTypes.length === 0) {
      // Consider that a root of the object type hierarchy "owns" the identifier and type discriminant properties
      // for all of its subtypes in the hierarchy.
      // invariant(this.properties.length >= 2, this.name);
      return this.properties;
    }
    return this.ownShaclProperties;
  }

  @Memoize()
  get ownShaclProperties(): readonly ObjectType.ShaclProperty<Type>[] {
    return this.properties.filter(
      (property) => property.kind === "ShaclProperty",
    );
  }

  @Memoize()
  get parentObjectTypes(): readonly ObjectType[] {
    return this.lazyParentObjectTypes();
  }

  @Memoize()
  get properties(): readonly ObjectType.Property[] {
    const properties = this.lazyProperties(this);
    const propertyNames = new Set<string>();
    for (const property of properties) {
      if (propertyNames.has(property.name)) {
        throw new Error(`duplicate property '${property.name}'`);
      }
    }
    return properties;
  }

  @Memoize()
  override get schema(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}schema`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`typeof ${this.schema}`;
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return code`${imports.Resource}${this.identifierType.kind === "IriType" ? code`<${imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}valueSparqlConstructTriples`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}valueSparqlWherePatterns`;
  }

  @Memoize()
  protected get thisVariable(): Code {
    switch (this.declarationType) {
      case "class":
        return code`this`;
      case "interface":
        return code`_${camelCase(this.name)}`;
      default:
        throw new RangeError(this.declarationType);
    }
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues, ...options } = variables;
    return code`${this.staticModuleName}.${syntheticNamePrefix}fromRdfResourceValues(${resourceValues}, ${options})`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    switch (this.declarationType) {
      case "class":
        return [
          code`${variables.value}.${syntheticNamePrefix}hash(${variables.hasher});`,
        ];
      case "interface":
        return [
          code`${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
        ];
    }
  }

  override jsonSchema({
    context,
  }: Parameters<AbstractType["jsonSchema"]>[0]): Code {
    let expression = code`${this.staticModuleName}.${syntheticNamePrefix}Json.schema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = code`${imports.z}.lazy((): ${imports.z}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return new AbstractType.JsonType(
      code`${this.staticModuleName}.${syntheticNamePrefix}Json`,
    );
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.staticModuleName}.${syntheticNamePrefix}Json.uiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  newExpression({ parameters }: { parameters: Code }): Code {
    switch (this.declarationType) {
      case "class":
        return code`new ${this.name}(${parameters})`;
      case "interface":
        return code`${this.staticModuleName}.${syntheticNamePrefix}create(${parameters})`;
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    switch (this.declarationType) {
      case "class":
        return code`${variables.value}.${syntheticNamePrefix}toJson()`;
      case "interface":
        return code`${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    switch (this.declarationType) {
      case "class":
        return code`[${variables.value}.${syntheticNamePrefix}toRdfResource({ graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
      case "interface":
        return code`[${this.staticModuleName}.${syntheticNamePrefix}toRdfResource(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
    }
  }

  protected ensureAtMostOneSuperObjectType() {
    if (this.parentObjectTypes.length > 1) {
      throw new RangeError(
        `object type '${this.name}' has multiple super object types`,
      );
    }
  }

  private readonly lazyAncestorObjectTypes: () => readonly ObjectType[];

  private readonly lazyChildObjectTypes: () => readonly ObjectType[];

  private readonly lazyDescendantObjectTypes: () => readonly ObjectType[];

  private readonly lazyDiscriminantProperty: (
    objectType: ObjectType,
  ) => ObjectType.DiscriminantProperty;

  private readonly lazyIdentifierProperty: (
    objectType: ObjectType,
  ) => ObjectType.IdentifierProperty;

  private readonly lazyParentObjectTypes: () => readonly ObjectType[];

  private readonly lazyProperties: (
    objectType: ObjectType,
  ) => readonly ObjectType.Property[];
}

export namespace ObjectType {
  export const IdentifierPrefixProperty = _IdentifierPrefixProperty;
  export type IdentifierPrefixProperty = _IdentifierPrefixProperty;
  export const IdentifierProperty = _IdentifierProperty;
  export type IdentifierProperty = _IdentifierProperty;
  export type ObjectSetMethodNames = {
    readonly object: string;
    readonly objectCount: string;
    readonly objectIdentifiers: string;
    readonly objects: string;
  };
  export type Property = _Property;
  export const ShaclProperty = _ShaclProperty;
  export type ShaclProperty<TypeT extends Type> = _ShaclProperty<TypeT>;
  export const DiscriminantProperty = _DiscriminantProperty;
  export type DiscriminantProperty = _DiscriminantProperty;
}
