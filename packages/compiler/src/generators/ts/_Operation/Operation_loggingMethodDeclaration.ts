import { Operation } from "../Operation.js";
import { Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function Operation_loggingMethodDeclaration(this: Operation): Code {
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