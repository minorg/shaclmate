import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/TsFeature.js";
import type { TsObjectDeclarationType } from "../../enums/TsObjectDeclarationType.js";
import { IdentifierPrefixProperty as _IdentifierPrefixProperty } from "./_ObjectType/IdentifierPrefixProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { identifierTypeDeclarations } from "./_ObjectType/identifierTypeDeclarations.js";
import { ObjectType_classDeclaration } from "./_ObjectType/ObjectType_classDeclaration.js";
import { ObjectType_createFunctionDeclaration } from "./_ObjectType/ObjectType_createFunctionDeclaration.js";
import { ObjectType_equalsFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_equalsFunctionOrMethodDeclaration.js";
import { ObjectType_filterFunctionDeclaration } from "./_ObjectType/ObjectType_filterFunctionDeclaration.js";
import { ObjectType_filterTypeDeclaration } from "./_ObjectType/ObjectType_filterTypeDeclaration.js";
import { ObjectType_fromJsonFunctionDeclarations } from "./_ObjectType/ObjectType_fromJsonFunctionDeclarations.js";
import { ObjectType_fromRdfFunctionDeclaration } from "./_ObjectType/ObjectType_fromRdfFunctionDeclaration.js";
import { ObjectType_fromRdfTypeVariableStatement } from "./_ObjectType/ObjectType_fromRdfTypeVariableStatement.js";
import { ObjectType_graphqlTypeVariableStatement } from "./_ObjectType/ObjectType_graphqlTypeVariableStatement.js";
import { ObjectType_hashFunctionOrMethodDeclarations } from "./_ObjectType/ObjectType_hashFunctionOrMethodDeclarations.js";
import { ObjectType_interfaceDeclaration } from "./_ObjectType/ObjectType_interfaceDeclaration.js";
import { ObjectType_isTypeFunctionDeclaration } from "./_ObjectType/ObjectType_isTypeFunctionDeclaration.js";
import { ObjectType_jsonSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonSchemaFunctionDeclaration.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonUiSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonUiSchemaFunctionDeclaration.js";
import { ObjectType_jsonZodSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonZodSchemaFunctionDeclaration.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_propertiesFromRdfFunctionDeclaration } from "./_ObjectType/ObjectType_propertiesFromRdfFunctionDeclaration.js";
import { ObjectType_schemaVariableStatement } from "./_ObjectType/ObjectType_schemaVariableStatement.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { ObjectType_sparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_sparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlWherePatternsFunctionDeclarations.js";
import { ObjectType_toJsonFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_toJsonFunctionOrMethodDeclaration.js";
import { ObjectType_toRdfFunctionOrMethodDeclaration } from "./_ObjectType/ObjectType_toRdfFunctionOrMethodDeclaration.js";
import type { Property as _Property } from "./_ObjectType/Property.js";
import { ShaclProperty as _ShaclProperty } from "./_ObjectType/ShaclProperty.js";
import { TypeDiscriminantProperty as _TypeDiscriminantProperty } from "./_ObjectType/TypeDiscriminantProperty.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
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
  readonly staticModuleName: string;
  readonly synthetic: boolean;
  override readonly typeofs = NonEmptyList(["object" as const]);
  override readonly recursive: boolean;

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
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.name = name;
    this.recursive = recursive;
    this.staticModuleName = staticModuleName;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  get _discriminantProperty(): AbstractType.DiscriminantProperty {
    const discriminantProperty = this.properties.find(
      (property) => property instanceof ObjectType.TypeDiscriminantProperty,
    );
    invariant(discriminantProperty);
    return {
      name: discriminantProperty.name,
      ownValues: discriminantProperty.type.ownValues,
      descendantValues: discriminantProperty.type.descendantValues,
    };
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

      staticModuleDeclarations.push(
        ...ObjectType_graphqlTypeVariableStatement.call(this).toList(),
        ...identifierTypeDeclarations.call(this),
        ...ObjectType_jsonTypeAliasDeclaration.call(this).toList(),
        ObjectType_filterFunctionDeclaration.call(this),
        ObjectType_filterTypeDeclaration.call(this),
        ...ObjectType_fromJsonFunctionDeclarations.call(this),
        ...ObjectType_fromRdfFunctionDeclaration.call(this).toList(),
        ...ObjectType_fromRdfTypeVariableStatement.call(this).toList(),
        ObjectType_isTypeFunctionDeclaration.call(this),
        ...ObjectType_jsonSchemaFunctionDeclaration.call(this).toList(),
        ...ObjectType_jsonUiSchemaFunctionDeclaration.call(this).toList(),
        ...ObjectType_jsonZodSchemaFunctionDeclaration.call(this).toList(),
        ...ObjectType_propertiesFromRdfFunctionDeclaration.bind(
          this,
        )().toList(),
        ObjectType_schemaVariableStatement.call(this),
        ...ObjectType_sparqlConstructQueryFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_sparqlConstructTriplesFunctionDeclaration.bind(
          this,
        )().toList(),
        ...ObjectType_sparqlWherePatternsFunctionDeclaration.bind(
          this,
        )().toList(),
        ...(this.declarationType === "interface"
          ? ObjectType_toJsonFunctionOrMethodDeclaration.call(this).toList()
          : []),
        ...(this.declarationType === "interface"
          ? ObjectType_toRdfFunctionOrMethodDeclaration.call(this).toList()
          : []),
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
    return Maybe.of(this._discriminantProperty);
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
    const identifierProperty = this.properties.find(
      (property) => property.kind === "IdentifierProperty",
    );
    invariant(identifierProperty);
    return identifierProperty;
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
  override get sparqlConstructTriplesFunction(): Code {
    return code`(({ filter, ignoreRdfType, valueVariable, variablePrefix }: ${snippets.SparqlConstructTriplesFunctionParameters}<${this.filterType}, ${this.schemaType}>) => ${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ filter, focusIdentifier: valueVariable, ignoreRdfType, variablePrefix }))`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`(({ filter, ignoreRdfType, preferredLanguages, propertyPatterns, valueVariable, variablePrefix }: ${snippets.SparqlWherePatternsFunctionParameters}<${this.filterType}, ${this.schemaType}>) => (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter, focusIdentifier: valueVariable, ignoreRdfType, preferredLanguages, variablePrefix })))`;
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return code`${imports.Resource}${this.identifierType.kind === "IriType" ? code`<${imports.NamedNode}>` : ""}`;
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
    return code`${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractType["fromRdfExpression"]>[0]): Code {
    return code`${variables.resourceValues}.chain(values => values.chainMap(value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { context: ${variables.context}, ${variables.ignoreRdfType ? "ignoreRdfType: true, " : ""}objectSet: ${variables.objectSet}, preferredLanguages: ${variables.preferredLanguages} }))))`;
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
      code`${this.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override jsonZodSchema({
    context,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): Code {
    let expression = code`${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = code`${imports.z}.lazy((): ${imports.z}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
    }
    return expression;
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

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    switch (this.declarationType) {
      case "class":
        return code`[${variables.value}.${syntheticNamePrefix}toRdf({ graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
      case "interface":
        return code`[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
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
  export const TypeDiscriminantProperty = _TypeDiscriminantProperty;
  export type TypeDiscriminantProperty = _TypeDiscriminantProperty;
}
