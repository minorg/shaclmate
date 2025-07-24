import {
  VariableDeclarationKind,
  type VariableStatementStructure,
} from "ts-morph";
import {
  type FunctionDeclarationStructure,
  type ModuleDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

type IdentifierTypeDeclarations = readonly (
  | FunctionDeclarationStructure
  | ModuleDeclarationStructure
  | TypeAliasDeclarationStructure
  | VariableStatementStructure
)[];

function identifierFromStringFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const expressions: string[] = [
    `purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: ${this.dataFactoryVariable}, identifier }))`,
  ];

  if (this.identifierType.isNamedNodeKind) {
    expressions.push(
      `chain((identifier) => (identifier.termType === "NamedNode") ? purify.Either.of(identifier) : purify.Left(new Error("expected identifier to be NamedNode")))`,
    );

    if (this.identifierType.in_.length > 0) {
      expressions.push(
        `chain((identifier) => { switch (identifier.value) { ${this.identifierType.in_.map((iri) => `case "${iri.value}": return purify.Either.of(identifier);`).join(" ")} default: return purify.Left(new Error("expected NamedNode identifier to be one of ${this.identifierType.in_.map((iri) => iri.value).join(" ")}))); }`,
      );
    }
  }

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: "fromString",
    parameters: [
      {
        name: "identifier",
        type: "string",
      },
    ],
    returnType: "purify.Either<Error, Identifier>",
    statements: [`return ${expressions.join(".")};`],
  };
}

function identifierToStringFunctionDeclaration(
  this: ObjectType,
): VariableStatementStructure {
  return {
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    kind: StructureKind.VariableStatement,
    declarations: [
      {
        initializer: "rdfjsResource.Resource.Identifier.toString",
        leadingTrivia:
          "// biome-ignore lint/suspicious/noShadowRestrictedNames:",
        name: "toString",
      },
    ],
  };
}

export function identifierTypeDeclarations(
  this: ObjectType,
): IdentifierTypeDeclarations {
  const ancestorObjectTypeWithSameIdentifierType =
    this.ancestorObjectTypes.find(
      (ancestorObjectType) =>
        ancestorObjectType.identifierType.name === this.identifierType.name,
    );

  if (ancestorObjectTypeWithSameIdentifierType) {
    return reExportAncestorIdentifierTypeDeclarations(
      ancestorObjectTypeWithSameIdentifierType,
    );
  }

  if (
    this.identifierType.nodeKinds.has("BlankNode") &&
    this.identifierType.nodeKinds.has("NamedNode") &&
    this.identifierType.in_.length === 0
  ) {
    return reExportRdfjsResourceIdentifierTypeDeclarations.bind(this)();
  }

  // Bespoke identifier type and associated functions
  return [
    {
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: "Identifier",
      type: this.identifierType.name,
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: "Identifier",
      statements: [
        identifierFromStringFunctionDeclaration.bind(this)(),
        identifierToStringFunctionDeclaration.bind(this)(),
      ],
    },
  ];
}

function reExportAncestorIdentifierTypeDeclarations(
  ancestorObjectType: ObjectType,
): IdentifierTypeDeclarations {
  // This object type's identifier type has the same identifier type as an ancestor object type,
  // so just reuse the latter.
  return [
    {
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: "Identifier",
      type: `${ancestorObjectType.staticModuleName}.Identifier`,
    },
    {
      isExported: true,
      kind: StructureKind.VariableStatement,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          initializer: `${ancestorObjectType.staticModuleName}.Identifier`,
          name: "Identifier",
        },
      ],
    },
  ];
}

function reExportRdfjsResourceIdentifierTypeDeclarations(
  this: ObjectType,
): IdentifierTypeDeclarations {
  // This object type's identifier type is equivalent to rdfjsResource.Resource.Identifier, so just reuse the latter.
  return [
    {
      isExported: true,
      kind: StructureKind.TypeAlias,
      name: "Identifier",
      type: "rdfjsResource.Resource.Identifier",
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: "Identifier",
      statements: [
        {
          isExported: true,
          kind: StructureKind.Function,
          name: "fromString",
          parameters: [
            {
              name: "identifier",
              type: "string",
            },
          ],
          returnType: "purify.Either<Error, Identifier>",
          statements: [
            `return purify.Either.encase(() => rdfjsResource.Resource.Identifier.fromString({ dataFactory: ${this.dataFactoryVariable}, identifier }));`,
          ],
        },
        {
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          kind: StructureKind.VariableStatement,
          declarations: [
            {
              initializer: "rdfjsResource.Resource.Identifier.toString",
              leadingTrivia:
                "// biome-ignore lint/suspicious/noShadowRestrictedNames:",
              name: "toString",
            },
          ],
        },
      ],
    },
  ];
}
