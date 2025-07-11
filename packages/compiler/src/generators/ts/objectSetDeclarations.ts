import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type MethodSignatureStructure,
  type ModuleDeclarationStructure,
  type OptionalKind,
  Scope,
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
        type: "$ObjectSet.ObjectTypeName",
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
  dataFactoryVariable,
  objectTypes,
}: {
  dataFactoryVariable: string;
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

  if (objectTypesWithSparqlFeature.length > 0) {
    statements.push(
      sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectTypeIdentifierNodeKinds,
        objectTypes: objectTypesWithSparqlFeature.sort((left, right) =>
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
          "return this.objectsSync<ObjectT>([identifier], type)[0];",
        ],
      },
      {
        ...objectSetInterfaceMethodSignatures["objectCount"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: ["return this.objectCountSync(type);"],
      },
      {
        ...objectSetInterfaceMethodSignatures["objectCount"],
        kind: StructureKind.Method,
        name: "objectCountSync",
        returnType: "purify.Either<Error, number>",
        statements: [
          "let count = 0",
          `switch (type) { ${objectTypes
            .flatMap((objectType) => {
              if (objectType.fromRdfType.isNothing()) {
                return [];
              }
              return [
                `${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} { 
  for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
    if (${objectType.staticModuleName}.fromRdf({ resource }).isRight()) {
      count++;
    }
  }
  break;
}`,
              ];
            })
            .concat(
              "default: return purify.Left(new Error(`unrecognized type ${type}`));",
            )
            .join("\n")} }`,
          "return purify.Either.of(count);",
        ],
      },
      {
        ...objectSetInterfaceMethodSignatures["objectIdentifiers"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: ["return this.objectIdentifiersSync(type, options);"],
      },
      {
        ...objectSetInterfaceMethodSignatures["objectIdentifiers"],
        kind: StructureKind.Method,
        name: "objectIdentifiersSync",
        returnType:
          "purify.Either<Error, readonly $ObjectSet.ObjectIdentifier[]>",
        statements: [
          "const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;",
          "if (limit <= 0) { return purify.Either.of([]); }",
          "let offset = options?.offset ?? 0;",
          "if (offset < 0) { offset = 0; }",
          "let identifierI = 0;",
          "const result: $ObjectSet.ObjectIdentifier[] = []",
          `switch (type) { ${objectTypes
            .flatMap((objectType) => {
              if (objectType.fromRdfType.isNothing()) {
                return [];
              }
              return [
                `${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} { 
  for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
    if (${objectType.staticModuleName}.fromRdf({ resource }).isRight() && identifierI++ >= offset) {
      result.push(resource.identifier);
      if (result.length === limit) {
        break;
      }
    }
  }
  break;
}`,
              ];
            })
            .concat(
              "default: return purify.Left(new Error(`unrecognized type ${type}`));",
            )
            .join("\n")} }`,
          "return purify.Either.of(result);",
        ],
      },
      {
        ...objectSetInterfaceMethodSignatures["objects"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: ["return this.objectsSync<ObjectT>(identifiers, type);"],
      },
      {
        ...objectSetInterfaceMethodSignatures["objects"],
        kind: StructureKind.Method,
        name: "objectsSync",
        returnType: "readonly purify.Either<Error, ObjectT>[]",
        statements: [
          `switch (type) { ${objectTypes
            .map((objectType) => {
              const fromRdfExpression = `${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) }) as unknown as purify.Either<Error, ObjectT>`;
              const identifierTypeChecks = objectTypeIdentifierNodeKinds
                .filter(
                  (identifierNodeKind) =>
                    !objectType.identifierType.nodeKinds.has(
                      identifierNodeKind,
                    ),
                )
                .map(
                  (identifierNodeKind) =>
                    `if (identifier.termType === "${identifierNodeKind}") { return purify.Left(new Error(\`\${type} does not accept ${identifierNodeKind} identifiers\`)); }`,
                );

              return `\
${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} 
  return identifiers.map(identifier => ${identifierTypeChecks.length > 0 ? `{ ${identifierTypeChecks.join("\n")} return ${fromRdfExpression}; }` : fromRdfExpression});`;
            })
            .concat(
              "default: return identifiers.map(() => purify.Left(new Error(`unrecognized type ${type}`)));",
            )
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

function sparqlObjectSetClassDeclaration({
  dataFactoryVariable,
  objectTypeIdentifierNodeKinds,
  objectTypes,
}: {
  dataFactoryVariable: string;
  objectTypeIdentifierNodeKinds: readonly ("BlankNode" | "NamedNode")[];
  objectTypes: readonly ObjectType[];
}): ClassDeclarationStructure {
  return {
    ctors: [
      {
        parameters: [
          {
            name: "{ sparqlClient }",
            type: '{ sparqlClient: $SparqlObjectSet["sparqlClient"] }',
          },
        ],
        statements: ["this.sparqlClient = sparqlClient;"],
      },
    ],
    implements: ["$ObjectSet"],
    isExported: true,
    kind: StructureKind.Class,
    name: "$SparqlObjectSet",
    methods: [
      {
        ...objectSetInterfaceMethodSignatures["object"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: [
          "return (await this.objects<ObjectT>([identifier], type))[0];",
        ],
      },
      {
        ...objectSetInterfaceMethodSignatures["objects"],
        kind: StructureKind.Method,
        isAsync: true,
        statements: [
          "if (identifiers.length === 0) { return []; }",
          ...(objectTypeIdentifierNodeKinds.some(
            (value) => value === "BlankNode",
          )
            ? [
                'if (identifiers.some(identifier => identifier.termType === "BlankNode")) { return identifiers.map(identifier => identifier.termType === "BlankNode" ? purify.Left(new Error("can\'t use blank node object identifiers with SPARQL")) : purify.Left(new Error("one of the supplied object identifiers is a blank node, which can\'t be used with SPARQL"))); }',
              ]
            : []),
          `const objectVariable = ${dataFactoryVariable}.variable!("object");`,
          `const constructQueryWhere = [{
            values: identifiers.map((identifier) => {
              const valuePatternRow: sparqljs.ValuePatternRow = {};
              valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
              return valuePatternRow;
            }),
            type: "values" as const,
          }]`,
          `switch (type) { ${objectTypes
            .map(
              (
                objectType,
              ) => `${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} {
              const constructQueryString = ${objectType.staticModuleName}.sparqlConstructQueryString({
                subject: objectVariable,
                where: constructQueryWhere
              });

              let quads: readonly rdfjs.Quad[];
              try {
                quads = await this.sparqlClient.queryQuads(constructQueryString);
              } catch (e) {
                const left = purify.Left<Error, ObjectT>(e as Error);
                return identifiers.map(() => left);
              }
              
              const dataset: rdfjs.DatasetCore = new N3.Store(quads.concat());

              return identifiers.map((identifier) =>
                ${objectType.staticModuleName}.fromRdf({
                  resource: new rdfjsResource.Resource<rdfjs.NamedNode>({ dataset, identifier: identifier as rdfjs.NamedNode })
                }) as unknown as purify.Either<Error, ObjectT>,
              );
            }`,
            )
            .concat(
              "default: return identifiers.map(() => purify.Left(new Error(`unrecognized type ${type}`)));",
            )
            .join("\n")}}`,
        ],
      },
    ],
    properties: [
      {
        isReadonly: true,
        name: "sparqlClient",
        scope: Scope.Private,
        type: "{ queryBindings: (query: string) => Promise<readonly Record<string, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>[]>; queryQuads: (query: string) => Promise<readonly rdfjs.Quad[]>; }",
      },
    ],
  };
}
