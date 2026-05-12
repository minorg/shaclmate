import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { Imports } from "./Imports.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";
import { Snippets } from "./Snippets.js";
import { synthesizeUberObjectUnionType } from "./synthesizeUberObjectUnionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TsGenerator implements Generator {
  private readonly logger: Logger;
  private readonly snippets: Snippets;
  private readonly typeFactory: TypeFactory;

  constructor({ logger }: { logger: Logger }) {
    const imports = new Imports();
    this.logger = logger;
    this.snippets = new Snippets({ imports, logger });
    this.typeFactory = new TypeFactory({
      imports,
      logger,
      snippets: this.snippets,
    });
  }

  generate(ast_: ast.Ast): string {
    let declarations: Code[] = [];

    for (const namedObjectType of ast_.namedObjectTypes) {
      for (const tsImport of namedObjectType.tsImports) {
        declarations.push(code`${tsImport}`);
      }
    }

    for (const astNamedUnionType of ast_.namedUnionTypes) {
      if (astNamedUnionType.isObjectUnionType()) {
        continue;
      }
      declarations = declarations.concat(
        this.typeFactory.createType(astNamedUnionType).declaration.toList(),
      );
    }

    const namedObjectTypesToposorted = ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) =>
      this.typeFactory.createNamedObjectType(astObjectType),
    );

    const namedObjectUnionTypesToposorted = ast_.namedUnionTypes
      .filter((_) => _.isObjectUnionType())
      .map((astObjectUnionType) =>
        this.typeFactory.createNamedObjectUnionType(astObjectUnionType),
      );
    for (const namedObjectType of namedObjectTypesToposorted) {
      declarations = declarations.concat(namedObjectType.declaration.toList());
    }
    for (const namedObjectUnionType of namedObjectUnionTypesToposorted) {
      declarations = declarations.concat(
        namedObjectUnionType.declaration.toList(),
      );
    }

    const namedObjectTypesNameSorted = namedObjectTypesToposorted.toSorted(
      (left, right) => left.name.localeCompare(right.name),
    );

    const namedObjectUnionTypesNameSorted =
      namedObjectUnionTypesToposorted.toSorted((left, right) =>
        left.name.localeCompare(right.name),
      );

    switch (namedObjectTypesNameSorted.length) {
      case 0:
        break;
      case 1:
        declarations.push(
          code`type ${syntheticNamePrefix}Object = ${namedObjectTypesNameSorted[0].name};`,
        );
        break;
      default: {
        const uberObjectUnionType = synthesizeUberObjectUnionType({
          logger: this.logger,
          namedObjectTypes: namedObjectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
        });
        declarations = declarations.concat(
          uberObjectUnionType.declaration.toList(),
        );
        namedObjectUnionTypesNameSorted.push(uberObjectUnionType);
      }
    }

    declarations.push(
      ...objectSetDeclarations({
        namedObjectTypes: namedObjectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
      }),
    );

    declarations.push(
      ...graphqlSchemaVariableStatement({
        namedObjectTypes: namedObjectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
      }).toList(),
    );

    declarations.splice(
      0,
      0,
      joinCode(
        Object.values(this.snippets)
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
