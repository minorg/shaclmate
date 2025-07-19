import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  Scope,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectSetInterfaceMethodSignaturesByObjectTypeName } from "./objectSetInterfaceMethodSignaturesByObjectTypeName.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function sparqlObjectSetClassDeclaration({
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
              `return this.$objects<${objectType.identifierType.name}, ${objectType.name}>(identifiers, ${objectType.staticModuleName});`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: objectType.fromRdfType.isJust()
              ? [
                  `return this.$objectsCount(${dataFactoryVariable}.namedNode("${objectType.fromRdfType.unsafeCoerce().value}"));`,
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
        name: "$objects",
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
      {
        kind: StructureKind.Method,
        isAsync: true,
        name: "$objectsCount",
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
