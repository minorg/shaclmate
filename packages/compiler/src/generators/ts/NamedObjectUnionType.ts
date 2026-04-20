import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNamedUnionType } from "./AbstractNamedUnionType.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class NamedObjectUnionType extends AbstractNamedUnionType<ObjectType> {
  private readonly identifierType: BlankNodeType | IdentifierType | IriType;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "NamedObjectUnionType";

  constructor({
    identifierType,
    ...superParameters
  }: {
    identifierType: BlankNodeType | IdentifierType | IriType;
  } & ConstructorParameters<typeof AbstractNamedUnionType<ObjectType>>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
  }

  @Memoize()
  override get graphqlType(): AbstractType.GraphqlType {
    return new AbstractType.GraphqlType(
      code`${this._name}.${syntheticNamePrefix}GraphQL`,
    );
  }

  protected override get staticModuleDeclarations(): readonly Code[] {
    let staticModuleDeclarations = super.staticModuleDeclarations.concat();

    if (this.features.has("graphql")) {
      staticModuleDeclarations.push(code`\
      export const ${syntheticNamePrefix}GraphQL = new ${imports.GraphQLUnionType}(${{
        description: this.comment.map(JSON.stringify).extract(),
        name: this.name,
        resolveType: code`(value: ${this.name}) => value.${syntheticNamePrefix}type`,
        types: code`[${joinCode(
          this.concreteMemberTypes.map(
            (memberType) => memberType.graphqlType.nullableName,
          ),
          { on: ", " },
        )}]`,
      }});
      `);
    }

    staticModuleDeclarations = staticModuleDeclarations.concat(
      code`export type ${syntheticNamePrefix}Identifier = ${this.identifierType.name};`,
      code`export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.identifierType.fromStringFunction, this.identifierType.toStringFunction])} }`,
    );

    if (this._name !== `${syntheticNamePrefix}Object`) {
      staticModuleDeclarations.push(code`\
    export function is${this._name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
      return ${joinCode(
        this.memberTypes.map(
          (memberType) =>
            code`${memberType.staticModuleName}.is${memberType.name}(object)`,
        ),
        { on: " || " },
      )};
    }`);
    }

    return staticModuleDeclarations;
  }

  @Memoize()
  private get concreteMemberTypes(): readonly ObjectType[] {
    return this.memberTypes.filter((memberType) => !memberType.abstract);
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }
}
