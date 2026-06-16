import type { Primitive } from "@rdfx/literal";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { AbstractTypedLiteralType } from "./AbstractTypedLiteralType.js";
import { arrayOf, type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class of typed literals whose datatype corresponds to a JavaScript primitive type.
 */
export abstract class AbstractPrimitiveType<
  ValueT extends Primitive,
> extends AbstractTypedLiteralType<ValueT> {
  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.empty();
  override readonly equalsFunction =
    code`${this.reusables.snippets.strictEquals}`;

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.decodedIn.length > 0) {
      return code`${joinCode(
        this.decodedIn.map((value) => this.literalValueExpression(value)),
        { on: " | " },
      )}`;
    }
    return code`${this.jsTypes[0].typeof}`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${variables.value})`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractTypedLiteralType<ValueT>["jsonSchema"]>[0],
  ): Code {
    switch (this.decodedIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.${this.jsTypes[0].typeof}()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${this.literalValueExpression(this.decodedIn[0])})`;
      default:
        return code`${this.reusables.imports.z}.union(${arrayOf(
          ...this.decodedIn.map(
            (value) =>
              code`${this.reusables.imports.z}.literal(${this.literalValueExpression(value)})`,
          ),
        )})`;
    }
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType(this.expression);
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return variables.value;
  }
}

export namespace AbstractPrimitiveType {
  export type ConversionFunction = AbstractLiteralType.ConversionFunction;
  export type DiscriminantProperty = AbstractLiteralType.DiscriminantProperty;
  export type JsType = AbstractLiteralType.JsType;
  export const GraphqlType = AbstractLiteralType.GraphqlType;
  export type GraphqlType = AbstractLiteralType.GraphqlType;
  export const JsonType = AbstractLiteralType.JsonType;
  export type JsonType = AbstractLiteralType.JsonType;
}
