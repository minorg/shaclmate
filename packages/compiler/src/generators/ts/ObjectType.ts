import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { DiscriminantProperty as _DiscriminantProperty } from "./_ObjectType/DiscriminantProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { identifierTypeDeclarations } from "./_ObjectType/identifierTypeDeclarations.js";
import { ObjectType_createFunctionDeclaration } from "./_ObjectType/ObjectType_createFunctionDeclaration.js";
import { ObjectType_equalsFunctionDeclaration } from "./_ObjectType/ObjectType_equalsFunctionDeclaration.js";
import { ObjectType_filterFunctionDeclaration } from "./_ObjectType/ObjectType_filterFunctionDeclaration.js";
import { ObjectType_filterTypeDeclaration } from "./_ObjectType/ObjectType_filterTypeDeclaration.js";
import { ObjectType_focusSparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_focusSparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunctionDeclaration.js";
import { ObjectType_fromJsonFunctionDeclaration } from "./_ObjectType/ObjectType_fromJsonFunctionDeclaration.js";
import { ObjectType_fromRdfResourceFunctionDeclaration } from "./_ObjectType/ObjectType_fromRdfResourceFunctionDeclaration.js";
import { ObjectType_fromRdfResourceValuesFunctionDeclaration } from "./_ObjectType/ObjectType_fromRdfResourceValuesFunctionDeclaration.js";
import { ObjectType_fromRdfTypeVariableStatement } from "./_ObjectType/ObjectType_fromRdfTypeVariableStatement.js";
import { ObjectType_graphqlTypeVariableStatement } from "./_ObjectType/ObjectType_graphqlTypeVariableStatement.js";
import { ObjectType_hashFunctionDeclarations } from "./_ObjectType/ObjectType_hashFunctionDeclarations.js";
import { ObjectType_interfaceDeclaration } from "./_ObjectType/ObjectType_interfaceDeclaration.js";
import { ObjectType_isTypeFunctionDeclaration } from "./_ObjectType/ObjectType_isTypeFunctionDeclaration.js";
import { ObjectType_jsonParseFunctionDeclaration } from "./_ObjectType/ObjectType_jsonParseFunctionDeclaration.js";
import { ObjectType_jsonSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonSchemaFunctionDeclaration.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonUiSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonUiSchemaFunctionDeclaration.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_schemaVariableStatement } from "./_ObjectType/ObjectType_schemaVariableStatement.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { ObjectType_toJsonFunctionDeclaration } from "./_ObjectType/ObjectType_toJsonFunctionDeclaration.js";
import { ObjectType_toRdfResourceFunctionDeclaration } from "./_ObjectType/ObjectType_toRdfResourceFunctionDeclaration.js";
import { ObjectType_toStringFunctionDeclarations } from "./_ObjectType/ObjectType_toStringFunctionDeclarations.js";
import { ObjectType_valueSparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_valueSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_valueSparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_valueSparqlWherePatternsFunctionDeclaration.js";
import type { Property as _Property } from "./_ObjectType/Property.js";
import { ShaclProperty as _ShaclProperty } from "./_ObjectType/ShaclProperty.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

export class ObjectType extends AbstractType {
  protected readonly toRdfTypes: readonly NamedNode[];

  override readonly conversionFunction: Maybe<AbstractType.ConversionFunction> =
    Maybe.empty();
  override readonly discriminantProperty: Maybe<ObjectType.DiscriminantProperty>;
  readonly extern: boolean;
  readonly fromRdfType: Maybe<NamedNode>;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Object";
  override readonly recursive: boolean;
  override readonly referencesObjectType = true;
  readonly synthetic: boolean;
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

  constructor({
    discriminantProperty,
    extern,
    fromRdfType,
    identifierType,
    lazyProperties,
    recursive,
    synthetic,
    toRdfTypes,
    ...superParameters
  }: {
    discriminantProperty: Maybe<ObjectType.DiscriminantProperty>;
    comment: Maybe<string>;
    extern: boolean;
    fromRdfType: Maybe<NamedNode>;
    identifierType: BlankNodeType | IdentifierType | IriType;
    label: Maybe<string>;
    lazyProperties: (objectType: ObjectType) => readonly ObjectType.Property[];
    recursive: boolean;
    synthetic: boolean;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.discriminantProperty = discriminantProperty;
    this.extern = extern;
    this.fromRdfType = fromRdfType;
    this.identifierType = identifierType;
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyProperties = lazyProperties;
    this.recursive = recursive;
    this.synthetic = synthetic;
    this.toRdfTypes = toRdfTypes;
  }

  override get declaration(): Maybe<Code> {
    const name = this.name.extract();
    if (!name) {
      return Maybe.empty();
    }

    const declarations: Code[] = [];

    if (!this.extern) {
      const staticModuleDeclarations: Code[] = [];

      if (this.configuration.features.has("Object.type")) {
        declarations.push(ObjectType_interfaceDeclaration.call(this));
      }

      staticModuleDeclarations.push(
        ...ObjectType_createFunctionDeclaration.call(this).toList(),
        ...ObjectType_equalsFunctionDeclaration.call(this).toList(),
        ...ObjectType_hashFunctionDeclarations.call(this),
      );

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
              code`export namespace Json { ${joinCode(jsonModuleDeclarations, { on: "\n\n" })} }`,
            ]
          : []),
        ...ObjectType_filterFunctionDeclaration.call(this).toList(),
        ...ObjectType_filterTypeDeclaration.call(this).toList(),
        ...ObjectType_focusSparqlConstructTriplesFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_focusSparqlWherePatternsFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_fromJsonFunctionDeclaration.call(this).toList(),
        ...ObjectType_fromRdfResourceFunctionDeclaration.call(this).toList(),
        ...ObjectType_fromRdfResourceValuesFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_fromRdfTypeVariableStatement.call(this).toList(),
        ...ObjectType_isTypeFunctionDeclaration.call(this).toList(),
        ...ObjectType_schemaVariableStatement.call(this).toList(),
        ...ObjectType_sparqlConstructQueryFunctionDeclaration.call({
          name,
          configuration: this.configuration,
          filterType: this.filterType,
          reusables: this.reusables,
        }).toList(),
        ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
          name,
          configuration: this.configuration,
          filterType: this.filterType,
          reusables: this.reusables,
        }).toList(),
        ...ObjectType_toJsonFunctionDeclaration.call(this).toList(),
        ...ObjectType_toRdfResourceFunctionDeclaration.call(this).toList(),
        ...ObjectType_toStringFunctionDeclarations.call(this),
        ...ObjectType_valueSparqlConstructTriplesFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_valueSparqlWherePatternsFunctionDeclaration.call(
          this,
        ).toList(),
      );

      if (staticModuleDeclarations.length > 0) {
        declarations.push(code`\
export namespace ${def(name)} {
${joinCode(staticModuleDeclarations, { on: "\n\n" })}
}`);
      }
    }

    if (declarations.length === 0) {
      return Maybe.empty();
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`${this.name.unsafeCoerce()}.equals`;
  }

  @Memoize()
  get expression(): Code {
    return code`${this.name.unsafeCoerce()}`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.name.unsafeCoerce()}.filter`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.name.unsafeCoerce()}.Filter`;
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.fromRdfType.map(
      () => code`${this.name.unsafeCoerce()}.fromRdfType`,
    );
  }

  @Memoize()
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this.name.unsafeCoerce()}.GraphQL`,
      this.reusables,
    );
  }

  @Memoize()
  override get hashFunction(): Code {
    return code`${this.name.unsafeCoerce()}.hash`;
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
    return code`${this.name.unsafeCoerce()}.schema`;
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
    return code`${this.reusables.imports.Resource}${this.identifierType.kind === "Iri" ? code`<${this.reusables.imports.NamedNode}>` : ""}`;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`${this.name.unsafeCoerce()}.valueSparqlConstructTriples`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.name.unsafeCoerce()}.valueSparqlWherePatterns`;
  }

  @Memoize()
  protected get thisVariable(): Code {
    return code`_${camelCase(this.name.unsafeCoerce())}`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.name.unsafeCoerce()}.fromJson(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const {
      resourceValues: resourceValuesVariable,
      ...fromRdfResourceValuesOptionsTemp
    } = variables;
    const fromRdfResourceValuesOptions: Record<string, boolean | Code> =
      fromRdfResourceValuesOptionsTemp;
    if (!this.configuration.features.has("ObjectSet")) {
      delete fromRdfResourceValuesOptions["objectSet"];
    }
    return code`${this.name.unsafeCoerce()}.fromRdfResourceValues(${resourceValuesVariable}, ${fromRdfResourceValuesOptions})`;
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
    let expression = code`${this.name.unsafeCoerce()}.Json.schema()`;
    if (
      context === "property" &&
      this.properties.some((property) => property.recursive)
    ) {
      expression = code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.name.unsafeCoerce()}.Json> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return new AbstractType.JsonType(code`${this.name.unsafeCoerce()}.Json`);
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name.unsafeCoerce()}.Json.uiSchema({ scopePrefix: ${variables.scopePrefix} })`,
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.unsafeCoerce()}.toJson(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    return code`[${this.name.unsafeCoerce()}.toRdfResource(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name.unsafeCoerce()}.${this.configuration.syntheticNamePrefix}toString(${variables.value})`;
  }

  private readonly lazyProperties: (
    namedObjectType: ObjectType,
  ) => readonly ObjectType.Property[];
}

export namespace ObjectType {
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
