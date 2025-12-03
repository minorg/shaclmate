import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { DeclaredType } from "./DeclaredType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { Import } from "./Import.js";
import type { ObjectType } from "./ObjectType.js";
import { StaticModuleStatementStructure } from "./StaticModuleStatementStructure.js";
import { Type } from "./Type.js";
import { objectSetMethodNames } from "./_ObjectType/objectSetMethodNames.js";
import * as _ObjectUnionType from "./_ObjectUnionType/index.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { tsComment } from "./tsComment.js";

/**
 * A union of object types, generated as a type alias
 *
 *   type SomeUnion = Member1 | Member2 | ...
 *
 * with associated functions that switch on the type discriminator property and delegate to the appropriate
 * member type code.
 *
 * It also generates SPARQL graph patterns that UNION the member object types.
 */
export class ObjectUnionType extends DeclaredType {
  protected readonly comment: Maybe<string>;
  protected readonly label: Maybe<string>;

  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();
  readonly identifierType: IdentifierType;
  readonly kind = "ObjectUnionType";
  readonly memberTypes: readonly _ObjectUnionType.MemberType[];
  override readonly typeof = "object";

  constructor({
    comment,
    identifierType,
    label,
    memberTypes,
    ...superParameters
  }: ConstructorParameters<typeof DeclaredType>[0] & {
    comment: Maybe<string>;
    export_: boolean;
    identifierType: IdentifierType;
    label: Maybe<string>;
    memberTypes: readonly ObjectType[];
    name: string;
  }) {
    super(superParameters);
    this.comment = comment;
    this.identifierType = identifierType;
    this.label = label;
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
  override get conversions(): readonly Type.Conversion[] {
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
      ..._ObjectUnionType.graphqlTypeVariableStatement.bind(this)().toList(),
      ..._ObjectUnionType.hashFunctionDeclaration.bind(this)().toList(),
      ..._ObjectUnionType.identifierTypeDeclarations.bind(this)(),
      ..._ObjectUnionType.jsonDeclarations.bind(this)(),
      ..._ObjectUnionType.isTypeFunctionDeclaration.bind(this)().toList(),
      ..._ObjectUnionType.propertiesVariableStatement.bind(this)().toList(),
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
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of(this._discriminatorProperty);
  }

  @Memoize()
  protected get _discriminatorProperty(): Type.DiscriminatorProperty {
    const discriminatorPropertyDescendantValues: string[] = [];
    const discriminatorPropertyName =
      this.memberTypes[0]._discriminatorProperty.name;
    const discriminatorPropertyOwnValues: string[] = [];
    for (const memberType of this.memberTypes) {
      invariant(
        memberType.declarationType === this.memberTypes[0].declarationType,
      );
      invariant(
        memberType._discriminatorProperty.name === discriminatorPropertyName,
      );
      discriminatorPropertyDescendantValues.push(
        ...memberType._discriminatorProperty.descendantValues,
      );
      discriminatorPropertyOwnValues.push(
        ...memberType._discriminatorProperty.ownValues,
      );
    }
    return {
      descendantValues: discriminatorPropertyDescendantValues,
      name: discriminatorPropertyName,
      ownValues: discriminatorPropertyOwnValues,
    };
  }

  @Memoize()
  override get equalsFunction(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}equals`;
  }

  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName(
      `${this.staticModuleName}.${syntheticNamePrefix}GraphQL`,
    );
  }

  @Memoize()
  get identifierTypeAlias(): string {
    return `${this.staticModuleName}.${syntheticNamePrefix}Identifier`;
  }

  @Memoize()
  override jsonName(): Type.JsonName {
    return new Type.JsonName(
      this.memberTypes.map((memberType) => memberType.jsonName).join(" | "),
    );
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  @Memoize()
  get objectSetMethodNames(): ObjectType.ObjectSetMethodNames {
    return objectSetMethodNames.bind(this)();
  }

  get staticModuleName() {
    return this.name;
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
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    // Assumes the JSON object has been recursively validated already.
    return `${this.staticModuleName}.${syntheticNamePrefix}fromJson(${variables.value}).unsafeCoerce()`;
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    // Don't ignoreRdfType, we may need it to distinguish the union members
    return `${variables.resourceValues}.chain(values => values.chainMap(value => value.toResource().chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...${variables.context}, ignoreRdfType: false, objectSet: ${variables.objectSet}, preferredLanguages: ${variables.preferredLanguages} }))))`;
  }

  override graphqlResolveExpression({
    variables,
  }: { variables: { value: string } }): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    switch (this.memberTypes[0].declarationType) {
      case "class":
        return [
          `${variables.value}.${syntheticNamePrefix}hash(${variables.hasher});`,
        ];
      case "interface":
        return [
          `${this.staticModuleName}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
        ];
    }
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    context,
    variables,
  }: Parameters<DeclaredType["jsonZodSchema"]>[0]): ReturnType<
    DeclaredType["jsonZodSchema"]
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
    parameters: Parameters<DeclaredType["snippetDeclarations"]>[0],
  ): readonly string[] {
    const { recursionStack } = parameters;
    if (recursionStack.some((type) => Object.is(type, this))) {
      return [];
    }
    recursionStack.push(this);
    const result = this.memberTypes.flatMap((memberType) =>
      memberType.snippetDeclarations(parameters),
    );
    invariant(Object.is(recursionStack.pop(), this));
    return result;
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return [
          `...${this.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples(${objectInitializer(
            {
              subject: parameters.variables.subject,
              variablePrefix: parameters.variables.variablePrefix,
            },
          )})`,
        ];
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlWherePatterns(parameters);
      case "subject":
        return [
          `...${this.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${objectInitializer(
            {
              preferredLanguages: parameters.variables.preferredLanguages,
              subject: parameters.variables.subject,
              variablePrefix: parameters.variables.variablePrefix,
            },
          )})`,
        ];
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    switch (this.memberTypes[0].declarationType) {
      case "class":
        return `${variables.value}.${syntheticNamePrefix}toJson()`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    const options = `{ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }`;
    switch (this.memberTypes[0].declarationType) {
      case "class":
        return `[${variables.value}.${syntheticNamePrefix}toRdf(${options}).identifier]`;
      case "interface":
        return `[${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, ${options}).identifier]`;
    }
  }

  override useImports(): readonly Import[] {
    return [];
  }
}
