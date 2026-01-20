import {
  type ClassDeclarationStructure,
  type MethodDeclarationStructure,
  type ModuleDeclarationStructure,
  type OptionalKind,
  type ParameterDeclarationStructure,
  Scope,
  StructureKind,
  type TypeParameterDeclarationStructure,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function sparqlObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): readonly (ClassDeclarationStructure | ModuleDeclarationStructure)[] {
  const typeParameters = {
    ObjectT: {
      name: "ObjectT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
    ObjectFilterT: {
      constraint:
        "{ readonly $identifier?: { readonly in?: readonly (rdfjs.BlankNode | rdfjs.NamedNode)[] } }",
      name: "ObjectFilterT",
    },
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const sparqlWherePatternsFunctionType = `(parameters?: { filter?: ${typeParameters.ObjectFilterT.name}; subject?: sparqljs.Triple["subject"]; }) => readonly sparqljs.Pattern[]`;

  const parameters = {
    constructObjectType: {
      name: "objectType",
      type: `{\
  ${syntheticNamePrefix}fromRdf: (resource: rdfjsResource.Resource, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => purify.Either<Error, ${typeParameters.ObjectT.name}>;
  ${syntheticNamePrefix}sparqlConstructQueryString: (parameters?: { filter?: ${typeParameters.ObjectFilterT.name}; subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions) => string;
  ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType};
}`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    query: {
      hasQuestionToken: true,
      name: "query",
      type: `${syntheticNamePrefix}SparqlObjectSet.Query<${typeParameters.ObjectFilterT.name}>`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    selectObjectTypeType: {
      name: "objectType",
      type: `{ ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType} }`,
    },
  };

  return [
    {
      ctors: [
        {
          parameters: [
            {
              name: "{ sparqlClient }",
              type: `{ sparqlClient: ${syntheticNamePrefix}SparqlObjectSet["${syntheticNamePrefix}sparqlClient"] }`,
            },
          ],
          statements: [
            `this.${syntheticNamePrefix}sparqlClient = sparqlClient;`,
          ],
        },
      ],
      implements: [`${syntheticNamePrefix}ObjectSet`],
      isExported: true,
      kind: StructureKind.Class,
      name: `${syntheticNamePrefix}SparqlObjectSet`,
      // methods: [
      methods: (
        [...objectTypes, ...objectUnionTypes].flatMap((objectType) => {
          if (!objectType.features.has("sparql")) {
            return unsupportedObjectSetMethodDeclarations({
              objectType,
            });
          }

          const methodSignatures = objectSetMethodSignatures({
            objectType,
            queryT: `${syntheticNamePrefix}SparqlObjectSet.Query`,
          });

          const runtimeObjectType = objectType.staticModuleName;

          return [
            {
              ...methodSignatures.object,
              kind: StructureKind.Method,
              isAsync: true,
              statements: [
                `return (await this.${methodSignatures.objects.name}({ filter: { ${syntheticNamePrefix}identifier: { in: [identifier] } } })).map(objects => objects[0]);`,
              ],
            },
            {
              ...methodSignatures.objectIdentifiers,
              kind: StructureKind.Method,
              isAsync: true,
              statements: [
                `return this.${syntheticNamePrefix}objectIdentifiers<${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
              ],
            },
            {
              ...methodSignatures.objects,
              kind: StructureKind.Method,
              isAsync: true,
              statements: [
                `return this.${syntheticNamePrefix}objects<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
              ],
            },
            {
              ...methodSignatures.objectsCount,
              isAsync: true,
              kind: StructureKind.Method,
              statements: [
                `return this.${syntheticNamePrefix}objectsCount<${objectType.filterType}>(${runtimeObjectType}, query);`,
              ],
            },
          ];
        }) satisfies MethodDeclarationStructure[]
      ).concat(
        {
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}mapBindingsToCount`,
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
const parsedCount = Number.parseInt(count.value, 10);
if (Number.isNaN(parsedCount)) {
  return purify.Left(new Error("'count' variable is NaN"));
}
return purify.Either.of(parsedCount);`,
          ],
        },
        {
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}mapBindingsToIdentifiers`,
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
          name: `${syntheticNamePrefix}objectIdentifiers`,
          parameters: [parameters.selectObjectTypeType, parameters.query],
          returnType: `Promise<purify.Either<Error, readonly ${typeParameters.ObjectIdentifierT.name}[]>>`,
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

const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query).filter(pattern => pattern.type !== "optional");
if (wherePatterns.length === 0) {
  return purify.Left(new Error("no required SPARQL WHERE patterns for identifiers"));
}

const selectQueryString = \
  this.${syntheticNamePrefix}sparqlGenerator.stringify({
    distinct: true,
    limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
    offset,
    order: query?.order ? query.order(this.${syntheticNamePrefix}objectVariable).concat() : [{ expression: this.${syntheticNamePrefix}objectVariable }],
    prefixes: {},
    queryType: "SELECT",
    type: "query",
    variables: [this.${syntheticNamePrefix}objectVariable],
    where: wherePatterns.concat()
  });
  
return purify.EitherAsync(async () =>
  this.${syntheticNamePrefix}mapBindingsToIdentifiers(
    await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
    this.${syntheticNamePrefix}objectVariable.value,
  ) as readonly ${typeParameters.ObjectIdentifierT.name}[],
);`,
          ],
          typeParameters: [
            typeParameters.ObjectFilterT,
            typeParameters.ObjectIdentifierT,
          ],
        },
        {
          isAsync: true,
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}objects`,
          parameters: [parameters.constructObjectType, parameters.query],
          returnType: `Promise<purify.Either<Error, readonly ${typeParameters.ObjectT.name}[]>>`,
          statements: [
            `\
return purify.EitherAsync(async ({ liftEither }) => {
  const identifiers = await liftEither(await this.${syntheticNamePrefix}objectIdentifiers<${typeParameters.ObjectFilterT.name}, ${typeParameters.ObjectIdentifierT.name}>(objectType, query));
  if (identifiers.length === 0) {
    return [];
  }

  const constructQueryString = objectType.${syntheticNamePrefix}sparqlConstructQueryString({
    subject: this.${syntheticNamePrefix}objectVariable,
    where: [{
      type: "values" as const,
      values: identifiers.map((identifier) => {
        const valuePatternRow: sparqljs.ValuePatternRow = {};
        valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
        return valuePatternRow;
      }),
    }]
  });

  const quads = await this.${syntheticNamePrefix}sparqlClient.queryQuads(constructQueryString);

  const dataset = datasetFactory.dataset(quads.concat());
  const objects: ${typeParameters.ObjectT.name}[] = [];
  for (const identifier of identifiers) {
    objects.push(await liftEither(objectType.${syntheticNamePrefix}fromRdf(new rdfjsResource.Resource<rdfjs.NamedNode>({ dataset, identifier: identifier as rdfjs.NamedNode }), { objectSet: this })));
  }
  return objects;
});`,
          ],
          typeParameters: [
            typeParameters.ObjectT,
            typeParameters.ObjectFilterT,
            typeParameters.ObjectIdentifierT,
          ],
        },
        {
          kind: StructureKind.Method,
          isAsync: true,
          name: `${syntheticNamePrefix}objectsCount`,
          parameters: [parameters.selectObjectTypeType, parameters.query],
          returnType: "Promise<purify.Either<Error, number>>",
          scope: Scope.Protected,
          statements: [
            `\
const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query).filter(pattern => pattern.type !== "optional");
if (wherePatterns.length === 0) {
  return purify.Left(new Error("no required SPARQL WHERE patterns for count"));
}

const selectQueryString = \
  this.${syntheticNamePrefix}sparqlGenerator.stringify({
    prefixes: {},
    queryType: "SELECT",
    type: "query",
    variables: [
      {
        expression: {
          aggregation: "COUNT",
          distinct: true,
          expression: this.${syntheticNamePrefix}objectVariable,
          type: "aggregate",
        },
        variable: this.${syntheticNamePrefix}countVariable,
      },
    ],
    where: wherePatterns
  });

return purify.EitherAsync(async ({ liftEither }) =>
  liftEither(
    this.${syntheticNamePrefix}mapBindingsToCount(
      await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
      this.${syntheticNamePrefix}countVariable.value,
    ),
  ),
);`,
          ],
          typeParameters: [typeParameters.ObjectFilterT],
        },
        {
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}wherePatterns`,
          parameters: [parameters.selectObjectTypeType, parameters.query],
          returnType: "readonly sparqljs.Pattern[]",
          scope: Scope.Protected,
          statements: [
            `\
// Patterns should be most to least specific.
const patterns: sparqljs.Pattern[] = [];

if (query?.where) {
  patterns.push(...query.where(this.${syntheticNamePrefix}objectVariable));
}

patterns.push(...objectType.${syntheticNamePrefix}sparqlWherePatterns({ filter: query?.filter, subject: this.${syntheticNamePrefix}objectVariable }));

return ${syntheticNamePrefix}insertSeedSparqlWherePattern(${syntheticNamePrefix}optimizeSparqlWherePatterns(patterns));`,
          ],
          typeParameters: [typeParameters.ObjectFilterT],
        },
      ),
      properties: [
        {
          initializer: `dataFactory.variable!("count");`,
          isReadonly: true,
          name: `${syntheticNamePrefix}countVariable`,
          scope: Scope.Protected,
        },
        {
          initializer: `dataFactory.variable!("object");`,
          isReadonly: true,
          name: `${syntheticNamePrefix}objectVariable`,
          scope: Scope.Protected,
        },
        {
          isReadonly: true,
          name: `${syntheticNamePrefix}sparqlClient`,
          scope: Scope.Protected,
          type: "{ queryBindings: (query: string) => Promise<readonly Record<string, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>[]>; queryQuads: (query: string) => Promise<readonly rdfjs.Quad[]>; }",
        },
        {
          initializer: "new sparqljs.Generator()",
          isReadonly: true,
          name: `${syntheticNamePrefix}sparqlGenerator`,
          scope: Scope.Protected,
        },
      ],
    },
    {
      isExported: true,
      kind: StructureKind.Module,
      name: `${syntheticNamePrefix}SparqlObjectSet`,
      statements: [
        {
          isExported: true,
          kind: StructureKind.TypeAlias,
          name: "Query",
          type: `${syntheticNamePrefix}ObjectSet.Query<${typeParameters.ObjectFilterT.name}> & { readonly order?: (objectVariable: rdfjs.Variable) => readonly sparqljs.Ordering[]; readonly where?: (objectVariable: rdfjs.Variable) => readonly sparqljs.Pattern[] }`,
          typeParameters: [typeParameters.ObjectFilterT],
        },
      ],
    },
  ];
}
