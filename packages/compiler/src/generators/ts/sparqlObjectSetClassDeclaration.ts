import {} from "@tpluscode/rdf-ns-builders";
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
  dataFactoryVariable,
  objectTypes,
  objectUnionTypes,
}: {
  dataFactoryVariable: string;
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): readonly (ClassDeclarationStructure | ModuleDeclarationStructure)[] {
  const typeParameters = {
    ObjectT: {
      constraint: "{ readonly identifier: ObjectIdentifierT }",
      name: "ObjectT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
    ObjectIdentifierT: {
      constraint: "rdfjs.BlankNode | rdfjs.NamedNode",
      name: "ObjectIdentifierT",
    } satisfies OptionalKind<TypeParameterDeclarationStructure>,
  };

  const sparqlWherePatternsFunctionType = `(parameters?: { subject?: sparqljs.Triple["subject"]; }) => readonly sparqljs.Pattern[]`;

  const parameters = {
    constructObjectType: {
      name: "objectType",
      type: `{\
  ${syntheticNamePrefix}fromRdf: (parameters: { resource: rdfjsResource.Resource }) => purify.Either<rdfjsResource.Resource.ValueError, ${typeParameters.ObjectT.name}>;
  ${syntheticNamePrefix}sparqlConstructQueryString: (parameters?: { subject?: sparqljs.Triple["subject"]; } & Omit<sparqljs.ConstructQuery, "prefixes" | "queryType" | "type"> & sparqljs.GeneratorOptions) => string;
  ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType};
}`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    query: {
      hasQuestionToken: true,
      name: "query",
      type: `${syntheticNamePrefix}SparqlObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
    selectObjectTypeType: {
      name: "objectType",
      type: `{ sparqlWherePatterns: ${sparqlWherePatternsFunctionType} }`,
    },
    where: {
      hasQuestionToken: true,
      name: "where",
      type: `${syntheticNamePrefix}SparqlObjectSet.Where<${typeParameters.ObjectIdentifierT.name}>`,
    } satisfies OptionalKind<ParameterDeclarationStructure>,
  };

  return [
    {
      ctors: [
        {
          parameters: [
            {
              name: "{ sparqlClient }",
              type: `{ sparqlClient: ${syntheticNamePrefix}SparqlObjectSet["sparqlClient"] }`,
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
                `return (await this.${methodSignatures.objects.name}({ where: { identifiers: [identifier], type: "identifiers" } }))[0];`,
              ],
            },
            {
              ...methodSignatures.objectIdentifiers,
              kind: StructureKind.Method,
              isAsync: true,
              statements: [
                `return this.${syntheticNamePrefix}objectIdentifiers<${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
              ],
            },
            {
              ...methodSignatures.objects,
              kind: StructureKind.Method,
              isAsync: true,
              statements: [
                `return this.${syntheticNamePrefix}objects<${objectType.name}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
              ],
            },
            {
              ...methodSignatures.objectsCount,
              isAsync: true,
              kind: StructureKind.Method,
              statements: [
                `return this.${syntheticNamePrefix}objectsCount<${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);`,
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
const parsedCount = Number.parseInt(count.value);
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

const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query?.where);
if (wherePatterns.length === 0) {
  return purify.Left(new Error("no SPARQL WHERE patterns for identifiers"));
}
  
return purify.EitherAsync(async () =>
  this.${syntheticNamePrefix}mapBindingsToIdentifiers(
    await this.${syntheticNamePrefix}sparqlClient.queryBindings(
      this.${syntheticNamePrefix}sparqlGenerator.stringify({
        distinct: true,
        limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
        offset,
        order: query?.order ? query.order(this.${syntheticNamePrefix}objectVariable).concat() : [{ expression: this.${syntheticNamePrefix}objectVariable }],
        prefixes: {},
        queryType: "SELECT",
        type: "query",
        variables: [this.${syntheticNamePrefix}objectVariable],
        where: wherePatterns
      }),
    ),
    this.${syntheticNamePrefix}objectVariable.value,
  ) as readonly ${typeParameters.ObjectIdentifierT.name}[],
);`,
          ],
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
        {
          isAsync: true,
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}objects`,
          parameters: [parameters.constructObjectType, parameters.query],
          returnType: `Promise<readonly purify.Either<Error, ${typeParameters.ObjectT.name}>[]>`,
          statements: [
            `\
const identifiersEither = await this.${syntheticNamePrefix}objectIdentifiers<${typeParameters.ObjectIdentifierT.name}>(objectType, query);
if (identifiersEither.isLeft()) {
  return [identifiersEither];
}
const identifiers = identifiersEither.unsafeCoerce();
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

let quads: readonly rdfjs.Quad[];
try {
  quads = await this.${syntheticNamePrefix}sparqlClient.queryQuads(constructQueryString);
} catch (e) {
  const left = purify.Left<Error, ${typeParameters.ObjectT.name}>(e as Error);
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
          typeParameters: [
            typeParameters.ObjectT,
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
const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query?.where);
if (wherePatterns.length === 0) {
  return purify.Left(new Error("no SPARQL WHERE patterns for count"));
}

return purify.EitherAsync(async ({ liftEither }) =>
  liftEither(
    this.${syntheticNamePrefix}mapBindingsToCount(
      await this.${syntheticNamePrefix}sparqlClient.queryBindings(
        this.${syntheticNamePrefix}sparqlGenerator.stringify({
          distinct: true,
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
        }),
      ),
      this.${syntheticNamePrefix}countVariable.value,
    ),
  ),
);`,
          ],
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
        {
          kind: StructureKind.Method,
          name: `${syntheticNamePrefix}wherePatterns`,
          parameters: [parameters.selectObjectTypeType, parameters.where],
          returnType: "sparqljs.Pattern[]",
          scope: Scope.Protected,
          statements: [
            `\
const patterns: sparqljs.Pattern[] = [];

// Patterns should be most to least specific.

if (where) {
  switch (where.type) {
    case "identifiers":
      patterns.push({
        type: "values" as const,
        values: where.identifiers.map((identifier) => {
          const valuePatternRow: sparqljs.ValuePatternRow = {};
          valuePatternRow["?object"] = identifier as rdfjs.NamedNode;
          return valuePatternRow;
        }),
      });
      break;
    case "patterns":
      patterns.push(...where.patterns(this.${syntheticNamePrefix}objectVariable));
      break;
  }
}

patterns.push(...objectType.${syntheticNamePrefix}sparqlWherePatterns({ subject: this.${syntheticNamePrefix}objectVariable }));

return patterns;`,
          ],
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
      ),
      properties: [
        {
          initializer: `${dataFactoryVariable}.variable!("count");`,
          isReadonly: true,
          name: `${syntheticNamePrefix}countVariable`,
          scope: Scope.Protected,
        },
        {
          initializer: `${dataFactoryVariable}.variable!("object");`,
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
      name: "$SparqlObjectSet",
      statements: [
        {
          isExported: true,
          kind: StructureKind.TypeAlias,
          name: "Query",
          type: `Omit<$ObjectSet.Query<${typeParameters.ObjectIdentifierT.name}>, "where"> & { readonly order?: (objectVariable: rdfjs.Variable) => readonly sparqljs.Ordering[]; readonly where?: Where<${typeParameters.ObjectIdentifierT.name}> }`,
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
        {
          kind: StructureKind.TypeAlias,
          isExported: true,
          name: "Where",
          type: `$ObjectSet.Where<${typeParameters.ObjectIdentifierT.name}> | { readonly patterns: (objectVariable: rdfjs.Variable) => readonly sparqljs.Pattern[]; readonly type: "patterns" }`,
          typeParameters: [typeParameters.ObjectIdentifierT],
        },
      ],
    },
  ];
}
