import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  TsObjectDeclarationType,
} from "../../enums/index.js";
import * as _ObjectType from "./_ObjectType/index.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { imports } from "./imports.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

export class ObjectType extends AbstractDeclaredType {
  protected readonly toRdfTypes: readonly NamedNode[];

  readonly abstract: boolean;
  readonly declarationType: TsObjectDeclarationType;
  readonly extern: boolean;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractDeclaredType["graphqlArgs"] =
    Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | NamedNodeType;
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
    identifierType: BlankNodeType | IdentifierType | NamedNodeType;
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
    // this.imports = imports;
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
          code`typeof ${value} === "object" && ${value} instanceof ${this.name}`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      },
    ];
  }

  override get declaration(): Maybe<Code> {
    if (this.extern) {
      return Maybe.empty();
    }

    const declarations: Code[] = [
      ..._ObjectType.classDeclaration.bind(this)().toList(),
      ..._ObjectType.interfaceDeclaration.bind(this)().toList(),
    ];

    const staticModuleDeclarations: Code[] = [
      ..._ObjectType.createFunctionDeclaration.bind(this)().toList(),
      ..._ObjectType.equalsFunctionOrMethodDeclaration.bind(this)().toList(),
      _ObjectType.filterFunctionDeclaration.bind(this)(),
      _ObjectType.filterTypeDeclaration.bind(this)(),
      ..._ObjectType.fromRdfTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.graphqlTypeVariableStatement.bind(this)().toList(),
      ..._ObjectType.identifierTypeDeclarations.bind(this)(),
      ..._ObjectType.jsonFunctionDeclarations.bind(this)(),
      ..._ObjectType.hashFunctionOrMethodDeclarations.bind(this)(),
      _ObjectType.isTypeFunctionDeclaration.bind(this)(),
      ..._ObjectType.rdfFunctionDeclarations.bind(this)(),
      _ObjectType.schemaVariableStatement.bind(this)(),
      ..._ObjectType.sparqlFunctionDeclarations.bind(this)(),
    ];

    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export module ${this.staticModuleName} {
${joinCode(staticModuleDeclarations)}
}`);
    }

    return Maybe.of(joinCode(declarations));
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
  override get discriminantProperty(): Maybe<AbstractDeclaredType.DiscriminantProperty> {
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
  get graphqlType(): AbstractDeclaredType.GraphqlType {
    return new AbstractDeclaredType.GraphqlType(
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
    return _ObjectType.objectSetMethodNames.bind(this)();
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
  override get schema(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}schema`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`typeof ${this.schema}`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`(({ ignoreRdfType, propertyPatterns, valueVariable, ...otherParameters }: ${snippets.SparqlWherePatternsFunctionParameters}<${this.filterType}, ${this.schemaType}>) => (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ ignoreRdfType: ignoreRdfType ?? true, subject: valueVariable, ...otherParameters })))`;
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return code`${imports.MutableResource}${this.identifierType.kind === "NamedNodeType" ? "<${imports.NamedNode}>" : ""}`;
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
  }: Parameters<AbstractDeclaredType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["fromRdfExpression"]>[0]): Code {
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
  }: Parameters<AbstractDeclaredType["hashStatements"]>[0]): readonly Code[] {
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
  override jsonType(): AbstractDeclaredType.JsonType {
    return new AbstractDeclaredType.JsonType(
      code`${this.staticModuleName}.${syntheticNamePrefix}Json`,
    );
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractDeclaredType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override jsonZodSchema({
    context,
  }: Parameters<AbstractDeclaredType["jsonZodSchema"]>[0]): Code {
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

  override sparqlConstructTriples({
    allowIgnoreRdfType,
    variables,
  }: Parameters<AbstractDeclaredType["sparqlConstructTriples"]>[0]): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{
      ignoreRdfType: allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
      subject: variables.valueVariable,
      variablePrefix: variables.variablePrefix,
    }})`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toJsonExpression"]>[0]): Code {
    switch (this.declarationType) {
      case "class":
        return code`${variables.value}.${syntheticNamePrefix}toJson()`;
      case "interface":
        return code`${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toRdfExpression"]>[0]): Code {
    switch (this.declarationType) {
      case "class":
        return code`[${variables.value}.${syntheticNamePrefix}toRdf({ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }).identifier]`;
      case "interface":
        return code`[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, { mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }).identifier]`;
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
