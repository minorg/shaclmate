import { Maybe } from "purify-ts";
import {
  type ClassDeclarationStructure,
  type ConstructorDeclarationStructure,
  type GetAccessorDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type StatementStructures,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { tsComment } from "../tsComment.js";
import { equalsFunctionOrMethodDeclaration } from "./equalsFunctionOrMethodDeclaration.js";
import { hashFunctionOrMethodDeclarations } from "./hashFunctionOrMethodDeclarations.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function constructorDeclaration(
  this: ObjectType,
): OptionalKind<ConstructorDeclarationStructure> {
  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParametersSignature.toList(),
  );

  const parametersType: string[] = [];
  if (parametersPropertySignatures.length > 0) {
    parametersType.push(
      `{ ${parametersPropertySignatures
        .map(
          (propertySignature) =>
            `readonly ${propertySignature.name}${propertySignature.hasQuestionToken ? "?" : ""}: ${propertySignature.type}`,
        )
        .join(", ")} }`,
    );
  }
  if (this.parentObjectTypes.length > 0) {
    // Pass up parameters
    parametersType.push(
      `ConstructorParameters<typeof ${this.parentObjectTypes[0].name}>[0]`,
    );
  }
  if (parametersType.length === 0) {
    parametersType.push("object");
  }

  const statements: (string | StatementStructures)[] = [];
  if (this.parentObjectTypes.length > 0) {
    // An ancestor object type may be extern so we always have a constructor and always pass up parameters instead
    // of trying to sense whether we need to or not.
    statements.push("super(parameters);");
  }

  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) => !!propertySignature.hasQuestionToken,
    );
  const parametersVariable = `parameters${parametersHasQuestionToken ? "?" : ""}`;
  const propertyStatements = this.properties.flatMap((property) =>
    property.constructorStatements({
      variables: {
        parameter: `${parametersVariable}.${property.name}`,
        parameters: parametersVariable,
      },
    }),
  );
  statements.push(...propertyStatements);

  return {
    leadingTrivia:
      propertyStatements.length === 0
        ? "// biome-ignore lint/complexity/noUselessConstructor: Always have a constructor\n"
        : undefined,
    parameters: [
      {
        hasQuestionToken: parametersHasQuestionToken,
        name: statements.length > 0 ? "parameters" : "_parameters",
        type: parametersType.join(" & "),
      },
    ],
    statements,
  };
}

export function classDeclaration(
  this: ObjectType,
): Maybe<ClassDeclarationStructure> {
  if (this.declarationType !== "class") {
    return Maybe.empty();
  }

  this.ensureAtMostOneSuperObjectType();

  const getAccessors: OptionalKind<GetAccessorDeclarationStructure>[] = [];
  const properties: OptionalKind<PropertyDeclarationStructure>[] = [];
  for (const property of this.properties) {
    property.propertyDeclaration.ifJust((propertyDeclaration) =>
      properties.push(propertyDeclaration),
    );
    property.getAccessorDeclaration.ifJust((getAccessor) =>
      getAccessors.push(getAccessor),
    );
  }

  return Maybe.of({
    ctors: [constructorDeclaration.bind(this)()],
    extends:
      this.parentObjectTypes.length > 0
        ? this.parentObjectTypes[0].name
        : undefined,
    getAccessors,
    isAbstract: this.abstract,
    isExported: this.export,
    kind: StructureKind.Class,
    leadingTrivia: this.comment.alt(this.label).map(tsComment).extract(),
    methods: [
      ...equalsMethodDeclaration.bind(this)().toList(),
      ...hashMethodDeclarations.bind(this)(),
      ...toJsonMethodDeclaration.bind(this)().toList(),
      ...toRdfMethodDeclaration.bind(this)().toList(),
      ...toStringMethodDeclaration.bind(this)().toList(),
    ],
    name: this.name,
    properties,
  });
}

function equalsMethodDeclaration(
  this: ObjectType,
): Maybe<OptionalKind<MethodDeclarationStructure>> {
  return equalsFunctionOrMethodDeclaration.bind(this)();
}

function hashMethodDeclarations(
  this: ObjectType,
): readonly OptionalKind<MethodDeclarationStructure>[] {
  return hashFunctionOrMethodDeclarations.bind(this)();
}

function toJsonMethodDeclaration(
  this: ObjectType,
): Maybe<OptionalKind<MethodDeclarationStructure>> {
  return toJsonFunctionOrMethodDeclaration
    .bind(this)()
    .map((toJsonFunctionOrMethodDeclaration) => ({
      ...toJsonFunctionOrMethodDeclaration,
      hasOverrideKeyword: this.parentObjectTypes.length > 0,
    }));
}

function toRdfMethodDeclaration(
  this: ObjectType,
): Maybe<OptionalKind<MethodDeclarationStructure>> {
  return toRdfFunctionOrMethodDeclaration
    .bind(this)()
    .map((toRdfFunctionOrMethodDeclaration) => ({
      ...toRdfFunctionOrMethodDeclaration,
      hasOverrideKeyword: this.parentObjectTypes.length > 0,
    }));
}

function toStringMethodDeclaration(
  this: ObjectType,
): Maybe<OptionalKind<MethodDeclarationStructure>> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of({
    hasOverrideKeyword: this.parentObjectTypes.length > 0,
    name: "toString",
    returnType: "string",
    statements: [`return JSON.stringify(this.${syntheticNamePrefix}toJson());`],
  });
}
