import type { Primitive } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of typed literals whose datatype corresponds to a JavaScript primitive type.
 */
export abstract class AbstractPrimitiveType<
  ValueT extends Primitive,
> extends AbstractTypedLiteralType<ValueT> {
  protected abstract readonly decodedIn: readonly ValueT[];

  override readonly equalsFunction = new ReferenceCallable(
    this.reusables.snippets.strictEquals,
  );

  @Memoize()
  override get fromJsonValueFunction(): AbstractTypedLiteralType<ValueT>["fromJsonValueFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveFromJsonValue}<${this.expression}>`,
    );
  }

  @Memoize()
  override get toJsonValueFunction(): AbstractTypedLiteralType<ValueT>["toJsonValueFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveToJsonValue}<${this.expression}>`,
    );
  }

  @Memoize()
  override get toJsonObjectFunction(): AbstractTypedLiteralType<ValueT>["toJsonObjectFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveToJsonObject}<${this.expression}>(${this.rdfjsTermExpression(this.datatype)})`,
    );
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.in_.length > 0) {
      return this.schemaVariable
        .map((schemaVariable) => code`${schemaVariable}["in"][number]`)
        .orDefault(
          code`${joinCode(
            this.in_.map((value) => this.valueExpression(value)),
            { on: " | " },
          )}`,
        );
    }

    return code`${this.jsTypes[0].typeof}`;
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
