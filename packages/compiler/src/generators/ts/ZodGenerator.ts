import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { NamedObjectType_jsonSchemaFunctionDeclaration } from "./_NamedObjectType/NamedObjectType_jsonSchemaFunctionDeclaration.js";
import { NamedObjectType_jsonTypeAliasDeclaration } from "./_NamedObjectType/NamedObjectType_jsonTypeAliasDeclaration.js";
import { Reusables } from "./Reusables.js";
import { TsGenerator } from "./TsGenerator.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class ZodGenerator implements Generator {
  private readonly logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
  }

  generate(ast_: ast.Ast): string {
    const configuration = TsGenerator.Configuration.finalize(
      ast_,
      TsGenerator.Configuration.default_,
    );
    const reusables = new Reusables({ configuration, logger: this.logger });
    const typeFactory = new TypeFactory({
      configuration,
      logger: this.logger,
      reusables,
    });

    const declarations: Code[] = [];

    for (const namedObjectType of ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) =>
      typeFactory.createNamedObjectType(astObjectType),
    )) {
      declarations.push(code`\
export namespace ${namedObjectType.name} {
  ${joinCode(NamedObjectType_jsonTypeAliasDeclaration.call(namedObjectType).toList())}

  export namespace Json {
    ${joinCode(NamedObjectType_jsonSchemaFunctionDeclaration.call(namedObjectType).toList())}
  }
}`);
    }

    for (const astNamedUnionType of ast_.namedUnionTypes.map(
      (astNamedUnionType) => typeFactory.createUnionType(astNamedUnionType),
    )) {
      declarations.push(code`\
export namespace ${astNamedUnionType.name} {
  ${astNamedUnionType.jsonTypeAliasDeclaration}
  export namespace Json {
    ${astNamedUnionType.jsonSchemaFunctionDeclaration}
  }
}`);
    }

    declarations.splice(
      0,
      0,
      joinCode(reusables.snippets.ifUsed, { on: "\n\n" }),
    );

    return joinCode(declarations, { on: "\n\n" }).toString({});
  }
}
