import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
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
import type { Type } from "./Type.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

export class NamedObjectType extends AbstractType {
  protected readonly toRdfTypes: readonly NamedNode[];

  override readonly conversionFunction: Maybe<AbstractType.ConversionFunction> =
    Maybe.empty();
  readonly extern: boolean;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "NamedObjectType";
  override readonly name: string;
  override readonly recursive: boolean;
  readonly synthetic: boolean;
  override readonly typeofs = ["object" as const];

  constructor({
    extern,
    fromRdfType,
    identifierType,
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
    fromRdfType: Maybe<NamedNode>;
    identifierType: BlankNodeType | IdentifierType | IriType;
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
    this.fromRdfType = fromRdfType;
    this.identifierType = identifierType;
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

  override get declaration(): Maybe<Code> {
    const declarations: Code[] = [];

    if (!this.extern) {
      const staticModuleDeclarations: Code[] = [];

      declarations.push(NamedObjectType_interfaceDeclaration.call(this));
      staticModuleDeclarations.push(
        ...NamedObjectType_createFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_equalsFunctionDeclaration.call(this).toList(),
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
              code`export namespace Json { ${joinCode(jsonModuleDeclarations, { on: "\n\n" })} }`,
            ]
          : []),
        NamedObjectType_filterFunctionDeclaration.call(this),
        NamedObjectType_filterTypeDeclaration.call(this),
        ...NamedObjectType_focusSparqlConstructTriplesFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_focusSparqlWherePatternsFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_fromJsonFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_fromRdfResourceFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_fromRdfResourceValuesFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_fromRdfTypeVariableStatement.call(this).toList(),
        NamedObjectType_isTypeFunctionDeclaration.call(this),
        NamedObjectType_schemaVariableStatement.call(this),
        ...NamedObjectType_sparqlConstructQueryFunctionDeclaration.call({
          configuration: this.configuration,
          filterType: this.filterType,
          name: this.name,
          reusables: this.reusables,
        }).toList(),
        ...NamedObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
          configuration: this.configuration,
          filterType: this.filterType,
          name: this.name,
          reusables: this.reusables,
        }).toList(),
        ...NamedObjectType_toJsonFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_toRdfResourceFunctionDeclaration.call(this).toList(),
        ...NamedObjectType_toStringFunctionDeclarations.call(this),
        ...NamedObjectType_valueSparqlConstructTriplesFunctionDeclaration.call(
          this,
        ).toList(),
        ...NamedObjectType_valueSparqlWherePatternsFunctionDeclaration.call(
          this,
        ).toList(),
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
      jsonName: this._discriminantProperty.jsonName,
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
    return code`${this.name}.equals`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.name}.filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.name}.Filter`;
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.fromRdfType.map(() => code`${this.name}.fromRdfType`);
  }

  @Memoize()
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this.name}.GraphQL`,
      this.reusables,
    );
  }

  @Memoize()
  override get hashFunction(): Code {
    return code`${this.name}.hash`;
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.name}.Identifier`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.properties.some((property) => property.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): NamedObjectType.ObjectSetMethodNames {
    return NamedObjectType_objectSetMethodNames.call({
      configuration: this.configuration,
      name: this.name,
    });
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
    return code`${this.name}.schema`;
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

    return code`${this.reusables.imports.Resource}${this.identifierType.kind === "IriType" ? code`<${this.reusables.imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.name}.valueSparqlConstructTriples`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.name}.valueSparqlWherePatterns`;
  }

  @Memoize()
  protected get thisVariable(): Code {
    return code`_${camelCase(this.name)}`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.name}.fromJson(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const { resourceValues, ...options } = variables;
    return code`${this.name}.fromRdfResourceValues(${resourceValues}, ${options})`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }

  override jsonSchema({
    context,
  }: Parameters<AbstractType["jsonSchema"]>[0]): Code {
    let expression = code`${this.name}.Json.schema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.name}.Json> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return new AbstractType.JsonType(code`${this.name}.Json`);
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name}.Json.uiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name}.toJson(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    return code`[${this.name}.toRdfResource(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name}.${this.configuration.syntheticNamePrefix}toString(${variables.value})`;
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
