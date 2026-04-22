import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, def, joinCode } from "../ts-poet-wrapper.js";
import { tsComment } from "../tsComment.js";
import { NamedObjectType_equalsFunctionOrMethodDeclaration } from "./NamedObjectType_equalsFunctionOrMethodDeclaration.js";
import { NamedObjectType_hashFunctionOrMethodDeclarations } from "./NamedObjectType_hashFunctionOrMethodDeclarations.js";
import { NamedObjectType_toJsonFunctionOrMethodDeclaration } from "./NamedObjectType_toJsonFunctionOrMethodDeclaration.js";
import { NamedObjectType_toRdfResourceFunctionOrMethodDeclaration } from "./NamedObjectType_toRdfResourceFunctionOrMethodDeclaration.js";

function NamedObjectType_constructorDeclaration(this: ObjectType): Code {
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

export function NamedObjectType_classDeclaration(this: ObjectType): Code {
  this.ensureAtMostOneSuperObjectType();

  return code`\
${this.comment
  .alt(this.label)
  .map(tsComment)
  .orDefault(
    "",
  )}export ${this.abstract ? "abstract " : ""}class ${def(this.name)}${this.parentObjectTypes.length > 0 ? ` extends ${this.parentObjectTypes[0].name}` : ""} {
${joinCode(
  [
    ...this.properties.flatMap((property) => property.declaration.toList()),
    NamedObjectType_constructorDeclaration.call(this),
    ...this.properties.flatMap((property) =>
      property.getAccessorDeclaration.toList(),
    ),
    ...NamedObjectType_equalsFunctionOrMethodDeclaration.call(this).toList(),
    ...NamedObjectType_hashFunctionOrMethodDeclarations.call(this),
    ...NamedObjectType_toJsonFunctionOrMethodDeclaration.call(this).toList(),
    ...NamedObjectType_toRdfResourceFunctionOrMethodDeclaration.call(
      this,
    ).toList(),
    ...NamedObjectType_toStringMethodDeclaration.call(this).toList(),
  ],
  { on: "\n\n" },
)}
}`;
}

function NamedObjectType_toStringMethodDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(
    code`${this.parentObjectTypes.length > 0 ? "override " : ""}toString(): string { return JSON.stringify(this.${syntheticNamePrefix}toJson()); }`,
  );
}
