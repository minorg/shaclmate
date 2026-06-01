import type { Logger } from "ts-log";
import type * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { ObjectType_jsonSchemaFunctionDeclaration } from "./_ObjectType/ObjectType_jsonSchemaFunctionDeclaration.js";
import { ObjectType_jsonTypeAliasDeclaration } from "./_ObjectType/ObjectType_jsonTypeAliasDeclaration.js";
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

    for (const astNamedType of ast_.namedTypes) {
      switch (astNamedType.kind) {
        case "Struct": {
          const tsNamedObjectType = typeFactory.createObjectType(astNamedType);
          declarations.push(code`\
export namespace ${tsNamedObjectType.name.unsafeCoerce()} {
  ${joinCode(ObjectType_jsonTypeAliasDeclaration.call(tsNamedObjectType).toList())}

  export namespace Json {
    ${joinCode(ObjectType_jsonSchemaFunctionDeclaration.call(tsNamedObjectType).toList())}
  }
}`);
          break;
        }
        case "Union": {
          const tsNamedUnionType = typeFactory.createUnionType(astNamedType);
          declarations.push(code`\
export namespace ${tsNamedUnionType.name.unsafeCoerce()} {
  ${tsNamedUnionType.jsonTypeAliasDeclaration}
  export namespace Json {
    ${tsNamedUnionType.jsonSchemaFunctionDeclaration}
  }
}`);
          break;
        }
        default: {
          const type = typeFactory.createType(astNamedType);
          type.declaration.ifJust((declaration) => {
            declarations.push(declaration);
          });
        }
      }
    }

    declarations.splice(
      0,
      0,
      joinCode(reusables.snippets.ifUsed, { on: "\n\n" }),
    );

    return joinCode(declarations, { on: "\n\n" }).toString({});
  }
}
