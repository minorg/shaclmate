import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";

import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export function sparqlObjectSetClassDeclaration(
  this: TsGenerator,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): Code {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

  const parameters = {
    constructObjectType: code`namedObjectType: {\
  focusSparqlWherePatterns: ${this.reusables.snippets.FocusSparqlWherePatternsFunction}<ObjectFilterT>;
  fromRdfResource:  ${this.reusables.snippets.FromRdfResourceFunction}<ObjectT>;
  sparqlConstructQueryString: (parameters: { filter?: ObjectFilterT; subject: ${this.reusables.imports.NamedNode} | ${this.reusables.imports.Variable}; } & Omit<${this.reusables.imports.sparqljs}.ConstructQuery, "prefixes" | "queryType" | "type"> & ${this.reusables.imports.sparqljs}.GeneratorOptions) => string;
}`,
    query: code`query?: ${syntheticNamePrefix}SparqlObjectSet.Query<ObjectFilterT, ObjectIdentifierT>`,
    selectObjectTypeType: code`namedObjectType: { focusSparqlWherePatterns: ${this.reusables.snippets.FocusSparqlWherePatternsFunction}<ObjectFilterT> }`,
  };
  const sparqlClientType = code`{ queryBindings: (query: string) => Promise<readonly Record<string, ${this.reusables.imports.BlankNode} | ${this.reusables.imports.Literal} | ${this.reusables.imports.NamedNode}>[]>; queryQuads: (query: string) => Promise<readonly ${this.reusables.imports.Quad}[]>; }`;

  const typeParameters = {
    ObjectT: code`ObjectT extends { readonly $identifier: () => ObjectIdentifierT }`,
    ObjectFilterT: code`ObjectFilterT`,
    ObjectIdentifierT: code`ObjectIdentifierT extends ${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode}`,
  };

  return code`\
export class ${syntheticNamePrefix}SparqlObjectSet implements ${syntheticNamePrefix}ObjectSet {
  readonly #countVariable = ${this.reusables.imports.dataFactory}.variable!("count");;
  readonly #graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}>;
  readonly #objectVariable = ${this.reusables.imports.dataFactory}.variable!("object");
  readonly #sparqlClient: ${sparqlClientType};
  readonly #sparqlGenerator = new ${this.reusables.imports.sparqljs}.Generator();

  constructor(sparqlClient: ${sparqlClientType}, options?: { graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}> }) {
    this.#graph = options?.graph;
    this.#sparqlClient = sparqlClient;
  }

${joinCode(
  [...namedObjectTypes, ...namedObjectUnionTypes].flatMap(
    (namedObjectType): readonly Code[] => {
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

  #mapBindingsToCount(bindings: readonly Record<string, ${this.reusables.imports.BlankNode} | ${this.reusables.imports.Literal} | ${this.reusables.imports.NamedNode}>[], variable: string): ${this.reusables.imports.Either}<Error, number> {
    if (bindings.length === 0) {
      return ${this.reusables.imports.Left}(new Error("empty result rows"));
    }
    if (bindings.length > 1) {
      return ${this.reusables.imports.Left}(new Error("more than one result row"));
    }
    const count = bindings[0][variable];
    if (count === undefined) {
      return ${this.reusables.imports.Left}(new Error("no 'count' variable in result row"));
    }
    if (count.termType !== "Literal") {
      return ${this.reusables.imports.Left}(new Error("'count' variable is not a Literal"));
    }
    const parsedCount = Number.parseInt(count.value, 10);
    if (Number.isNaN(parsedCount)) {
      return ${this.reusables.imports.Left}(new Error("'count' variable is NaN"));
    }
    return ${this.reusables.imports.Right}(parsedCount);
  }

  #mapBindingsToIdentifiers(bindings: readonly Record<string, ${this.reusables.imports.BlankNode} | ${this.reusables.imports.Literal} | ${this.reusables.imports.NamedNode}>[], variable: string): readonly ${this.reusables.imports.NamedNode}[] {
    const identifiers: ${this.reusables.imports.NamedNode}[] = [];
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

  async #objectIdentifiers<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${this.reusables.imports.Either}<Error, readonly ObjectIdentifierT[]>> {
    if (query?.identifiers) {
      return ${this.reusables.imports.Right}(query.identifiers);
    }

    const limit = query?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${this.reusables.imports.Right}([]);
    }

    let offset = query?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    const wherePatterns = this.#wherePatterns(namedObjectType, query);
    if (wherePatterns.length === 0) {
      return ${this.reusables.imports.Left}(new Error("no SPARQL WHERE patterns for identifiers"));
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
      
    return ${this.reusables.imports.EitherAsync}(async () =>
      this.#mapBindingsToIdentifiers(
        await this.#sparqlClient.queryBindings(selectQueryString),
        this.#objectVariable.value,
      ) as readonly ObjectIdentifierT[],
    );  
  }

  async #objects<${typeParameters.ObjectT}, ${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.constructObjectType}, ${parameters.query}): Promise<${this.reusables.imports.Either}<Error, readonly ObjectT[]>> {
    return ${this.reusables.imports.EitherAsync}(async ({ liftEither }) => {
      const identifiers = await liftEither(await this.#objectIdentifiers<ObjectFilterT, ObjectIdentifierT>(namedObjectType, query));
      if (identifiers.length === 0) {
        return [];
      }

      const constructQueryString = namedObjectType.sparqlConstructQueryString({
        subject: this.#objectVariable,
        where: [{
          type: "values" as const,
          values: identifiers.map((identifier) => {
            const valuePatternRow: ${this.reusables.imports.sparqljs}.ValuePatternRow = {};
            valuePatternRow["?object"] = identifier as ${this.reusables.imports.NamedNode};
            return valuePatternRow;
          }),
        }]
      });

      const quads = await this.#sparqlClient.queryQuads(constructQueryString);

      const dataset = ${this.reusables.imports.datasetFactory}.dataset(quads.concat());
      const objects: ObjectT[] = [];
      for (const identifier of identifiers) {
        objects.push(await liftEither(namedObjectType.fromRdfResource(new ${this.reusables.imports.Resource}({ dataFactory: ${this.reusables.imports.dataFactory}, dataset: dataset, identifier: identifier as ${this.reusables.imports.NamedNode} }), { objectSet: this, preferredLanguages: query?.preferredLanguages })));
      }
      return objects;
    });
  }

  async #objectCount<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): Promise<${this.reusables.imports.Either}<Error, number>> {
    const wherePatterns = this.#wherePatterns(namedObjectType, query);
    if (wherePatterns.length === 0) {
      return ${this.reusables.imports.Left}(new Error("no SPARQL WHERE patterns for count"));
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

    return ${this.reusables.imports.EitherAsync}(async ({ liftEither }) =>
      liftEither(
        this.#mapBindingsToCount(
          await this.#sparqlClient.queryBindings(selectQueryString),
          this.#countVariable.value,
        ),
      ),
    );
  }

  #wherePatterns<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}>(${parameters.selectObjectTypeType}, ${parameters.query}): readonly ${this.reusables.imports.sparqljs}.Pattern[] {
    // Patterns should be most to least specific.
    let patterns: ${this.reusables.imports.sparqljs}.Pattern[] = [];

    if (query?.where) {
      patterns = patterns.concat(query.where(this.#objectVariable));
    }

    patterns = patterns.concat(namedObjectType.focusSparqlWherePatterns({ filter: query?.filter, focusIdentifier: this.#objectVariable, ignoreRdfType: false, preferredLanguages: query?.preferredLanguages, variablePrefix: this.#objectVariable.value }));

    patterns = ${this.reusables.snippets.normalizeSparqlWherePatterns}(patterns).concat();

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
    return [{ patterns: [{ patterns, type: "group" }, { name: ${this.reusables.imports.dataFactory}.variable!("g"), patterns, type: "graph" }], type: "union" }];
  }
}
  
export namespace ${syntheticNamePrefix}SparqlObjectSet {
  export type Query<${typeParameters.ObjectFilterT}, ${typeParameters.ObjectIdentifierT}> = ${syntheticNamePrefix}ObjectSet.Query<ObjectFilterT, ObjectIdentifierT> & { readonly order?: (objectVariable: ${this.reusables.imports.Variable}) => readonly ${this.reusables.imports.sparqljs}.Ordering[]; readonly where?: (objectVariable: ${this.reusables.imports.Variable}) => readonly ${this.reusables.imports.sparqljs}.Pattern[] };
}`;
}
