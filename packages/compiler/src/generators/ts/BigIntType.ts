import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import {
  arrayOf,
  type Code,
  code,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class BigIntType extends AbstractNumericType<bigint> {
  override readonly jsTypes = [{ typeof: "bigint" } as const];
  override readonly kind = "BigInt";

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.bigIntFromRdfResourceValues}<${this.expression}>`;
  }

  @Memoize()
  override get graphqlType() {
    return new AbstractNumericType.GraphqlType(
      code`${this.reusables.imports.GraphQLBigInt}`,
      this.reusables,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["fromJsonExpression"]>[0]): Code {
    let expression = code`BigInt(${variables.value}["@value"])`;
    if (this.in_.length > 0) {
      expression = code`${expression} as ${this.expression}`;
    }
    return code`${this.reusables.imports.Either}.encase<Error, ${this.expression}>(() => ${expression})`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractNumericType<bigint>["jsonSchema"]>[0],
  ): Code {
    let valueJsonSchema: Code;
    switch (this.in_.length) {
      case 0:
        valueJsonSchema = code`${this.reusables.imports.z}.string()`;
        break;
      case 1:
        valueJsonSchema = code`${this.reusables.imports.z}.literal(${this.valueExpression(this.in_[0])})`;
        break;
      default:
        valueJsonSchema = code`${this.reusables.imports.z}.enum(${arrayOf(
          ...this.in_.map((value) => this.valueExpression(value)),
        )})`;
        break;
    }

    return code`${this.reusables.imports.z}.object({ "@type": ${this.reusables.imports.z}.literal(${literalOf(this.datatype.value)}), "@value": ${valueJsonSchema} })`;
  }

  @Memoize()
  override jsonType(): AbstractNumericType.JsonType {
    return new AbstractNumericType.JsonType(
      code`{ readonly "@type": ${literalOf(this.datatype.value)}, readonly "@value": ${
        this.in_.length === 0
          ? "string"
          : joinCode(
              this.in_.map(
                (in_) =>
                  code`${literalOf(LiteralDecoder.decodeBigIntLiteral(in_).toString())}`,
              ),
              { on: " | " },
            )
      } }`,
    );
  }

  override valueExpression(literal: bigint | Literal): Code {
    return code`${typeof literal === "bigint" ? literal : LiteralDecoder.decodeBigIntLiteral(literal).unsafeCoerce()}n`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractNumericType<bigint>["toJsonExpression"]>[0]): Code {
    let valueExpression = code`${variables.value}.toString()`;
    if (this.in_.length > 0) {
      valueExpression = code`${valueExpression} as ${joinCode(
        this.in_.map(
          (in_) =>
            code`${literalOf(LiteralDecoder.decodeBigIntLiteral(in_).toString())}`,
        ),
        { on: " | " },
      )}`;
    }

    return code`{ "@type": ${literalOf(this.datatype.value)} as const, "@value": ${valueExpression} }`;
  }
}
