import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type MethodSignatureStructure,
  type ModuleDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

const objectSetInterfaceMethodSignatures: Record<
  string,
  OptionalKind<MethodSignatureStructure>
> = {
  object: {
    name: "object",
    parameters: [
      {
        name: "identifier",
        type: "$ObjectSet.ObjectIdentifier",
      },
      {
        name: "type",
        type: "$ObjectSet.ObjectTypeName",
      },
    ],
    typeParameters: [
      {
        name: "ObjectT",
      },
    ],
    returnType: "Promise<purify.Either<Error, ObjectT>>",
  },
  objectCount: {
    name: "objectCount",
    parameters: [
      {
        name: "type",
        type: "$ObjectSet.ObjectTypeName",
      },
    ],
    returnType: "Promise<purify.Either<Error, number>>",
  },
  objectIdentifiers: {
    name: "objectIdentifiers",
    parameters: [
      {
        name: "type",
        type: "$ObjectSet.ObjectIdentifier",
      },
      {
        hasQuestionToken: true,
        name: "options",
        type: "{ limit?: number; offset?: number }",
      },
    ],
    returnType:
      "Promise<purify.Either<Error, readonly $ObjectSet.ObjectIdentifier[]>>",
  },
  objects: {
    name: "objects",
    parameters: [
      {
        name: "identifiers",
        type: "readonly $ObjectSet.ObjectIdentifier[]",
      },
      {
        name: "type",
        type: "$ObjectSet.ObjectTypeName",
      },
    ],
    typeParameters: [
      {
        name: "ObjectT",
      },
    ],
    returnType: "Promise<readonly purify.Either<Error, ObjectT>[]>",
  },
};

function objectSetInterfaceDeclaration(): InterfaceDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Interface,
    methods: Object.values(objectSetInterfaceMethodSignatures),
    name: "$ObjectSet",
  };
}

function objectSetModuleDeclaration({
  objectTypeIdentifierNodeKinds,
  objectTypeDiscriminatorValues,
}: {
  objectTypeIdentifierNodeKinds: readonly ("BlankNode" | "NamedNode")[];
  objectTypeDiscriminatorValues: readonly string[];
}): ModuleDeclarationStructure {
  return {
    kind: StructureKind.Module,
    name: "$ObjectSet",
    statements: [
      {
        kind: StructureKind.TypeAlias,
        name: "ObjectIdentifier",
        isExported: true,
        type: objectTypeIdentifierNodeKinds
          .map((nodeKind) => `rdfjs.${nodeKind}`)
          .join(" | "),
      },
      {
        kind: StructureKind.TypeAlias,
        name: "ObjectTypeName",
        isExported: true,
        type: objectTypeDiscriminatorValues
          .map((value) => JSON.stringify(value))
          .join(" | "),
      },
    ],
  };
}

export function objectSetDeclarations({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): readonly (
  | ClassDeclarationStructure
  | InterfaceDeclarationStructure
  | ModuleDeclarationStructure
)[] {
  const objectTypesWithRdfFeature: ObjectType[] = [];
  const objectTypesWithSparqlFeature: ObjectType[] = [];
  const objectTypeDiscriminatorValuesSet = new Set<string>();
  const objectTypeIdentifierNodeKindsSet = new Set<"BlankNode" | "NamedNode">();
  for (const objectType of objectTypes) {
    if (objectType.abstract) {
      continue;
    }

    const objectTypeHasRdfFeature = objectType.features.has("rdf");
    const objectTypeHasSparqlFeature = objectType.features.has("sparql");

    if (!objectTypeHasRdfFeature && !objectTypeHasSparqlFeature) {
      continue;
    }
    if (objectTypeHasRdfFeature) {
      objectTypesWithRdfFeature.push(objectType);
    }
    if (objectTypeHasSparqlFeature) {
      objectTypesWithSparqlFeature.push(objectType);
    }

    for (const nodeKind of objectType.identifierType.nodeKinds) {
      objectTypeIdentifierNodeKindsSet.add(nodeKind);
    }
    for (const objectTypeDiscriminatorValue of objectType._discriminatorProperty
      .ownValues) {
      objectTypeDiscriminatorValuesSet.add(objectTypeDiscriminatorValue);
    }
  }

  if (
    objectTypesWithRdfFeature.length === 0 &&
    objectTypesWithSparqlFeature.length === 0
  ) {
    return [];
  }

  const objectTypeDiscriminatorValues = [
    ...objectTypeDiscriminatorValuesSet,
  ].toSorted();
  const objectTypeIdentifierNodeKinds = [
    ...objectTypeIdentifierNodeKindsSet,
  ].toSorted();

  const statements: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
  )[] = [
    objectSetInterfaceDeclaration(),
    objectSetModuleDeclaration({
      objectTypeDiscriminatorValues,
      objectTypeIdentifierNodeKinds,
    }),
  ];

  if (objectTypesWithRdfFeature.length > 0) {
    statements.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectTypeIdentifierNodeKinds,
        objectTypes: objectTypesWithRdfFeature.sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      }),
    );
  }

  return statements;
}

function rdfjsDatasetObjectSetClassDeclaration({
  objectTypeIdentifierNodeKinds,
  objectTypes,
}: {
  objectTypeIdentifierNodeKinds: readonly ("BlankNode" | "NamedNode")[];
  objectTypes: readonly ObjectType[];
}): ClassDeclarationStructure {
  return {
    ctors: [
      {
        parameters: [
          {
            name: "{ dataset }",
            type: "{ dataset: rdfjs.DatasetCore }",
          },
        ],
        statements: [
          "this.resourceSet = new rdfjsResource.ResourceSet({ dataset })",
        ],
      },
    ],
    implements: ["$ObjectSet"],
    isExported: true,
    kind: StructureKind.Class,
    name: "$RdfjsDatasetObjectSet",
    methods: [
      {
        ...objectSetInterfaceMethodSignatures["object"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: ["return this.objectSync<ObjectT>(identifier, type);"],
      },
      {
        ...objectSetInterfaceMethodSignatures["object"],
        kind: StructureKind.Method,
        name: "objectSync",
        returnType: "purify.Either<Error, ObjectT>",
        statements: [
          `switch (type) { ${objectTypes
            .flatMap((objectType) => {
              const caseBlockStatements: string[] = [];
              for (const identifierNodeKind of objectTypeIdentifierNodeKinds) {
                if (
                  !objectType.identifierType.nodeKinds.has(identifierNodeKind)
                ) {
                  caseBlockStatements.push(
                    `if (identifier.termType === "${identifierNodeKind}") { return purify.Left(new Error(\`\${type} does not accept ${identifierNodeKind} identifiers\`)); }`,
                  );
                }
              }
              caseBlockStatements.push(
                `return ${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) }) as unknown as purify.Either<Error, ObjectT>;`,
              );
              return `${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} { ${caseBlockStatements.join("\n")} }`;
            })
            .join("\n")}}`,
        ],
      },
    ],
    properties: [
      {
        isReadonly: true,
        name: "resourceSet",
        type: "rdfjsResource.ResourceSet",
      },
    ],
  };
}
