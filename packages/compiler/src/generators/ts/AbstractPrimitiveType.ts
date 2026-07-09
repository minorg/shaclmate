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

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${variables.value})`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractTypedLiteralType<ValueT>["jsonSchema"]>[0],
  ): Code {
    switch (this.in_.length) {
      case 0:
        return code`${this.reusables.imports.z}.${this.jsTypes[0].typeof}()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${this.valueExpression(this.in_[0])})`;
      default: {
        const name = this.name.extract();
        if (name && this.configuration.features.has("Object.schema")) {
          // Reuse the type from schema to cut down code
          return code`${this.reusables.imports.z}.union(${name}.schema.in.map(_ => ${this.reusables.imports.z}.literal(_)))`;
        } else {
          return code`${this.reusables.imports.z}.union(${arrayOf(
            ...this.in_.map(
              (value) =>
                code`${this.reusables.imports.z}.literal(${this.valueExpression(value)})`,
            ),
          )})`;
        }
      }
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
