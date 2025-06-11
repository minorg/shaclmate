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
  VariableDeclarationKind,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import * as _ObjectType from "./_ObjectType/index.js";

import type {
  IdentifierMintingStrategy,
  TsFeature,
  TsObjectDeclarationType,
} from "../../enums/index.js";
import { DeclaredType } from "./DeclaredType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export class ObjectType extends DeclaredType {
  private readonly imports: readonly string[];

  protected readonly comment: Maybe<string>;
  protected readonly fromRdfType: Maybe<NamedNode>;
  protected readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  protected readonly label: Maybe<string>;
  protected readonly toRdfTypes: readonly NamedNode[];

  readonly abstract: boolean;
  readonly declarationType: TsObjectDeclarationType;
  readonly extern: boolean;
  readonly kind = "ObjectType";

  constructor({
    abstract,
    comment,
    declarationType,
    extern,
    fromRdfType,
    label,
    lazyAncestorObjectTypes,
    lazyChildObjectTypes,
    lazyDescendantObjectTypes,
    lazyParentObjectTypes,
    lazyProperties,
    imports,
    identifierMintingStrategy,
    toRdfTypes,
    ...superParameters
  }: {
    abstract: boolean;
    comment: Maybe<string>;
    declarationType: TsObjectDeclarationType;
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    imports: readonly string[];
    label: Maybe<string>;
    lazyAncestorObjectTypes: () => readonly ObjectType[];
    lazyChildObjectTypes: () => readonly ObjectType[];
    lazyDescendantObjectTypes: () => readonly ObjectType[];
    lazyParentObjectTypes: () => readonly ObjectType[];
    lazyProperties: () => readonly ObjectType.Property[];
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof DeclaredType>[0]) {
    super(superParameters);
    this.abstract = abstract;
    this.comment = comment;
    this.declarationType = declarationType;
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.imports = imports;
    this.label = label;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyAncestorObjectTypes = lazyAncestorObjectTypes;
    this.lazyChildObjectTypes = lazyChildObjectTypes;
    this.lazyDescendantObjectTypes = lazyDescendantObjectTypes;
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.identifierMintingStrategy = identifierMintingStrategy;
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
      values: [this.discriminatorValue],
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

  @Memoize()
  get declarationImports(): readonly Import[] {
    if (this.extern) {
      return [];
    }
    const imports: Import[] = this.properties.flatMap(
      (property) => property.declarationImports,
    );
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

  @Memoize()
  get declarations() {
    const declarations: (
      | ClassDeclarationStructure
      | InterfaceDeclarationStructure
      | ModuleDeclarationStructure
    )[] = [
      ..._ObjectType.classDeclaration.bind(this)().toList(),
      ..._ObjectType.interfaceDeclaration.bind(this)().toList(),
    ];

    const staticModuleStatements: StatementStructures[] = [
      ..._ObjectType.createFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.equalsFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.fromRdfTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.jsonTypeAliasDeclaration.bind(this)().toList(),
      ..._ObjectType.jsonFunctionDeclarations.bind(this)(),
      ..._ObjectType.hashFunctionDeclarations.bind(this)(),
      ..._ObjectType.rdfFunctionDeclarations.bind(this)(),
      ..._ObjectType.sparqlFunctionDeclarations.bind(this)(),
    ];

    if (!this.extern) {
      staticModuleStatements.push({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        kind: StructureKind.VariableStatement,
        declarations: [
          {
            name: "Pointers",
            initializer: `{ ${staticModuleStatements
              .flatMap((statement) =>
                statement.kind === StructureKind.Function
                  ? [statement.name]
                  : [],
              )
              .toSorted()
              .join(", ")} }`,
          },
        ],
      });

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
        return "((left, right) => left.equals(right))";
      case "interface":
        return `${this.staticModuleName}.equals`;
      default:
        throw new RangeError(this.declarationType);
    }
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
  get jsonName(): string {
    return `${this.staticModuleName}.Json`;
  }

  @Memoize()
  get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
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
    const properties = this.lazyProperties();
    const propertyNames = new Set<string>();
    for (const property of properties) {
      if (propertyNames.has(property.name)) {
        throw new Error(`duplicate property '${property.name}'`);
      }
    }
    return properties;
  }

  get staticModuleName(): string {
    return this.childObjectTypes.length > 0 ? `${this.name}Static` : this.name;
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
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    // Assumes the JSON object has been recursively validated already.
    return `${this.staticModuleName}.fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return `${variables.resourceValues}.head().chain(value => value.to${this.rdfjsResourceType().named ? "Named" : ""}Resource()).chain(_resource => ${this.staticModuleName}.fromRdf({ ...${variables.context}, ${variables.ignoreRdfType ? "ignoreRdfType: true, " : ""}languageIn: ${variables.languageIn}, resource: _resource }))`;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    switch (this.declarationType) {
      case "class":
        return [`${variables.value}.hash(${variables.hasher});`];
      case "interface":
        return [
          `${this.staticModuleName}.hash(${variables.value}, ${variables.hasher});`,
        ];
    }
  }

  override jsonUiSchemaElement({
    variables,
  }: { variables: { scopePrefix: string } }): Maybe<string> {
    return Maybe.of(
      `${this.staticModuleName}.jsonUiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override jsonZodSchema(
    _parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): ReturnType<Type["jsonZodSchema"]> {
    return `${this.staticModuleName}.jsonZodSchema()`;
  }

  rdfjsResourceType(options?: { mutable?: boolean }): {
    readonly mutable: boolean;
    readonly name: string;
    readonly named: boolean;
  } {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].rdfjsResourceType(options);
    }

    return {
      mutable: !!options?.mutable,
      name: `rdfjsResource.${options?.mutable ? "Mutable" : ""}Resource${this.identifierType.isNamedNodeKind ? "<rdfjs.NamedNode>" : ""}`,
      named: this.identifierType.isNamedNodeKind,
    };
  }

  override snippetDeclarations(): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (this.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.EqualsResult);
    }
    if (
      (this.features.has("json") || this.features.has("rdf")) &&
      this.parentObjectTypes.length > 0
    ) {
      snippetDeclarations.push(SnippetDeclarations.UnwrapR);
    }
    for (const property of this.ownProperties) {
      snippetDeclarations.push(...property.snippetDeclarations);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples({
    context,
    variables,
  }: Parameters<Type["sparqlConstructTemplateTriples"]>[0]): readonly string[] {
    switch (context) {
      case "property":
        return super.sparqlConstructTemplateTriples({ context, variables });
      case "type":
        return [
          `...${this.staticModuleName}.sparqlConstructTemplateTriples(${objectInitializer(
            {
              ignoreRdfType: true, // Can ignore the rdf:type when the object is nested
              subject: variables.subject,
              variablePrefix: variables.variablePrefix,
            },
          )})`,
        ];
    }
  }

  override sparqlWherePatterns({
    context,
    variables,
  }: Parameters<Type["sparqlWherePatterns"]>[0]): readonly string[] {
    switch (context) {
      case "property":
        return super.sparqlWherePatterns({ context, variables });
      case "type":
        return [
          `...${this.staticModuleName}.sparqlWherePatterns(${objectInitializer({
            ignoreRdfType: true, // Can ignore the rdf:type when the object is nested
            subject: variables.subject,
            variablePrefix: variables.variablePrefix,
          })})`,
        ];
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `${variables.value}.toJson()`;
      case "interface":
        return `${this.staticModuleName}.toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `${variables.value}.toRdf({ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} })`;
      case "interface":
        return `${this.staticModuleName}.toRdf(${variables.value}, { mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} })`;
    }
  }

  override useImports(_features: Set<TsFeature>): readonly Import[] {
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

  private readonly lazyProperties: () => readonly ObjectType.Property[];
}

export namespace ObjectType {
  export const IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export type IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export const IdentifierProperty = _ObjectType.IdentifierProperty;
  export type IdentifierProperty = _ObjectType.IdentifierProperty;
  export const Property = _ObjectType.Property;
  export type Property = _ObjectType.Property<any>;
  export const ShaclProperty = _ObjectType.ShaclProperty;
  export type ShaclProperty = _ObjectType.ShaclProperty;
  export const TypeDiscriminatorProperty =
    _ObjectType.TypeDiscriminatorProperty;
  export type TypeDiscriminatorProperty = _ObjectType.TypeDiscriminatorProperty;
}
