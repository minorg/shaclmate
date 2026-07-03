import dataFactory from "@rdfx/data-factory";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import type * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { GraphqlSchema } from "./GraphqlSchema.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import { ObjectSetType } from "./ObjectSetType.js";
import type { ObjectType } from "./ObjectType.js";
import { RdfjsDatasetObjectSetType } from "./RdfjsDatasetObjectSetType.js";
import { Reusables } from "./Reusables.js";
import { SparqlObjectSetType } from "./SparqlObjectSetType.js";
import type { TsFeature } from "./TsFeature.js";
import type { Type } from "./Type.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

function compareTsNamedType(left: Type, right: Type): number {
  return left.name.unsafeCoerce().localeCompare(right.name.unsafeCoerce());
}

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

    const tsNamedTypes: Type[] = [];
    const tsNamedObjectTypes: ObjectType[] = [];
    const tsNamedObjectDiscriminatedUnionTypes: ObjectDiscriminatedUnionType[] =
      [];
    for (const astNamedType of ast_.namedTypes) {
      const tsNamedType = typeFactory.createType(astNamedType);
      tsNamedTypes.push(tsNamedType);

      if (astNamedType.kind === "Struct") {
        for (const tsImport of astNamedType.tsImports) {
          declarations.push(code`${tsImport}`);
        }
      }

      switch (tsNamedType.kind) {
        case "Object":
          tsNamedObjectTypes.push(tsNamedType);
          break;
        case "ObjectDiscriminatedUnion":
          tsNamedObjectDiscriminatedUnionTypes.push(
            tsNamedType as ObjectDiscriminatedUnionType,
          );
          break;
      }
    }

    tsNamedTypes.sort(compareTsNamedType);
    tsNamedObjectTypes.sort(compareTsNamedType);
    tsNamedObjectDiscriminatedUnionTypes.sort(compareTsNamedType);

    for (const tsNamedType of tsNamedTypes) {
      switch (tsNamedType.kind) {
        case "ObjectDiscriminatedUnion":
        case "DiscriminatedUnion":
          continue; // Declare compound types last.
      }

      tsNamedType.declaration.ifJust((declaration) => {
        declarations.push(declaration);
      });
    }

    // Declare compound types last.
    for (const tsNamedType of tsNamedTypes) {
      switch (tsNamedType.kind) {
        case "ObjectDiscriminatedUnion":
        case "DiscriminatedUnion":
          break;
        default:
          continue;
      }

      tsNamedType.declaration.ifJust((declaration) => {
        declarations.push(declaration);
      });
    }

    switch (tsNamedObjectTypes.length) {
      case 0:
        break;
      case 1:
        declarations.push(
          code`type ${configuration.syntheticNamePrefix}Object = ${tsNamedObjectTypes[0].expression};`,
        );
        break;
      default: {
        const uberObjectDiscriminatedUnionType =
          this.synthesizeUberObjectDiscriminatedUnionType({
            configuration,
            namedObjectTypes: tsNamedObjectTypes,
            reusables,
          });
        declarations = declarations.concat(
          uberObjectDiscriminatedUnionType.declaration.toList(),
        );
        tsNamedObjectDiscriminatedUnionTypes.push(
          uberObjectDiscriminatedUnionType,
        );
      }
    }

    declarations.push(
      ...this.objectSetTypeDeclarations({
        configuration,
        namedObjectTypes: tsNamedObjectTypes,
        namedObjectDiscriminatedUnionTypes:
          tsNamedObjectDiscriminatedUnionTypes,
        reusables,
      }),
    );

    if (configuration.features.has("GraphQL")) {
      const graphqlNamedObjectTypes = tsNamedObjectTypes.filter(
        (tsNamedObjectType) => !tsNamedObjectType.synthetic,
      );
      const graphqlNamedObjectDiscriminatedUnionTypes =
        tsNamedObjectDiscriminatedUnionTypes.filter(
          (tsNamedObjectDiscriminatedUnionType) =>
            !tsNamedObjectDiscriminatedUnionType.synthetic,
        );

      if (graphqlNamedObjectTypes.length > 0) {
        declarations.push(
          new GraphqlSchema({
            configuration,
            logger: this.logger,
            namedObjectTypes: graphqlNamedObjectTypes,
            namedObjectDiscriminatedUnionTypes:
              graphqlNamedObjectDiscriminatedUnionTypes,
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
    namedObjectDiscriminatedUnionTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    namedObjectTypes: readonly ObjectType[];
    namedObjectDiscriminatedUnionTypes: readonly ObjectDiscriminatedUnionType[];
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
      namedObjectDiscriminatedUnionTypes,
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
  private synthesizeUberObjectDiscriminatedUnionType({
    configuration,
    namedObjectTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    namedObjectTypes: readonly ObjectType[];
    reusables: Reusables;
  }): ObjectDiscriminatedUnionType {
    const filteredNamedObjectTypes = namedObjectTypes.filter(
      (namedObjectType) => !namedObjectType.extern,
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
        name: Maybe.empty(),
        comment: Maybe.empty(),
        configuration,
        label: Maybe.empty(),
        logger: this.logger,
        reusables,
        shapeIdentifier: dataFactory.blankNode(),
      });
    } else {
      switch ([...nodeKinds][0]) {
        case "BlankNode":
          identifierType = new BlankNodeType({
            name: Maybe.empty(),
            comment: Maybe.empty(),
            configuration,
            label: Maybe.empty(),
            logger: this.logger,
            reusables,
            shapeIdentifier: dataFactory.blankNode(),
          });
          break;
        case "IRI":
          identifierType = new IriType({
            name: Maybe.empty(),
            comment: Maybe.empty(),
            configuration,
            hasValues: [],
            in_: [],
            label: Maybe.empty(),
            logger: this.logger,
            reusables,
            shapeIdentifier: dataFactory.blankNode(),
          });
          break;
      }
    }

    return new ObjectDiscriminatedUnionType({
      name: Maybe.of(`${configuration.syntheticNamePrefix}Object`),
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
      shapeIdentifier: dataFactory.blankNode(),
      synthetic: true,
    });
  }
}

export namespace TsGenerator {
  export interface Configuration {
    readonly features: ReadonlySet<TsFeature>;
    readonly finalized: true;
    readonly objectDiscriminantProperty: {
      readonly jsonName: string;
      readonly name: string;
    };
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

      objectDiscriminantProperty: {
        jsonName: "$type",
        name: "$type",
      },

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
        objectDiscriminantProperty:
          partialConfiguration?.objectDiscriminantProperty ??
          default_.objectDiscriminantProperty,
        syntheticNamePrefix:
          partialConfiguration?.syntheticNamePrefix ??
          default_.syntheticNamePrefix!,
      };
    }
  }
}
