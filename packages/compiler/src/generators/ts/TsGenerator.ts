import { type Code, joinCode } from "ts-poet";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";
import { synthesizeUberObjectUnionType } from "./synthesizeUberObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";

export class TsGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    const declarations: Code[] = [];

    let objectTypesToposorted = ast.ObjectType.toposort(ast_.objectTypes).map(
      (astObjectType) => this.typeFactory.createObjectType(astObjectType),
    );
    objectTypesToposorted = objectTypesToposorted.slice(0, 1);

    let objectUnionTypesToposorted = ast_.objectUnionTypes.map(
      (astObjectUnionType) =>
        this.typeFactory.createObjectUnionType(astObjectUnionType),
    );
    objectUnionTypesToposorted = [];

    for (const objectType of objectTypesToposorted) {
      declarations.push(...objectType.declaration.toList());
    }
    for (const objectUnionType of objectUnionTypesToposorted) {
      declarations.push(...objectUnionType.declaration.toList());
    }

    const objectTypesNameSorted = objectTypesToposorted.toSorted(
      (left, right) => left.name.localeCompare(right.name),
    );

    const objectUnionTypesNameSorted = objectUnionTypesToposorted.toSorted(
      (left, right) => left.name.localeCompare(right.name),
    );

    const uberObjectUnionType = synthesizeUberObjectUnionType({
      objectTypes: objectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
    });

    declarations.push(
      ...objectSetDeclarations({
        objectTypes: objectTypesNameSorted,
        objectUnionTypes:
          objectUnionTypesNameSorted.concat(uberObjectUnionType),
      }),
    );

    declarations.push(
      ...graphqlSchemaVariableStatement({
        objectTypes: objectTypesNameSorted,
        objectUnionTypes:
          objectUnionTypesNameSorted.concat(uberObjectUnionType),
      }).toList(),
    );

    return joinCode(declarations).toString();
  }
}
