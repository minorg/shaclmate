import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  TsObjectDeclarationType,
} from "../../enums/index.js";
import * as _ObjectType from "./_ObjectType/index.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { Sparql } from "./Sparql.js";
import { StaticModuleStatementStructure } from "./StaticModuleStatementStructure.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

const sparqlInstancesOfPatternSnippetDeclaration = singleEntryRecord(
  `${syntheticNamePrefix}sparqlInstancesOfPattern`,
  `\
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
function ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType, subject }: { rdfType: rdfjs.NamedNode | rdfjs.Variable, subject: sparqljs.Triple["subject"] }): sparqljs.Pattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            $RdfVocabularies.rdf.type,
            {
              items: [$RdfVocabularies.rdfs.subClassOf],
              pathType: "*",
              type: "path",
            },
          ],
          pathType: "/",
          type: "path",
        },
        object: rdfType,
      },
    ],
    type: "bgp",
  };
}`,
);

// export const UnwrapL = `type ${syntheticNamePrefix}UnwrapL<T> = T extends purify.Either<infer L, any> ? L : never`;
const UnwrapRSnippetDeclaration = singleEntryRecord(
  `${syntheticNamePrefix}UnwrapR`,
  `type ${syntheticNamePrefix}UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never`,
);

export class ObjectType extends AbstractDeclaredType {
  private readonly imports: readonly string[];

  protected readonly toRdfTypes: readonly NamedNode[];

  readonly abstract: boolean;
  readonly declarationType: TsObjectDeclarationType;
  readonly extern: boolean;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractDeclaredType["graphqlArgs"] =
    Maybe.empty();
  readonly identifierType: IdentifierType;
  readonly kind = "ObjectType";
  readonly staticModuleName: string;
  readonly synthetic: boolean;
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    abstract,
    declarationType,
    extern,
    fromRdfType,
    identifierType,
    imports,
    lazyAncestorObjectTypes,
    lazyChildObjectTypes,
    lazyDescendantObjectTypes,
    lazyParentObjectTypes,
    lazyProperties,
    staticModuleName,
    synthetic,
    toRdfTypes,
    ...superParameters
  }: {
    abstract: boolean;
    comment: Maybe<string>;
    declarationType: TsObjectDeclarationType;
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierType: IdentifierType;
    imports: readonly string[];
    label: Maybe<string>;
    lazyAncestorObjectTypes: () => readonly ObjectType[];
    lazyChildObjectTypes: () => readonly ObjectType[];
    lazyDescendantObjectTypes: () => readonly ObjectType[];
    lazyParentObjectTypes: () => readonly ObjectType[];
    lazyProperties: (objectType: ObjectType) => readonly ObjectType.Property[];
    staticModuleName: string;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractDeclaredType>[0]) {
    super(superParameters);
    this.abstract = abstract;
    this.declarationType = declarationType;
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.identifierType = identifierType;
    this.imports = imports;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyAncestorObjectTypes = lazyAncestorObjectTypes;
    this.lazyChildObjectTypes = lazyChildObjectTypes;
    this.lazyDescendantObjectTypes = lazyDescendantObjectTypes;
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.staticModuleName = staticModuleName;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  get _discriminantProperty(): AbstractDeclaredType.DiscriminantProperty {
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
  override get conversions(): readonly AbstractDeclaredType.Conversion[] {
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
    }
    if (this.features.has("json")) {
      imports.push(Import.ZOD);
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
    if (this.extern) {
      return [];
    }

    const declarations: (
      | ClassDeclarationStructure
      | InterfaceDeclarationStructure
      | ModuleDeclarationStructure
    )[] = [
      ..._ObjectType.classDeclaration.bind(this)().toList(),
      ..._ObjectType.interfaceDeclaration.bind(this)().toList(),
    ];

    const staticModuleStatements: StaticModuleStatementStructure[] = [
      ..._ObjectType.createFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.equalsFunctionDeclaration.bind(this)().toList(),
      _ObjectType.filterFunctionDeclaration.bind(this)(),
      _ObjectType.filterTypeDeclaration.bind(this)(),
      ..._ObjectType.fromRdfTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.graphqlTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.identifierTypeDeclarations.bind(this)(),
      ..._ObjectType.jsonDeclarations.bind(this)(),
      ..._ObjectType.hashFunctionDeclarations.bind(this)(),
      _ObjectType.isTypeFunctionDeclaration.bind(this)(),
      ..._ObjectType.rdfFunctionDeclarations.bind(this)(),
      _ObjectType.schemaVariableStatement.bind(this)(),
      ..._ObjectType.sparqlFunctionDeclarations.bind(this)(),
    ];

    if (staticModuleStatements.length > 0) {
      declarations.push({
        isExported: this.export,
        kind: StructureKind.Module,
        name: this.staticModuleName,
        statements: staticModuleStatements.sort(
          StaticModuleStatementStructure.compare,
        ),
      });
    }

    return declarations;
  }

  @Memoize()
  get descendantFromRdfTypes(): readonly NamedNode[] {
    return this.descendantObjectTypes.flatMap((descendantObjectType) =>
      descendantObjectType.fromRdfType.toList(),
    );
  }

  @Memoize()
  get descendantFromRdfTypeVariables(): readonly string[] {
    return this.descendantObjectTypes.flatMap((descendantObjectType) =>
      descendantObjectType.fromRdfTypeVariable.toList(),
    );
  }

  @Memoize()
  get descendantObjectTypes(): readonly ObjectType[] {
    return this.lazyDescendantObjectTypes();
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractDeclaredType.DiscriminantProperty> {
    return Maybe.of(this._discriminantProperty);
  }

  @Memoize()
  get discriminantValue(): string {
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
  get filterFunction(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}filter`;
  }

  @Memoize()
  get filterType(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Filter`;
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<string> {
    return this.fromRdfType.map(
      () => `${this.staticModuleName}.${syntheticNamePrefix}fromRdfType`,
    );
  }

  @Memoize()
  get graphqlType(): AbstractDeclaredType.GraphqlType {
    return new AbstractDeclaredType.GraphqlType(
      `${this.staticModuleName}.${syntheticNamePrefix}GraphQL`,
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
  get identifierTypeAlias(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override jsonType(): AbstractDeclaredType.JsonType {
    return new AbstractDeclaredType.JsonType(
      `${this.staticModuleName}.${syntheticNamePrefix}Json`,
    );
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  newExpression({ parameters }: { parameters: string }): string {
    switch (this.declarationType) {
      case "class":
        return `new ${this.name}(${parameters})`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}create(${parameters})`;
    }
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return _ObjectType.objectSetMethodNames.bind(this)();
  }

  @Memoize()
  get ownProperties(): readonly ObjectType.Property[] {
    if (this.parentObjectTypes.length === 0) {
      // Consider that a root of the object type hierarchy "owns" the identifier and type discriminant properties
      // for all of its subtypes in the hierarchy.
      invariant(this.properties.length >= 2, this.name);
      return this.properties;
    }
    return this.ownShaclProperties;
  }

  @Memoize()
  get ownShaclProperties(): readonly _ObjectType.ShaclProperty<Type>[] {
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
  override get schema(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}schema`;
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
  }: Parameters<AbstractDeclaredType["fromJsonExpression"]>[0]): string {
    // Assumes the JSON object has been recursively validated already.
    return `${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["fromRdfExpression"]>[0]): string {
    return `${variables.resourceValues}.chain(values => values.chainMap(value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { context: ${variables.context}, ${variables.ignoreRdfType ? "ignoreRdfType: true, " : ""}objectSet: ${variables.objectSet}, preferredLanguages: ${variables.preferredLanguages} }))))`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: string };
  }): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractDeclaredType["hashStatements"]>[0]): readonly string[] {
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
  }: Parameters<
    AbstractDeclaredType["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    return Maybe.of(
      `${this.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override jsonZodSchema({
    context,
    variables,
  }: Parameters<AbstractDeclaredType["jsonZodSchema"]>[0]): ReturnType<
    AbstractDeclaredType["jsonZodSchema"]
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
  }: Parameters<AbstractDeclaredType["snippetDeclarations"]>[0]): Readonly<
    Record<string, string>
  > {
    if (recursionStack.some((type) => Object.is(type, this))) {
      return {};
    }

    let snippetDeclarations: Record<string, string> = {};

    if (this.features.has("equals")) {
      snippetDeclarations = mergeSnippetDeclarations(
        snippetDeclarations,
        sharedSnippetDeclarations.EqualsResult,
      );
    }
    if (this.features.has("rdf")) {
      snippetDeclarations = mergeSnippetDeclarations(
        snippetDeclarations,
        sharedSnippetDeclarations.IdentifierSet, // For $RdfjsDatasetObjectSet
        sharedSnippetDeclarations.RdfVocabularies,
      );
    }
    if (this.features.has("sparql")) {
      if (this.fromRdfType.isJust()) {
        snippetDeclarations = mergeSnippetDeclarations(
          snippetDeclarations,
          sparqlInstancesOfPatternSnippetDeclaration,
        );
      }
      snippetDeclarations = mergeSnippetDeclarations(
        snippetDeclarations,
        sharedSnippetDeclarations.normalizeSparqlWherePatterns,
      );
    }
    if (
      (this.features.has("json") || this.features.has("rdf")) &&
      this.parentObjectTypes.length > 0
    ) {
      snippetDeclarations = mergeSnippetDeclarations(
        snippetDeclarations,
        UnwrapRSnippetDeclaration,
      );
    }
    recursionStack.push(this);
    for (const property of this.ownProperties) {
      snippetDeclarations = mergeSnippetDeclarations(
        snippetDeclarations,
        property.snippetDeclarations({
          features: this.features,
          recursionStack,
        }),
      );
    }
    invariant(Object.is(recursionStack.pop(), this));
    return snippetDeclarations;
  }

  override sparqlConstructTriples({
    allowIgnoreRdfType,
    variables,
  }: Parameters<AbstractDeclaredType["sparqlConstructTriples"]>[0]): readonly (
    | Sparql.Triple
    | string
  )[] {
    return [
      `...${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${objectInitializer(
        {
          ignoreRdfType: allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
          subject: variables.valueVariable,
          variablePrefix: variables.variablePrefix,
        },
      )})`,
    ];
  }

  override sparqlWherePatterns({
    allowIgnoreRdfType,
    propertyPatterns,
    variables,
  }: Parameters<
    AbstractDeclaredType["sparqlWherePatterns"]
  >[0]): readonly Sparql.Pattern[] {
    return [
      ...propertyPatterns,
      {
        patterns: `${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${objectInitializer(
          {
            filter: variables.filter.extract(),
            ignoreRdfType: allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
            preferredLanguages: variables.preferredLanguages,
            subject: variables.valueVariable,
            variablePrefix: variables.variablePrefix,
          },
        )})`,
        type: "opaque-block",
      },
    ];
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toJsonExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `${variables.value}.${syntheticNamePrefix}toJson()`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toRdfExpression"]>[0]): string {
    switch (this.declarationType) {
      case "class":
        return `[${variables.value}.${syntheticNamePrefix}toRdf({ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }).identifier]`;
      case "interface":
        return `[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, { mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }).identifier]`;
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
  export const IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export type IdentifierPrefixProperty = _ObjectType.IdentifierPrefixProperty;
  export const IdentifierProperty = _ObjectType.IdentifierProperty;
  export type IdentifierProperty = _ObjectType.IdentifierProperty;
  export type ObjectSetMethodNames = {
    readonly object: string;
    readonly objectsCount: string;
    readonly objectIdentifiers: string;
    readonly objects: string;
  };
  export type Property = _ObjectType.Property;
  export const ShaclProperty = _ObjectType.ShaclProperty;
  export type ShaclProperty<TypeT extends Type> =
    _ObjectType.ShaclProperty<TypeT>;
  export const TypeDiscriminantProperty = _ObjectType.TypeDiscriminantProperty;
  export type TypeDiscriminantProperty = _ObjectType.TypeDiscriminantProperty;
}
