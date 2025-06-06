import {
  type OptionalKind,
  type ParameterDeclarationStructure,
  Scope,
  type TypeParameterDeclarationStructure,
} from "ts-morph";
import { ObjectType } from "../ObjectType.js";

const hasherVariable = "_hasher";

export const hasherTypeConstraint =
  "{ update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }";

export function hashFunctionOrMethodDeclarations(this: ObjectType): readonly {
  hasOverrideKeyword?: boolean;
  name: string;
  parameters: OptionalKind<ParameterDeclarationStructure>[];
  returnType: string;
  scope?: Scope;
  statements: string[];
  typeParameters: OptionalKind<TypeParameterDeclarationStructure>[];
}[] {
  if (!this.features.has("hash")) {
    return [];
  }

  const hashOwnShaclPropertiesStatements = this.ownShaclProperties.flatMap(
    (property) =>
      property.hashStatements({
        depth: 0,
        variables: {
          hasher: hasherVariable,
          value: `${this.thisVariable}.${property.name}`,
        },
      }),
  );

  if (
    this.declarationType === "class" &&
    this.parentObjectTypes.length > 0 &&
    hashOwnShaclPropertiesStatements.length === 0
  ) {
    // If there's a parent class and no hash statements in this class, can skip overriding hash
    return [];
  }

  const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
  if (this.declarationType === "interface") {
    parameters.push({
      name: this.thisVariable,
      type: this.name,
    });
  }
  parameters.push({
    name: hasherVariable,
    type: "HasherT",
  });

  const hashShaclPropertiesStatements: string[] = [];

  let hasOverrideKeyword = false;
  if (this.parentObjectTypes.length > 0) {
    switch (this.declarationType) {
      case "class": {
        hashShaclPropertiesStatements.push(
          `super.hashShaclProperties(${hasherVariable});`,
        );
        hasOverrideKeyword = true;
        break;
      }
      case "interface": {
        for (const parentObjectType of this.parentObjectTypes) {
          hashShaclPropertiesStatements.push(
            `${parentObjectType.name}Static.hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
          );
        }
        break;
      }
    }
  }
  hashShaclPropertiesStatements.push(...hashOwnShaclPropertiesStatements);

  const returnType = "HasherT";
  const typeParameters = [
    {
      name: "HasherT",
      constraint: hasherTypeConstraint,
    },
  ];

  return [
    {
      hasOverrideKeyword,
      name: "hash",
      parameters,
      returnType,
      statements: [
        ...this.ownProperties
          .filter((property) => !(property instanceof ObjectType.ShaclProperty))
          .flatMap((property) =>
            property.hashStatements({
              depth: 0,
              variables: {
                hasher: hasherVariable,
                value: `${this.thisVariable}.${property.name}`,
              },
            }),
          ),
        this.declarationType === "class"
          ? `this.hashShaclProperties(${hasherVariable});`
          : `${this.name}Static.hashShaclProperties(${this.thisVariable}, ${hasherVariable});`,
        `return ${hasherVariable};`,
      ],
      typeParameters,
    },
    {
      hasOverrideKeyword,
      name: "hashShaclProperties",
      parameters,
      returnType,
      scope: this.declarationType === "class" ? Scope.Protected : undefined,
      statements: [
        ...hashShaclPropertiesStatements,
        `return ${hasherVariable};`,
      ],
      typeParameters,
    },
  ];
}
