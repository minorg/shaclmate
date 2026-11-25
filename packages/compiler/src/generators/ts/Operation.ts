import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { parse as parseUriTemplate } from "uri-template";
import type * as ast from "../../ast/index.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { Service } from "./Service.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export class Operation extends AbstractConstruct {
  readonly errors: readonly Operation.Error[];
  readonly name: string;
  readonly input: Maybe<Operation.Input>;
  readonly output: Maybe<Operation.Output>;
  private readonly lazyHttpBinding: () => Operation.HttpBinding;
  private readonly service: Pick<Service, "name">;

  constructor({
    errors,
    name,
    input,
    lazyHttpBinding,
    output,
    service,
    ...superParameters
  }: {
    errors: readonly Operation.Error[];
    input: Maybe<Operation.Input>;
    lazyHttpBinding: () => Operation.HttpBinding;
    name: string;
    output: Maybe<Operation.Output>;
    service: Pick<Service, "name">;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.errors = errors;
    this.input = input;
    this.lazyHttpBinding = lazyHttpBinding;
    this.name = name;
    this.output = output;
    this.service = service;
  }

  @Memoize()
  get httpBinding(): Operation.HttpBinding {
    return this.lazyHttpBinding();
  }

  @Memoize()
  get interfaceSignature(): Code {
    return code`${this.name}(${this.parametersDeclaration}): ${this.returnTypeAnnotation}`;
  }

  @Memoize()
  get loggingMethodDeclaration(): Code {
    const parametersVariableName = this.input
      .map(() => code`parameters`)
      .orDefault(code``);
    return code`\
async ${this.name}(${this.parametersDeclaration}): ${this.returnTypeAnnotation} {
  const logContext: Record<string, unknown> = {
    service: ${literalOf(this.service.name)},
    operation: ${literalOf(this.name)}${this.input
      .map(
        (input) =>
          code`,\n    parameters: { ${joinCode(
            input.type.properties.flatMap((property) =>
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
    .ifRight((${this.output.map(() => code`output`).orDefault(code``)}) => {
      this.logger.debug(${this.output.map((output) => code`{ ...logContext, output: ${output.type.toLoggableExpression({ variables: { value: code`output` } })} }`).orDefault(code`logContext`)}, "success")
    });
}`;
  }

  @Memoize()
  private get parametersDeclaration(): Code {
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
  private get returnTypeAnnotation(): Code {
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

  export class HttpBinding extends AbstractConstruct {
    private readonly method: string;
    private readonly operation: Operation;
    private readonly statusCode: number;
    private readonly uriTemplate: ReturnType<typeof parseUriTemplate>["ast"];

    constructor({
      method,
      operation,
      statusCode,
      uriTemplate,
      ...superParameters
    }: {
      method: string;
      operation: Operation;
      statusCode: number;
      uriTemplate: ReturnType<typeof parseUriTemplate>["ast"];
    } & ConstructorParameters<typeof AbstractConstruct>[0]) {
      super(superParameters);
      this.method = method;
      this.operation = operation;
      this.statusCode = statusCode;
      this.uriTemplate = uriTemplate;
    }

    httpApiRouteRegistration({
      variables,
    }: {
      variables: { logger: Code; service: Code };
    }): Code {
      let mapErrorToProblemDetailsJson: Code;
      if (this.operation.errors.length > 0) {
        const errorStatusCodes = new Set<number>(
          this.operation.errors.map((error) => error.httpBinding.statusCode),
        );
        errorStatusCodes.add(500); // For UnknownError

        const errorDiscriminantPropertyName =
          this.operation.errors[0].type.discriminatedType.unsafeCoerce()
            .discriminantProperty.name;
        mapErrorToProblemDetailsJson = code`\
let problemDetailsJson: ${this.reusables.snippets.ProblemDetailsJson}<${joinCode(
          [...errorStatusCodes]
            .sort()
            .map((errorStatusCode) => code`${literalOf(errorStatusCode)}`),
          { on: "|" },
        )}>;
switch (error.${errorDiscriminantPropertyName}) {
${joinCode(
  this.operation.errors.map((error) => {
    const errorDiscriminantPropertyValues =
      error.type.discriminatedType.unsafeCoerce().discriminantProperty.values;
    const errorName = error.type.name.unsafeCoerce();
    const errorType = error.type.shapeIdentifier;
    invariant(errorType.termType === "NamedNode");

    const problemDetailsJson: Record<string, Code> = {
      status: code`${literalOf(error.httpBinding.statusCode)}`,
      title: code`${literalOf(errorName)}`,
      type: code`${literalOf(errorType.value)}`,
    };

    for (const errorProperty of error.type.properties) {
      if (errorProperty.kind !== "Shacl") {
        continue;
      }
      if (errorProperty.name !== "detail") {
        continue;
      }
      let errorDetailPropertyValueExpression: Code = code`error.${errorProperty.name}`;
      switch (errorProperty.type.kind) {
        case "Option":
          if (errorProperty.type.itemType.kind === "String") {
            errorDetailPropertyValueExpression = code`${errorDetailPropertyValueExpression}.extract()`;
            break;
          } else {
            continue;
          }
        case "String":
          break;
        default:
          continue;
      }
      problemDetailsJson["detail"] = errorDetailPropertyValueExpression;
    }

    return code`${joinCode(errorDiscriminantPropertyValues.map((value) => code`case ${literalOf(value)}:`))} problemDetailsJson = ${problemDetailsJson}; break;`;
  }),
  { on: "\n" },
)}
  case ${literalOf(`${this.configuration.syntheticNamePrefix}UnknownError`)}:
    problemDetailsJson = ${this.reusables.snippets.errorToProblemDetailsJson}(error.error);
    break;
}`;
      } else {
        mapErrorToProblemDetailsJson = code`const problemDetailsJson = ${this.reusables.snippets.errorToProblemDetailsJson}(error);`;
      }

      const httpApiRouteRegistrationParameters: Code[] = [];

      httpApiRouteRegistrationParameters.push(
        code`${literalOf(
          this.uriTemplate.parts
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

      let inputForwarding: Code;
      const targetSchemas = new Map<
        ast.Operation.Input.HttpBinding.PropertySource,
        Code[]
      >();
      this.operation.input
        .ifJust((input) => {
          const inputForwardingPropertyAssignments: Record<string, Code> = {};
          for (const inputProperty of input.type.properties) {
            if (inputProperty.kind !== "Shacl") {
              continue;
            }
            const inputPropertySource =
              input.httpBinding.propertySourcesByPropertyName.get(
                inputProperty.name,
              );
            invariant(inputPropertySource);

            inputForwardingPropertyAssignments[inputProperty.name] =
              code`${inputProperty.type.fromJsonValueFunction.unannotatedUsage}(c.req.valid("${inputPropertySource === "path" ? "param" : inputPropertySource}").${inputProperty.name}, { schema: ${inputProperty.type.schema.expression} })`;

            let targetSchemas_ = targetSchemas.get(inputPropertySource);
            if (!targetSchemas_) {
              targetSchemas_ = [];
              targetSchemas.set(inputPropertySource, targetSchemas_);
            }
            targetSchemas_.push(
              code`${inputProperty.name}: ${inputProperty.type.jsonValueType.schema}`,
            );
          }

          inputForwarding = code`${this.reusables.snippets.sequenceRecord}(${inputForwardingPropertyAssignments}).unsafeCoerce()`;
        })
        .ifNothing(() => {
          inputForwarding = code``;
        });
      for (const [target, properties] of targetSchemas.entries()) {
        httpApiRouteRegistrationParameters.push(
          code`${this.reusables.snippets.zValidator}(${literalOf(target === "path" ? "param" : target)}, ${this.reusables.imports.z}.object({ ${joinCode(properties, { on: ", " })} }))`,
        );
      }
      httpApiRouteRegistrationParameters.push(code`\
async (c) =>
  (await ${variables.service}.${this.operation.name}(${inputForwarding!}))
  .mapLeft(error => {
${mapErrorToProblemDetailsJson}

    ${variables.logger}.error({ status: problemDetailsJson.status, type: problemDetailsJson.type }, problemDetailsJson.detail ?? "(no message)");

    return c.json(problemDetailsJson, problemDetailsJson.status, { "Content-Type": "application/problem+json" });
  })
  .map(${this.operation.output
    .map((output): Code => {
      switch (output.httpBinding.contentType) {
        case "application/json":
          switch (output.type.kind) {
            case "Object":
              return code`((result) => c.json(${output.type.toJsonValueFunction.unannotatedUsage}(result) as ${output.type.jsonValueType.expression}, ${this.statusCode}))`;
            case "Option":
              invariant(output.type.itemType.kind === "Object");
              return code`\
((resultMaybe) => {
  const result = resultMaybe.extract();
  if (result === undefined) {
    return c.body(null, 404);
  }
  return c.json(${output.type.itemType.toJsonValueFunction.unannotatedUsage}(result) as ${output.type.itemType.jsonValueType.expression}, ${this.statusCode});
})`;
            default:
              output.type satisfies never;
              throw new Error("should never reach this point");
          }

        default:
          throw new RangeError(
            `unsupported output content type: ${output.httpBinding.contentType}`,
          );
      }
    })
    .orDefault(code`() => c.body(null, ${this.statusCode})`)})
  .extract()
`);

      return code`${this.method.toLowerCase()}(${joinCode(httpApiRouteRegistrationParameters, { on: ", " })})`;
    }

    httpClientMethod(parameters: { variables: { honoClient: Code } }): Code {
      const variables = {
        ...parameters.variables,
        eitherAsyncHelpers: code`_eitherAsyncHelpers`,
        parameters: code`parameters`,
        response: code`response`,
      };

      const honoClientMethodParts: Code[] = [variables.honoClient];
      for (const part of this.operation.httpBinding.uriTemplate.parts) {
        if (part.type === "literal") {
          for (const piece of part.value.split("/")) {
            if (piece) {
              honoClientMethodParts.push(code`[${literalOf(piece)}]`);
            }
          }
          continue;
        }

        if (part.operator === "/" || part.operator === "") {
          for (const variable of part.variables) {
            honoClientMethodParts.push(
              code`[${literalOf(`:${variable.name}`)}]`,
            );
          }
        }
      }
      honoClientMethodParts.push(
        code`.\$${this.operation.httpBinding.method.toLowerCase()}`,
      );
      const honoClientMethod = joinCode(honoClientMethodParts);

      let honoClientMethodParameters: Code;
      this.operation.input
        .ifJust((input) => {
          const honoClientMethodParametersRecord: Record<
            string,
            Record<string, Code>
          > = {};
          for (const inputProperty of input.type.properties) {
            if (inputProperty.kind !== "Shacl") {
              continue;
            }
            const inputPropertySource =
              input.httpBinding.propertySourcesByPropertyName.get(
                inputProperty.name,
              );
            invariant(inputPropertySource);
            const honoInputPropertySource =
              inputPropertySource === "path" ? "param" : inputPropertySource;

            if (!honoClientMethodParametersRecord[honoInputPropertySource]) {
              honoClientMethodParametersRecord[honoInputPropertySource] = {};
            }
            let inputPropertyValueExpression = code`${inputProperty.type.toJsonValueFunction.annotatedUsage}(${variables.parameters}.${inputProperty.name})`;
            if (honoInputPropertySource === "param") {
              inputPropertyValueExpression = code`encodeURIComponent(${inputPropertyValueExpression})`;
            }
            honoClientMethodParametersRecord[honoInputPropertySource][
              inputProperty.name
            ] = inputPropertyValueExpression;
          }
          honoClientMethodParameters = code`${honoClientMethodParametersRecord}`;
        })
        .ifNothing(() => {
          honoClientMethodParameters = code``;
        });

      const responseHandlingStatements: Code[] = [];
      const unknownErrorDiscriminantPropertyAssignment = code`${this.configuration.objectDiscriminantProperty.name}: "${this.configuration.syntheticNamePrefix}UnknownError"`;
      const mapLeftToUnknownError =
        this.operation.errors.length > 0
          ? code`.mapLeft(error => ({ error, ${unknownErrorDiscriminantPropertyAssignment} }))`
          : code``;

      this.operation.output
        .ifJust((output) => {
          switch (output.type.kind) {
            case "Object":
              responseHandlingStatements.push(code`\
if (${variables.response}.status === ${this.operation.httpBinding.statusCode}) {
${
  this.operation.errors.length > 0
    ? code`\
let responseJson: ${output.type.jsonValueType.expression};
try {
  responseJson = await ${variables.response}.json();
} catch (e) {
  return ${variables.eitherAsyncHelpers}.throwE({ error: e as Error, ${unknownErrorDiscriminantPropertyAssignment} });
}`
    : code`const responseJson = await ${variables.response}.json();`
}

  return await ${variables.eitherAsyncHelpers}.liftEither(${output.type.fromJsonValueFunction.annotatedUsage}(responseJson)${mapLeftToUnknownError});
}`);
              break;

            case "Option": {
              invariant(output.type.itemType.kind === "Object");
              responseHandlingStatements.push(code`\
if (${variables.response}.status === 404) {
  return ${this.reusables.imports.Maybe}.empty();
}`);

              responseHandlingStatements.push(code`\
if (${variables.response}.status === ${this.operation.httpBinding.statusCode}) {
${
  this.operation.errors.length > 0
    ? code`\
let responseJson: ${output.type.itemType.jsonValueType.expression};
try {
  responseJson = await ${variables.response}.json();
} catch (e) {
  return ${variables.eitherAsyncHelpers}.throwE({ error: e as Error, ${unknownErrorDiscriminantPropertyAssignment} });
}`
    : code`const responseJson = await ${variables.response}.json();`
}

  return ${this.reusables.imports.Maybe}.of(await ${variables.eitherAsyncHelpers}.liftEither(${output.type.itemType.fromJsonValueFunction.annotatedUsage}(responseJson)${mapLeftToUnknownError}));
}`);
              break;
            }

            default:
              output.type satisfies never;
              throw new Error("should never reach this point");
          }
        })
        .ifNothing(() => {
          responseHandlingStatements.push(code`\
if (${variables.response}.status === ${this.operation.httpBinding.statusCode}) {
  return;
}`);
        });

      for (const error of this.operation.errors) {
        responseHandlingStatements.push(code`\
if (${variables.response}.status === ${error.httpBinding.statusCode}) {
  let responseJson: ${error.type.jsonValueType.expression};
  try {
    responseJson = await ${variables.response}.json();
  } catch (e) {
    return ${variables.eitherAsyncHelpers}.throwE({ error: e as Error, ${unknownErrorDiscriminantPropertyAssignment} });
  }

  return ${variables.eitherAsyncHelpers}.throwE(await ${variables.eitherAsyncHelpers}.liftEither((${error.type.fromJsonValueFunction.annotatedUsage}(responseJson))${mapLeftToUnknownError}));
}`);
      }

      const fallThroughErrorExpression = code`new Error(\`unexpected response status: \${response.status}\`)`;
      if (this.operation.errors.length > 0) {
        responseHandlingStatements.push(
          code`return ${variables.eitherAsyncHelpers}.throwE({ error: ${fallThroughErrorExpression}, ${unknownErrorDiscriminantPropertyAssignment} });`,
        );
      } else {
        responseHandlingStatements.push(
          code`return ${variables.eitherAsyncHelpers}.throwE(${fallThroughErrorExpression})`,
        );
      }

      return code`\
async ${this.operation.interfaceSignature} {
  return ${this.reusables.imports.EitherAsync}(async (${variables.eitherAsyncHelpers}) => {
    const response = await ${honoClientMethod}(${honoClientMethodParameters!});

${joinCode(responseHandlingStatements, { on: "\n\n" })}
  });
}`;
    }
  }
}
