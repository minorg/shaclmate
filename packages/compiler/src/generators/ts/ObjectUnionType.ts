import { camelCase } from "change-case";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import { objectSetMethodNames } from "./_ObjectType/objectSetMethodNames.js";
import * as _ObjectUnionType from "./_ObjectUnionType/index.js";
import { AbstractDeclaredType } from "./AbstractDeclaredType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectType } from "./ObjectType.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { StaticModuleStatementStructure } from "./StaticModuleStatementStructure.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { tsComment } from "./tsComment.js";

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
  readonly memberTypes: readonly _ObjectUnionType.MemberType[];
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
        new _ObjectUnionType.MemberType({
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
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: this.name,
      },
    ];
  }

  override get declarationImports(): readonly Import[] {
    return this.memberTypes.flatMap((memberType) => memberType.useImports());
  }

  get declarations() {
    const declarations: (
      | ModuleDeclarationStructure
      | TypeAliasDeclarationStructure
    )[] = [this.typeAliasDeclaration];

    const staticModuleStatements: StaticModuleStatementStructure[] = [
      ..._ObjectUnionType.equalsFunctionDeclaration.bind(this)().toList(),
      _ObjectUnionType.filterFunctionDeclaration.bind(this)(),
      _ObjectUnionType.filterTypeDeclaration.bind(this)(),
      ..._ObjectUnionType.graphqlTypeVariableStatement.bind(this)().toList(),
      ..._ObjectUnionType.hashFunctionDeclaration.bind(this)().toList(),
      ..._ObjectUnionType.identifierTypeDeclarations.bind(this)(),
      ..._ObjectUnionType.jsonDeclarations.bind(this)(),
      ..._ObjectUnionType.isTypeFunctionDeclaration.bind(this)().toList(),
      _ObjectUnionType.schemaVariableStatement.bind(this)(),
      ..._ObjectUnionType.rdfFunctionDeclarations.bind(this)(),
      ..._ObjectUnionType.sparqlFunctionDeclarations.bind(this)(),
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
  override get discriminantProperty(): Maybe<AbstractDeclaredType.DiscriminantProperty> {
    return Maybe.of(this._discriminantProperty);
  }

  @Memoize()
  override get equalsFunction(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}equals`;
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
  override get graphqlType(): AbstractDeclaredType.GraphqlType {
    return new AbstractDeclaredType.GraphqlType(
      `${this.staticModuleName}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierTypeAlias(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
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
  override get schema(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}schema`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `(({ propertyPatterns, ...otherParameters }) => [...propertyPatterns, ${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(otherParameters)])`;
  }

  get staticModuleName() {
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
  protected get concreteMemberTypes(): readonly _ObjectUnionType.MemberType[] {
    return this.memberTypes.filter((memberType) => !memberType.abstract);
  }

  @Memoize()
  protected get thisVariable(): string {
    return `_${camelCase(this.name)}`;
  }

  private get typeAliasDeclaration(): TypeAliasDeclarationStructure {
    return {
      isExported: true,
      leadingTrivia: this.comment.alt(this.label).map(tsComment).extract(),
      kind: StructureKind.TypeAlias,
      name: this.name,
      type: this.memberTypes.map((memberType) => memberType.name).join(" | "),
    };
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
    // Don't ignoreRdfType, we may need it to distinguish the union members
    return `${variables.resourceValues}.chain(values => values.chainMap(value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { context: ${variables.context}, ignoreRdfType: false, objectSet: ${variables.objectSet}, preferredLanguages: ${variables.preferredLanguages} }))))`;
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
    return [
      `${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
    ];
  }

  @Memoize()
  override jsonType(): AbstractDeclaredType.JsonType {
    return new AbstractDeclaredType.JsonType(
      this.memberTypes
        .map((memberType) => memberType.jsonType().name)
        .join(" | "),
    );
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    context,
    variables,
  }: Parameters<AbstractDeclaredType["jsonZodSchema"]>[0]): ReturnType<
    AbstractDeclaredType["jsonZodSchema"]
  > {
    const expression = `${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
    for (const memberType of this.memberTypes) {
      if (
        context === "property" &&
        memberType.properties.some((property) => property.recursive)
      ) {
        return `${variables.zod}.lazy((): ${variables.zod}.ZodType<${this.staticModuleName}.${syntheticNamePrefix}Json> => ${expression})`;
      }
    }
    return expression;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractDeclaredType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    const { recursionStack } = parameters;
    if (recursionStack.some((type) => Object.is(type, this))) {
      return {};
    }
    recursionStack.push(this);
    const snippetDeclarations = this.memberTypes.reduce(
      (snippetDeclarations, memberType) =>
        mergeSnippetDeclarations(
          snippetDeclarations,
          memberType.snippetDeclarations(parameters),
        ),
      {} as Record<string, SnippetDeclaration>,
    );
    invariant(Object.is(recursionStack.pop(), this));
    return snippetDeclarations;
  }

  override sparqlConstructTriples({
    variables,
  }: Parameters<
    AbstractDeclaredType["sparqlConstructTriples"]
  >[0]): readonly string[] {
    return [
      `...${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${objectInitializer(
        {
          subject: variables.valueVariable,
          variablePrefix: variables.variablePrefix,
        },
      )})`,
    ];
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toJsonExpression"]>[0]): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractDeclaredType["toRdfExpression"]>[0]): string {
    return `[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, ${objectInitializer({ mutateGraph: variables.mutateGraph, resourceSet: variables.resourceSet })}).identifier]`;
  }

  override useImports(): readonly Import[] {
    return [];
  }
}
