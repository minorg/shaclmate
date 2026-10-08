import type { Maybe } from "purify-ts";
import type * as uriTemplate from "uri-template";
import type {
  HttpRequestContentType,
  HttpRequestMethod,
  HttpResponseContentType,
} from "../input/input.shaclmate.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { StructDiscriminatedUnionType } from "./StructDiscriminatedUnionType.js";
import type { StructType } from "./StructType.js";
import type { Type } from "./Type.js";

export class Operation extends AbstractConstruct {
  /**
   * Bindings of this operation.
   */
  readonly bindings: readonly Operation.Binding[];

  /**
   * Error(s) returned by this operation.
   */
  readonly error: Maybe<StructType | StructDiscriminatedUnionType>;

  /**
   * Name of this operation.
   */
  readonly name: string;

  /**
   * Parameter type.
   */
  readonly parameter: Maybe<StructType>;

  /**
   * Result type.
   */
  readonly result: Maybe<Type>;

  constructor({
    bindings,
    error,
    name,
    parameter,
    result,
    ...superParameters
  }: {
    bindings: readonly Operation.Binding[];
    error: Maybe<StructType | StructDiscriminatedUnionType>;
    name: string;
    parameter: Maybe<StructType>;
    result: Maybe<Type>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.bindings = bindings;
    this.error = error;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
  }
}

export namespace Operation {
  export interface HttpBinding {
    readonly request: HttpBinding.Request;
    readonly response: HttpBinding.Response;
  }

  export namespace HttpBinding {
    export interface Request {
      readonly contentType: HttpRequestContentType;
      readonly method: HttpRequestMethod;
      readonly uriTemplate: ReturnType<typeof uriTemplate.parse>;
    }

    export interface Response {
      readonly contentType: HttpResponseContentType;
      readonly statusCode: number;
    }
  }

  export type Binding = HttpBinding;
}
