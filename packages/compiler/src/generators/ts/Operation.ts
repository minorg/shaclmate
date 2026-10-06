import type { Maybe } from "purify-ts";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";

export class Operation extends AbstractConstruct {
  readonly error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
  readonly name: string;
  readonly parameter: Maybe<ObjectType>;
  readonly result: Maybe<Type>;

  constructor({
    error,
    name,
    parameter,
    result,
    ...superParameters
  }: {
    error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
    name: string;
    parameter: Maybe<ObjectType>;
    result: Maybe<Type>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.error = error;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
  }
}
