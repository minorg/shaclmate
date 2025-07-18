import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import {
  type ClassDeclarationStructure,
  type InterfaceDeclarationStructure,
  type MethodDeclarationStructure,
  type MethodSignatureStructure,
  type ModuleDeclarationStructure,
  type OptionalKind,
  Scope,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

type ObjectSetInterfaceMethodSignaturesByObjectTypeName = Record<
  string,
  Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >
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
  const objectTypes = objectTypesUnsorted
    .filter((objectType) => !objectType.abstract)
    .toSorted((left, right) => left.name.localeCompare(right.name));
  let objectTypesWithRdfFeatureCount = 0;
  let objectTypesWithSparqlFeatureCount = 0;
  for (const objectType of objectTypes) {
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
  }

  if (
    objectTypesWithRdfFeatureCount === 0 &&
    objectTypesWithSparqlFeatureCount === 0
  ) {
    return [];
  }

  const objectSetInterfaceMethodSignaturesByObjectTypeName = objectTypes.reduce(
    (result, objectType) => {
      const methodNames = objectType.objectSetMethodNames;
      result[objectType.name] = {
        object: {
          name: methodNames.object,
          parameters: [
            {
              name: "identifier",
              type: objectType.identifierType.name,
            },
          ],
          returnType: `Promise<purify.Either<Error, ${objectType.name}>>`,
        },
        objectIdentifiers: {
          name: methodNames.objectIdentifiers,
          parameters: [
            {
              hasQuestionToken: true,
              name: "options",
              type: "{ limit?: number; offset?: number }",
            },
          ],
          returnType: `Promise<purify.Either<Error, readonly ${objectType.identifierType.name}[]>>`,
        },
        objects: {
          name: methodNames.objects,
          parameters: [
            {
              name: "identifiers",
              type: `readonly ${objectType.identifierType.name}[]`,
            },
          ],
          returnType: `Promise<readonly purify.Either<Error, ${objectType.name}>[]>`,
        },
        objectsCount: {
          name: methodNames.objectsCount,
          returnType: "Promise<purify.Either<Error, number>>",
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
  ];

  if (objectTypesWithRdfFeatureCount > 0) {
    statements.push(
      rdfjsDatasetObjectSetClassDeclaration({
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypes,
      }),
    );
  }

  if (objectTypesWithSparqlFeatureCount > 0) {
    statements.push(
      sparqlObjectSetClassDeclaration({
        dataFactoryVariable,
        objectSetInterfaceMethodSignaturesByObjectTypeName,
        objectTypes,
      }),
    );
  }

  return statements;
}

function rdfjsDatasetObjectSetClassDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
  objectTypes,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
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
        return unsupportedObjectSetMethodDeclarations({
          objectSetInterfaceMethodSignatures,
        });
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
          returnType: `purify.Either<Error, readonly ${objectType.identifierType.name}[]>`,
          statements: objectType.fromRdfType.isJust()
            ? [
                "const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;",
                "if (limit <= 0) { return purify.Either.of([]); }",
                "let offset = options?.offset ?? 0;",
                "if (offset < 0) { offset = 0; }",
                "let identifierI = 0;",
                `const result: ${objectType.identifierType.name}[] = []`,
                `for (const resource of this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedInstancesOf" : "instancesOf"}(${objectType.staticModuleName}.fromRdfType)) {
                  ${objectType.staticModuleName}.fromRdf({ resource }).ifRight((object) => {
                    if (identifierI++ >= offset) {
                      result.push(object.identifier);
                    }
                  });
                  if (result.length === limit) {
                    break;
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
            `return identifiers.map(identifier => ${objectType.staticModuleName}.fromRdf({ resource: this.resourceSet.${objectType.identifierType.isNamedNodeKind ? "namedResource" : "resource"}(identifier) }));`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectsCount,
          isAsync: true,
          kind: StructureKind.Method,
          statements: [
            `return this.${objectSetInterfaceMethodSignatures.objectsCount.name}Sync();`,
          ],
        },
        {
          ...objectSetInterfaceMethodSignatures.objectsCount,
          kind: StructureKind.Method,
          name: `${objectSetInterfaceMethodSignatures.objectsCount.name}Sync`,
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
  dataFactoryVariable,
  objectSetInterfaceMethodSignaturesByObjectTypeName,
  objectTypes,
}: {
  dataFactoryVariable: string;
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
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
    methods: (
      objectTypes.flatMap((objectType) => {
        const objectSetInterfaceMethodSignatures =
          objectSetInterfaceMethodSignaturesByObjectTypeName[objectType.name];

        if (!objectType.features.has("sparql")) {
          return unsupportedObjectSetMethodDeclarations({
            objectSetInterfaceMethodSignatures,
          });
        }

        return [
          {
            ...objectSetInterfaceMethodSignatures.object,
            kind: StructureKind.Method,
            isAsync: true,
            statements: [
              `return (await this.${objectSetInterfaceMethodSignatures.objects.name}([identifier]))[0];`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectIdentifiers,
            kind: StructureKind.Method,
            isAsync: true,
            parameters: objectType.fromRdfType.isJust()
              ? objectSetInterfaceMethodSignatures.objectIdentifiers.parameters
              : objectSetInterfaceMethodSignatures.objectIdentifiers.parameters!.map(
                  (parameter) => ({ ...parameter, name: `_${parameter.name}` }),
                ),
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectIdentifiers(${dataFactoryVariable}.namedNode("${objectType.fromRdfType.unsafeCoerce().value}"), options);`,
                ]
              : [
                  `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
                ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objects,
            kind: StructureKind.Method,
            isAsync: true,
            statements: [
              `return this.$objectsByIdentifiers<${objectType.identifierType.name}, ${objectType.name}>(identifiers, ${objectType.staticModuleName});`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectCount(${dataFactoryVariable}.namedNode("${objectType.fromRdfType.unsafeCoerce().value}"));`,
                ]
              : [
                  `return purify.Left(new Error("${objectType.name} has no fromRdfType"));`,
                ],
          },
        ];
      }) satisfies MethodDeclarationStructure[]
    ).concat(
      {
        kind: StructureKind.Method,
        name: "$mapBindingsToCount",
        parameters: [
          {
            name: "bindings",
            type: "readonly Record<string, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>[]",
          },
          {
            name: "variable",
            type: "string",
          },
        ],
        returnType: "purify.Either<Error, number>",
        scope: Scope.Protected,
        statements: [
          `\
if (bindings.length === 0) {
  return purify.Left(new Error("empty result rows"));
}
if (bindings.length > 1) {
  return purify.Left(new Error("more than one result row"));
}
const count = bindings[0][variable];
if (typeof count === "undefined") {
  return purify.Left(new Error("no 'count' variable in result row"));
}
if (count.termType !== "Literal") {
  return purify.Left(new Error("'count' variable is not a Literal"));
}
const parsedCount = Number.parseInt(count.value);
if (Number.isNaN(parsedCount)) {
  return purify.Left(new Error("'count' variable is NaN"));
}
return purify.Either.of(parsedCount);`,
        ],
      },
      {
        kind: StructureKind.Method,
        name: "$mapBindingsToIdentifiers",
        parameters: [
          {
            name: "bindings",
            type: "readonly Record<string, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>[]",
          },
          {
            name: "variable",
            type: "string",
          },
        ],
        returnType: "readonly rdfjs.NamedNode[]",
        scope: Scope.Protected,
        statements: [
          `\
const identifiers: rdfjs.NamedNode[] = [];
for (const bindings_ of bindings) {
  const identifier = bindings_[variable];
  if (
    typeof identifier !== "undefined" &&
    identifier.termType === "NamedNode"
  ) {
    identifiers.push(identifier);
  }
}
return identifiers;`,
        ],
      },
      {
        kind: StructureKind.Method,
        isAsync: true,
        name: "$objectCount",
        parameters: [
          {
            name: "rdfType",
            type: "rdfjs.NamedNode",
          },
        ],
        returnType: "Promise<purify.Either<Error, number>>",
        scope: Scope.Protected,
        statements: [
          `\
return purify.EitherAsync(async ({ liftEither }) =>
  liftEither(
    this.$mapBindingsToCount(
      await this.sparqlClient.queryBindings(
        this.sparqlGenerator.stringify({
          distinct: true,
          prefixes: {},
          queryType: "SELECT",
          type: "query",
          variables: [
            {
              expression: {
                aggregation: "COUNT",
                distinct: true,
                expression: ${dataFactoryVariable}.variable!("object"),
                type: "aggregate",
              },
              variable: ${dataFactoryVariable}.variable!("count"),
            },
          ],
          where: [
            {
              triples: [
                {
                  object: rdfType,
                  subject: ${dataFactoryVariable}.variable!("object"),
                  predicate: {
                    items: [
                      ${dataFactoryVariable}.namedNode("${rdf.type.value}"),
                      {
                        items: [${dataFactoryVariable}.namedNode("${rdfs.subClassOf.value}")],
                        pathType: "*",
                        type: "path",
                      },
                    ],
                    pathType: "/",
                    type: "path",
                  },
                },
              ],
              type: "bgp",
            }
          ],
        }),
      ),
      "count",
    ),
  ),
);`,
        ],
      },
      {
        kind: StructureKind.Method,
        isAsync: true,
        name: "$objectIdentifiers",
        parameters: [
          {
            name: "rdfType",
            type: "rdfjs.NamedNode",
          },
          {
            hasQuestionToken: true,
            name: "options",
            type: "{ limit?: number; offset?: number; }",
          },
        ],
        returnType: "Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>",
        scope: Scope.Protected,
        statements: [
          `\
const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) {
  return purify.Either.of([]);
}

let offset = options?.offset ?? 0;
if (offset < 0) {
  offset = 0;
}

const objectVariable = ${dataFactoryVariable}.variable!("object");

return purify.EitherAsync(async () =>
  this.$mapBindingsToIdentifiers(
    await this.sparqlClient.queryBindings(
      this.sparqlGenerator.stringify({
        distinct: true,
        limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
        offset,
        order: [{ expression: objectVariable }],
        prefixes: {},
        queryType: "SELECT",
        type: "query",
        variables: [objectVariable],
        where: [
          {
            triples: [
              {
                object: rdfType,
                subject: objectVariable,
                predicate: {
                  items: [
                    ${dataFactoryVariable}.namedNode("${rdf.type.value}"),
                    {
                      items: [${dataFactoryVariable}.namedNode("${rdfs.subClassOf.value}")],
                      pathType: "*",
                      type: "path",
                    },
                  ],
                  pathType: "/",
                  type: "path",
                },
              },
            ],
            type: "bgp",
          }
        ],
      }),
    ),
    objectVariable.value,
  ),
);`,
        ],
      },
      {
        isAsync: true,
        kind: StructureKind.Method,
        name: "$objectsByIdentifiers",
        parameters: [
          {
            name: "identifiers",
            type: "readonly IdentifierT[]",
          },
          {
            name: "objectType",
            type: `{
fromRdf: (parameters: { resource: rdfjsResource.Resource<rdfjs.NamedNode> }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
sparqlConstructQueryString: (parameters?: { subject: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions) => string;
            }`,
          },
        ],
        returnType: "Promise<readonly purify.Either<Error, ObjectT>[]>",
        statements: [
          "if (identifiers.length === 0) { return []; }",
          'if (identifiers.some(identifier => identifier.termType === "BlankNode")) { return identifiers.map(identifier => identifier.termType === "BlankNode" ? purify.Left(new Error("can\'t use blank node object identifiers with SPARQL")) : purify.Left(new Error("one of the supplied object identifiers is a blank node, which can\'t be used with SPARQL"))); }',
          `const objectVariable = ${dataFactoryVariable}.variable!("object");`,
          `const constructQueryString = objectType.sparqlConstructQueryString({
              subject: objectVariable,
              where: [{
                type: "values" as const,
                values: identifiers.map((identifier) => {
                  const valuePatternRow: sparqljs.ValuePatternRow = {};
                  valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
                  return valuePatternRow;
                }),
              }]
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
              objectType.fromRdf({
                resource: new rdfjsResource.Resource<rdfjs.NamedNode>({ dataset, identifier: identifier as rdfjs.NamedNode })
              })
            );`,
        ],
        typeParameters: [
          {
            constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
            name: "IdentifierT",
          },
          {
            constraint: "{ readonly identifier: IdentifierT }",
            name: "ObjectT",
          },
        ],
      },
    ),
    properties: [
      {
        isReadonly: true,
        name: "sparqlClient",
        scope: Scope.Protected,
        type: "{ queryBindings: (query: string) => Promise<readonly Record<string, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>[]>; queryQuads: (query: string) => Promise<readonly rdfjs.Quad[]>; }",
      },
      {
        initializer: "new sparqljs.Generator()",
        isReadonly: true,
        name: "sparqlGenerator",
        scope: Scope.Protected,
      },
    ],
  };
}

function unsupportedObjectSetMethodDeclarations({
  objectSetInterfaceMethodSignatures,
}: {
  objectSetInterfaceMethodSignatures: Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >;
}): readonly MethodDeclarationStructure[] {
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
              `return identifiers.map(() => purify.Left(new Error("${methodName}: not supported")));`,
            ]
          : [`return purify.Left(new Error("${methodName}: not supported"));`],
    }),
  );
}
