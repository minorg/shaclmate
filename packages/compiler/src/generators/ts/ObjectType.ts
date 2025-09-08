import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  type StatementStructures,
  StructureKind,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import * as _ObjectType from "./_ObjectType/index.js";

import type {
  IdentifierMintingStrategy,
  TsObjectDeclarationType,
} from "../../enums/index.js";
import { DeclaredType } from "./DeclaredType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class ObjectType extends DeclaredType {
  private readonly imports: readonly string[];

  protected readonly comment: Maybe<string>;
  protected readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  protected readonly label: Maybe<string>;
  protected readonly toRdfTypes: readonly NamedNode[];

  readonly abstract: boolean;
  readonly declarationType: TsObjectDeclarationType;
  readonly extern: boolean;
  readonly fromRdfType: Maybe<NamedNode>;
  readonly kind = "ObjectType";
  readonly staticModuleName: string;
  readonly typeof = "object";

  constructor({
    abstract,
    comment,
    declarationType,
    extern,
    fromRdfType,
    imports,
    identifierMintingStrategy,
    label,
    lazyAncestorObjectTypes,
    lazyChildObjectTypes,
    lazyDescendantObjectTypes,
    lazyParentObjectTypes,
    lazyProperties,
    staticModuleName,
    toRdfTypes,
    ...superParameters
  }: {
    abstract: boolean;
    comment: Maybe<string>;
    declarationType: TsObjectDeclarationType;
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    imports: readonly string[];
    label: Maybe<string>;
    lazyAncestorObjectTypes: () => readonly ObjectType[];
    lazyChildObjectTypes: () => readonly ObjectType[];
    lazyDescendantObjectTypes: () => readonly ObjectType[];
    lazyParentObjectTypes: () => readonly ObjectType[];
    lazyProperties: (objectType: ObjectType) => readonly ObjectType.Property[];
    staticModuleName: string;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof DeclaredType>[0]) {
    super(superParameters);
    this.abstract = abstract;
    this.comment = comment;
    this.declarationType = declarationType;
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.imports = imports;
    this.label = label;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyAncestorObjectTypes = lazyAncestorObjectTypes;
    this.lazyChildObjectTypes = lazyChildObjectTypes;
    this.lazyDescendantObjectTypes = lazyDescendantObjectTypes;
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.staticModuleName = staticModuleName;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  get _discriminatorProperty(): Type.DiscriminatorProperty {
    const discriminatorProperty = this.properties.find(
      (property) => property instanceof ObjectType.TypeDiscriminatorProperty,
    );
    invariant(discriminatorProperty);
    return {
      name: discriminatorProperty.name,
      ownValues: discriminatorProperty.type.ownValues,
      descendantValues: discriminatorProperty.type.descendantValues,
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
  override get conversions(): readonly Type.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          `typeof ${value} === "object" && ${value} instanceof ${this.name}`,
        sourceTypeName: this.name,
      },
    ];
  }

  get declarationImports(): readonly Import[] {
    if (this.extern) {
      return [];
    }
    const imports: Import[] = this.properties.flatMap(
      (property) => property.declarationImports,
    );
    if (this.features.has("graphql")) {
      imports.push(Import.GRAPHQL);
      imports.push(Import.GRAPHQL_SCALARS);
    }
    if (this.features.has("json")) {
      imports.push(Import.ZOD);
      imports.push(Import.ZOD_TO_JSON_SCHEMA);
    }
    if (this.features.has("rdf")) {
      imports.push(Import.PURIFY);
      imports.push(Import.RDFJS_RESOURCE);
    }
    if (this.features.has("sparql")) {
      imports.push(Import.SPARQLJS);
    }
    return imports;
  }

  get declarations() {
    const declarations: (
      | ClassDeclarationStructure
      | InterfaceDeclarationStructure
      | ModuleDeclarationStructure
    )[] = [
      ..._ObjectType.classDeclaration.bind(this)().toList(),
      ..._ObjectType.interfaceDeclaration.bind(this)().toList(),
    ];

    const staticModuleStatements: (StatementStructures | string)[] = [
      ..._ObjectType.createFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.equalsFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.fromRdfTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.graphqlTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.identifierTypeDeclarations.bind(this)(),
      ..._ObjectType.jsonTypeAliasDeclaration.bind(this)().toList(),
      ..._ObjectType.jsonFunctionDeclarations.bind(this)(),
      ..._ObjectType.hashFunctionDeclarations.bind(this)(),
      ..._ObjectType.rdfFunctionDeclarations.bind(this)(),
      ..._ObjectType.propertiesVariableStatement.bind(this)().toList(),
      ..._ObjectType.sparqlFunctionDeclarations.bind(this)(),
    ];

    if (staticModuleStatements.length > 0) {
      declarations.push({
        isExported: this.export,
        kind: StructureKind.Module,
        name: this.staticModuleName,
        statements: staticModuleStatements,
      });
    }

    return declarations;
  }

  @Memoize()
  get descendantObjectTypes(): readonly ObjectType[] {
    return this.lazyDescendantObjectTypes();
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of(this._discriminatorProperty);
  }

  @Memoize()
  get discriminatorValue(): string {
    return this.name;
  }

  @Memoize()
  override get equalsFunction(): string {
    switch (this.declarationType) {
      case "class":
        return `((left, right) => left.${syntheticNamePrefix}equals(right))`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}equals`;
      default:
        throw new RangeError(this.declarationType);
    }
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<string> {
    return this.fromRdfType.map(
      () => `${this.staticModuleName}.${syntheticNamePrefix}fromRdfType`,
    );
  }

  @Memoize()
  get graphqlName(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}GraphQL`;
  }

  @Memoize()
  get identifierProperty(): ObjectType.IdentifierProperty {
    const identifierProperty = this.properties.find(
      (property) => property instanceof ObjectType.IdentifierProperty,
    );
    invariant(identifierProperty);
    return identifierProperty;
  }

  @Memoize()
  get identifierType(): IdentifierType {
    return this.identifierProperty.type;
  }

  @Memoize()
  get identifierTypeAlias(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override get jsonName(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Json`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return _ObjectType.objectSetMethodNames.bind(this)();
  }

  @Memoize()
  get ownProperties(): readonly ObjectType.Property[] {
    if (this.parentObjectTypes.length === 0) {
      // Consider that a root of the object type hierarchy "owns" the identifier and type discriminator properties
      // for all of its subtypes in the hierarchy.
      invariant(this.properties.length >= 2, this.name);
      return this.properties;
    }
    return this.ownShaclProperties;
  }

  @Memoize()
  get ownShaclProperties(): readonly ObjectType.Property[] {
    return this.properties.filter(
      (property) => property instanceof _ObjectType.ShaclProperty,
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
  get toRdfjsResourceType(): string {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return `rdfjsResource.MutableResource${this.identifierType.isNamedNodeKind ? "<rdfjs.NamedNode>" : ""}`;
  }

  @Memoize()
  protected get thisVariable(): string {
    switch (this.declarationType) {
      case "class":
        return "this";
      case "interface":
        return `_${camelCase(this.name)}`;
      default:
        throw new RangeError(this.declarationType);
    }
  }

  override fromJsonExpression({
    variables,
  }: Parameters<DeclaredType["fromJsonExpression"]>[0]): string {
    // Assumes the JSON object has been recursively validated already.
    return `${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<DeclaredType["fromRdfExpression"]>[0]): string {
    return `${variables.resourceValues}.head().chain(value => value.toResource()).chain(_resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf({ ...${variables.context}, ${variables.ignoreRdfType ? "ignoreRdfType: true, " : ""}languageIn: ${variables.languageIn}, resource: _resource }))`;
  }

  override graphqlResolveExpression({
    variables,
  }: { variables: { value: string } }): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<DeclaredType["hashStatements"]>[0]): readonly string[] {
    switch (this.declarationType) {
      case "class":
        return [
          `${variables.value}.${syntheticNamePrefix}hash(${variables.hasher});`,
        ];
      case "interface":
        return [
          `${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
        ];
    }
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<DeclaredType["jsonUiSchemaElement"]>[0]): Maybe<string> {
    return Maybe.of(
      `${this.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override jsonZodSchema({
    context,
    variables,
  }: Parameters<DeclaredType["jsonZodSchema"]>[0]): ReturnType<
    DeclaredType["jsonZodSchema"]
  > {
    let expression = `${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = `${variables.zod}.lazy((): ${variables.zod}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
    }
    return expression;
  }

  override snippetDeclarations({
    recursionStack,
  }: Parameters<DeclaredType["snippetDeclarations"]>[0]): readonly string[] {
    if (recursionStack.some((type) => Object.is(type, this))) {
      return [];
    }

    const snippetDeclarations: string[] = [];
    if (this.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.EqualsResult);
    }
    if (this.features.has("rdf")) {
      snippetDeclarations.push(SnippetDeclarations.RdfVocabularies);
    }
    if (this.features.has("sparql") && this.fromRdfType.isJust()) {
      snippetDeclarations.push(SnippetDeclarations.sparqlInstancesOfPattern);
    }
    if (
      (this.features.has("json") || this.features.has("rdf")) &&
      this.parentObjectTypes.length > 0
    ) {
      snippetDeclarations.push(SnippetDeclarations.UnwrapR);
    }
    recursionStack.push(this);
    for (const property of this.ownProperties) {
      snippetDeclarations.push(
        ...property.snippetDeclarations({
          features: this.features,
          recursionStack,
        }),
      );
    }
    invariant(Object.is(recursionStack.pop(), this));
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<DeclaredType["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return [
          `...${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples(${objectInitializer(
            {
              ignoreRdfType: parameters.allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
              subject: parameters.variables.subject,
              variablePrefix: parameters.variables.variablePrefix,
            },
          )})`,
        ];
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<DeclaredType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlWherePatterns(parameters);
      case "subject":
        return [
          `...${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${objectInitializer(
            {
              ignoreRdfType: parameters.allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
              subject: parameters.variables.subject,
              variablePrefix: parameters.variables.variablePrefix,
            },
          )})`,
        ];
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<DeclaredType["toJsonExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `${variables.value}.${syntheticNamePrefix}toJson()`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<DeclaredType["toRdfExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `${variables.value}.${syntheticNamePrefix}toRdf({ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} })`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, { mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} })`;
    }
  }

  @Memoize()
  override useImports(): readonly Import[] {
    return this.imports;
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
  export const EagerShaclProperty = _ObjectType.EagerShaclProperty;
  export type EagerShaclProperty<TypeT extends Type = Type> =
    _ObjectType.EagerShaclProperty<TypeT>;
  export const IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export type IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export const IdentifierProperty = _ObjectType.IdentifierProperty;
  export type IdentifierProperty = _ObjectType.IdentifierProperty;
  export const LazyShaclProperty = _ObjectType.LazyShaclProperty;
  export type LazyShaclProperty<
    IdentifierTypeT extends _ObjectType.LazyShaclProperty.Type.IdentifierType,
    LazyTypeT extends _ObjectType.LazyShaclProperty.Type<
      IdentifierTypeT,
      ResultTypeT
    >,
    ResultTypeT extends _ObjectType.LazyShaclProperty.Type.ResultType,
  > = _ObjectType.LazyShaclProperty<IdentifierTypeT, LazyTypeT, ResultTypeT>;
  export namespace LazyShaclProperty {
    export type Type<
      IdentifierTypeT extends _ObjectType.LazyShaclProperty.Type.IdentifierType,
      ResultTypeT extends _ObjectType.LazyShaclProperty.Type.ResultType,
    > = _ObjectType.LazyShaclProperty.Type<IdentifierTypeT, ResultTypeT>;

    export namespace Type {
      export type IdentifierType =
        _ObjectType.LazyShaclProperty.Type.IdentifierType;
      export type ResultType = _ObjectType.LazyShaclProperty.Type.ResultType;
    }
  }
  export type ObjectSetMethodNames = {
    readonly object: string;
    readonly objectsCount: string;
    readonly objectIdentifiers: string;
    readonly objects: string;
  };
  export const Property = _ObjectType.Property;
  export type Property = _ObjectType.Property<any>;
  export const ShaclProperty = _ObjectType.ShaclProperty;
  export type ShaclProperty<TypeT extends Type> =
    _ObjectType.ShaclProperty<TypeT>;
  export const TypeDiscriminatorProperty =
    _ObjectType.TypeDiscriminatorProperty;
  export type TypeDiscriminatorProperty = _ObjectType.TypeDiscriminatorProperty;
}
