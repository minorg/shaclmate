import type { NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { DiscriminantProperty as _DiscriminantProperty } from "./_ObjectType/DiscriminantProperty.js";
import { IdentifierProperty as _IdentifierProperty } from "./_ObjectType/IdentifierProperty.js";
import { ObjectType_createFunctionExpression } from "./_ObjectType/ObjectType_createFunctionExpression.js";
import { ObjectType_equalsFunctionExpression } from "./_ObjectType/ObjectType_equalsFunctionExpression.js";
import { ObjectType_filterFunctionExpression } from "./_ObjectType/ObjectType_filterFunctionExpression.js";
import { ObjectType_filterTypeExpression } from "./_ObjectType/ObjectType_filterTypeExpression.js";
import { ObjectType_focusSparqlConstructTriplesFunctionExpression } from "./_ObjectType/ObjectType_focusSparqlConstructTriplesFunctionExpression.js";
import { ObjectType_focusSparqlWherePatternsFunctionExpression } from "./_ObjectType/ObjectType_focusSparqlWherePatternsFunctionExpression.js";
import { ObjectType_fromJsonFunctionExpression } from "./_ObjectType/ObjectType_fromJsonFunctionExpression.js";
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
import { ObjectType_schemaExpression } from "./_ObjectType/ObjectType_schemaExpression.js";
import { ObjectType_schemaTypeExpression } from "./_ObjectType/ObjectType_schemaTypeExpression.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { ObjectType_toJsonFunctionExpression } from "./_ObjectType/ObjectType_toJsonFunctionExpression.js";
import { ObjectType_toRdfResourceFunctionExpression } from "./_ObjectType/ObjectType_toRdfResourceFunctionExpression.js";
import { ObjectType_toStringFunctionExpression } from "./_ObjectType/ObjectType_toStringFunctionExpression.js";
import { ObjectType_toStringRecordFunctionExpression } from "./_ObjectType/ObjectType_toStringRecordFunctionExpression.js";
import { ObjectType_valueSparqlConstructTriplesFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlConstructTriplesFunctionExpression.js";
import { ObjectType_valueSparqlWherePatternsFunctionExpression } from "./_ObjectType/ObjectType_valueSparqlWherePatternsFunctionExpression.js";
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

      // create
      if (this.configuration.features.has("Object.create")) {
        staticModuleDeclarations.push(
          code`export const create: (${this.constructorParameters.signature}) => ${this.reusables.imports.Either}<Error, ${this.expression}> = ${ObjectType_createFunctionExpression.call(this)};`,
          code`export function createUnsafe(${this.constructorParameters.signature}): ${this.expression} {
  return create(parameters).unsafeCoerce();
}`,
        );
      }

      // equals
      if (this.configuration.features.has("Object.equals")) {
        staticModuleDeclarations.push(
          code`export const equals: (left: ${this.expression}, right: ${this.expression}) => ${this.reusables.snippets.EqualsResult} = ${ObjectType_equalsFunctionExpression.call(this)};`,
        );
      }

      // Filter / filter
      if (this.configuration.features.has("Object.filter")) {
        staticModuleDeclarations.push(
          code`export type Filter = ${ObjectType_filterTypeExpression.call(this)};`,
        );

        staticModuleDeclarations.push(
          code`export const filter: (filter: ${this.filterType}, value: ${this.expression}) => boolean = ${ObjectType_filterFunctionExpression.call(this)};`,
        );
      }

      // GraphQL
      if (this.configuration.features.has("GraphQL") && !this.synthetic) {
        staticModuleDeclarations.push(
          code`export const GraphQL = ${ObjectType_graphqlTypeExpression.call(this)};`,
        );
      }

      // focusSparqlConstructTriples / focusSparqlWherePatterns
      if (this.configuration.features.has("Object.SPARQL")) {
        staticModuleDeclarations.push(
          code`export const focusSparqlConstructTriples: ${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}> = ${ObjectType_focusSparqlConstructTriplesFunctionExpression.call(this)};`,
          code`export const focusSparqlWherePatterns: ${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}> = ${ObjectType_focusSparqlWherePatternsFunctionExpression.call(this)};`,
        );
      }

      // fromJson
      if (this.configuration.features.has("Object.fromJson")) {
        staticModuleDeclarations.push(
          code`export const fromJson: (json: ${this.jsonType().expression}) => ${this.reusables.imports.Either}<Error, ${this.expression}> = ${ObjectType_fromJsonFunctionExpression.call(this)};`,
        );
      }

      // fromRdfResource / fromRdfResourceValues
      if (this.configuration.features.has("Object.fromRdf")) {
        staticModuleDeclarations.push(
          code`export const _fromRdfResource: ${this.reusables.snippets._FromRdfResourceFunction}<${this.expression}> = ${ObjectType_fromRdfResourceFunctionExpression.call(this)};`,
          code`export const fromRdfResource = ${this.reusables.snippets.wrap_FromRdfResourceFunction}(_fromRdfResource);`,
          code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}> = 
  (values, options) => values.chainMap(value => value.toResource().chain(resource => fromRdfResource(resource, options)));`,
        );
      }

      // hash
      if (this.configuration.features.has("Object.hash")) {
        staticModuleDeclarations.push(
          code`export const hash = ${ObjectType_hashFunctionExpression.call(this)};`,
        );
      }

      // Identifier
      if (this.configuration.features.has("Object.type")) {
        staticModuleDeclarations = staticModuleDeclarations.concat(
          ObjectType_identifierTypeDeclarations.call(this),
        );
      }

      // isType
      staticModuleDeclarations = staticModuleDeclarations.concat(
        ObjectType_isTypeFunctionDeclaration.call(this).toList(),
      );

      // type Json
      if (this.configuration.features.has("Object.JSON.type")) {
        staticModuleDeclarations.push(
          code`export type Json = ${ObjectType_jsonTypeExpression.call(this)}`,
        );
      }

      // namespace Json
      {
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
      }

      // schema / Schema
      if (this.configuration.features.has("Object.schema")) {
        staticModuleDeclarations.push(
          code`export const schema = ${ObjectType_schemaExpression.call(this)};`,
          code`export type Schema = typeof schema;`,
        );
      }

      // sparqlConstructQuery / sparqlConstructQueryString
      if (this.configuration.features.has("Object.SPARQL")) {
        staticModuleDeclarations.push(
          ObjectType_sparqlConstructQueryFunctionDeclaration.call({
            name,
            configuration: this.configuration,
            filterType: this.filterType,
            reusables: this.reusables,
          }),
          ObjectType_sparqlConstructQueryStringFunctionDeclaration.call({
            name,
            configuration: this.configuration,
            filterType: this.filterType,
            reusables: this.reusables,
          }),
        );
      }

      // toJson
      if (this.configuration.features.has("Object.toJson")) {
        staticModuleDeclarations.push(
          code`export const toJson: (${this.thisVariable}: ${this.expression}) => ${this.jsonType().expression} = ${ObjectType_toJsonFunctionExpression.call(this)};`,
        );
      }

      // toRdfResource
      if (this.configuration.features.has("Object.toRdf")) {
        staticModuleDeclarations.push(
          code`export const _toRdfResource: ${this.reusables.snippets._ToRdfResourceFunction}<${this.identifierTypeAlias}, ${this.expression}> = ${ObjectType_toRdfResourceFunctionExpression.call(this)};`,
          code`export const toRdfResource = ${this.reusables.snippets.wrap_ToRdfResourceFunction}(_toRdfResource);`,
        );
      }

      // toString / toStringRecord
      if (this.configuration.features.has("Object.toString")) {
        staticModuleDeclarations.push(
          code`export const ${this.configuration.syntheticNamePrefix}toString: (${this.thisVariable}: ${this.expression}) => string = ${ObjectType_toStringFunctionExpression.call(this)};`,
          code`export const toStringRecord: (${this.thisVariable}: ${this.expression}) => Record<string, string> = ${ObjectType_toStringRecordFunctionExpression.call(this)};`,
        );
      }

      // valueSparqlConstructTriples / valueSparqlWherePatterns
      if (this.configuration.features.has("Object.SPARQL")) {
        staticModuleDeclarations.push(
          code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${ObjectType_valueSparqlConstructTriplesFunctionExpression.call(this)};`,
          code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${ObjectType_valueSparqlWherePatternsFunctionExpression.call(this)};`,
        );
      }

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
    return this.fromRdfType.map((fromRdfType) =>
      this.name
        .map((name) => code`${name}.schema.fromRdfType`)
        .orDefault(this.rdfjsTermExpression(fromRdfType)),
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

  @Memoize()
  override get schema(): Code {
    return this.name
      .map((name) => code`${name}.schema`)
      .orDefault(ObjectType_schemaExpression.call(this));
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map((name) => code`${name}.Schema`)
      .orDefault(ObjectType_schemaTypeExpression.call(this));
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
    return this.name
      .map((name) => code`${name}.valueSparqlConstructTriples`)
      .orDefault(
        ObjectType_valueSparqlConstructTriplesFunctionExpression.call(this),
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(
        ObjectType_valueSparqlWherePatternsFunctionExpression.call(this),
      );
  }

  @Memoize()
  protected get constructorParameters(): {
    hasQuestionToken: boolean;
    signature: Code;
    variable: string;
  } {
    let hasQuestionToken: boolean = true;
    const propertySignatures: Code[] = [];
    for (const property of this.properties) {
      property.constructorParameter.ifJust((propertyConstructorParameter) => {
        hasQuestionToken =
          hasQuestionToken && propertyConstructorParameter.hasQuestionToken;
        propertySignatures.push(propertyConstructorParameter.signature);
      });
    }
    invariant(propertySignatures.length > 0);

    return {
      hasQuestionToken,
      signature: code`parameters${hasQuestionToken ? "?" : ""}: { ${joinCode(propertySignatures)} }`,
      variable: "parameters",
    };
  }

  @Memoize()
  protected get createFunction(): Code {
    return this.name
      .map((name) => code`${name}.create`)
      .orDefault(ObjectType_createFunctionExpression.call(this));
  }

  @Memoize()
  protected get thisVariable(): Code {
    return this.name
      .map((name) => code`_${camelCase(name)}`)
      .orDefault(code`_object`);
  }

  @Memoize()
  protected get toJsonFunction(): Code {
    return this.name
      .map((name) => code`${name}.toJson`)
      .orDefault(ObjectType_toJsonFunctionExpression.call(this));
  }

  @Memoize()
  protected get toStringFunction(): Code {
    return this.name
      .map(
        (name) =>
          code`${name}.${this.configuration.syntheticNamePrefix}toString`,
      )
      .orDefault(ObjectType_toStringFunctionExpression.call(this));
  }

  private get inlineExpression(): Code {
    return code`{ ${joinCode(
      this.properties.map((property) => property.declaration),
      { on: "\n\n" },
    )} }`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    // Assumes the JSON object has been recursively validated already.
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(ObjectType_fromJsonFunctionExpression.call(this))}(${variables.value})`;
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
          expression = code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${name}.Json> => ${expression})`;
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
    const toJsonFunction = this.name
      .map((name) => code`${name}.toJson`)
      .orDefault(ObjectType_toJsonFunctionExpression.call(this));
    return code`${toJsonFunction}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const toRdfResourceFunction = this.name
      .map((name) => code`${name}.toRdfResource`)
      .orDefault(
        code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${this.identifierType.expression}, ${this.expression}>(${ObjectType_toRdfResourceFunctionExpression.call(this)})`,
      );
    return code`[${toRdfResourceFunction}(${variables.value}, { graph: ${variables.graph}, resourceSet: ${variables.resourceSet} }).identifier]`;
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

  protected toStringRecordExpression({
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
