import { camelCase } from "change-case";
import { Maybe } from "purify-ts";
import type {
  OptionalKind,
  ParameterDeclarationStructure,
  TypeParameterDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

const hasherVariable = "_hasher";

export const hasherTypeConstraint =
  "{ update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }";

export function hashFunctionOrMethodDeclaration(this: ObjectType): Maybe<{
  parameters: OptionalKind<ParameterDeclarationStructure>[];
  returnType: string;
  statements: string[];
  typeParameters: OptionalKind<TypeParameterDeclarationStructure>[];
}> {
  if (!this.configuration.features.has("hash")) {
    return Maybe.empty();
  }

  let thisVariable: string;
  switch (this.configuration.objectTypeDeclarationType) {
    case "class":
      thisVariable = "this";
      break;
    case "interface":
      thisVariable = `_${camelCase(this.name)}`;
      break;
  }

  const propertyHashStatements = this.properties.flatMap((property) =>
    property.hashStatements({
      depth: 0,
      variables: {
        hasher: hasherVariable,
        value: `${thisVariable}.${property.name}`,
      },
    }),
  );
  if (
    this.configuration.objectTypeDeclarationType === "class" &&
    propertyHashStatements.length === 0
  ) {
    return Maybe.empty();
  }

  const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
  if (this.configuration.objectTypeDeclarationType === "interface") {
    parameters.push({
      name: thisVariable,
      type: this.name,
    });
  }
  parameters.push({
    name: hasherVariable,
    type: "HasherT",
  });

  const statements: string[] = [];

  let hasOverrideKeyword = false;
  switch (this.configuration.objectTypeDeclarationType) {
    case "class": {
      // If there's an ancestor with a hash implementation then delegate to super.
      for (const ancestorObjectType of this.ancestorObjectTypes) {
        if (
          (ancestorObjectType.classDeclaration().methods ?? []).some(
            (method) => method.name === "hash",
          )
        ) {
          statements.push(`super.hash(${hasherVariable});`);
          hasOverrideKeyword = true;
          break;
        }
      }
      break;
    }
    case "interface": {
      for (const parentObjectType of this.parentObjectTypes) {
        parentObjectType
          .hashFunctionDeclaration()
          .ifJust((hashFunctionDeclaration) => {
            statements.push(
              `${parentObjectType.name}.${hashFunctionDeclaration.name}(${thisVariable}, ${hasherVariable});`,
            );
          });
      }
      break;
    }
  }

  statements.push(...propertyHashStatements);

  statements.push(`return ${hasherVariable};`);

  return Maybe.of({
    hasOverrideKeyword,
    parameters,
    returnType: "HasherT",
    statements,
    typeParameters: [
      {
        name: "HasherT",
        constraint: hasherTypeConstraint,
      },
    ],
  });
}
