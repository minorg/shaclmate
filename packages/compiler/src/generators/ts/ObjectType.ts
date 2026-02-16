import type { NamedNode } from "@rdfjs/types";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  TsObjectDeclarationType,
} from "../../enums/index.js";
import { classDeclaration } from "./_ObjectType/classDeclaration.js";
import { createFunctionDeclaration } from "./_ObjectType/createFunctionDeclaration.js";
import { equalsFunctionOrMethodDeclaration } from "./_ObjectType/equalsFunctionOrMethodDeclaration.js";
import { filterFunctionDeclaration } from "./_ObjectType/filterFunctionDeclaration.js";
import { filterTypeDeclaration } from "./_ObjectType/filterTypeDeclaration.js";
import { fromRdfTypeVariableStatement } from "./_ObjectType/fromRdfTypeVariableStatement.js";
import { graphqlTypeVariableStatement } from "./_ObjectType/graphqlTypeVariableStatement.js";
import { hashFunctionOrMethodDeclarations } from "./_ObjectType/hashFunctionOrMethodDeclarations.js";
import { IdentifierPrefixProperty as _IdentifierPrefixProperty } from "./_ObjectType/IdentifierPrefixProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { identifierTypeDeclarations } from "./_ObjectType/identifierTypeDeclarations.js";
import { interfaceDeclaration } from "./_ObjectType/interfaceDeclaration.js";
import { isTypeFunctionDeclaration } from "./_ObjectType/isTypeFunctionDeclaration.js";
import { jsonFunctionDeclarations } from "./_ObjectType/jsonFunctionDeclarations.js";
import { jsonTypeAliasDeclaration } from "./_ObjectType/jsonTypeAliasDeclaration.js";
import { objectSetMethodNames } from "./_ObjectType/objectSetMethodNames.js";
import type { Property as _Property } from "./_ObjectType/Property.js";
import { rdfFunctionDeclarations } from "./_ObjectType/rdfFunctionDeclarations.js";
import { ShaclProperty as _ShaclProperty } from "./_ObjectType/ShaclProperty.js";
import { schemaVariableStatement } from "./_ObjectType/schemaVariableStatement.js";
import { sparqlFunctionDeclarations } from "./_ObjectType/sparqlFunctionDeclarations.js";
import { TypeDiscriminantProperty as _TypeDiscriminantProperty } from "./_ObjectType/TypeDiscriminantProperty.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { imports } from "./imports.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

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

    const declarations: Code[] = [];

    const staticModuleDeclarations: Code[] = [];

    switch (this.declarationType) {
      case "class": {
        declarations.push(classDeclaration.bind(this)());
        break;
      }
      case "interface": {
        declarations.push(interfaceDeclaration.bind(this)());
        staticModuleDeclarations.push(
          ...createFunctionDeclaration.bind(this)().toList(),
          ...equalsFunctionOrMethodDeclaration.bind(this)().toList(),
          ...hashFunctionOrMethodDeclarations.bind(this)(),
        );
        break;
      }
    }

    staticModuleDeclarations.push(
      filterFunctionDeclaration.bind(this)(),
      filterTypeDeclaration.bind(this)(),
      ...fromRdfTypeVariableStatement.bind(this)().toList(),
      ...graphqlTypeVariableStatement.bind(this)().toList(),
      ...identifierTypeDeclarations.bind(this)(),
      ...jsonFunctionDeclarations.bind(this)(),
      ...jsonTypeAliasDeclaration.bind(this)().toList(),
      isTypeFunctionDeclaration.bind(this)(),
      ...rdfFunctionDeclarations.bind(this)(),
      schemaVariableStatement.bind(this)(),
      ...sparqlFunctionDeclarations.bind(this)(),
    );

    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${this.staticModuleName} {
${joinCode(staticModuleDeclarations, { on: "\n\n" })}
}`);
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
    return objectSetMethodNames.bind(this)();
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
  override get sparqlWherePatternsFunction(): Code {
    return code`(({ ignoreRdfType, propertyPatterns, valueVariable, ...otherParameters }: ${snippets.SparqlWherePatternsFunctionParameters}<${this.filterType}, ${this.schemaType}>) => (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ ignoreRdfType: ignoreRdfType ?? true, subject: valueVariable, ...otherParameters })))`;
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return code`${imports.MutableResource}${this.identifierType.kind === "NamedNodeType" ? code`<${imports.NamedNode}>` : ""}`;
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
  }: Parameters<
    AbstractDeclaredType["sparqlConstructTriples"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{
        ignoreRdfType: allowIgnoreRdfType ? true : undefined, // Can ignore the rdf:type when the object is nested
        subject: variables.valueVariable,
        variablePrefix: variables.variablePrefix,
      }})`,
    );
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
  export const IdentifierPrefixProperty = _IdentifierPrefixProperty;
  export type IdentifierPrefixProperty = _IdentifierPrefixProperty;
  export const IdentifierProperty = _IdentifierProperty;
  export type IdentifierProperty = _IdentifierProperty;
  export type ObjectSetMethodNames = {
    readonly object: string;
    readonly objectsCount: string;
    readonly objectIdentifiers: string;
    readonly objects: string;
  };
  export type Property = _Property;
  export const ShaclProperty = _ShaclProperty;
  export type ShaclProperty<TypeT extends Type> = _ShaclProperty<TypeT>;
  export const TypeDiscriminantProperty = _TypeDiscriminantProperty;
  export type TypeDiscriminantProperty = _TypeDiscriminantProperty;
}
