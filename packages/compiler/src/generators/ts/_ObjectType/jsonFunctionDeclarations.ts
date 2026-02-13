import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { sharedImports } from "../sharedImports.js";
import { sharedSnippets } from "../sharedSnippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";

function fromJsonFunctionDeclarations(this: ObjectType): readonly Code[] {
  const initializers: string[] = [];
  const propertiesFromJsonReturnType: Code[] = [];
  const propertiesFromJsonStatements: Code[] = [];
  const propertyReturnTypeSignatures: Code[] = [];

  propertiesFromJsonStatements.push(
    code`const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(_json);`,
    code`if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return ${sharedImports.Left}(${syntheticNamePrefix}jsonSafeParseResult.error); }`,
    code`const ${variables.jsonObject} = ${syntheticNamePrefix}jsonSafeParseResult.data;`,
  );

  const chains: { expression: Code; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject})`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    propertiesFromJsonReturnType.push(
      code`${sharedSnippets.UnwrapR}<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson>>`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      propertiesFromJsonStatements.push(...propertyFromJsonStatements);
      initializers.push(property.name);
      propertyReturnTypeSignatures.push(
        code`${property.name}: ${property.type.name};`,
      );
    }
  }

  const resultExpression = `{ ${initializers.join(", ")} }`;
  if (chains.length === 0) {
    propertiesFromJsonStatements.push(
      code`return ${sharedImports.Either}.of(${resultExpression})`,
    );
  } else {
    propertiesFromJsonStatements.push(
      code`return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            code`(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          code`(${resultExpression})`,
        )}`,
    );
  }

  if (propertyReturnTypeSignatures.length > 0) {
    propertiesFromJsonReturnType.splice(
      0,
      0,
      code`{ ${joinCode(propertyReturnTypeSignatures, { on: " " })} }`,
    );
  }

  const functionDeclarations: Code[] = [];

  functionDeclarations.push(code`\
export function ${syntheticNamePrefix}propertiesFromJson(_json: unknown): ${sharedImports.Either}<${sharedImports.z}.ZodError, ${joinCode(propertiesFromJsonReturnType, { on: " & " })}> {
${joinCode(propertiesFromJsonStatements)}
}`);

  if (this.abstract) {
    return functionDeclarations;
  }

  let propertiesFromJsonExpression = code`${syntheticNamePrefix}propertiesFromJson(json)`;
  if (this.declarationType === "class") {
    propertiesFromJsonExpression = code`${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
  }
  functionDeclarations.push(code`\
export function ${syntheticNamePrefix}fromJson(json: unknown): ${sharedImports.Either}<${sharedImports.z}.ZodError, ${this.name}> {
  return ${propertiesFromJsonExpression};
}`);

  return functionDeclarations;
}

function jsonSchemaFunctionDeclaration(this: ObjectType): Code {
  return code`\
export function ${syntheticNamePrefix}jsonSchema() {
  return ${sharedImports.z}.toJSONSchema(${syntheticNamePrefix}jsonZodSchema());
}`;
}

function jsonUiSchemaFunctionDeclaration(this: ObjectType): Code {
  const variables = { scopePrefix: code`scopePrefix` };
  const elements: Code[] = this.parentObjectTypes
    .map(
      (parentObjectType) =>
        code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix })`,
    )
    .concat(
      this.ownProperties.flatMap((property) =>
        property.jsonUiSchemaElement({ variables }).toList(),
      ),
    );

  return code`\
export function ${syntheticNamePrefix}jsonUiSchema(parameters?: { scopePrefix?: string }): any {
  const scopePrefix = parameters?.scopePrefix ?? "#";
  return { "elements": [ ${elements.join(", ")} ], label: "${this.label.orDefault(this.name)}", type: "Group" };
}`;
}

function jsonZodSchemaFunctionDeclaration(this: ObjectType): Code {
  const mergeZodObjectSchemas: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    mergeZodObjectSchemas.push(
      `${parentObjectType.jsonZodSchema({ context: "type" })}`,
    );
  }
  if (this.properties.length > 0) {
    mergeZodObjectSchemas.push(
      `${sharedImports.z}.object({ ${this.properties
        .flatMap((property) => property.jsonZodSchema.toList())
        .map(({ key, schema }) => `"${key}": ${schema}`)
        .join(",")} })`,
    );
  }

  return code`\
export function ${syntheticNamePrefix}jsonZodSchema() {
  return ${
    mergeZodObjectSchemas.length > 0
      ? mergeZodObjectSchemas.reduce((merged, zodObjectSchema) => {
          if (merged.length === 0) {
            return zodObjectSchema;
          }
          return `${merged}.merge(${zodObjectSchema})`;
        }, "")
      : `${sharedImports.z}.object()`
  } satisfies ${sharedImports.z}.ZodType<${syntheticNamePrefix}Json>;,
}`;
}

function toJsonFunctionDeclaration(this: ObjectType): Maybe<Code> {
  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  return toJsonFunctionOrMethodDeclaration.bind(this)();
}

export function jsonFunctionDeclarations(this: ObjectType): readonly Code[] {
  if (!this.features.has("json")) {
    return [];
  }

  return [
    ...fromJsonFunctionDeclarations.bind(this)(),
    jsonSchemaFunctionDeclaration.bind(this)(),
    jsonUiSchemaFunctionDeclaration.bind(this)(),
    ...toJsonFunctionDeclaration.bind(this)().toList(),
    jsonZodSchemaFunctionDeclaration.bind(this)(),
  ];
}

const variables = {
  jsonObject: code`${syntheticNamePrefix}jsonObject`,
};
