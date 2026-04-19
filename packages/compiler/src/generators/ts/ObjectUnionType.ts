import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { ObjectType_objectSetMethodNames } from "./_ObjectType/ObjectType_objectSetMethodNames.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";
import { MemberType } from "./_ObjectUnionType/MemberType.js";
import { ObjectUnionType_equalsFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_equalsFunctionDeclaration.js";
import { ObjectUnionType_filterFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_filterFunctionDeclaration.js";
import { ObjectUnionType_filterTypeDeclaration } from "./_ObjectUnionType/ObjectUnionType_filterTypeDeclaration.js";
import { ObjectUnionType_fromJsonFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_fromJsonFunctionDeclaration.js";
import { ObjectUnionType_fromRdfFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_fromRdfFunctionDeclarations.js";
import { ObjectUnionType_graphqlTypeVariableStatement } from "./_ObjectUnionType/ObjectUnionType_graphqlTypeVariableStatement.js";
import { ObjectUnionType_hashFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_hashFunctionDeclaration.js";
import { ObjectUnionType_identifierTypeDeclarations } from "./_ObjectUnionType/ObjectUnionType_identifierTypeDeclarations.js";
import { ObjectUnionType_isTypeFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_isTypeFunctionDeclaration.js";
import { ObjectUnionType_jsonTypeAliasDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonTypeAliasDeclaration.js";
import { ObjectUnionType_jsonZodSchemaFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonZodSchemaFunctionDeclaration.js";
import { ObjectUnionType_schemaVariableStatement } from "./_ObjectUnionType/ObjectUnionType_schemaVariableStatement.js";
import { ObjectUnionType_sparqlConstructTriplesFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_sparqlConstructTriplesFunctionDeclaration.js";
import { ObjectUnionType_sparqlWherePatternsFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_sparqlWherePatternsFunctionDeclaration.js";
import { ObjectUnionType_toJsonFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_toJsonFunctionDeclaration.js";
import { ObjectUnionType_toRdfFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_toRdfFunctionDeclarations.js";
import { ObjectUnionType_typeAliasDeclaration } from "./_ObjectUnionType/ObjectUnionType_typeAliasDeclaration.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, def, joinCode } from "./ts-poet-wrapper.js";

/**
 * A union of object types, generated as a type alias
 *
 *   type SomeUnion = Member1 | Member2 | ...
 *
 * with associated functions that switch on the type discriminant property and delegate to the appropriate
 * member type code.
 *
 * It also generates SPARQL graph patterns that UNION the member object types.
 */
export class ObjectUnionType extends AbstractDeclaredType {
  override readonly graphqlArgs: AbstractDeclaredType["graphqlArgs"] =
    Maybe.empty();
  readonly identifierType: BlankNodeType | IdentifierType | IriType;
  override readonly kind = "ObjectUnionType";
  readonly memberTypes: readonly MemberType[];
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    identifierType,
    memberTypes,
    ...superParameters
  }: ConstructorParameters<typeof AbstractDeclaredType>[0] & {
    comment: Maybe<string>;
    export_: boolean;
    identifierType: BlankNodeType | IdentifierType | IriType;
    label: Maybe<string>;
    memberTypes: readonly ObjectType[];
    name: string;
  }) {
    super(superParameters);
    this.identifierType = identifierType;
    invariant(
      memberTypes.length > 0,
      "ObjectUnionType memberTypes array is empty",
    );
    this.memberTypes = memberTypes.map(
      (memberType) =>
        new MemberType({
          delegate: memberType,
          universe: memberTypes,
        }),
    );
  }

  @Memoize()
  override get conversions(): readonly AbstractDeclaredType.Conversion[] {
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

  override get declaration(): Code {
    const declarations: Code[] = [
      ObjectUnionType_typeAliasDeclaration.call(this),
    ];

    const staticModuleDeclarations: Code[] = [
      ...ObjectUnionType_graphqlTypeVariableStatement.call(this).toList(),
      ...ObjectUnionType_identifierTypeDeclarations.call(this),
      ...ObjectUnionType_jsonTypeAliasDeclaration.call(this).toList(),
      ...ObjectUnionType_equalsFunctionDeclaration.call(this).toList(),
      ObjectUnionType_filterFunctionDeclaration.call(this),
      ObjectUnionType_filterTypeDeclaration.call(this),
      ...ObjectUnionType_hashFunctionDeclaration.call(this).toList(),
      ...ObjectUnionType_fromJsonFunctionDeclaration.call(this).toList(),
      ...ObjectUnionType_fromRdfFunctionDeclaration.call(this).toList(),
      ...ObjectUnionType_isTypeFunctionDeclaration.call(this).toList(),
      ...ObjectUnionType_jsonZodSchemaFunctionDeclaration.call(this).toList(),
      ObjectUnionType_schemaVariableStatement.call(this),
      ...ObjectType_sparqlConstructQueryFunctionDeclaration.bind(
        this,
      )().toList(),
      ...ObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(
        this,
      )().toList(),
      ...ObjectUnionType_sparqlConstructTriplesFunctionDeclaration.bind(
        this,
      )().toList(),
      ...ObjectUnionType_sparqlWherePatternsFunctionDeclaration.bind(
        this,
      )().toList(),
      ...ObjectUnionType_toJsonFunctionDeclaration.call(this).toList(),
      ...ObjectUnionType_toRdfFunctionDeclaration.call(this).toList(),
    ];

    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(this.staticModuleName)} {
${joinCode(staticModuleDeclarations, { on: "\n\n" })}
}`);
    }

    return joinCode(declarations, { on: "\n\n" });
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractDeclaredType.DiscriminantProperty> {
    return Maybe.of(this._discriminantProperty);
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}equals`;
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
  override get graphqlType(): AbstractDeclaredType.GraphqlType {
    return new AbstractDeclaredType.GraphqlType(
      code`${this.staticModuleName}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierTypeAlias(): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return ObjectType_objectSetMethodNames.call(this);
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
  override get sparqlConstructTriplesFunction(): Code {
    return code`(({ ignoreRdfType, schema, valueVariable, ...otherParameters }: ${snippets.SparqlConstructTriplesFunctionParameters}<${this.filterType}, ${this.schemaType}>) => ${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ ...otherParameters, focusIdentifier: valueVariable, ignoreRdfType: false }))`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`(({ ignoreRdfType, propertyPatterns, schema, valueVariable, ...otherParameters }: ${snippets.SparqlWherePatternsFunctionParameters}<${this.filterType}, ${this.schemaType}>) => (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({  ...otherParameters, focusIdentifier: valueVariable, ignoreRdfType: false })))`;
  }

  get staticModuleName(): string {
    return this.name;
  }

  @Memoize()
  protected get _discriminantProperty(): AbstractDeclaredType.DiscriminantProperty {
    const discriminantPropertyDescendantValues: AbstractDeclaredType.DiscriminantProperty.Value[] =
      [];
    const discriminantPropertyName =
      this.memberTypes[0]._discriminantProperty.name;
    const discriminantPropertyOwnValues: AbstractDeclaredType.DiscriminantProperty.Value[] =
      [];
    for (const memberType of this.memberTypes) {
      // invariant(
      //   memberType.declarationType === this.memberTypes[0].declarationType,
      // );
      invariant(
        memberType._discriminantProperty.name === discriminantPropertyName,
        "ObjectUnionType discriminant property names don't line up",
      );
      discriminantPropertyDescendantValues.push(
        ...memberType._discriminantProperty.descendantValues,
      );
      discriminantPropertyOwnValues.push(
        ...memberType._discriminantProperty.ownValues,
      );
    }
    return {
      descendantValues: discriminantPropertyDescendantValues,
      name: discriminantPropertyName,
      ownValues: discriminantPropertyOwnValues,
    };
  }

  @Memoize()
  protected get concreteMemberTypes(): readonly MemberType[] {
    return this.memberTypes.filter((memberType) => !memberType.abstract);
  }

  @Memoize()
  protected get thisVariable(): Code {
    return code`_${camelCase(this.name)}`;
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
    // Don't ignoreRdfType, we may need it to distinguish the union members
    return code`${variables.resourceValues}.chain(values => values.chainMap(value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { context: ${variables.context}, ignoreRdfType: false, objectSet: ${variables.objectSet}, preferredLanguages: ${variables.preferredLanguages} }))))`;
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
    return [
      code`${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
    ];
  }

  @Memoize()
  override jsonType(): AbstractDeclaredType.JsonType {
    return new AbstractDeclaredType.JsonType(
      joinCode(
        this.memberTypes.map(
          (memberType) => code`${memberType.jsonType().name}`,
        ),
        { on: "|" },
      ),
    );
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    context,
  }: Parameters<AbstractDeclaredType["jsonZodSchema"]>[0]): Code {
    const expression = code`${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
    for (const memberType of this.memberTypes) {
      if (
        context === "property" &&
        memberType.properties.some((property) => property.recursive)
      ) {
        return code`${imports.z}.lazy((): ${imports.z}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
      }
    }
    return expression;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toJsonExpression"]>[0]): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toRdfExpression"]>[0]): Code {
    return code`[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, ${{ graph: variables.graph, resourceSet: variables.resourceSet }}).identifier]`;
  }
}
