import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function sparqlObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): Code {
  const sparqlWherePatternsFunctionType = `(parameters?: { filter?: ObjectFilterT; subject?: ${sharedImports.sparqljs}.Triple["subject"]; }) => readonly ${sharedImports.sparqljs}.Pattern[]`;

  const parameters = {
    constructObjectType: code`objectType: {\
  ${syntheticNamePrefix}fromRdf: (resource: ${sharedImports.Resource}, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => ${sharedImports.Either}<Error, ObjectT>;
  ${syntheticNamePrefix}sparqlConstructQueryString: (parameters?: { filter?: ObjectFilterT; subject?: ${sharedImports.sparqljs}.Triple["subject"]; } & Omit<${sharedImports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${sharedImports.sparqljs}.GeneratorOptions) => string;
  ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType};
}`,
    query: code`query: ${syntheticNamePrefix}SparqlObjectSet.Query<ObjectFilterT>`,
    selectObjectTypeType: code`objectType: { ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType} }`,
  };

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT extends { readonly $identifier?: { readonly in?: readonly (${sharedImports.BlankNode} | ${sharedImports.NamedNode})[] } }`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${sharedImports.BlankNode} | ${sharedImports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}SparqlObjectSet implements ${syntheticNamePrefix}ObjectSet {
  protected readonly ${syntheticNamePrefix}countVariable = ${sharedImports.dataFactory}.variable!("count");;
  protected readonly ${syntheticNamePrefix}objectVariable = ${sharedImports.dataFactory}.variable!("object");
  protected readonly ${syntheticNamePrefix}sparqlClient: { queryBindings: (query: string) => Promise<readonly Record<string, ${sharedImports.BlankNode} | ${sharedImports.Literal} | ${sharedImports.NamedNode}>[]>; queryQuads: (query: string) => Promise<readonly rdfjs.Quad[]>; }
  protected readonly ${syntheticNamePrefix}sparqlGenerator = new ${sharedImports.sparqljs}.Generator();

  constructor({ sparqlClient }: { sparqlClient: ${syntheticNamePrefix}SparqlObjectSet["${syntheticNamePrefix}sparqlClient"] }) {
    this.sparqlClient = sparqlClient;
  }

${joinCode(
  [...objectTypes, ...objectUnionTypes].flatMap(
    (objectType): readonly Code[] => {
      if (!objectType.features.has("sparql")) {
        return Object.values(
          unsupportedObjectSetMethodDeclarations({
            objectType,
          }),
        );
      }

      const methodSignatures = objectSetMethodSignatures({
        objectType,
        queryT: `${syntheticNamePrefix}SparqlObjectSet.Query`,
      });

      const runtimeObjectType = objectType.staticModuleName;

      return [
        code`\
async ${methodSignatures.object.name}(${methodSignatures.object.parameters}): ${methodSignatures.object.returnType} {
  return (await this.${methodSignatures.objects.name}({ filter: { ${syntheticNamePrefix}identifier: { in: [identifier] } } })).map(objects => objects[0]);
}`,
        code`\
async ${methodSignatures.objectIdentifiers.name}(${methodSignatures.objectIdentifiers.parameters}): ${methodSignatures.objectIdentifiers.returnType} {
  return this.${syntheticNamePrefix}objectIdentifiers<${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
        code`\
async ${methodSignatures.objects.name}(${methodSignatures.objects.parameters}): ${methodSignatures.objects.returnType} {
  return this.${syntheticNamePrefix}objects<${objectType.name}, ${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
        code`\
async ${methodSignatures.objectsCount.name}(${methodSignatures.objectsCount.parameters}): ${methodSignatures.objectsCount.returnType} {
  return this.${syntheticNamePrefix}objectsCount<${objectType.filterType}>(${runtimeObjectType}, query);
}`,
      ];
    },
  ),
)}

  protected ${syntheticNamePrefix}mapBindingsToCount(bindings: readonly Record<string, ${sharedImports.BlankNode} | ${sharedImports.Literal} | ${sharedImports.NamedNode}>[], variable: string): ${sharedImports.Either}<Error, number> {
    if (bindings.length === 0) {
      return ${sharedImports.Left}(new Error("empty result rows"));
    }
    if (bindings.length > 1) {
      return ${sharedImports.Left}(new Error("more than one result row"));
    }
    const count = bindings[0][variable];
    if (typeof count === "undefined") {
      return ${sharedImports.Left}(new Error("no 'count' variable in result row"));
    }
    if (count.termType !== "Literal") {
      return ${sharedImports.Left}(new Error("'count' variable is not a Literal"));
    }
    const parsedCount = Number.parseInt(count.value, 10);
    if (Number.isNaN(parsedCount)) {
      return ${sharedImports.Left}(new Error("'count' variable is NaN"));
    }
    return ${sharedImports.Either}.of(parsedCount);
  }

  protected ${syntheticNamePrefix}mapBindingsToIdentifiers(bindings: readonly Record<string, ${sharedImports.BlankNode} | ${sharedImports.Literal} | ${sharedImports.NamedNode}>[], variable: string): readonly ${sharedImports.NamedNode}[] {
    const identifiers: ${sharedImports.NamedNode}[] = [];
    for (const bindings_ of bindings) {
      const identifier = bindings_[variable];
      if (
        typeof identifier !== "undefined" &&
        identifier.termType === "NamedNode"
      ) {
        identifiers.push(identifier);
      }
    }
    return identifiers;
  }

  protected async ${syntheticNamePrefix}objectIdentifiers<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${sharedImports.Either}<Error, readonly ObjectIdentifierT[]>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${sharedImports.Either}.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query);
    if (wherePatterns.length === 0) {
      return ${sharedImports.Left}(new Error("no SPARQL WHERE patterns for identifiers"));
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
      
    return ${sharedImports.EitherAsync}(async () =>
      this.${syntheticNamePrefix}mapBindingsToIdentifiers(
        await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
        this.${syntheticNamePrefix}objectVariable.value,
      ) as readonly ObjectIdentifierT[],
    );  
  }

  protected async ${syntheticNamePrefix}objects<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.constructObjectType}, ${parameters.query}): Promise<${sharedImports.Either}<Error, readonly ObjectT[]>> {
    return ${sharedImports.EitherAsync}(async ({ liftEither }) => {
      const identifiers = await liftEither(await this.${syntheticNamePrefix}objectIdentifiers<ObjectFilterT, ObjectIdentifierT>(objectType, query));
      if (identifiers.length === 0) {
        return [];
      }

      const constructQueryString = objectType.${syntheticNamePrefix}sparqlConstructQueryString({
        subject: this.${syntheticNamePrefix}objectVariable,
        where: [{
          type: "values" as const,
          values: identifiers.map((identifier) => {
            const valuePatternRow: ${sharedImports.sparqljs}.ValuePatternRow = {};
            valuePatternRow["?object"] = identifier as ${sharedImports.NamedNode};
            return valuePatternRow;
          }),
        }]
      });

      const quads = await this.${syntheticNamePrefix}sparqlClient.queryQuads(constructQueryString);

      const dataset = ${sharedSnippets.datasetFactory}.dataset(quads.concat());
      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        objects.push(await liftEither(objectType.${syntheticNamePrefix}fromRdf(new ${sharedImports.Resource}<${sharedImports.NamedNode}>({ dataset, identifier: identifier as ${sharedImports.NamedNode} }), { objectSet: this })));
      }
      return objects;
    });
  }

  protected async ${syntheticNamePrefix}objectsCount<${typeParameters.ObjectFilterT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${sharedImports.Either}<Error, number>> {
    const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query);
    if (wherePatterns.length === 0) {
      return ${sharedImports.Left}(new Error("no SPARQL WHERE patterns for count"));
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
        where: wherePatterns.concat()
      });

    return ${sharedImports.EitherAsync}(async ({ liftEither }) =>
      liftEither(
        this.${syntheticNamePrefix}mapBindingsToCount(
          await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
          this.${syntheticNamePrefix}countVariable.value,
        ),
      ),
    );
  }

  protected ${syntheticNamePrefix}wherePatterns<${typeParameters.ObjectFilterT}>(${parameters.selectObjectTypeType}, ${parameters.query}): readonly ${sharedImports.sparqljs}.Pattern[] {
    // Patterns should be most to least specific.
    const patterns: ${sharedImports.sparqljs}.Pattern[] = [];

    if (query?.where) {
      patterns.push(...query.where(this.${syntheticNamePrefix}objectVariable));
    }

    patterns.push(...objectType.${syntheticNamePrefix}sparqlWherePatterns({ filter: query?.filter, subject: this.${syntheticNamePrefix}objectVariable }));

    return ${sharedSnippets.normalizeSparqlWherePatterns}(patterns);
  }
}
  
export namespace ${syntheticNamePrefix}SparqlObjectSet {
  export type Query<${typeParameters.ObjectFilterT}> = ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT> & { readonly order?: (objectVariable: ${sharedImports.Variable}) => readonly ${sharedImports.sparqljs}.Ordering[]; readonly where?: (objectVariable: ${sharedImports.Variable}) => readonly ${sharedImports.sparqljs}.Pattern[] };
}`;
}
