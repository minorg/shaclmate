import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { DiscriminantProperty as _DiscriminantProperty } from "./_ObjectType/DiscriminantProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { ObjectType_createFunctionDeclaration } from "./_ObjectType/ObjectType_createFunctionDeclaration.js";
import { ObjectType_equalsFunctionExpression } from "./_ObjectType/ObjectType_equalsFunctionExpression.js";
import { ObjectType_filterFunctionExpression } from "./_ObjectType/ObjectType_filterFunctionExpression.js";
import { ObjectType_filterTypeExpression } from "./_ObjectType/ObjectType_filterTypeExpression.js";
import { ObjectType_focusSparqlConstructTriplesFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunctionDeclaration.js";
import { ObjectType_focusSparqlWherePatternsFunctionDeclaration } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunctionDeclaration.js";
import { ObjectType_fromJsonFunctionDeclaration } from "./_ObjectType/ObjectType_fromJsonFunctionDeclaration.js";
import { ObjectType_fromRdfResourceFunctionExpression } from "./_ObjectType/ObjectType_fromRdfResourceFunctionExpression.js";
import { ObjectType_graphqlTypeExpression } from "./_ObjectType/ObjectType_graphqlTypeExpression.js";
import { ObjectType_hashFunctionExpression } from "./_ObjectType/ObjectType_hashFunctionExpression.js";
import { ObjectType_identifierTypeDeclarations } from "./_ObjectType/ObjectType_identifierTypeDeclarations.js";
import { ObjectType_isTypeFunctionDeclaration } from "./_ObjectType/ObjectType_isTypeFunctionDeclaration.js";
import { ObjectType_jsonParseFunctionDeclaration } from "./_ObjectType/ObjectType_jsonParseFunctionDeclaration.js";
import { ObjectType_jsonSchemaExpression } from "./_ObjectType/ObjectType_jsonSchemaExpression.js";
import { ObjectType_jsonTypeExpression } from "./_ObjectType/ObjectType_jsonTypeExpression.js";
import { ObjectType_jsonUiSchemaFunctionExpression } from "./_ObjectType/ObjectType_jsonUiSchemaFunctionExpression.js";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_schemaVariableStatement } from "./_ObjectType/ObjectType_schemaVariableStatement.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { ObjectType_toJsonFunctionDeclaration } from "./_ObjectType/ObjectType_toJsonFunctionDeclaration.js";
import { ObjectType_toRdfResourceFunctionDeclaration } from "./_ObjectType/ObjectType_toRdfResourceFunctionDeclaration.js";
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
import { tsComment } from "./tsComment.js";

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

  @Memoize()
  get referencesNamedType(): boolean {
    return (
      this.name.isJust() ||
      this.properties.some((property) => {
        switch (property.kind) {
          case "Identifier":
          case "Shacl":
            return property.type.referencesNamedType;
          default:
            return false;
        }
      })
    );
  }

  private get inlineExpression(): Code {
    return code`{ ${joinCode(
      this.properties.map((property) => property.declaration),
      { on: "\n\n" },
    )} }`;
  }

  override get declaration(): Maybe<Code> {
    const name = this.name.extract();
    if (!name) {
      return Maybe.empty();
    }

    const declarations: Code[] = [];

    if (!this.extern) {
      if (this.configuration.features.has("Object.type")) {
        declarations.push(code`\
 ${this.comment
   .alt(this.label)
   .map(tsComment)
   .orDefault("")}export type ${name} = ${this.inlineExpression};`);
      }

      let staticModuleDeclarations: Code[] = [];

      if (this.configuration.features.has("Object.create")) {
        staticModuleDeclarations.push(
          ObjectType_createFunctionDeclaration.call(this),
        );
      }

      if (this.configuration.features.has("Object.equals")) {
        staticModuleDeclarations.push(
          code`export const equals = ${ObjectType_equalsFunctionExpression.call(this)};`,
        );
      }

      if (this.configuration.features.has("Object.filter")) {
        staticModuleDeclarations.push(
          code`export type Filter = ${ObjectType_filterTypeExpression.call(this)};`,
        );

        staticModuleDeclarations.push(
          code`export const filter = ${ObjectType_filterFunctionExpression.call(this)};`,
        );
      }

      if (this.configuration.features.has("GraphQL") && !this.synthetic) {
        staticModuleDeclarations.push(
          code`export const GraphQL = ${ObjectType_graphqlTypeExpression.call(this)};`,
        );
      }

      if (this.configuration.features.has("Object.fromRdf")) {
        staticModuleDeclarations.push(code`
export const _fromRdfResource = ${ObjectType_fromRdfResourceFunctionExpression.call(this)};         
export const fromRdfResource = ${this.reusables.snippets.wrap_FromRdfResourceFunction}(_fromRdfResource);

export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}> = 
  (values, options) => values.chainMap(value => value.toResource().chain(resource => fromRdfResource(resource, options)));`);
      }

      if (this.configuration.features.has("Object.hash")) {
        staticModuleDeclarations.push(
          code`export const hash = ${ObjectType_hashFunctionExpression.call(this)};`,
        );
      }

      if (this.configuration.features.has("Object.type")) {
        // Identifier
        staticModuleDeclarations = staticModuleDeclarations.concat(
          ObjectType_identifierTypeDeclarations.call(this),
        );
      }

      if (this.configuration.features.has("Object.JSON.type")) {
        staticModuleDeclarations.push(
          code`export type Json = ${ObjectType_jsonTypeExpression.call(this)}`,
        );
      }

      const jsonModuleDeclarations: Code[] = [];
      if (this.configuration.features.has("Object.JSON.parse")) {
        jsonModuleDeclarations.push(
          ObjectType_jsonParseFunctionDeclaration.call(this),
        );
      }
      if (this.configuration.features.has("Object.JSON.schema")) {
        jsonModuleDeclarations.push(
          code`export function schema() { return ${ObjectType_jsonSchemaExpression.call(this)} satisfies ${this.reusables.imports.z}.ZodType<Json>; }`,
        );
      }
      if (this.configuration.features.has("Object.JSON.uiSchema")) {
        jsonModuleDeclarations.push(
          code`export const uiSchema = ${ObjectType_jsonUiSchemaFunctionExpression.call(this)};`,
        );
      }
      if (jsonModuleDeclarations.length > 0) {
        staticModuleDeclarations.push(
          code`export namespace Json { ${joinCode(jsonModuleDeclarations, { on: "\n\n" })} }`,
        );
      }

      //   ...ObjectType_jsonParseFunctionDeclaration.call(this).toList(),
      //   ...ObjectType_jsonSchemaFunctionDeclaration.call(this).toList(),
      //   ...ObjectType_jsonUiSchemaFunctionDeclaration.call(this).toList(),
      // ];

      if (this.configuration.features.has("Object.toString")) {
        staticModuleDeclarations.push(
          code`export const ${this.configuration.syntheticNamePrefix}toString = (${this.thisVariable}: ${this.expression}): string => \`\${${name}(JSON.stringify(toStringRecord(${this.thisVariable}))}\`;`,
        );
        staticModuleDeclarations.push(
          code`export const toStringRecord = (${this.thisVariable}: ${this.expression}): string => ${this.toStringRecordExpression({ variables: { value: this.thisVariable } })};`,
        );
      }

      staticModuleDeclarations.push(
        ...ObjectType_focusSparqlConstructTriplesFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_focusSparqlWherePatternsFunctionDeclaration.call(
          this,
        ).toList(),
        ...ObjectType_fromJsonFunctionDeclaration.call(this).toList(),
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
    return this.name
      .map((name) => code`${name}.equals`)
      .orDefault(ObjectType_equalsFunctionExpression.call(this));
  }

  @Memoize()
  get expression(): Code {
    return this.name
      .map((name) => code`${name}`)
      .orDefault(this.inlineExpression);
  }

  @Memoize()
  get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(ObjectType_filterFunctionExpression.call(this));
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(ObjectType_filterTypeExpression.call(this));
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefault(
        code`((values, options) => values.chainMap(value => value.toResource().chain(resource => ${ObjectType_fromRdfResourceFunctionExpression.call(this)}(resource, options))))`,
      );
  }

  @Memoize()
  get fromRdfTypeVariable(): Maybe<Code> {
    return this.fromRdfType.map(
      () => code`${this.name.unsafeCoerce()}.schema.fromRdfType`,
    );
  }

  @Memoize()
  get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      this.name
        .map((name) => code`${name}.GraphQL`)
        .orDefault(ObjectType_graphqlTypeExpression.call(this)),
      this.reusables,
    );
  }

  @Memoize()
  override get hashFunction(): Code {
    return this.name
      .map((name) => code`${name}.hash`)
      .orDefault(ObjectType_hashFunctionExpression.call(this));
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
    invariant(
      properties.length > 0,
      `${this.name.extract()}: empty properties`,
    );
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
    return this.name
      .map((name) => {
        let expression = code`${name}.Json.schema()`;
        if (
          context === "property" &&
          this.properties.some((property) => property.recursive)
        ) {
          expression = code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.name.unsafeCoerce()}.Json> => ${expression})`;
        }
        return expression;
      })
      .orDefault(ObjectType_jsonSchemaExpression.call(this));
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return new AbstractType.JsonType(
      this.name
        .map((name) => code`${name}.Json`)
        .orDefault(ObjectType_jsonTypeExpression.call(this)),
    );
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<AbstractType["jsonUiSchemaElement"]>[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.name
        .map((name) => code`${name}.Json.uiSchema`)
        .orDefault(
          ObjectType_jsonUiSchemaFunctionExpression.call(this),
        )}({ scopePrefix: ${variables.scopePrefix} })`,
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
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toString(${variables.value})`,
      )
      .orDefault(
        code`JSON.stringify(${this.toStringRecordExpression({ variables })})`,
      );
  }

  private toStringRecordExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.reusables.snippets.compactRecord}({${joinCode(
      this.properties.flatMap((property) =>
        property
          .toStringInitializer({
            variables: {
              value: property.accessExpression({
                variables: { object: variables.value },
              }),
            },
          })
          .toList(),
      ),
      { on: "," },
    )}})`;
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
