import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";
import { snippets } from "./snippets.js";
import { synthesizeUberObjectUnionType } from "./synthesizeUberObjectUnionType.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TsGenerator implements Generator {
  private readonly typeFactory = new TypeFactory();

  generate(ast_: ast.Ast): string {
    let declarations: Code[] = [];

    for (const astNamedUnionType of ast_.namedUnionTypes) {
      if (astNamedUnionType.isObjectUnionType()) {
        continue;
      }
      declarations = declarations.concat(
        this.typeFactory.createType(astNamedUnionType).declaration.toList(),
      );
    }

    const objectTypesToposorted = ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) =>
      this.typeFactory.createNamedObjectType(astObjectType),
    );

    const namedObjectUnionTypesToposorted = ast_.namedUnionTypes
      .filter((_) => _.isObjectUnionType())
      .map((astObjectUnionType) =>
        this.typeFactory.createNamedObjectUnionType(astObjectUnionType),
      );
    for (const objectType of objectTypesToposorted) {
      declarations = declarations.concat(objectType.declaration.toList());
    }
    for (const namedObjectUnionType of namedObjectUnionTypesToposorted) {
      declarations = declarations.concat(
        namedObjectUnionType.declaration.toList(),
      );
    }

    const objectTypesNameSorted = objectTypesToposorted.toSorted(
      (left, right) => left.name.localeCompare(right.name),
    );

    const namedObjectUnionTypesNameSorted =
      namedObjectUnionTypesToposorted.toSorted((left, right) =>
        left.name.localeCompare(right.name),
      );

    if (objectTypesToposorted.length > 0) {
      const uberObjectUnionType = synthesizeUberObjectUnionType({
        objectTypes: objectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
      });
      declarations = declarations.concat(
        uberObjectUnionType.declaration.toList(),
      );
      namedObjectUnionTypesNameSorted.push(uberObjectUnionType);
    }

    declarations.push(
      ...objectSetDeclarations({
        objectTypes: objectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
      }),
    );

    declarations.push(
      ...graphqlSchemaVariableStatement({
        objectTypes: objectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
      }).toList(),
    );

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
