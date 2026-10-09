import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type * as ast from "../../ast/index.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Service } from "./Service.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class Operation extends AbstractConstruct {
  readonly bindings: readonly Operation.Binding[];
  private readonly error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
  private readonly name: string;
  private readonly parameter: Maybe<ObjectType>;
  private readonly result: Maybe<Type>;
  private readonly service: Pick<Service, "name">;

  constructor({
    bindings,
    error,
    name,
    parameter,
    result,
    service,
    ...superParameters
  }: {
    bindings: readonly Operation.Binding[];
    error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
    name: string;
    parameter: Maybe<ObjectType>;
    result: Maybe<Type>;
    service: Pick<Service, "name">;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.bindings = bindings;
    this.error = error;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
    this.service = service;
  }

  @Memoize()
  get interfaceSignature(): Code {
    return code`${this.name}(${this.parameterDeclaration}): ${this.returnTypeAnnotation}`;
  }

  @Memoize()
  get loggingMethodDeclaration(): Code {
    const parametersVariableName = this.parameter
      .map(() => code`parameters`)
      .orDefault(code``);
    return code`\
async ${this.name}(${this.parameterDeclaration}): ${this.returnTypeAnnotation} {
  const logContext: Record<string, unknown> = {
    service: ${literalOf(this.service.name)},
    operation: ${literalOf(this.name)}${this.parameter
      .map(
        (parameter) =>
          code`,\n    parameters: { ${joinCode(
            parameter.properties.flatMap((property) =>
              property
                .toLoggableInitializer({
                  variables: {
                    object: parametersVariableName,
                  },
                })
                .toList(),
            ),
            { on: "," },
          )} }`,
      )
      .orDefault(code``)}
  };
  this.logger.trace(logContext, "called");
  return (await this.delegate.${this.name}(${parametersVariableName}))
    .ifLeft((error) => {
      this.logger.error({ ...logContext, error }, "error");
    })
    .ifRight((${this.result.map(() => code`result`).orDefault(code``)}) => {
      this.logger.debug(${this.result.map((result) => code`{ ...logContext, result: ${result.toLoggableExpression({ variables: { value: code`result` } })} }`).orDefault(code`logContext`)}, "success")
    });
}`;
  }

  @Memoize()
  private get returnTypeAnnotation(): Code {
    return code`Promise<${this.reusables.imports.Either}<${this.error.map((error) => error.expression).orDefault(code`Error`)}, ${this.result.map((result) => result.expression).orDefault(code`void`)}>>`;
  }

  @Memoize()
  private get parameterDeclaration(): Code {
    return this.parameter
      .map(
        (parameter) =>
          code`parameters: ${parameter.name
            .map((name) => code`${name}`)
            .orDefault(
              code`{ ${joinCode(
                parameter.properties.flatMap((property) =>
                  property.declaration.toList(),
                ),
                { on: "\n\n" },
              )} }`,
            )}`,
      )
      .orDefault(code``);
  }
}

export namespace Operation {
  export class HttpBinding {
    constructor(
      readonly request: ast.Operation.HttpBinding.Request,
      readonly response: ast.Operation.HttpBinding.Response,
    ) {}

    @Memoize()
    get httpApiRouteRegistration(): Code {
      throw new Error("not implemented yet");
    }
  }

  export type Binding = HttpBinding;
}
