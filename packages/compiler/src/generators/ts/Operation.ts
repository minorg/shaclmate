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
    private readonly errorResponses: readonly ast.Operation.HttpBinding.ErrorResponse[];
    private readonly operation: Operation;
    private readonly request: ast.Operation.HttpBinding.Request;
    private readonly resultResponse: ast.Operation.HttpBinding.ResultResponse;
    private readonly reusables: Reusables;

    constructor({
      errorResponses,
      operation,
      request,
      resultResponse,
      reusables,
    }: {
      errorResponses: readonly ast.Operation.HttpBinding.ErrorResponse[];
      operation: Operation;
      request: ast.Operation.HttpBinding.Request;
      resultResponse: ast.Operation.HttpBinding.ResultResponse;
      reusables: Reusables;
    }) {
      this.errorResponses = errorResponses;
      this.operation = operation;
      this.request = request;
      this.resultResponse = resultResponse;
      this.reusables = reusables;
    }

    httpApiRouteRegistration({
      variables,
    }: {
      variables: { logger: Code; service: Code };
    }): Code {
      const errorDiscriminantPropertyName = this.operation.error
        .chain((error) => error.discriminantProperty)
        .map((discriminantProperty) => discriminantProperty.name)
        .extract();
      invariant(
        this.errorResponses.length === 0 || errorDiscriminantPropertyName,
      );
      const mapErrorBranches: Code[] = [];
      if (this.errorResponses.length > 0) {
        mapErrorBranches.push(code`\
if (${literalOf(errorDiscriminantPropertyName)} in error) {
  switch (error.${errorDiscriminantPropertyName}) {
${joinCode(
  this.errorResponses.map((errorResponse) => {
    const errorName = errorResponse.error.name.unsafeCoerce();
    const errorType = errorResponse.error.shapeIdentifier;
    invariant(errorType.termType === "NamedNode");
    return code`case ${literalOf(errorName)}: problemDetailsJson = { status: ${literalOf(errorResponse.statusCode)}, title: ${literalOf(errorName)}, type: ${literalOf(errorType.value)} }; break;`;
  }),
  { on: "\n" },
)}
  }
}`);
      }
      mapErrorBranches.push(
        code`problemDetailsJson = ${this.reusables.snippets.errorToProblemDetailsJson}(error);`,
      );

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
        const parameterJsonSchema = parameterProperty.type.jsonType({
          form: "compact",
        }).schema;
        targetSchemas_.push(
          code`${parameterProperty.name}: ${parameterJsonSchema}`,
        );
      }
      for (const [target, properties] of targetSchemas.entries()) {
        httpApiRouteRegistrationParameters.push(
          code`${this.reusables.snippets.zValidator}(${literalOf(target === "path" ? "param" : target)}, ${this.reusables.imports.z}.object({ ${joinCode(properties, { on: ", " })} }))`,
        );
      }
      httpApiRouteRegistrationParameters.push(code`\
async (c) =>
  (await ${variables.service}.${this.operation.name}(${
    this.request.parameterSources.size > 0
      ? code`${this.reusables.snippets.sequenceRecord}(${[
          ...this.request.parameterSources.entries(),
        ].reduce(
          (acc, [parameterName, parameterSource]) => {
            const parameterProperty = parameterProperties.get(parameterName)!;
            acc[parameterName] =
              code`${parameterProperty.type.fromJsonExpression({
                form: "compact",
                variables: {
                  value: code`c.req.valid("${parameterSource === "path" ? "param" : parameterSource}").${parameterName}`,
                },
              })}`;
            return acc;
          },
          {} as Record<string, Code>,
        )}).unsafeCoerce()`
      : ""
  }))
  .mapLeft(error => {
    ${mapErrorBranches.length > 1 ? code`let problemDetailsJson: ${this.reusables.snippets.ProblemDetailsJson};` : code`const `}${joinCode(mapErrorBranches, { on: " else " })}

    ${variables.logger}.error({ status: problemDetailsJson.status, type: problemDetailsJson.type }, problemDetailsJson.detail ?? "(no message)");

    return c.json(problemDetailsJson, problemDetailsJson.status ?? 500, { "Content-Type": "application/problem+json" });
  })
  .map((${this.operation.result.map(() => "result").orDefault("")}) => c.body(${this.resultResponse.contentType
    .map((contentType): Code => {
      const result = this.operation.result.unsafeCoerce();
      switch (contentType) {
        case "application/json":
          return code`${result.toJsonExpression({ form: "compact", variables: { value: code`result` } })}`;
        default:
          contentType satisfies never;
          throw new RangeError(contentType);
      }
    })
    .orDefault(code`null`)}, ${this.resultResponse.statusCode}))
  .extract()
`);

      return code`${this.request.method.toLowerCase()}(${joinCode(httpApiRouteRegistrationParameters, { on: ", " })})`;
    }
  }

  export type Binding = HttpBinding;
}
