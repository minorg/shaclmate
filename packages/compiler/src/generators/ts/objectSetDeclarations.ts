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

type ObjectSetInterfaceMethodSignaturesByObjectTypeName = Record<
  string,
  {
    readonly object: OptionalKind<MethodSignatureStructure>;
    readonly objectCount: OptionalKind<MethodSignatureStructure>;
    readonly objectIdentifiers: OptionalKind<MethodSignatureStructure>;
    readonly objects: OptionalKind<MethodSignatureStructure>;
  }
>;

function objectSetInterfaceDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
}): InterfaceDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Interface,
    methods: Object.values(
      objectSetInterfaceMethodSignaturesByObjectTypeName,
    ).flatMap(Object.values),
    name: "$ObjectSet",
  };
}

function objectSetModuleDeclaration({
  objectTypeIdentifierNodeKinds,
}: {
  objectTypeIdentifierNodeKinds: readonly ("BlankNode" | "NamedNode")[];
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
    ],
  };
}

export function objectSetDeclarations({
  dataFactoryVariable,
  objectTypes: objectTypesUnsorted,
}: {
  dataFactoryVariable: string;
  objectTypes: readonly ObjectType[];
}): readonly (
  | ClassDeclarationStructure
  | InterfaceDeclarationStructure
  | ModuleDeclarationStructure
)[] {
  const objectTypes = objectTypesUnsorted.toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );
  let objectTypesWithRdfFeatureCount = 0;
  let objectTypesWithSparqlFeatureCount = 0;
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
      objectTypesWithRdfFeatureCount++;
    }
    if (objectTypeHasSparqlFeature) {
      objectTypesWithSparqlFeatureCount++;
    }

    for (const nodeKind of objectType.identifierType.nodeKinds) {
      objectTypeIdentifierNodeKindsSet.add(nodeKind);
    }
  }

  if (
    objectTypesWithRdfFeatureCount === 0 &&
    objectTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const objectTypeIdentifierNodeKinds = [
    ...objectTypeIdentifierNodeKindsSet,
  ].toSorted();

  const objectSetInterfaceMethodSignaturesByObjectTypeName = objectTypes.reduce(
    (result, objectType) => {
      result[objectType.name] = {
        object: {
          name: objectType.objectSetMethodNamePrefixSingular,
          parameters: [
            {
              name: "identifier",
              type: "$ObjectSet.ObjectIdentifier",
            },
          ],
          returnType: `Promise<purify.Either<Error, ${objectType.name}>>`,
        },
        objectCount: {
          name: `${objectType.objectSetMethodNamePrefixSingular}Count`,
          returnType: "Promise<purify.Either<Error, number>>",
        },
        objectIdentifiers: {
          name: `${objectType.objectSetMethodNamePrefixSingular}Identifiers`,
          parameters: [
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
          name: objectType.objectSetMethodNamePrefixPlural,
          parameters: [
            {
              name: "identifiers",
              type: "readonly $ObjectSet.ObjectIdentifier[]",
            },
          ],
          returnType: `Promise<readonly purify.Either<Error, ${objectType.name}>[]>`,
        },
      };
      return result;
    },
    {} as ObjectSetInterfaceMethodSignaturesByObjectTypeName,
  );

  const statements: (
    | ClassDeclarationStructure
    | InterfaceDeclarationStructure
    | ModuleDeclarationStructure
  )[] = [
    objectSetInterfaceDeclaration({
      objectSetInterfaceMethodSignaturesByObjectTypeName,
    }),
    objectSetModuleDeclaration({
      objectTypeIdentifierNodeKinds,
    }),
  ];

  if (objectTypesWithRdfFeatureCount > 0) {
    statements.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypeIdentifierNodeKinds,
        objectTypes,
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    statements.push(
      sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypeIdentifierNodeKinds,
        objectTypes,
      }),
    );
  }

  return statements;
}

function rdfjsDatasetObjectSetClassDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
  objectTypeIdentifierNodeKinds,
  objectTypes,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
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
    methods: objectTypes.flatMap((objectType) => {
      const objectSetInterfaceMethodSignatures =
        objectSetInterfaceMethodSignaturesByObjectTypeName[objectType.name];

      if (!objectType.features.has("rdf")) {
        return Object.entries(objectSetInterfaceMethodSignatures).map(
          ([methodName, methodSignature]) => ({
            ...methodSignature,
            kind: StructureKind.Method,
            parameters:
              methodName !== "objects" && methodSignature.parameters
                ? methodSignature.parameters!.map((parameter) => ({
                    ...parameter,
                    name: `_${parameter.name}`,
                  }))
                : methodSignature.parameters,
            isAsync: true,
            statements:
              methodName === "objects"
                ? [
                    `return identifiers.map(() => purify.Left(new Error("${methodName}: fromRdf not supported")));`,
                  ]
                : [
                    `return purify.Left(new Error("${methodName}: fromRdf not supported"));`,
                  ],
          }),
        );
      }

      return [
        {
          ...objectSetInterfaceMethodSignatures.object,
          isAsync: true,
          kind: StructureKind.Method,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.object.name}Sync(identifier);`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.object,
          kind: StructureKind.Method,
          name: `${objectSetInterfaceMethodSignatures.object.name}Sync`,
          returnType: `purify.Either<Error, ${objectType.name}>`,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync([identifier])[0];`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectCount,
          isAsync: true,
          kind: StructureKind.Method,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.objectCount.name}Sync();`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectCount,
          kind: StructureKind.Method,
          name: `${objectSetInterfaceMethodSignatures.objectCount.name}Sync`,
          returnType: "purify.Either<Error, number>",
          statements: objectType.fromRdfType.isJust()
            ? [
                "let count = 0",
                `for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
              if (${objectType.staticModuleName}.fromRdf({ resource }).isRight()) {
                count++;
              }
            }`,
                "return purify.Either.of(count);",
              ]
            : [
                `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
              ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectIdentifiers,
          isAsync: true,
          kind: StructureKind.Method,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync(options);`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectIdentifiers,
          kind: StructureKind.Method,
          name: `${objectSetInterfaceMethodSignatures.objectIdentifiers.name}Sync`,
          parameters: objectType.fromRdfType.isJust()
            ? objectSetInterfaceMethodSignatures.objectIdentifiers.parameters
            : objectSetInterfaceMethodSignatures.objectIdentifiers.parameters!.map(
                (parameter) => ({ ...parameter, name: `_${parameter.name}` }),
              ),
          returnType:
            "purify.Either<Error, readonly $ObjectSet.ObjectIdentifier[]>",
          statements: objectType.fromRdfType.isJust()
            ? [
                "const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;",
                "if (limit <= 0) { return purify.Either.of([]); }",
                "let offset = options?.offset ?? 0;",
                "if (offset < 0) { offset = 0; }",
                "let identifierI = 0;",
                "const result: $ObjectSet.ObjectIdentifier[] = []",
                `for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
              if (${objectType.staticModuleName}.fromRdf({ resource }).isRight() && identifierI++ >= offset) {
                result.push(resource.identifier);
                if (result.length === limit) {
                  break;
                }
              }
            }`,
                "return purify.Either.of(result);",
              ]
            : [
                `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
              ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objects,
          isAsync: true,
          kind: StructureKind.Method,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.objects.name}Sync(identifiers);`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objects,
          kind: StructureKind.Method,
          name: `${objectSetInterfaceMethodSignatures.objects.name}Sync`,
          returnType: `readonly purify.Either<Error, ${objectType.name}>[]`,
          statements: [
            `${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) })`,
          ].map((fromRdfExpression) =>
            objectTypeIdentifierNodeKinds.some(
              (objectTypeIdentifierNodeKind) =>
                !objectType.identifierType.nodeKinds.has(
                  objectTypeIdentifierNodeKind,
                ),
            )
              ? `return identifiers.map(identifier => { ${objectTypeIdentifierNodeKinds
                  .filter(
                    (identifierNodeKind) =>
                      !objectType.identifierType.nodeKinds.has(
                        identifierNodeKind,
                      ),
                  )
                  .map(
                    (identifierNodeKind) =>
                      `if (identifier.termType === "${identifierNodeKind}") { return purify.Left(new Error(\`${objectSetInterfaceMethodSignatures.objects.name} does not accept ${identifierNodeKind} identifiers\`)); }`,
                  )
                  .join("\n")} return ${fromRdfExpression}; });`
              : `return identifiers.map(identifier => ${fromRdfExpression});`,
          ),
        },
      ];
    }),
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
  // dataFactoryVariable,
  // objectSetInterfaceMethodSignaturesByObjectTypeName,
  // objectTypeIdentifierNodeKinds,
  // objectTypes,
}: {
  dataFactoryVariable: string;
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
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
    // methods: [
    //   {
    //     ...objectSetInterfaceMethodSignatures["object"],
    //     kind: StructureKind.Method,
    //     isAsync: true,
    //     statements: [
    //       "return (await this.objects<ObjectT>([identifier], type))[0];",
    //     ],
    //   },
    //   {
    //     ...objectSetInterfaceMethodSignatures["objects"],
    //     kind: StructureKind.Method,
    //     isAsync: true,
    //     statements: [
    //       "if (identifiers.length === 0) { return []; }",
    //       ...(objectTypeIdentifierNodeKinds.some(
    //         (value) => value === "BlankNode",
    //       )
    //         ? [
    //             'if (identifiers.some(identifier => identifier.termType === "BlankNode")) { return identifiers.map(identifier => identifier.termType === "BlankNode" ? purify.Left(new Error("can\'t use blank node object identifiers with SPARQL")) : purify.Left(new Error("one of the supplied object identifiers is a blank node, which can\'t be used with SPARQL"))); }',
    //           ]
    //         : []),
    //       `const objectVariable = ${dataFactoryVariable}.variable!("object");`,
    //       `const constructQueryWhere = [{
    //         values: identifiers.map((identifier) => {
    //           const valuePatternRow: sparqljs.ValuePatternRow = {};
    //           valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
    //           return valuePatternRow;
    //         }),
    //         type: "values" as const,
    //       }]`,
    //       `switch (type) { ${objectTypes
    //         .map(
    //           (
    //             objectType,
    //           ) => `${objectType._discriminatorProperty.ownValues.map((value) => `case "${value}":`).join("\n")} {
    //           const constructQueryString = ${objectType.staticModuleName}.sparqlConstructQueryString({
    //             subject: objectVariable,
    //             where: constructQueryWhere
    //           });

    //           let quads: readonly rdfjs.Quad[];
    //           try {
    //             quads = await this.sparqlClient.queryQuads(constructQueryString);
    //           } catch (e) {
    //             const left = purify.Left<Error, ObjectT>(e as Error);
    //             return identifiers.map(() => left);
    //           }

    //           const dataset: rdfjs.DatasetCore = new N3.Store(quads.concat());

    //           return identifiers.map((identifier) =>
    //             ${objectType.staticModuleName}.fromRdf({
    //               resource: new rdfjsResource.Resource<rdfjs.NamedNode>({ dataset, identifier: identifier as rdfjs.NamedNode })
    //             }) as unknown as purify.Either<Error, ObjectT>,
    //           );
    //         }`,
    //         )
    //         .concat(
    //           "default: return identifiers.map(() => purify.Left(new Error(`unrecognized type ${type}`)));",
    //         )
    //         .join("\n")}}`,
    //     ],
    //   },
    // ],
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
