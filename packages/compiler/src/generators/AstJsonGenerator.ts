import type * as ast from "../ast/index.js";
import type { Generator } from "./Generator.js";

export class AstJsonGenerator implements Generator {
  generate(ast: ast.Ast): string {
    return JSON.stringify(
      {
        objectTypes: ast.namedObjectTypes.map((objectType) => ({
          ...objectType.toJSON(),
          properties: objectType.properties.map((property) =>
            property.toJSON(),
          ),
        })),
      },
      undefined,
      2,
    );
  }
}
