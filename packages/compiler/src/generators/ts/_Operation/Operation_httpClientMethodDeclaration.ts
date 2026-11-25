import { invariant } from "ts-invariant";
import type { Operation } from "../Operation.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function Operation_httpClientMethodDeclaration(
  this: Operation,
  parameters: { variables: { honoClient: Code } },
): Code {
  const variables = {
    ...parameters.variables,
    eitherAsyncHelpers: code`_eitherAsyncHelpers`,
    parameters: code`parameters`,
    response: code`response`,
  };

  const honoClientMethodParts: Code[] = [variables.honoClient];
  for (const part of this.httpBinding.uriTemplate.parts) {
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
        honoClientMethodParts.push(code`[${literalOf(`:${variable.name}`)}]`);
      }
    }
  }
  honoClientMethodParts.push(code`.\$${this.httpBinding.method.toLowerCase()}`);
  const honoClientMethod = joinCode(honoClientMethodParts);

  let honoClientMethodParameters: Code;
  this.input
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
  const mapLeftToUnknownError =
    this.errors.length > 0
      ? code`.mapLeft(${this.reusables.snippets.UnknownError}.fromError)`
      : code``;

  this.output
    .ifJust((output) => {
      switch (output.type.kind) {
        case "Object":
          responseHandlingStatements.push(code`\
if (${variables.response}.status === ${this.httpBinding.statusCode}) {
${
  this.errors.length > 0
    ? code`\
let responseJson: ${output.type.jsonValueType.expression};
try {
  responseJson = await ${variables.response}.json();
} catch (e) {
  return ${variables.eitherAsyncHelpers}.throwE(${this.reusables.snippets.UnknownError}.fromError(e as Error));
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
if (${variables.response}.status === ${this.httpBinding.statusCode}) {
${
  this.errors.length > 0
    ? code`\
let responseJson: ${output.type.itemType.jsonValueType.expression};
try {
  responseJson = await ${variables.response}.json();
} catch (e) {
  return ${variables.eitherAsyncHelpers}.throwE(${this.reusables.snippets.UnknownError}.fromError(e as Error));
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
if (${variables.response}.status === ${this.httpBinding.statusCode}) {
  return;
}`);
    });

  for (const error of this.errors) {
    responseHandlingStatements.push(code`\
if (${variables.response}.status === ${error.httpBinding.statusCode}) {
  let responseJson: ${error.type.jsonValueType.expression};
  try {
    responseJson = await ${variables.response}.json();
  } catch (e) {
    return ${variables.eitherAsyncHelpers}.throwE(${this.reusables.snippets.UnknownError}.fromError(e as Error));
  }

  return ${variables.eitherAsyncHelpers}.throwE(await ${variables.eitherAsyncHelpers}.liftEither((${error.type.fromJsonValueFunction.annotatedUsage}(responseJson))${mapLeftToUnknownError}));
}`);
  }

  const fallThroughErrorExpression = code`new Error(\`unexpected response status: \${response.status}\`)`;
  if (this.errors.length > 0) {
    responseHandlingStatements.push(
      code`return ${variables.eitherAsyncHelpers}.throwE(${this.reusables.snippets.UnknownError}.fromError(${fallThroughErrorExpression}));`,
    );
  } else {
    responseHandlingStatements.push(
      code`return ${variables.eitherAsyncHelpers}.throwE(${fallThroughErrorExpression})`,
    );
  }

  return code`\
async ${this.interfaceSignature} {
  return ${this.reusables.imports.EitherAsync}(async (${variables.eitherAsyncHelpers}) => {
    const response = await ${honoClientMethod}(${honoClientMethodParameters!});

${joinCode(responseHandlingStatements, { on: "\n\n" })}
  });
}`;
}
