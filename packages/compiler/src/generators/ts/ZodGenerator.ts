import { invariant } from "ts-invariant";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonZodSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonZodSchemaFunctionDeclaration.js";
import { snippets } from "./snippets.js";
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
${joinCode(
  [
    ...ObjectType_jsonTypeAliasDeclaration.bind(objectType)().toList(),
    ...ObjectType_jsonZodSchemaFunctionDeclaration.bind(objectType)().toList(),
  ],
  { on: "\n\n" },
)}
}`);
    }

    for (const astNamedUnionType of ast_.namedUnionTypes.map(
      (astNamedUnionType) =>
        this.typeFactory.createUnionType(astNamedUnionType),
    )) {
      invariant(astNamedUnionType.kind !== "AnonymousUnionType");
      declarations.push(code`\
export namespace ${astNamedUnionType.staticModuleName} {
${joinCode(
  [
    astNamedUnionType.jsonTypeAliasDeclaration,
    astNamedUnionType.jsonZodSchemaFunctionDeclaration,
  ],
  { on: "\n\n" },
)}
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
