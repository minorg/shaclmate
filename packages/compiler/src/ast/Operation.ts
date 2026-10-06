import type { Maybe } from "purify-ts";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { StructCompoundType } from "./StructCompoundType.js";
import type { StructType } from "./StructType.js";
import type { Type } from "./Type.js";

export class Operation extends AbstractConstruct {
  /**
   * Error(s) returned by this operation.
   */
  readonly error: Maybe<StructType | StructCompoundType>;

  /**
   * Name of this operation.
   */
  readonly name: string;

  /**
   * Parameter type.
   */
  readonly parameter: Maybe<StructType | StructCompoundType>;

  /**
   * Result type.
   */
  readonly result: Maybe<Type>;

  constructor({
    error,
    name,
    parameter,
    result,
    ...superParameters
  }: {
    error: Maybe<StructType | StructCompoundType>;
    name: string;
    parameter: Maybe<StructType | StructCompoundType>;
    result: Maybe<Type>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.error = error;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
  }
}
