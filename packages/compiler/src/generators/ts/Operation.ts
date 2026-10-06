import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code } from "./ts-poet-wrapper.js";

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

  @Memoize()
  get interfaceDeclaration(): Code {
    const parameter = this.parameter
      .map((parameter) => code`parameters: ${parameter.expression}`)
      .orDefault(code``);
    const returnType = code`Promise<${this.reusables.imports.Either}<${this.error.map((error) => error.expression).orDefault(code`Error`)}, ${this.result.map((result) => result.expression).orDefault(code`void`)}>>`;
    return code`${this.name}(${parameter}): ${returnType}`;
  }
}
