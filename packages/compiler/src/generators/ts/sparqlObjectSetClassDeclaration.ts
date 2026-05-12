import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";

import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TsGeneratorContext } from "./TsGeneratorContext.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import { unsupportedObjectSetMethodDeclarations } from "./unsupportedObjectSetMethodDeclarations.js";

export function sparqlObjectSetClassDeclaration(
  this: TsGeneratorContext,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): Code {
  const parameters = {
    constructObjectType: code`namedObjectType: {\
  ${syntheticNamePrefix}focusSparqlWherePatterns: ${this.snippets.FocusSparqlWherePatternsFunction}<ObjectFilterT>;
  ${syntheticNamePrefix}fromRdfResource:  ${this.snippets.FromRdfResourceFunction}<ObjectT>;
  ${syntheticNamePrefix}sparqlConstructQueryString: (parameters: { filter?: ObjectFilterT; subject: ${this.imports.NamedNode} | ${this.imports.Variable}; } & Omit<${this.imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${this.imports.sparqljs}.GeneratorOptions) => string;
}`,
    query: code`query?: ${syntheticNamePrefix}SparqlObjectSet.Query<ObjectFilterT, ObjectIdentifierT>`,
    selectObjectTypeType: code`namedObjectType: { ${syntheticNamePrefix}focusSparqlWherePatterns: ${this.snippets.FocusSparqlWherePatternsFunction}<ObjectFilterT> }`,
  };
  const sparqlClientType = code`{ queryBindings: (query: string) => Promise<readonly Record<string, ${this.imports.BlankNode} | ${this.imports.Literal} | ${this.imports.NamedNode}>[]>; queryQuads: (query: string) => Promise<readonly ${this.imports.Quad}[]>; }`;

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: () => ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${this.imports.BlankNode} | ${this.imports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}SparqlObjectSet implements ${syntheticNamePrefix}ObjectSet {
  readonly #countVariable = ${this.imports.dataFactory}.variable!("count");;
  readonly #graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}>;
  readonly #objectVariable = ${this.imports.dataFactory}.variable!("object");
  readonly #sparqlClient: ${sparqlClientType};
  readonly #sparqlGenerator = new ${this.imports.sparqljs}.Generator();

  constructor(sparqlClient: ${sparqlClientType}, options?: { graph?: Exclude<${this.imports.Quad_Graph}, ${this.imports.Variable}> }) {
    this.#graph = options?.graph;
    this.#sparqlClient = sparqlClient;
  }

${joinCode(
  [...namedObjectTypes, ...namedObjectUnionTypes].flatMap(
    (namedObjectType): readonly Code[] => {
      if (!namedObjectType.features.has("sparql")) {
        return Object.values(
          unsupportedObjectSetMethodDeclarations.call(this, {
            namedObjectType,
          }),
        );
      }

      const methodSignatures = objectSetMethodSignatures.call(this, {
        namedObjectType,
        queryT: `${syntheticNamePrefix}SparqlObjectSet.Query`,
      });

      const runtimeObjectType = namedObjectType.name;

      return [
        code`\
async ${methodSignatures.object.name}(${methodSignatures.object.parameters}): ${methodSignatures.object.returnType} {
  return (await this.${methodSignatures.objects.name}({ identifiers: [identifier], preferredLanguages: options?.preferredLanguages })).map(objects => objects[0]);
}`,
        code`\
async ${methodSignatures.objectCount.name}(${methodSignatures.objectCount.parameters}): ${methodSignatures.objectCount.returnType} {
  return this.#objectCount<${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
        code`\
async ${methodSignatures.objectIdentifiers.name}(${methodSignatures.objectIdentifiers.parameters}): ${methodSignatures.objectIdentifiers.returnType} {
  return this.#objectIdentifiers<${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
        code`\
async ${methodSignatures.objects.name}(${methodSignatures.objects.parameters}): ${methodSignatures.objects.returnType} {
  return this.#objects<${namedObjectType.name}, ${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>(${runtimeObjectType}, query);
}`,
      ];
    },
  ),
  { on: "\n\n" },
)}

  #mapBindingsToCount(bindings: readonly Record<string, ${this.imports.BlankNode} | ${this.imports.Literal} | ${this.imports.NamedNode}>[], variable: string): ${this.imports.Either}<Error, number> {
    if (bindings.length === 0) {
      return ${this.imports.Left}(new Error("empty result rows"));
    }
    if (bindings.length > 1) {
      return ${this.imports.Left}(new Error("more than one result row"));
    }
    const count = bindings[0][variable];
    if (count === undefined) {
      return ${this.imports.Left}(new Error("no 'count' variable in result row"));
    }
    if (count.termType !== "Literal") {
      return ${this.imports.Left}(new Error("'count' variable is not a Literal"));
    }
    const parsedCount = Number.parseInt(count.value, 10);
    if (Number.isNaN(parsedCount)) {
      return ${this.imports.Left}(new Error("'count' variable is NaN"));
    }
    return ${this.imports.Right}(parsedCount);
  }

  #mapBindingsToIdentifiers(bindings: readonly Record<string, ${this.imports.BlankNode} | ${this.imports.Literal} | ${this.imports.NamedNode}>[], variable: string): readonly ${this.imports.NamedNode}[] {
    const identifiers: ${this.imports.NamedNode}[] = [];
    for (const bindings_ of bindings) {
      const identifier = bindings_[variable];
      if (
        identifier !== undefined &&
        identifier.termType === "NamedNode"
      ) {
        identifiers.push(identifier);
      }
    }
    return identifiers;
  }

  async #objectIdentifiers<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${this.imports.Either}<Error, readonly ObjectIdentifierT[]>> {
    if (query?.identifiers) {
      return ${this.imports.Right}(query.identifiers);
    }

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${this.imports.Right}([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const wherePatterns = this.#wherePatterns(namedObjectType, query);
    if (wherePatterns.length === 0) {
      return ${this.imports.Left}(new Error("no SPARQL WHERE patterns for identifiers"));
    }

    const selectQueryString = \
      this.#sparqlGenerator.stringify({
        distinct: true,
        limit: limit < Number.MAX_SAFE_INTEGER ? limit : undefined,
        offset,
        order: query?.order ? query.order(this.#objectVariable).concat() : [{ expression: this.#objectVariable }],
        prefixes: {},
        queryType: "SELECT",
        type: "query",
        variables: [this.#objectVariable],
        where: wherePatterns.concat()
      });
      
    return ${this.imports.EitherAsync}(async () =>
      this.#mapBindingsToIdentifiers(
        await this.#sparqlClient.queryBindings(selectQueryString),
        this.#objectVariable.value,
      ) as readonly ObjectIdentifierT[],
    );  
  }

  async #objects<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.constructObjectType}, ${parameters.query}): Promise<${this.imports.Either}<Error, readonly ObjectT[]>> {
    return ${this.imports.EitherAsync}(async ({ liftEither }) => {
      const identifiers = await liftEither(await this.#objectIdentifiers<ObjectFilterT, ObjectIdentifierT>(namedObjectType, query));
      if (identifiers.length === 0) {
        return [];
      }

      const constructQueryString = namedObjectType.${syntheticNamePrefix}sparqlConstructQueryString({
        subject: this.#objectVariable,
        where: [{
          type: "values" as const,
          values: identifiers.map((identifier) => {
            const valuePatternRow: ${this.imports.sparqljs}.ValuePatternRow = {};
            valuePatternRow["?object"] = identifier as ${this.imports.NamedNode};
            return valuePatternRow;
          }),
        }]
      });

      const quads = await this.#sparqlClient.queryQuads(constructQueryString);

      const dataset = ${this.imports.datasetFactory}.dataset(quads.concat());
      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        objects.push(await liftEither(namedObjectType.${syntheticNamePrefix}fromRdfResource(new ${this.imports.Resource}({ dataFactory: ${this.imports.dataFactory}, dataset: dataset, identifier: identifier as ${this.imports.NamedNode} }), { objectSet: this, preferredLanguages: query?.preferredLanguages })));
      }
      return objects;
    });
  }

  async #objectCount<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${this.imports.Either}<Error, number>> {
    const wherePatterns = this.#wherePatterns(namedObjectType, query);
    if (wherePatterns.length === 0) {
      return ${this.imports.Left}(new Error("no SPARQL WHERE patterns for count"));
    }

    const selectQueryString = \
      this.#sparqlGenerator.stringify({
        prefixes: {},
        queryType: "SELECT",
        type: "query",
        variables: [
          {
            expression: {
              aggregation: "COUNT",
              distinct: true,
              expression: this.#objectVariable,
              type: "aggregate",
            },
            variable: this.#countVariable,
          },
        ],
        where: wherePatterns.concat()
      });

    return ${this.imports.EitherAsync}(async ({ liftEither }) =>
      liftEither(
        this.#mapBindingsToCount(
          await this.#sparqlClient.queryBindings(selectQueryString),
          this.#countVariable.value,
        ),
      ),
    );
  }

  #wherePatterns<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): readonly ${this.imports.sparqljs}.Pattern[] {
    // Patterns should be most to least specific.
    let patterns: ${this.imports.sparqljs}.Pattern[] = [];

    if (query?.where) {
      patterns = patterns.concat(query.where(this.#objectVariable));
    }

    patterns = patterns.concat(namedObjectType.${syntheticNamePrefix}focusSparqlWherePatterns({ filter: query?.filter, focusIdentifier: this.#objectVariable, ignoreRdfType: false, preferredLanguages: query?.preferredLanguages, variablePrefix: this.#objectVariable.value }));

    patterns = ${this.snippets.normalizeSparqlWherePatterns}(patterns).concat();

    const graph = query?.graph ?? this.#graph;
    if (graph) {
      switch (graph.termType) {
        case "DefaultGraph":
          return patterns; // Patterns without a GRAPH pattern around them query the default graph
        case "NamedNode":
          return [{ name: graph, patterns, type: "graph" }];
      }
    }
    // Union of all graphs: { ... patterns covering default graph ... } UNION { GRAPH ?g { ... patterns covering named graphs ... } }
    return [{ patterns: [{ patterns, type: "group" }, { name: ${this.imports.dataFactory}.variable!("g"), patterns, type: "graph" }], type: "union" }];
  }
}
  
export namespace ${syntheticNamePrefix}SparqlObjectSet {
  export type Query<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}> = ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT, ObjectIdentifierT> & { readonly order?: (objectVariable: ${this.imports.Variable}) => readonly ${this.imports.sparqljs}.Ordering[]; readonly where?: (objectVariable: ${this.imports.Variable}) => readonly ${this.imports.sparqljs}.Pattern[] };
}`;
}
