import type { Maybe } from "purify-ts";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { StructType } from "./StructType.js";
import type { Type } from "./Type.js";

export class Operation extends AbstractConstruct {
  /**
   * Name of this operation.
   */
  readonly name: string;

  /**
   * Parameters type.
   */
  readonly parameters: Maybe<StructType>;

  /**
   * Result type.
   */
  readonly result: Maybe<Type>;

  constructor({
    name,
    parameters,
    result,
    ...superParameters
  }: {
    name: string;
    parameters: Maybe<StructType>;
    result: Maybe<Type>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.name = name;
    this.parameters = parameters;
    this.result = result;
  }
}
