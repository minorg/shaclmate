import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonZodSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonZodSchemaFunctionDeclaration.js";
import { ObjectUnionType_jsonTypeAliasDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonTypeAliasDeclaration.js";
import { ObjectUnionType_jsonZodSchemaFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonZodSchemaFunctionDeclaration.js";
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

    for (const namedUnionType of ast_.namedUnionTypes
      .filter((_) => _.isObjectUnionType())
      .map((astObjectUnionType) =>
        this.typeFactory.createObjectUnionType(astObjectUnionType),
      )) {
      declarations.push(code`\
export namespace ${namedUnionType.staticModuleName} {
${joinCode(
  [
    ...ObjectUnionType_jsonTypeAliasDeclaration.bind(namedUnionType)().toList(),
    ...ObjectUnionType_jsonZodSchemaFunctionDeclaration.bind(
      namedUnionType,
    )().toList(),
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
