import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { DiscriminantProperty as _DiscriminantProperty } from "./_NamedObjectType/DiscriminantProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_NamedObjectType/IdentifierProperty.js";
import { identifierTypeDeclarations } from "./_NamedObjectType/identifierTypeDeclarations.js";
import { NamedObjectType_createFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_createFunctionDeclaration.js";
import { NamedObjectType_equalsFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_equalsFunctionDeclaration.js";
import { NamedObjectType_filterFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_filterFunctionDeclaration.js";
import { NamedObjectType_filterTypeDeclaration } from "./_NamedObjectType/NamedObjectType_filterTypeDeclaration.js";
import { NamedObjectType_focusSparqlConstructTriplesFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_focusSparqlConstructTriplesFunctionDeclaration.js";
import { NamedObjectType_focusSparqlWherePatternsFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_focusSparqlWherePatternsFunctionDeclaration.js";
import { NamedObjectType_fromJsonFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_fromJsonFunctionDeclaration.js";
import { NamedObjectType_fromRdfResourceFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_fromRdfResourceFunctionDeclaration.js";
import { NamedObjectType_fromRdfResourceValuesFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_fromRdfResourceValuesFunctionDeclaration.js";
import { NamedObjectType_fromRdfTypeVariableStatement } from "./_NamedObjectType/NamedObjectType_fromRdfTypeVariableStatement.js";
import { NamedObjectType_graphqlTypeVariableStatement } from "./_NamedObjectType/NamedObjectType_graphqlTypeVariableStatement.js";
import { NamedObjectType_hashFunctionDeclarations } from "./_NamedObjectType/NamedObjectType_hashFunctionDeclarations.js";
import { NamedObjectType_interfaceDeclaration } from "./_NamedObjectType/NamedObjectType_interfaceDeclaration.js";
import { NamedObjectType_isTypeFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_isTypeFunctionDeclaration.js";
import { NamedObjectType_jsonParseFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonParseFunctionDeclaration.js";
import { NamedObjectType_jsonSchemaFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonSchemaFunctionDeclaration.js";
import { NamedObjectType_jsonTypeAliasDeclaration } from "./_NamedObjectType/NamedObjectType_jsonTypeAliasDeclaration.js";
import { NamedObjectType_jsonUiSchemaFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonUiSchemaFunctionDeclaration.js";
import { NamedObjectType_objectSetMethodNames } from "./_NamedObjectType/NamedObjectType_objectSetMethodNames.js";
import { NamedObjectType_propertiesFromJsonFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_propertiesFromJsonFunctionDeclaration.js";
import { NamedObjectType_propertiesFromRdfResourceFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_propertiesFromRdfResourceFunctionDeclaration.js";
import { NamedObjectType_schemaVariableStatement } from "./_NamedObjectType/NamedObjectType_schemaVariableStatement.js";
import { NamedObjectType_sparqlConstructQueryFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { NamedObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { NamedObjectType_toJsonFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_toJsonFunctionDeclaration.js";
import { NamedObjectType_toRdfResourceFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_toRdfResourceFunctionDeclaration.js";
import { NamedObjectType_toStringFunctionDeclarations } from "./_NamedObjectType/NamedObjectType_toStringFunctionDeclarations.js";
import { NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration.js";
import { NamedObjectType_valueSparqlWherePatternsFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_valueSparqlWherePatternsFunctionDeclaration.js";
import type { Property as _Property } from "./_NamedObjectType/Property.js";
import { ShaclProperty as _ShaclProperty } from "./_NamedObjectType/ShaclProperty.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";

import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TsFeature } from "./TsFeature.js";
import type { Type } from "./Type.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

export class NamedObjectType extends AbstractType {
  private readonly imports: readonly string[];

  protected readonly toRdfTypes: readonly NamedNode[];

  readonly extern: boolean;
  readonly features: ReadonlySet<TsFeature>;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "NamedObjectType";
  override readonly name: string;
  override readonly recursive: boolean;
  readonly synthetic: boolean;
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    extern,
    features,
    fromRdfType,
    identifierType,
    imports,
    lazyAncestorObjectTypes,
    lazyChildObjectTypes,
    lazyDescendantObjectTypes,
    lazyDiscriminantProperty,
    lazyParentObjectTypes,
    lazyProperties,
    name,
    recursive,
    synthetic,
    toRdfTypes,
    ...superParameters
  }: {
    comment: Maybe<string>;
    extern: boolean;
    features: ReadonlySet<TsFeature>;
    fromRdfType: Maybe<NamedNode>;
    identifierType: BlankNodeType | IdentifierType | IriType;
    imports: readonly string[];
    label: Maybe<string>;
    lazyAncestorObjectTypes: () => readonly NamedObjectType[];
    lazyChildObjectTypes: () => readonly NamedObjectType[];
    lazyDiscriminantProperty: (
      namedObjectType: NamedObjectType,
    ) => NamedObjectType.DiscriminantProperty;
    lazyDescendantObjectTypes: () => readonly NamedObjectType[];
    lazyParentObjectTypes: () => readonly NamedObjectType[];
    lazyProperties: (
      namedObjectType: NamedObjectType,
    ) => readonly NamedObjectType.Property[];
    name: string;
    recursive: boolean;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
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
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.name = name;
    this.recursive = recursive;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
  }

  @Memoize()
  get _discriminantProperty(): NamedObjectType.DiscriminantProperty {
    return this.lazyDiscriminantProperty(this);
  }

  @Memoize()
  get ancestorObjectTypes(): readonly NamedObjectType[] {
    return this.lazyAncestorObjectTypes();
  }

  @Memoize()
  get childObjectTypes(): readonly NamedObjectType[] {
    return this.lazyChildObjectTypes();
  }

  @Memoize()
  override get conversions(): readonly AbstractType.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
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

      declarations.push(NamedObjectType_interfaceDeclaration.call(this));
      staticModuleDeclarations.push(
        ...NamedObjectType_createFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_equalsFunctionDeclaration.bind(this)().toList(),
        ...NamedObjectType_hashFunctionDeclarations.call(this),
      );

      const jsonModuleDeclarations: Code[] = [
        ...NamedObjectType_jsonParseFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_jsonSchemaFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_jsonUiSchemaFunctionDeclaration.call(this).toList(),
      ];

      staticModuleDeclarations.push(
        ...NamedObjectType_graphqlTypeVariableStatement.call(this).toList(),
        ...identifierTypeDeclarations.call(this),
        ...NamedObjectType_jsonTypeAliasDeclaration.call(this).toList(),
        ...(jsonModuleDeclarations.length > 0
          ? [
              code`export namespace ${syntheticNamePrefix}Json { ${joinCode(jsonModuleDeclarations, { on: "\n\n" })} }`,
            ]
          : []),
        NamedObjectType_filterFunctionDeclaration.call(this),
        NamedObjectType_filterTypeDeclaration.call(this),
        ...NamedObjectType_focusSparqlConstructTriplesFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_focusSparqlWherePatternsFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_fromJsonFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_fromRdfResourceFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_fromRdfResourceValuesFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_fromRdfTypeVariableStatement.call(this).toList(),
        NamedObjectType_isTypeFunctionDeclaration.call(this),
        ...NamedObjectType_propertiesFromJsonFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_propertiesFromRdfResourceFunctionDeclaration.bind(
          this,
        )().toList(),
        NamedObjectType_schemaVariableStatement.call(this),
        ...NamedObjectType_sparqlConstructQueryFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_toJsonFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_toRdfResourceFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_toStringFunctionDeclarations.call(this),
        ...NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration.bind(
          this,
        )().toList(),
        ...NamedObjectType_valueSparqlWherePatternsFunctionDeclaration.bind(
          this,
        )().toList(),
      );

      if (staticModuleDeclarations.length > 0) {
        declarations.push(code`\
export namespace ${def(this.name)} {
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
  get descendantObjectTypes(): readonly NamedObjectType[] {
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
    return code`${this.name}.${syntheticNamePrefix}equals`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.name}.${syntheticNamePrefix}filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.name}.${syntheticNamePrefix}Filter`;
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.fromRdfType.map(
      () => code`${this.name}.${syntheticNamePrefix}fromRdfType`,
    );
  }

  @Memoize()
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this.name}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.name}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): NamedObjectType.ObjectSetMethodNames {
    return NamedObjectType_objectSetMethodNames.call(this);
  }

  @Memoize()
  get parentObjectTypes(): readonly NamedObjectType[] {
    return this.lazyParentObjectTypes();
  }

  @Memoize()
  get properties(): readonly NamedObjectType.Property[] {
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
    return code`${this.name}.${syntheticNamePrefix}schema`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`typeof ${this.schema}`;
  }

  @Memoize()
  get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    return new Set([...this.identifierType.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  get toRdfjsResourceType(): Code {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].toRdfjsResourceType;
    }

    return code`${this.imports.Resource}${this.identifierType.kind === "IriType" ? code`<${this.imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.name}.${syntheticNamePrefix}valueSparqlConstructTriples`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.name}.${syntheticNamePrefix}valueSparqlWherePatterns`;
  }

  @Memoize()
  protected get thisVariable(): Code {
    return code`_${camelCase(this.name)}`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.name}.${syntheticNamePrefix}fromJson(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues, ...options } = variables;
    return code`${this.name}.${syntheticNamePrefix}fromRdfResourceValues(${resourceValues}, ${options})`;
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
    return [
      code`${this.name}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
    ];
  }

  override jsonSchema({
    context,
  }: Parameters<AbstractType["jsonSchema"]>[0]): Code {
    let expression = code`${this.name}.${syntheticNamePrefix}Json.schema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = code`${this.imports.z}.lazy((): ${this.imports.z}.ZodType<${this.name}.${syntheticNamePrefix}Json> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return new AbstractType.JsonType(
      code`${this.name}.${syntheticNamePrefix}Json`,
    );
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}.${syntheticNamePrefix}Json.uiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name}.${syntheticNamePrefix}toJson(${variables.value})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name}.${syntheticNamePrefix}toString(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    return code`[${this.name}.${syntheticNamePrefix}toRdfResource(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
  }

  private readonly lazyAncestorObjectTypes: () => readonly NamedObjectType[];

  private readonly lazyChildObjectTypes: () => readonly NamedObjectType[];

  private readonly lazyDescendantObjectTypes: () => readonly NamedObjectType[];

  private readonly lazyDiscriminantProperty: (
    namedObjectType: NamedObjectType,
  ) => NamedObjectType.DiscriminantProperty;

  private readonly lazyParentObjectTypes: () => readonly NamedObjectType[];

  private readonly lazyProperties: (
    namedObjectType: NamedObjectType,
  ) => readonly NamedObjectType.Property[];
}

export namespace NamedObjectType {
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
