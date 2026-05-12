import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { NamedObjectType_jsonSchemaFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonSchemaFunctionDeclaration.js";
import { NamedObjectType_jsonTypeAliasDeclaration } from "./_NamedObjectType/NamedObjectType_jsonTypeAliasDeclaration.js";
import { Reusables } from "./Reusables.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ZodGenerator implements Generator {
  private readonly reusables: Reusables;
  private readonly typeFactory: TypeFactory;

  constructor({ logger }: { logger: Logger }) {
    this.reusables = new Reusables({ logger });
    this.typeFactory = new TypeFactory({
      logger,
      reusables: this.reusables,
    });
  }

  generate(ast_: ast.Ast): string {
    const declarations: Code[] = [];

    for (const namedObjectType of ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) =>
      this.typeFactory.createNamedObjectType(astObjectType),
    )) {
      declarations.push(code`\
export namespace ${namedObjectType.name} {
  ${joinCode(NamedObjectType_jsonTypeAliasDeclaration.bind(namedObjectType)().toList())}

  export namespace ${syntheticNamePrefix}Json {
    ${joinCode(NamedObjectType_jsonSchemaFunctionDeclaration.bind(namedObjectType)().toList())}
  }
}`);
    }

    for (const astNamedUnionType of ast_.namedUnionTypes.map(
      (astNamedUnionType) =>
        this.typeFactory.createUnionType(astNamedUnionType),
    )) {
      invariant(astNamedUnionType.kind !== "AnonymousUnionType");
      declarations.push(code`\
export namespace ${astNamedUnionType.name} {
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
        Object.values(this.reusables.snippets)
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
