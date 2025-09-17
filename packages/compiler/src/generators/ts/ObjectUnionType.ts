import { camelCase, pascalCase } from "change-case";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type FunctionDeclarationStructure,
  type ModuleDeclarationStructure,
  type StatementStructures,
  StructureKind,
  type TypeAliasDeclarationStructure,
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import { DeclaredType } from "./DeclaredType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { Import } from "./Import.js";
import type { ObjectType } from "./ObjectType.js";
import { Type } from "./Type.js";
import { hasherTypeConstraint } from "./_ObjectType/hashFunctionOrMethodDeclarations.js";
import { objectSetMethodNames } from "./_ObjectType/objectSetMethodNames.js";
import { sparqlConstructQueryFunctionDeclaration } from "./_ObjectType/sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "./_ObjectType/sparqlConstructQueryStringFunctionDeclaration.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { tsComment } from "./tsComment.js";

class MemberType {
  private readonly delegate: ObjectType;
  private readonly universe: readonly ObjectType[];

  constructor({
    delegate,
    universe,
  }: { delegate: ObjectType; universe: readonly ObjectType[] }) {
    this.delegate = delegate;
    this.universe = universe;
  }

  get declarationType() {
    return this.delegate.declarationType;
  }

  @Memoize()
  get discriminatorPropertyValues(): readonly string[] {
    // A member type's combined discriminator property values are its "own" values plus any descendant values that are
    // not the "own" values of some other member type.
    // So if you have type A, type B, and B inherits A, then
    // A has
    //   own discriminator property values: ["A"]
    //   descendant discriminator property values: ["B"]
    // and B has
    //  own discriminator property values: ["B"]
    //  descendant discriminator property values ["B"]
    // In this case A shouldn't have "B" as a combined discriminator property value since it's "claimed" by B.
    const memberOwnDiscriminatorPropertyValues = new Set<string>();
    for (const memberType of this.universe) {
      for (const ownDiscriminatorPropertyValue of memberType.discriminatorProperty.unsafeCoerce()
        .ownValues) {
        memberOwnDiscriminatorPropertyValues.add(ownDiscriminatorPropertyValue);
      }
    }

    return this.delegate._discriminatorProperty.ownValues.concat(
      this.delegate._discriminatorProperty.descendantValues.filter(
        (value) => !memberOwnDiscriminatorPropertyValues.has(value),
      ),
    );
  }

  get features() {
    return this.delegate.features;
  }

  get fromRdfType() {
    return this.delegate.fromRdfType;
  }

  get fromRdfTypeVariable() {
    return this.delegate.fromRdfTypeVariable;
  }

  get graphqlName() {
    return this.delegate.graphqlName;
  }

  get identifierTypeAlias() {
    return this.delegate.identifierTypeAlias;
  }

  get jsonName() {
    return this.delegate.jsonName;
  }

  get mutable() {
    return this.delegate.mutable;
  }

  get name() {
    return this.delegate.name;
  }

  get staticModuleName() {
    return this.delegate.staticModuleName;
  }

  get toRdfjsResourceType() {
    return this.delegate.toRdfjsResourceType;
  }

  jsonZodSchema(parameters: Parameters<DeclaredType["jsonZodSchema"]>[0]) {
    return this.delegate.jsonZodSchema(parameters);
  }

  snippetDeclarations(
    parameters: Parameters<DeclaredType["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.delegate.snippetDeclarations(parameters);
  }

  useImports() {
    return this.delegate.useImports();
  }
}

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
  private readonly _discriminatorProperty: Type.DiscriminatorProperty;
  private readonly comment: Maybe<string>;
  private readonly label: Maybe<string>;

  readonly identifierType: IdentifierType;
  readonly kind = "ObjectUnionType";
  readonly memberTypes: readonly MemberType[];
  readonly typeof = "object";

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
    const discriminatorPropertyDescendantValues: string[] = [];
    const discriminatorPropertyName =
      memberTypes[0].discriminatorProperty.unsafeCoerce().name;
    const discriminatorPropertyOwnValues: string[] = [];
    for (const memberType of memberTypes) {
      invariant(memberType.declarationType === memberTypes[0].declarationType);
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
    this._discriminatorProperty = {
      descendantValues: discriminatorPropertyDescendantValues,
      name: discriminatorPropertyName,
      ownValues: discriminatorPropertyOwnValues,
    };
    this.memberTypes = memberTypes.map(
      (memberType) =>
        new MemberType({ delegate: memberType, universe: memberTypes }),
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

    const staticModuleStatements: StatementStructures[] = [
      ...this.equalsFunctionDeclaration.toList(),
      ...this.fromJsonFunctionDeclaration.toList(),
      ...this.fromRdfFunctionDeclaration.toList(),
      ...this.graphqlTypeVariableStatement.toList(),
      ...this.hashFunctionDeclaration.toList(),
      ...this.jsonTypeAliasDeclaration.toList(),
      ...this.jsonZodSchemaFunctionDeclaration.toList(),
      ...this.identifierTypeDeclarations,
      ...this.sparqlFunctionDeclarations,
      ...this.toJsonFunctionDeclaration.toList(),
      ...this.toRdfFunctionDeclaration.toList(),
    ];

    if (staticModuleStatements.length > 0) {
      declarations.push({
        isExported: this.export,
        kind: StructureKind.Module,
        name: this.staticModuleName,
        statements: staticModuleStatements,
      });
    }

    return declarations;
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of(this._discriminatorProperty);
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
  override get jsonName(): Type.JsonName {
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

  private get equalsFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("equals")) {
      return Maybe.empty();
    }

    const caseBlocks = this.memberTypes.map((memberType) => {
      let returnExpression: string;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = `left.${syntheticNamePrefix}equals(right as unknown as ${memberType.name})`;
          break;
        case "interface":
          returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}equals(left, right as unknown as ${memberType.name})`;
          break;
      }
      return `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${returnExpression};`;
    });
    caseBlocks.push(
      'default: left satisfies never; throw new Error("unrecognized type");',
    );

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}equals`,
      parameters: [
        {
          name: "left",
          type: this.name,
        },
        {
          name: "right",
          type: this.name,
        },
      ],
      returnType: `${syntheticNamePrefix}EqualsResult`,
      statements: `\
return ${syntheticNamePrefix}strictEquals(left.${syntheticNamePrefix}type, right.${syntheticNamePrefix}type).chain(() => {
  switch (left.${this._discriminatorProperty.name}) {
   ${caseBlocks.join(" ")}
  }
})`,
    });
  }

  private get fromJsonFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("json")) {
      return Maybe.empty();
    }

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}fromJson`,
      parameters: [
        {
          name: "json",
          type: "unknown",
        },
      ],
      returnType: `purify.Either<zod.ZodError, ${this.name}>`,
      statements: [
        `return ${this.memberTypes.reduce((expression, memberType) => {
          const memberTypeExpression = `(${memberType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
          return expression.length > 0
            ? `${expression}.altLazy(() => ${memberTypeExpression})`
            : memberTypeExpression;
        }, "")};`,
      ],
    });
  }

  private get fromRdfFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("rdf")) {
      return Maybe.empty();
    }

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}fromRdf`,
      parameters: [
        {
          name: "resource",
          type: "rdfjsResource.Resource",
        },
        {
          hasQuestionToken: true,
          name: "options",
          type: `{ [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; objectSet?: ${syntheticNamePrefix}ObjectSet }`,
        },
      ],
      returnType: `purify.Either<Error, ${this.name}>`,
      statements: [
        `return ${this.memberTypes.reduce((expression, memberType) => {
          const memberTypeExpression = `(${memberType.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...options, ignoreRdfType: false }) as purify.Either<Error, ${this.name}>)`;
          return expression.length > 0
            ? `${expression}.altLazy(() => ${memberTypeExpression})`
            : memberTypeExpression;
        }, "")};`,
      ],
    });
  }

  private get graphqlTypeVariableStatement(): Maybe<VariableStatementStructure> {
    if (!this.features.has("graphql")) {
      return Maybe.empty();
    }

    return Maybe.of({
      declarationKind: VariableDeclarationKind.Const,
      kind: StructureKind.VariableStatement,
      declarations: [
        {
          name: `${syntheticNamePrefix}GraphQL`,
          initializer: `new graphql.GraphQLUnionType(${objectInitializer({
            description: this.comment.map(JSON.stringify).extract(),
            name: `"${this.name}"`,
            resolveType: `function (value: ${this.name}) { return value.${syntheticNamePrefix}type; }`,
            types: `[${this.memberTypes.map((memberType) => memberType.graphqlName.nullableName).join(", ")}]`,
          })})`,
        },
      ],
      isExported: true,
    } satisfies VariableStatementStructure);
  }

  private get hashFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("hash")) {
      return Maybe.empty();
    }

    const hasherVariable = "_hasher";

    const caseBlocks = this.memberTypes.map((memberType) => {
      let returnExpression: string;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = `${this.thisVariable}.${syntheticNamePrefix}hash(${hasherVariable})`;
          break;
        case "interface":
          returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}hash(${this.thisVariable}, ${hasherVariable})`;
          break;
      }
      return `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${returnExpression};`;
    });
    caseBlocks.push(
      `default: ${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
    );

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}hash`,
      parameters: [
        {
          name: this.thisVariable,
          type: this.name,
        },
        {
          name: hasherVariable,
          type: "HasherT",
        },
      ],
      returnType: "HasherT",
      statements: `switch (${this.thisVariable}.${this._discriminatorProperty.name}) { ${caseBlocks.join(" ")} }`,
      typeParameters: [
        {
          name: "HasherT",
          constraint: hasherTypeConstraint,
        },
      ],
    });
  }

  private get identifierTypeDeclarations(): readonly (
    | FunctionDeclarationStructure
    | ModuleDeclarationStructure
    | TypeAliasDeclarationStructure
    | VariableStatementStructure
  )[] {
    return [
      {
        isExported: true,
        kind: StructureKind.TypeAlias,
        name: `${syntheticNamePrefix}Identifier`,
        type: this.identifierType.name,
      },
      {
        isExported: true,
        kind: StructureKind.Module,
        name: `${syntheticNamePrefix}Identifier`,
        statements: [
          this.identifierType.fromStringFunctionDeclaration,
          this.identifierType.toStringFunctionDeclaration,
        ],
      },
    ];
  }

  private get jsonTypeAliasDeclaration(): Maybe<TypeAliasDeclarationStructure> {
    if (!this.features.has("json")) {
      return Maybe.empty();
    }

    return Maybe.of({
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: `${syntheticNamePrefix}Json`,
      type: this.memberTypes
        .map((memberType) => memberType.jsonName)
        .join(" | "),
    });
  }

  private get jsonZodSchemaFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("json")) {
      return Maybe.empty();
    }

    const variables = { zod: "zod" };
    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}jsonZodSchema`,
      statements: `return ${variables.zod}.discriminatedUnion("${this._discriminatorProperty.name}", [${this.memberTypes.map((memberType) => memberType.jsonZodSchema({ context: "type", variables })).join(", ")}]);`,
    });
  }

  private get sparqlFunctionDeclarations(): readonly FunctionDeclarationStructure[] {
    if (!this.features.has("sparql")) {
      return [];
    }

    return [
      sparqlConstructQueryFunctionDeclaration.bind(this)(),
      sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
      {
        isExported: true,
        kind: StructureKind.Function,
        name: `${syntheticNamePrefix}sparqlConstructTemplateTriples`,
        // Accept ignoreRdfType in order to reuse code but don't pass it through, since deserialization may depend on it
        parameters: [
          {
            hasQuestionToken: true,
            name: "parameters",
            type: '{ ignoreRdfType?: boolean, subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
          },
        ],
        returnType: "readonly sparqljs.Triple[]",
        statements: [
          `return [${this.memberTypes
            .map(
              (memberType) =>
                `...${memberType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples({ subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
            )
            .join(", ")}];`,
        ],
      },
      {
        isExported: true,
        kind: StructureKind.Function,
        name: `${syntheticNamePrefix}sparqlWherePatterns`,
        // Accept ignoreRdfType in order to reuse code but don't pass it through, since deserialization may depend on it
        parameters: [
          {
            hasQuestionToken: true,
            name: "parameters",
            type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
          },
        ],
        returnType: "readonly sparqljs.Pattern[]",
        statements: [
          `return [{ patterns: [${this.memberTypes
            .map((memberType) =>
              objectInitializer({
                patterns: `${memberType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ subject: parameters?.subject ?? dataFactory.variable!("${camelCase(this.name)}${pascalCase(memberType.name)}"), variablePrefix: parameters?.variablePrefix ? \`\${parameters.variablePrefix}${pascalCase(memberType.name)}\` : "${camelCase(this.name)}${pascalCase(memberType.name)}" }).concat()`,
                type: '"group"',
              }),
            )
            .join(", ")}], type: "union" }];`,
        ],
      },
    ];
  }

  private get toJsonFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("json")) {
      return Maybe.empty();
    }

    const caseBlocks = this.memberTypes.map((memberType) => {
      let returnExpression: string;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = `${this.thisVariable}.${syntheticNamePrefix}toJson()`;
          break;
        case "interface":
          returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}toJson(${this.thisVariable})`;
          break;
      }
      return `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${returnExpression};`;
    });
    caseBlocks.push(
      `default: ${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
    );

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}toJson`,
      parameters: [
        {
          name: this.thisVariable,
          type: this.name,
        },
      ],
      returnType: this.jsonName.toString(),
      statements: `switch (${this.thisVariable}.${this._discriminatorProperty.name}) { ${caseBlocks.join(" ")} }`,
    });
  }

  private get toRdfFunctionDeclaration(): Maybe<FunctionDeclarationStructure> {
    if (!this.features.has("rdf")) {
      return Maybe.empty();
    }

    const parametersVariable = "_parameters";

    const caseBlocks = this.memberTypes.map((memberType) => {
      let returnExpression: string;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = `${this.thisVariable}.${syntheticNamePrefix}toRdf(${parametersVariable})`;
          break;
        case "interface":
          returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}toRdf(${this.thisVariable}, ${parametersVariable})`;
          break;
      }
      return `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${returnExpression};`;
    });
    caseBlocks.push(
      `default: ${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
    );

    return Maybe.of({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}toRdf`,
      parameters: [
        {
          name: this.thisVariable,
          type: this.name,
        },
        {
          name: parametersVariable,
          type: "{ mutateGraph: rdfjsResource.MutableResource.MutateGraph, resourceSet: rdfjsResource.MutableResourceSet }",
        },
      ],
      returnType: (() => {
        let returnType: string | undefined;
        for (const memberType of this.memberTypes) {
          const memberRdfjsResourceType = memberType.toRdfjsResourceType;

          if (typeof returnType === "undefined") {
            returnType = memberRdfjsResourceType;
          } else if (memberRdfjsResourceType !== returnType) {
            return "rdfjsResource.Resource";
          }
        }
        // The types agree
        return returnType!;
      })(),
      statements: `switch (${this.thisVariable}.${this._discriminatorProperty.name}) { ${caseBlocks.join(" ")} }`,
    });
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
    return `${variables.resourceValues}.head().chain(value => value.toResource()).chain(resource => ${this.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...${variables.context}, ignoreRdfType: false, languageIn: ${variables.languageIn}, objectSet: ${variables.objectSet} }))`;
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

  override jsonZodSchema(): ReturnType<Type["jsonZodSchema"]> {
    return `${this.staticModuleName}.${syntheticNamePrefix}jsonZodSchema()`;
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
        throw new Error(
          "not implemented: need a freestanding toJson function like the toRdf function",
        );
      // return `${this.name}.toJson(${variables.value})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    const options = `{ mutateGraph: ${variables.mutateGraph}, resourceSet: ${variables.resourceSet} }`;
    switch (this.memberTypes[0].declarationType) {
      case "class":
        return `${variables.value}.${syntheticNamePrefix}toRdf(${options})`;
      case "interface":
        return `${this.staticModuleName}.${syntheticNamePrefix}toRdf(${variables.value}, ${options})`;
    }
  }

  override useImports(): readonly Import[] {
    return [];
  }
}
