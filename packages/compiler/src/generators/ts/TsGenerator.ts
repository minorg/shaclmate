import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { GraphqlSchema } from "./GraphqlSchema.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import { ObjectSetType } from "./ObjectSetType.js";
import type { ObjectType } from "./ObjectType.js";
import { ObjectUnionType } from "./ObjectUnionType.js";
import { RdfjsDatasetObjectSetType } from "./RdfjsDatasetObjectSetType.js";
import { Reusables } from "./Reusables.js";
import { SparqlObjectSetType } from "./SparqlObjectSetType.js";
import type { TsFeature } from "./TsFeature.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TsGenerator implements Generator {
  private readonly configuration?: Partial<TsGenerator.Configuration>;
  private readonly logger: Logger;

  constructor({
    configuration,
    logger,
  }: { configuration?: Partial<TsGenerator.Configuration>; logger: Logger }) {
    this.configuration = configuration;
    this.logger = logger;
  }

  generate(ast_: ast.Ast): string {
    const configuration = TsGenerator.Configuration.finalize(
      ast_,
      this.configuration,
    );

    const reusables = new Reusables({
      configuration,
      logger: this.logger,
    });
    const typeFactory = new TypeFactory({
      configuration,
      logger: this.logger,
      reusables,
    });

    let declarations: Code[] = [];

    for (const namedObjectType of ast_.namedObjectTypes) {
      for (const tsImport of namedObjectType.tsImports) {
        declarations.push(code`${tsImport}`);
      }
    }

    for (const astNamedUnionType of ast_.namedUnionTypes) {
      if (astNamedUnionType.isObjectUnionType()) {
        continue;
      }
      declarations = declarations.concat(
        typeFactory.createType(astNamedUnionType).declaration.toList(),
      );
    }

    const namedObjectTypesToposorted = ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) => typeFactory.createObjectType(astObjectType));

    const namedObjectUnionTypesToposorted = ast_.namedUnionTypes
      .filter((_) => _.isObjectUnionType())
      .map((astObjectUnionType) =>
        typeFactory.createObjectUnionType(astObjectUnionType),
      );
    for (const namedObjectType of namedObjectTypesToposorted) {
      declarations = declarations.concat(namedObjectType.declaration.toList());
    }
    for (const namedObjectUnionType of namedObjectUnionTypesToposorted) {
      declarations = declarations.concat(
        namedObjectUnionType.declaration.toList(),
      );
    }

    const namedObjectTypesNameSorted = namedObjectTypesToposorted.toSorted(
      (left, right) =>
        left.alias.unsafeCoerce().localeCompare(right.alias.unsafeCoerce()),
    );

    const namedObjectUnionTypesNameSorted =
      namedObjectUnionTypesToposorted.toSorted((left, right) =>
        (left.alias.unsafeCoerce() as string).localeCompare(
          right.alias.unsafeCoerce(),
        ),
      );

    switch (namedObjectTypesNameSorted.length) {
      case 0:
        break;
      case 1:
        declarations.push(
          code`type ${configuration.syntheticNamePrefix}Object = ${namedObjectTypesNameSorted[0].expression};`,
        );
        break;
      default: {
        const uberObjectUnionType = this.synthesizeUberObjectUnionType({
          configuration,
          namedObjectTypes: namedObjectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
          reusables,
        });
        declarations = declarations.concat(
          uberObjectUnionType.declaration.toList(),
        );
        namedObjectUnionTypesNameSorted.push(uberObjectUnionType);
      }
    }

    declarations.push(
      ...this.objectSetTypeDeclarations({
        configuration,
        namedObjectTypes: namedObjectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
        reusables,
      }),
    );

    if (configuration.features.has("GraphQL")) {
      const graphqlNamedObjectTypes = namedObjectTypesNameSorted.filter(
        (namedObjectType) => !namedObjectType.synthetic,
      );
      const graphqlNamedObjectUnionTypes =
        namedObjectUnionTypesNameSorted.filter(
          (namedObjectUnionType) => !namedObjectUnionType.synthetic,
        );

      if (graphqlNamedObjectTypes.length > 0) {
        declarations.push(
          new GraphqlSchema({
            configuration,
            logger: this.logger,
            namedObjectTypes: graphqlNamedObjectTypes,
            namedObjectUnionTypes: graphqlNamedObjectUnionTypes,
            reusables,
          }).declaration,
        );
      }
    }

    declarations.splice(
      0,
      0,
      joinCode(reusables.snippets.ifUsed, { on: "\n\n" }),
    );

    return joinCode(declarations).toString({});
  }

  private objectSetTypeDeclarations({
    configuration,
    namedObjectTypes,
    namedObjectUnionTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    namedObjectTypes: readonly ObjectType[];
    namedObjectUnionTypes: readonly ObjectUnionType[];
    reusables: Reusables;
  }): readonly Code[] {
    const constructorParameters: ConstructorParameters<
      typeof ObjectSetType
    >[0] = {
      configuration,
      logger: this.logger,
      namedObjectTypes: namedObjectTypes.filter(
        (namedObjectType) =>
          !namedObjectType.extern && !namedObjectType.synthetic,
      ),
      namedObjectUnionTypes,
      reusables,
    };

    const declarations: Code[] = [];

    if (configuration.features.has("ObjectSet")) {
      declarations.push(new ObjectSetType(constructorParameters).declaration);
    }

    if (configuration.features.has("RdfjsDatasetObjectSet")) {
      declarations.push(
        new RdfjsDatasetObjectSetType(constructorParameters).declaration,
      );
    }

    if (configuration.features.has("SparqlObjectSet")) {
      declarations.push(
        new SparqlObjectSetType(constructorParameters).declaration,
      );
    }

    return declarations;
  }

  /**
   * Synthesize the $Object union.
   */
  private synthesizeUberObjectUnionType({
    configuration,
    namedObjectTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    namedObjectTypes: readonly ObjectType[];
    reusables: Reusables;
  }): ObjectUnionType {
    const filteredNamedObjectTypes = namedObjectTypes.filter(
      (namedObjectType) => !namedObjectType.extern, // && !namedObjectType.name.startsWith(syntheticNamePrefix),
    );
    invariant(filteredNamedObjectTypes.length > 0);

    const nodeKinds = filteredNamedObjectTypes.reduce(
      (nodeKinds, namedObjectType) => {
        for (const nodeKind of namedObjectType.identifierType.nodeKinds) {
          nodeKinds.add(nodeKind);
        }
        return nodeKinds;
      },
      new Set<IdentifierNodeKind>(),
    );

    let identifierType: BlankNodeType | IdentifierType | IriType;
    if (nodeKinds.size === 2) {
      identifierType = new IdentifierType({
        alias: Maybe.empty(),
        comment: Maybe.empty(),
        configuration,
        label: Maybe.empty(),
        logger: this.logger,
        reusables,
      });
    } else {
      switch ([...nodeKinds][0]) {
        case "BlankNode":
          identifierType = new BlankNodeType({
            alias: Maybe.empty(),
            comment: Maybe.empty(),
            configuration,
            label: Maybe.empty(),
            logger: this.logger,
            reusables,
          });
          break;
        case "IRI":
          identifierType = new IriType({
            alias: Maybe.empty(),
            comment: Maybe.empty(),
            configuration,
            hasValues: [],
            in_: [],
            label: Maybe.empty(),
            logger: this.logger,
            reusables,
          });
          break;
      }
    }

    return new ObjectUnionType({
      alias: Maybe.of(`${configuration.syntheticNamePrefix}Object`),
      comment: Maybe.empty(),
      configuration,
      identifierType: Maybe.of(identifierType),
      label: Maybe.empty(),
      logger: this.logger,
      members: filteredNamedObjectTypes.map((namedObjectType) => ({
        discriminantValue: Maybe.empty(),
        type: namedObjectType,
      })),
      recursive: false,
      reusables,
      synthetic: true,
    });
  }
}

export namespace TsGenerator {
  export interface Configuration {
    readonly features: ReadonlySet<TsFeature>;
    readonly finalized: true;
    readonly syntheticNamePrefix: string;
  }

  export namespace Configuration {
    export const default_: Omit<Configuration, "finalized"> = {
      features: new Set([
        "Object.create",
        "Object.equals",
        "Object.hash",
        "JSON",
        "RDF",
      ]),

      syntheticNamePrefix: "$",
    };

    const featureDependenciesStatic: Record<TsFeature, TsFeature[]> = {
      GraphQL: ["ObjectSet"],

      // Alias for other features, not dependencies per se
      JSON: ["Object.JSON"],

      "Object.create": ["Object.schema", "Object.toString", "Object.type"],

      "Object.equals": ["Object.type"],

      "Object.filter": ["Object.type"],

      "Object.fromJson": ["Object.create", "Object.JSON.type", "Object.type"],

      "Object.fromRdf": ["Object.create", "Object.schema"],

      "Object.hash": [],

      // Alias for other features, not dependencies per se
      "Object.JSON": [
        "Object.fromJson",
        "Object.JSON.parse",
        "Object.JSON.schema",
        "Object.JSON.type",
        "Object.JSON.uiSchema",
        "Object.toJson",
      ],

      "Object.JSON.parse": ["Object.JSON.schema", "Object.JSON.type"],

      "Object.JSON.type": [],

      "Object.JSON.schema": ["Object.JSON.type"],

      "Object.JSON.uiSchema": [],

      // Alias for other features, not dependencies per se
      "Object.RDF": ["Object.fromRdf", "Object.toRdf"],

      "Object.schema": [],

      "Object.toJson": ["Object.JSON.type", "Object.type"],

      "Object.toRdf": ["Object.schema", "Object.type"],

      "Object.toString": ["Object.type"],

      "Object.SPARQL": ["Object.schema"],

      "Object.type": [], // Implies Object.Identifier

      ObjectSet: ["Object.filter"],

      // Alias for other features, not dependencies per se
      RDF: ["Object.RDF", "RdfjsDatasetObjectSet"],

      RdfjsDatasetObjectSet: ["Object.fromRdf", "ObjectSet"],

      SPARQL: ["Object.SPARQL", "SparqlObjectSet"],

      SparqlObjectSet: ["Object.SPARQL", "ObjectSet"],
    };

    export function finalize(
      ast: ast.Ast,
      partialConfiguration?: Partial<Configuration>,
    ): Configuration {
      const requestedFeatures =
        partialConfiguration?.features ?? default_.features!;

      const featureDependencies = Object.fromEntries(
        Object.entries(featureDependenciesStatic).map(([k, v]) => [k, [...v]]),
      ) as Record<TsFeature, TsFeature[]>;

      if (ast.lazyTypesCount > 0) {
        featureDependencies["Object.fromJson"].push("ObjectSet");
        featureDependencies["Object.fromRdf"].push(
          "ObjectSet",
          "RdfjsDatasetObjectSet",
        );
      }

      const inferredFeatures = new Set(requestedFeatures);
      {
        const inferredFeaturesQueue = [...requestedFeatures];
        while (inferredFeaturesQueue.length > 0) {
          const feature = inferredFeaturesQueue.shift()!;

          for (const featureDependency of featureDependencies[feature]) {
            if (!inferredFeatures.has(featureDependency)) {
              inferredFeatures.add(featureDependency);
              inferredFeaturesQueue.push(featureDependency);
            }
          }
        }
      }

      return {
        features: inferredFeatures,
        finalized: true,
        syntheticNamePrefix:
          partialConfiguration?.syntheticNamePrefix ??
          default_.syntheticNamePrefix!,
      };
    }
  }
}
