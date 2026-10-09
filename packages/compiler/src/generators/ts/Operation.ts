import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type * as ast from "../../ast/index.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Reusables } from "./Reusables.js";
import type { Service } from "./Service.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class Operation extends AbstractConstruct {
  readonly error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
  readonly name: string;
  readonly parameter: Maybe<ObjectType>;
  readonly result: Maybe<Type>;
  private readonly service: Pick<Service, "name">;

  constructor({
    error,
    name,
    lazyBindings,
    parameter,
    result,
    service,
    ...superParameters
  }: {
    error: Maybe<ObjectType | ObjectDiscriminatedUnionType>;
    name: string;
    lazyBindings: () => readonly Operation.Binding[];
    parameter: Maybe<ObjectType>;
    result: Maybe<Type>;
    service: Pick<Service, "name">;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.error = error;
    this.lazyBindings = lazyBindings;
    this.name = name;
    this.parameter = parameter;
    this.result = result;
    this.service = service;
  }

  @Memoize()
  get bindings(): readonly Operation.Binding[] {
    return this.lazyBindings();
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

  @Memoize()
  private get returnTypeAnnotation(): Code {
    return code`Promise<${this.reusables.imports.Either}<${this.error.map((error) => error.expression).orDefault(code`Error`)}, ${this.result.map((result) => result.expression).orDefault(code`void`)}>>`;
  }

  private readonly lazyBindings: () => readonly Operation.Binding[];
}

export namespace Operation {
  export class HttpBinding {
    private readonly operation: Operation;
    private readonly request: ast.Operation.HttpBinding.Request;
    // private readonly response: ast.Operation.HttpBinding.Response;
    private readonly reusables: Reusables;

    constructor({
      operation,
      request,
      reusables,
    }: {
      operation: Operation;
      request: ast.Operation.HttpBinding.Request;
      response: ast.Operation.HttpBinding.Response;
      reusables: Reusables;
    }) {
      this.operation = operation;
      this.request = request;
      // this.response = response;
      this.reusables = reusables;
    }

    httpApiRouteRegistration(_parameters: {
      variables: { service: Code };
    }): Code {
      const httpApiRouteRegistrationParameters: Code[] = [];

      httpApiRouteRegistrationParameters.push(
        code`${literalOf(
          this.request.uriTemplate.parts
            .map((part) => {
              if (part.type === "literal") {
                return part.value;
              }

              const { operator, variables } = part;

              let convertedVariables = variables
                .map((variable) => {
                  let convertedVariable = `:${variable.name}`;
                  if (
                    variable.modifier?.type === "explode" ||
                    operator === "+"
                  ) {
                    convertedVariable = `${convertedVariable}*`;
                  }
                  return convertedVariable;
                })
                .join("/");
              if (operator === "/") {
                convertedVariables = `/${convertedVariables}`;
              }
              return convertedVariables;
            })
            .join(""),
        )}`,
      );

      const parameterProperties = new Map<
        string,
        ObjectType.ShaclProperty<Type>
      >();
      this.operation.parameter.ifJust((parameter) => {
        for (const property of parameter.properties) {
          if (property.kind === "Shacl") {
            parameterProperties.set(property.name, property);
          }
        }
      });
      const targetSchemas = new Map<
        ast.Operation.HttpBinding.Request.ParameterSource,
        Code[]
      >();
      for (const [
        parameterName,
        parameterSource,
      ] of this.request.parameterSources.entries()) {
        let targetSchemas_ = targetSchemas.get(parameterSource);
        if (!targetSchemas_) {
          targetSchemas_ = [];
          targetSchemas.set(parameterSource, targetSchemas_);
        }
        const parameterProperty = parameterProperties.get(parameterName);
        invariant(parameterProperty);
        const parameterJsonSchema = parameterProperty.jsonSchema.unsafeCoerce();
        targetSchemas_.push(
          code`${parameterJsonSchema.key}: ${parameterJsonSchema.schema}`,
        );
      }
      for (const [target, properties] of targetSchemas.entries()) {
        httpApiRouteRegistrationParameters.push(
          code`${this.reusables.snippets.zValidator}(${literalOf(target === "path" ? "param" : target)}, ${this.reusables.imports.z}.object({ ${joinCode(properties, { on: ", " })} }))`,
        );
      }

      return code`${this.request.method.toLowerCase()}(${joinCode(httpApiRouteRegistrationParameters, { on: ", " })})`;
    }
  }

  export type Binding = HttpBinding;
}
