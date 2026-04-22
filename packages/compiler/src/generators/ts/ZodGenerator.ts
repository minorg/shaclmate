import { invariant } from "ts-invariant";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { ObjectType_jsonSchemaFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonSchemaFunctionDeclaration.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_NamedObjectType/NamedObjectType_jsonTypeAliasDeclaration.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ZodGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    const declarations: Code[] = [];

    for (const objectType of ast.ObjectType.toposort(ast_.objectTypes).map(
      (astObjectType) => this.typeFactory.createObjectType(astObjectType),
    )) {
      declarations.push(code`\
export namespace ${objectType.staticModuleName} {
  ${joinCode(ObjectType_jsonTypeAliasDeclaration.bind(objectType)().toList())}

  export namespace ${syntheticNamePrefix}Json {
    ${joinCode(ObjectType_jsonSchemaFunctionDeclaration.bind(objectType)().toList())}
  }
}`);
    }

    for (const astNamedUnionType of ast_.namedUnionTypes.map(
      (astNamedUnionType) =>
        this.typeFactory.createUnionType(astNamedUnionType),
    )) {
      invariant(astNamedUnionType.kind !== "AnonymousUnionType");
      declarations.push(code`\
export namespace ${astNamedUnionType.staticModuleName} {
  ${astNamedUnionType.jsonTypeAliasDeclaration}
  export namespace ${syntheticNamePrefix}Json {
    ${astNamedUnionType.jsonSchemaFunctionDeclaration}
  }
}`);
    }

    declarations.splice(
      0,
      0,
      joinCode(
        Object.values(snippets)
          .sort((left, right) =>
            left.usageSiteName.localeCompare(right.usageSiteName),
          )
          .map((snippet) => code`${snippet.ifUsed}`),
        { on: "\n\n" },
      ),
    );

    return joinCode(declarations, { on: "\n\n" }).toString({});
  }
}
