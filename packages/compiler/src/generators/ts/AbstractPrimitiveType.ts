import type { Primitive } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of typed literals whose datatype corresponds to a JavaScript primitive type.
 */
export abstract class AbstractPrimitiveType<
  ValueT extends Primitive,
> extends AbstractTypedLiteralType<ValueT> {
  override readonly equalsFunction =
    code`${this.reusables.snippets.strictEquals}`;

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.in_.length > 0) {
      const name = this.name.extract();
      if (name && this.configuration.features.has("Object.schema")) {
        // Reuse the type from schema to cut down code
        return code`(typeof ${name}.schema)["in"][number]`;
      }

      return code`${joinCode(
        this.in_.map((value) => this.valueExpression(value)),
        { on: " | " },
      )}`;
    }
    return code`${this.jsTypes[0].typeof}`;
  }

  protected override fromCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["fromJsonExpression"]
  >[0]): Code {
    return variables.value;
  }

  protected override toCompactJsonExpression({
    variables,
  }: Parameters<
    AbstractTypedLiteralType<Date>["toCompactJsonExpression"]
  >[0]): Code {
    return variables.value;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractLiteralType["toLoggableExpression"]>[0]): Code {
    return variables.value;
  }
}

export namespace AbstractPrimitiveType {
  export type ConversionFunction = AbstractLiteralType.ConversionFunction;
  export type DiscriminantProperty = AbstractLiteralType.DiscriminantProperty;
  export type JsType = AbstractLiteralType.JsType;
  export const GraphqlType = AbstractLiteralType.GraphqlType;
  export type GraphqlType = AbstractLiteralType.GraphqlType;
  export type JsonType = AbstractLiteralType.JsonType;
}
