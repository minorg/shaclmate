import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type * as ast from "../../ast/index.js";
import { Operation_httpApiRouteRegistration } from "./_Operation/Operation_httpApiRouteRegistration.js";
import { Operation_httpClientMethodDeclaration } from "./_Operation/Operation_httpClientMethodDeclaration.js";
import { Operation_loggingMethodDeclaration } from "./_Operation/Operation_loggingMethodDeclaration.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { Service } from "./Service.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class Operation extends AbstractConstruct {
  protected readonly service: Pick<Service, "name">;

  readonly errors: readonly Operation.Error[];
  readonly httpBinding: Operation.HttpBinding;
  readonly input: Maybe<Operation.Input>;
  readonly name: string;
  readonly output: Maybe<Operation.Output>;

  constructor({
    errors,
    httpBinding,
    input,
    name,
    output,
    service,
    ...superParameters
  }: {
    errors: readonly Operation.Error[];
    httpBinding: Operation.HttpBinding;
    input: Maybe<Operation.Input>;
    name: string;
    output: Maybe<Operation.Output>;
    service: Pick<Service, "name">;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.errors = errors;
    this.input = input;
    this.httpBinding = httpBinding;
    this.name = name;
    this.output = output;
    this.service = service;
  }

  @Memoize()
  get interfaceSignature(): Code {
    return code`${this.name}(${this.parametersDeclaration}): ${this.returnTypeAnnotation}`;
  }

  @Memoize()
  get loggingMethodDeclaration(): Code {
    return Operation_loggingMethodDeclaration.call(this);
  }

  @Memoize()
  protected get parametersDeclaration(): Code {
    return this.input
      .map(
        (input) =>
          code`parameters: ${input.type.name
            .map((name) => code`${name}`)
            .orDefault(
              code`{ ${joinCode(
                input.type.properties.flatMap((property) =>
                  property.declaration.toList(),
                ),
                { on: "\n\n" },
              )} }`,
            )}`,
      )
      .orDefault(code``);
  }

  @Memoize()
  protected get returnTypeAnnotation(): Code {
    return code`Promise<${this.reusables.imports.Either}<${
      this.errors.length > 0
        ? joinCode(
            this.errors
              .map(
                (error) =>
                  error.type.discriminatedType.unsafeCoerce().expression,
              )
              .concat(
                code`${this.reusables.snippets.UnknownError}.Discriminated`,
              ),
            { on: "|" },
          )
        : code`Error`
    }, ${this.output.map((output) => output.type.expression).orDefault(code`void`)}>>`;
  }

  httpApiRouteRegistration(parameters: {
    variables: { logger: Code; service: Code };
  }): Code {
    return Operation_httpApiRouteRegistration.call(this, parameters);
  }

  httpClientMethodDeclaration(parameters: {
    variables: { honoClient: Code };
  }): Code {
    return Operation_httpClientMethodDeclaration.call(this, parameters);
  }
}

export namespace Operation {
  export interface Error {
    readonly httpBinding: ast.Operation.Error.HttpBinding;
    readonly type: ObjectType;
  }

  export interface Input {
    readonly httpBinding: ast.Operation.Input.HttpBinding;
    readonly type: ObjectType;
  }

  export interface Output {
    readonly httpBinding: ast.Operation.Output.HttpBinding;
    readonly type: ObjectType | OptionType<ObjectType>;
  }

  export type HttpBinding = ast.Operation.HttpBinding;
}
