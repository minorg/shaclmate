import { AbstractType } from "./AbstractType.js";
import type { SchemaObject } from "./SchemaObject.js";

/**
 * Abstract base class for built-in types (container types, term types, et al.) -- anything that is not user-defined.
 */
export abstract class AbstractBuiltinType extends AbstractType {
  override get schema(): SchemaObject<
    SchemaObject.AbstractType | SchemaObject.BuiltinType
  > {
    return super.schema;
  }
}

export namespace AbstractBuiltinType {
  export type ConversionFunction = AbstractType.ConversionFunction;
  export namespace ConversionFunction {
    export const SourceType = AbstractType.ConversionFunction.SourceType;
    export type SourceType = AbstractType.ConversionFunction.SourceType;
  }
  export type DiscriminatedType = AbstractType.DiscriminatedType;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export type JsType = AbstractType.JsType;
  export const JsType = AbstractType.JsType;
  export type JsonType = AbstractType.JsonType;
  export type JsonTypeFactory = AbstractType.JsonTypeFactory;
}
