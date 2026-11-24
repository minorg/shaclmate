import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { parse as parseUriTemplate } from "uri-template";
import type * as ast from "../../ast/index.js";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { Service } from "./Service.js";
import type { Type } from "./Type.js";
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
            this.errors.map(
              (error) => error.type.discriminatedType.unsafeCoerce().expression,
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
      const mapErrorBranches: Code[] = [];
      if (this.operation.errors.length > 0) {
        const errorDiscriminantPropertyName =
          this.operation.errors[0].type.discriminatedType.unsafeCoerce()
            .discriminantProperty.name;
        mapErrorBranches.push(code`\
if (${literalOf(errorDiscriminantPropertyName)} in error) {
  switch (error.${errorDiscriminantPropertyName}) {
${joinCode(
  this.operation.errors.map((error) => {
    const errorDiscriminantPropertyValues =
      error.type.discriminatedType.unsafeCoerce().discriminantProperty.values;
    const errorName = error.type.name.unsafeCoerce();
    const errorType = error.type.shapeIdentifier;
    invariant(errorType.termType === "NamedNode");
    return code`${joinCode(errorDiscriminantPropertyValues.map((value) => code`case ${literalOf(value)}:`))} problemDetailsJson = { status: ${literalOf(error.httpBinding.statusCode)}, title: ${literalOf(errorName)}, type: ${literalOf(errorType.value)} }; break;`;
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
          const inputPropertiesByName = new Map<
            string,
            ObjectType.ShaclProperty<Type>
          >();
          for (const property of input.type.properties) {
            if (property.kind === "Shacl") {
              inputPropertiesByName.set(property.name, property);
            }
          }

          const inputForwardingPropertyAssignments: Record<string, Code> = {};
          for (const [
            inputPropertyName,
            inputPropertySource,
          ] of input.httpBinding.propertySourcesByPropertyName.entries()) {
            const inputProperty = inputPropertiesByName.get(inputPropertyName);
            invariant(inputProperty);

            inputForwardingPropertyAssignments[inputPropertyName] =
              code`${inputProperty.type.fromJsonValueFunction.unannotatedUsage}(c.req.valid("${inputPropertySource === "path" ? "param" : inputPropertySource}").${inputPropertyName}, { schema: ${inputProperty.type.schema.expression} })`;

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
    ${mapErrorBranches.length > 1 ? code`let problemDetailsJson: ${this.reusables.snippets.ProblemDetailsJson};` : code`const `}${joinCode(mapErrorBranches, { on: " else " })}

    ${variables.logger}.error({ status: problemDetailsJson.status, type: problemDetailsJson.type }, problemDetailsJson.detail ?? "(no message)");

    return c.json(problemDetailsJson, problemDetailsJson.status ?? 500, { "Content-Type": "application/problem+json" });
  })
  .map(${this.operation.output
    .map((output): Code => {
      switch (output.httpBinding.contentType) {
        case "application/json":
          return code`((result) => c.json(${output.type.toJsonValueFunction.unannotatedUsage}(result), ${this.statusCode}))`;
        default:
          // contentType satisfies never;
          throw new RangeError(output.httpBinding.contentType);
      }
    })
    .orDefault(code`() => c.body(null, ${this.statusCode})`)})
  .extract()
`);

      return code`${this.method.toLowerCase()}(${joinCode(httpApiRouteRegistrationParameters, { on: ", " })})`;
    }
  }
}
