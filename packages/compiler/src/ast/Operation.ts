import type { Maybe } from "purify-ts";
import type * as uriTemplate from "uri-template";
import type {
  HttpRequestContentType,
  HttpRequestMethod,
  HttpResponseContentType,
} from "../input/input.shaclmate.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { OptionType } from "./OptionType.js";
import type { StructDiscriminatedUnionType } from "./StructDiscriminatedUnionType.js";
import type { StructType } from "./StructType.js";

export class Operation extends AbstractConstruct {
  /**
   * Bindings of this operation.
   */
  readonly bindings: readonly Operation.Binding[];

  /**
   * Error(s) returned by this operation.
   */
  readonly error: Maybe<Operation.Error>;

  /**
   * Name of this operation.
   */
  readonly name: string;

  /**
   * Parameter type.
   */
  readonly parameter: Maybe<Operation.Parameter>;

  /**
   * Result type.
   */
  readonly result: Maybe<Operation.Result>;

  constructor({
    bindings,
    error,
    name,
    parameter,
    result,
    ...superParameters
  }: {
    bindings: readonly Operation.Binding[];
    error: Maybe<Operation.Error>;
    name: string;
    parameter: Maybe<Operation.Parameter>;
    result: Maybe<Operation.Result>;
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
  export type Error = StructType | StructDiscriminatedUnionType;

  export interface HttpBinding {
    readonly request: HttpBinding.Request;
    readonly response: HttpBinding.Response;
  }

  export namespace HttpBinding {
    export interface Request {
      readonly contentType: Maybe<HttpRequestContentType>;
      readonly method: HttpRequestMethod;
      readonly parameterSources: ReadonlyMap<string, Request.ParameterSource>;
      readonly uriTemplate: ReturnType<typeof uriTemplate.parse>["ast"];
    }

    export namespace Request {
      export type ParameterSource = "body" | "path" | "query";
    }

    export interface Response {
      readonly contentType: Maybe<HttpResponseContentType>;
      readonly statusCode: number;
    }
  }

  export type Binding = HttpBinding;

  export type Parameter = StructType;

  export type Result = OptionType<StructType> | StructType;
}
