import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  type ParameterDeclarationStructure,
  Scope,
  StructureKind,
  type TypeParameterDeclarationStructure,
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
  const parameters = {
    objectType: {
      name: "objectType",
      type: `{\
  fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<rdfjsResource.Resource.ValueError, ObjectT>;
  fromRdfType?: rdfjs.NamedNode;
  sparqlConstructQueryString: (parameters?: { subject: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions) => string;
}`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    query: {
      hasQuestionToken: true,
      name: "query",
      type: "$ObjectSet.Query<ObjectIdentifierT>",
    } satisfies OptionalKind<ParameterDeclarationStructure>,
  };

  const typeParameters: OptionalKind<TypeParameterDeclarationStructure>[] = [
    {
      constraint: "{ readonly identifier: ObjectIdentifierT }",
      name: "ObjectT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
    {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  ];

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
              `return (await this.${objectSetInterfaceMethodSignatures.objects.name}({ where: { identifiers: [identifier], type: "identifiers" } }))[0];`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectIdentifiers,
            kind: StructureKind.Method,
            isAsync: true,
            statements: [
              `return this.$objectIdentifiers<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objects,
            kind: StructureKind.Method,
            isAsync: true,
            statements: [
              `return this.$objects<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query);`,
            ],
          },
          {
            ...objectSetInterfaceMethodSignatures.objectsCount,
            isAsync: true,
            kind: StructureKind.Method,
            statements: [
              `return this.$objectsCount<${objectType.name}, ${objectType.identifierType.name}>(${objectType.staticModuleName}, query);`,
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
        parameters: [parameters.objectType, parameters.query],
        returnType:
          "Promise<purify.Either<Error, readonly ObjectIdentifierT[]>>",
        scope: Scope.Protected,
        statements: [
          `\
const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
if (limit <= 0) {
  return purify.Either.of([]);
}

let offset = query?.offset ?? 0;
if (offset < 0) {
  offset = 0;
}

if (query?.where) {
  const identifiers = query.where.identifiers;
  if (identifiers.some(identifier => identifier.termType === "BlankNode")) {
    return purify.Left(new Error("can\'t use blank node object identifiers with SPARQL"));
  }
  return purify.Either.of(identifiers.slice(offset, offset + limit));
}
  
if (objectType.fromRdfType) {
  return purify.EitherAsync(async () =>
    this.$mapBindingsToIdentifiers(
      await this.sparqlClient.queryBindings(
        this.sparqlGenerator.stringify({
          distinct: true,
          limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
          offset,
          order: [{ expression: this.objectVariable }],
          prefixes: {},
          queryType: "SELECT",
          type: "query",
          variables: [this.objectVariable],
          where: [
            {
              triples: [
                {
                  object: objectType.fromRdfType!,
                  subject: this.objectVariable,
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
      this.objectVariable.value,
    ) as readonly ObjectIdentifierT[],
  );
}

return purify.Either.of([]);
`,
        ],
        typeParameters,
      },
      {
        isAsync: true,
        kind: StructureKind.Method,
        name: "$objects",
        parameters: [parameters.objectType, parameters.query],
        returnType: "Promise<readonly purify.Either<Error, ObjectT>[]>",
        statements: [
          `\
const identifiersEither = await this.$objectIdentifiers<ObjectT, ObjectIdentifierT>(objectType, query);
if (identifiersEither.isLeft()) {
  return [identifiersEither];
}
const identifiers = identifiersEither.unsafeCoerce();
if (identifiers.length === 0) {
  return [];
}

const constructQueryString = objectType.sparqlConstructQueryString({
  subject: this.objectVariable,
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
);
`,
        ],
        typeParameters,
      },
      {
        kind: StructureKind.Method,
        isAsync: true,
        name: "$objectsCount",
        parameters: [parameters.objectType, parameters.query],
        returnType: "Promise<purify.Either<Error, number>>",
        scope: Scope.Protected,
        statements: [
          `\
if (!objectType.fromRdfType) {
  return purify.Either.of(0);
}

if (query) {
  throw new Error("not implemented");
}

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
                expression: this.objectVariable,
                type: "aggregate",
              },
              variable: this.countVariable,
            },
          ],
          where: [
            {
              triples: [
                {
                  object: objectType.fromRdfType!,
                  subject: this.objectVariable,
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
      this.countVariable.value,
    ),
  ),
);`,
        ],
        typeParameters,
      },
    ),
    properties: [
      {
        initializer: `${dataFactoryVariable}.variable!("count");`,
        isReadonly: true,
        name: "countVariable",
        scope: Scope.Protected,
      },
      {
        initializer: `${dataFactoryVariable}.variable!("object");`,
        isReadonly: true,
        name: "objectVariable",
        scope: Scope.Protected,
      },
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
