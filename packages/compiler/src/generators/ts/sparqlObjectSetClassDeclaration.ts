import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function sparqlObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): Code {
  const sparqlWherePatternsFunctionType = code`(parameters?: { filter?: ObjectFilterT; subject?: ${imports.sparqljs}.Triple["subject"]; }) => readonly ${imports.sparqljs}.Pattern[]`;

  const parameters = {
    constructObjectType: code`objectType: {\
  ${syntheticNamePrefix}fromRdf: (resource: ${imports.Resource}, options: { objectSet: ${syntheticNamePrefix}ObjectSet }) => ${imports.Either}<Error, ObjectT>;
  ${syntheticNamePrefix}sparqlConstructQueryString: (parameters?: { filter?: ObjectFilterT; subject?: ${imports.sparqljs}.Triple["subject"]; } & Omit<${imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${imports.sparqljs}.GeneratorOptions) => string;
  ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType};
}`,
    query: code`query?: ${syntheticNamePrefix}SparqlObjectSet.Query<ObjectFilterT, ObjectIdentifierT>`,
    selectObjectTypeType: code`objectType: { ${syntheticNamePrefix}sparqlWherePatterns: ${sparqlWherePatternsFunctionType} }`,
  };

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}SparqlObjectSet implements ${syntheticNamePrefix}ObjectSet {
  protected readonly ${syntheticNamePrefix}countVariable = ${imports.dataFactory}.variable!("count");;
  protected readonly ${syntheticNamePrefix}objectVariable = ${imports.dataFactory}.variable!("object");
  protected readonly ${syntheticNamePrefix}sparqlGenerator = new ${imports.sparqljs}.Generator();

  constructor(protected readonly ${syntheticNamePrefix}sparqlClient: { queryBindings: (query: string) => Promise<readonly Record<string, ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>[]>; queryQuads: (query: string) => Promise<readonly ${imports.Quad}[]>; }) {
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
  return (await this.${methodSignatures.objects.name}({ identifiers: [identifier] })).map(objects => objects[0]);
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
  return this.${syntheticNamePrefix}objectsCount<${objectType.filterType}, ${objectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
      ];
    },
  ),
  { on: "\n\n" },
)}

  protected ${syntheticNamePrefix}mapBindingsToCount(bindings: readonly Record<string, ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>[], variable: string): ${imports.Either}<Error, number> {
    if (bindings.length === 0) {
      return ${imports.Left}(new Error("empty result rows"));
    }
    if (bindings.length > 1) {
      return ${imports.Left}(new Error("more than one result row"));
    }
    const count = bindings[0][variable];
    if (typeof count === "undefined") {
      return ${imports.Left}(new Error("no 'count' variable in result row"));
    }
    if (count.termType !== "Literal") {
      return ${imports.Left}(new Error("'count' variable is not a Literal"));
    }
    const parsedCount = Number.parseInt(count.value, 10);
    if (Number.isNaN(parsedCount)) {
      return ${imports.Left}(new Error("'count' variable is NaN"));
    }
    return ${imports.Either}.of(parsedCount);
  }

  protected ${syntheticNamePrefix}mapBindingsToIdentifiers(bindings: readonly Record<string, ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>[], variable: string): readonly ${imports.NamedNode}[] {
    const identifiers: ${imports.NamedNode}[] = [];
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

  protected async ${syntheticNamePrefix}objectIdentifiers<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${imports.Either}<Error, readonly ObjectIdentifierT[]>> {
    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${imports.Either}.of([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query);
    if (wherePatterns.length === 0) {
      return ${imports.Left}(new Error("no SPARQL WHERE patterns for identifiers"));
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
      
    return ${imports.EitherAsync}(async () =>
      this.${syntheticNamePrefix}mapBindingsToIdentifiers(
        await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
        this.${syntheticNamePrefix}objectVariable.value,
      ) as readonly ObjectIdentifierT[],
    );  
  }

  protected async ${syntheticNamePrefix}objects<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.constructObjectType}, ${parameters.query}): Promise<${imports.Either}<Error, readonly ObjectT[]>> {
    return ${imports.EitherAsync}(async ({ liftEither }) => {
      const identifiers = await liftEither(await this.${syntheticNamePrefix}objectIdentifiers<ObjectFilterT, ObjectIdentifierT>(objectType, query));
      if (identifiers.length === 0) {
        return [];
      }

      const constructQueryString = objectType.${syntheticNamePrefix}sparqlConstructQueryString({
        subject: this.${syntheticNamePrefix}objectVariable,
        where: [{
          type: "values" as const,
          values: identifiers.map((identifier) => {
            const valuePatternRow: ${imports.sparqljs}.ValuePatternRow = {};
            valuePatternRow["?object"] = identifier as ${imports.NamedNode};
            return valuePatternRow;
          }),
        }]
      });

      const quads = await this.${syntheticNamePrefix}sparqlClient.queryQuads(constructQueryString);

      const dataset = ${snippets.datasetFactory}.dataset(quads.concat());
      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        objects.push(await liftEither(objectType.${syntheticNamePrefix}fromRdf(new ${imports.Resource}<${imports.NamedNode}>({ dataset, identifier: identifier as ${imports.NamedNode} }), { objectSet: this })));
      }
      return objects;
    });
  }

  protected async ${syntheticNamePrefix}objectsCount<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${imports.Either}<Error, number>> {
    const wherePatterns = this.${syntheticNamePrefix}wherePatterns(objectType, query);
    if (wherePatterns.length === 0) {
      return ${imports.Left}(new Error("no SPARQL WHERE patterns for count"));
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

    return ${imports.EitherAsync}(async ({ liftEither }) =>
      liftEither(
        this.${syntheticNamePrefix}mapBindingsToCount(
          await this.${syntheticNamePrefix}sparqlClient.queryBindings(selectQueryString),
          this.${syntheticNamePrefix}countVariable.value,
        ),
      ),
    );
  }

  protected ${syntheticNamePrefix}wherePatterns<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): readonly ${imports.sparqljs}.Pattern[] {
    // Patterns should be most to least specific.
    const patterns: ${imports.sparqljs}.Pattern[] = [];

    if (query?.where) {
      patterns.push(...query.where(this.${syntheticNamePrefix}objectVariable));
    }

    patterns.push(...objectType.${syntheticNamePrefix}sparqlWherePatterns({ filter: query?.filter, subject: this.${syntheticNamePrefix}objectVariable }));

    return ${snippets.normalizeSparqlWherePatterns}(patterns);
  }
}
  
export namespace ${syntheticNamePrefix}SparqlObjectSet {
  export type Query<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}> = ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT, ObjectIdentifierT> & { readonly order?: (objectVariable: ${imports.Variable}) => readonly ${imports.sparqljs}.Ordering[]; readonly where?: (objectVariable: ${imports.Variable}) => readonly ${imports.sparqljs}.Pattern[] };
}`;
}
