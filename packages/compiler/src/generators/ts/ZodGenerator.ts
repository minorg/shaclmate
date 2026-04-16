import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
import { ObjectType_jsonZodSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonZodSchemaFunctionDeclaration.js";
import { ObjectUnionType_jsonTypeAliasDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonTypeAliasDeclaration.js";
import { ObjectUnionType_jsonZodSchemaFunctionDeclaration } from "./_ObjectUnionType/ObjectUnionType_jsonZodSchemaFunctionDeclaration.js";
import { snippets } from "./snippets.js";
import { synthesizeUberObjectUnionType } from "./synthesizeUberObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ZodGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    const declarations: Code[] = [];

    const objectTypesToposorted = ast.ObjectType.toposort(ast_.objectTypes).map(
      (astObjectType) => this.typeFactory.createObjectType(astObjectType),
    );

    for (const objectType of objectTypesToposorted) {
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

    for (const objectUnionType of ast_.objectUnionTypes.map(
      (astObjectUnionType) =>
        this.typeFactory.createObjectUnionType(astObjectUnionType),
    )) {
      declarations.push(code`\
export namespace ${objectUnionType.staticModuleName} {
${joinCode(
  [
    ...ObjectUnionType_jsonTypeAliasDeclaration.bind(
      objectUnionType,
    )().toList(),
    ...ObjectUnionType_jsonZodSchemaFunctionDeclaration.bind(
      objectUnionType,
    )().toList(),
  ],
  { on: "\n\n" },
)}
}`);
    }

    const uberObjectUnionType = synthesizeUberObjectUnionType({
      objectTypes: objectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
    });
    declarations.push(uberObjectUnionType.declaration);

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

    return joinCode(declarations).toString({});
  }
}
