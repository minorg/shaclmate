import type * as ast from "../ast/index.js";
import type { Generator } from "./Generator.js";

export class AstJsonGenerator implements Generator {
  generate(ast: ast.Ast): string {
    return JSON.stringify(
      {
        namedTypes: ast.namedTypes.map((namedType) => ({
          ...namedType.toJSON(),
          ...(namedType.kind === "Struct"
            ? {
                properties: namedType.properties.map((property) =>
                  property.toJSON(),
                ),
              }
            : {}),
        })),
      },
      undefined,
      2,
    );
  }
}
