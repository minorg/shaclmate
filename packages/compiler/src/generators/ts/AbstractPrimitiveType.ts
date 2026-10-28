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
  override get fromCompactedJsonFunction(): AbstractTypedLiteralType<ValueT>["fromCompactedJsonFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveFromCompactedJson}<${this.expression}>`,
    );
  }

  @Memoize()
  override get toCompactedJsonFunction(): AbstractTypedLiteralType<ValueT>["toCompactedJsonFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveToCompactedJson}<${this.expression}>`,
    );
  }

  @Memoize()
  override get toExpandedJsonFunction(): AbstractTypedLiteralType<ValueT>["toExpandedJsonFunction"] {
    return new ReferenceCallable(
      code`${this.reusables.snippets.primitiveToExpandedJson}<${this.expression}>(${this.rdfjsTermExpression(this.datatype)})`,
    );
  }

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
