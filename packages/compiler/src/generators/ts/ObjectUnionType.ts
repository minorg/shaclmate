import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { objectSetMethodNames } from "./_ObjectType/objectSetMethodNames.js";
import { equalsFunctionDeclaration } from "./_ObjectUnionType/equalsFunctionDeclaration.js";
import { filterFunctionDeclaration } from "./_ObjectUnionType/filterFunctionDeclaration.js";
import { filterTypeDeclaration } from "./_ObjectUnionType/filterTypeDeclaration.js";
import { graphqlTypeVariableStatement } from "./_ObjectUnionType/graphqlTypeVariableStatement.js";
import { hashFunctionDeclaration } from "./_ObjectUnionType/hashFunctionDeclaration.js";
import { identifierTypeDeclarations } from "./_ObjectUnionType/identifierTypeDeclarations.js";
import { isTypeFunctionDeclaration } from "./_ObjectUnionType/isTypeFunctionDeclaration.js";
import { jsonFunctionDeclarations } from "./_ObjectUnionType/jsonFunctionDeclarations.js";
import { jsonTypeAliasDeclaration } from "./_ObjectUnionType/jsonTypeAliasDeclaration.js";
import { MemberType } from "./_ObjectUnionType/MemberType.js";
import { rdfFunctionDeclarations } from "./_ObjectUnionType/rdfFunctionDeclarations.js";
import { schemaVariableStatement } from "./_ObjectUnionType/schemaVariableStatement.js";
import { sparqlFunctionDeclarations } from "./_ObjectUnionType/sparqlFunctionDeclarations.js";
import { typeAliasDeclaration } from "./_ObjectUnionType/typeAliasDeclaration.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import { imports } from "./imports.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectType } from "./ObjectType.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

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
  readonly identifierType: BlankNodeType | IdentifierType | NamedNodeType;
  readonly kind = "ObjectUnionType";
  readonly memberTypes: readonly MemberType[];
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    identifierType,
    memberTypes,
    ...superParameters
  }: ConstructorParameters<typeof AbstractDeclaredType>[0] & {
    comment: Maybe<string>;
    export_: boolean;
    identifierType: BlankNodeType | IdentifierType | NamedNodeType;
    label: Maybe<string>;
    memberTypes: readonly ObjectType[];
    name: string;
  }) {
    super(superParameters);
    this.identifierType = identifierType;
    invariant(memberTypes.length > 0);
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
    const declarations: Code[] = [typeAliasDeclaration.bind(this)()];

    const staticModuleDeclarations: Code[] = [
      ...equalsFunctionDeclaration.bind(this)().toList(),
      filterFunctionDeclaration.bind(this)(),
      filterTypeDeclaration.bind(this)(),
      ...graphqlTypeVariableStatement.bind(this)().toList(),
      ...hashFunctionDeclaration.bind(this)().toList(),
      ...identifierTypeDeclarations.bind(this)(),
      ...jsonFunctionDeclarations.bind(this)(),
      ...jsonTypeAliasDeclaration.bind(this)().toList(),
      ...isTypeFunctionDeclaration.bind(this)().toList(),
      schemaVariableStatement.bind(this)(),
      ...rdfFunctionDeclarations.bind(this)(),
      ...sparqlFunctionDeclarations.bind(this)(),
    ];

    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${this.staticModuleName} {
${joinCode(staticModuleDeclarations)}
}`);
    }

    return joinCode(declarations);
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
    return objectSetMethodNames.bind(this)();
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
    return code`(({ propertyPatterns, valueVariable, ...otherParameters }) => (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ subject: valueVariable, ...otherParameters })))`;
  }

  get staticModuleName(): string {
    return this.name;
  }

  @Memoize()
  protected get _discriminantProperty(): AbstractDeclaredType.DiscriminantProperty {
    const discriminantPropertyDescendantValues: string[] = [];
    const discriminantPropertyName =
      this.memberTypes[0]._discriminantProperty.name;
    const discriminantPropertyOwnValues: string[] = [];
    for (const memberType of this.memberTypes) {
      // invariant(
      //   memberType.declarationType === this.memberTypes[0].declarationType,
      // );
      invariant(
        memberType._discriminantProperty.name === discriminantPropertyName,
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

  override sparqlConstructTriples({
    variables,
  }: Parameters<
    AbstractDeclaredType["sparqlConstructTriples"]
  >[0]): Maybe<Code> {
    return Maybe.of(
      code`${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{
        subject: variables.valueVariable,
        variablePrefix: variables.variablePrefix,
      }})`,
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toJsonExpression"]>[0]): Code {
    return code`${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toRdfExpression"]>[0]): Code {
    return code`[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, ${{ mutateGraph: variables.mutateGraph, resourceSet: variables.resourceSet }}).identifier]`;
  }
}
