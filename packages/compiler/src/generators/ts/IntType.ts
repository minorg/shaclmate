import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class IntType extends AbstractNumericType<number> {
  override readonly jsTypes = [{ typeof: "number" }] as const;
  override readonly kind = "Int";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.intFromRdfResourceValues}<${this.expression}, ${this.schemaType}>`;
  }

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLInt}`,
      this.reusables,
    );
  }

  override literalValueExpression(literal: Literal | number): Code {
    return code`${typeof literal === "number" ? literal : LiteralDecoder.decodeIntLiteral(literal).unsafeCoerce()}`;
  }
}
