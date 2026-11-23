import type { Maybe } from "purify-ts";
import type * as uriTemplate from "uri-template";
import type {
  OperationErrorHttpBindingStatusCode,
  OperationHttpBindingStatusCode,
} from "../input/input.shaclmate.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { OptionType } from "./OptionType.js";
import type { StructType } from "./StructType.js";

export class Operation extends AbstractConstruct {
  /**
   * Error(s) returned by this operation.
   */
  readonly error: Maybe<Operation.Error>;

  /**
   * HTTP binding of this operation.
   */
  readonly httpBinding: Operation.HttpBinding;

  /**
   * Name of this operation.
   */
  readonly name: string;

  /**
   * Input type.
   */
  readonly input: Maybe<Operation.Input>;

  /**
   * Output type.
   */
  readonly output: Maybe<Operation.Output>;

  constructor({
    error,
    httpBinding,
    name,
    input,
    output,
    ...superParameters
  }: {
    error: Maybe<Operation.Error>;
    name: string;
    httpBinding: Operation.HttpBinding;
    input: Maybe<Operation.Input>;
    output: Maybe<Operation.Output>;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.error = error;
    this.httpBinding = httpBinding;
    this.name = name;
    this.input = input;
    this.output = output;
  }
}

export namespace Operation {
  export interface Error {
    readonly httpBinding: Error.HttpBinding;
    readonly type: StructType;
  }

  export namespace Error {
    export interface HttpBinding {
      readonly contentType: "application/problem+json";
      readonly error: StructType;
      readonly statusCode: OperationErrorHttpBindingStatusCode;
    }
  }

  export interface HttpBinding {
    readonly method: string;
    readonly statusCode: OperationHttpBindingStatusCode;
    readonly uriTemplate: ReturnType<typeof uriTemplate.parse>["ast"];
  }

  export interface Input {
    readonly httpBinding: Input.HttpBinding;
    readonly type: StructType;
  }

  export namespace Input {
    export interface HttpBinding {
      readonly contentType: string;
      readonly propertySourcesByPropertyName: ReadonlyMap<
        string,
        HttpBinding.PropertySource
      >;
    }

    export namespace HttpBinding {
      export type PropertySource = "body" | "path" | "query";
    }
  }

  export interface Output {
    readonly httpBinding: Output.HttpBinding;
    readonly type: OptionType<StructType> | StructType;
  }

  export namespace Output {
    export interface HttpBinding {
      readonly contentType: string;
    }
  }
}
