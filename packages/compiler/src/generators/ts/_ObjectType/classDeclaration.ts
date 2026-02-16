import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, def, joinCode } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { equalsFunctionOrMethodDeclaration } from "./equalsFunctionOrMethodDeclaration.js";
import { hashFunctionOrMethodDeclarations } from "./hashFunctionOrMethodDeclarations.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function constructorDeclaration(this: ObjectType): Code {
  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParametersSignature.toList(),
  );

  const parametersType: Code[] = [];
  if (parametersPropertySignatures.length > 0) {
    parametersType.push(code`{ ${joinCode(parametersPropertySignatures)} }`);
  }
  if (this.parentObjectTypes.length > 0) {
    // Pass up parameters
    parametersType.push(
      code`ConstructorParameters<typeof ${this.parentObjectTypes[0].name}>[0]`,
    );
  }
  if (parametersType.length === 0) {
    parametersType.push(code`object`);
  }

  const statements: Code[] = [];
  if (this.parentObjectTypes.length > 0) {
    // An ancestor object type may be extern so we always have a constructor and always pass up parameters instead
    // of trying to sense whether we need to or not.
    statements.push(code`super(parameters);`);
  }

  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) =>
        propertySignature.toCodeString([]).indexOf("?:") !== -1,
    );
  const parametersVariable = code`parameters${parametersHasQuestionToken ? "?" : ""}`;
  const propertyStatements = this.properties.flatMap((property) =>
    property.constructorStatements({
      variables: {
        parameter: code`${parametersVariable}.${property.name}`,
        parameters: parametersVariable,
      },
    }),
  );
  statements.push(...propertyStatements);

  return code`\
${propertyStatements.length === 0 ? "// biome-ignore lint/complexity/noUselessConstructor: Always have a constructor" : ""}
constructor(${statements.length > 0 ? "parameters" : "_parameters"}${parametersHasQuestionToken ? "?" : ""}: ${joinCode(parametersType, { on: " & " })}) {
${joinCode(statements)}
}`;
}

export function classDeclaration(this: ObjectType): Code {
  this.ensureAtMostOneSuperObjectType();

  return code`\
${this.comment.alt(this.label).map(tsComment).orDefault("")}
${this.export ? "export " : ""}${this.abstract ? "abstract " : ""}class ${def(this.name)}${this.parentObjectTypes.length > 0 ? ` extends ${this.parentObjectTypes[0].name}` : ""} {
${joinCode(
  [
    ...this.properties.flatMap((property) => property.declaration.toList()),
    constructorDeclaration.bind(this)(),
    ...this.properties.flatMap((property) =>
      property.getAccessorDeclaration.toList(),
    ),
    ...equalsFunctionOrMethodDeclaration.bind(this)().toList(),
    ...hashFunctionOrMethodDeclarations.bind(this)(),
    ...toJsonFunctionOrMethodDeclaration.bind(this)().toList(),
    ...toRdfFunctionOrMethodDeclaration.bind(this)().toList(),
    ...toStringMethodDeclaration.bind(this)().toList(),
  ],
  { on: "\n\n" },
)}
}`;
}

function toStringMethodDeclaration(this: ObjectType): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(
    code`${this.parentObjectTypes.length > 0 ? "override " : ""}toString(): string { return JSON.stringify(this.${syntheticNamePrefix}toJson()); }`,
  );
}
