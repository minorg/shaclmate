import { invariant } from "ts-invariant";
import type * as ast from "../../../ast/index.js";
import type { Operation } from "../Operation.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function Operation_httpApiRouteRegistration(
  this: Operation,
  {
    variables,
  }: {
    variables: { logger: Code; service: Code };
  },
): Code {
  let mapErrorToProblemDetailsJson: Code;
  if (this.errors.length > 0) {
    const errorStatusCodes = new Set<number>(
      this.errors.map((error) => error.httpBinding.statusCode),
    );
    errorStatusCodes.add(500); // For UnknownError

    const errorDiscriminantPropertyName =
      this.errors[0].type.discriminatedType.unsafeCoerce().discriminantProperty
        .name;
    mapErrorToProblemDetailsJson = code`\
let problemDetailsJson: ${this.reusables.snippets.ProblemDetailsJson}<${joinCode(
      [...errorStatusCodes]
        .sort()
        .map((errorStatusCode) => code`${literalOf(errorStatusCode)}`),
      { on: "|" },
    )}>;
switch (error.${errorDiscriminantPropertyName}) {
${joinCode(
  this.errors.map((error) => {
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
      this.httpBinding.uriTemplate.parts
        .map((part) => {
          if (part.type === "literal") {
            return part.value;
          }

          const { operator, variables } = part;

          let convertedVariables = variables
            .map((variable) => {
              let convertedVariable = `:${variable.name}`;
              if (variable.modifier?.type === "explode" || operator === "+") {
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
  this.input
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
  (await ${variables.service}.${this.name}(${inputForwarding!}))
  .mapLeft(error => {
${mapErrorToProblemDetailsJson}

    ${variables.logger}.error({ status: problemDetailsJson.status, type: problemDetailsJson.type }, problemDetailsJson.detail ?? "(no message)");

    return c.json(problemDetailsJson, problemDetailsJson.status, { "Content-Type": "application/problem+json" });
  })
  .map(${this.output
    .map((output): Code => {
      switch (output.httpBinding.contentType) {
        case "application/json":
          switch (output.type.kind) {
            case "Object":
              return code`((result) => c.json(${output.type.toJsonValueFunction.unannotatedUsage}(result) as ${output.type.jsonValueType.expression}, ${this.httpBinding.statusCode}))`;
            case "Option":
              invariant(output.type.itemType.kind === "Object");
              return code`\
((resultMaybe) => {
  const result = resultMaybe.extract();
  if (result === undefined) {
    return c.body(null, 404);
  }
  return c.json(${output.type.itemType.toJsonValueFunction.unannotatedUsage}(result) as ${output.type.itemType.jsonValueType.expression}, ${this.httpBinding.statusCode});
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
    .orDefault(code`() => c.body(null, ${this.httpBinding.statusCode})`)})
  .extract()
`);

  return code`${this.httpBinding.method.toLowerCase()}(${joinCode(httpApiRouteRegistrationParameters, { on: ", " })})`;
}
