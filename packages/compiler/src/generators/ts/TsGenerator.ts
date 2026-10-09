import type { Logger } from "@rdfx/logger";
import type * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { GraphqlSchema } from "./GraphqlSchema.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import { ObjectSetType } from "./ObjectSetType.js";
import type { ObjectType } from "./ObjectType.js";
import { Operation } from "./Operation.js";
import { RdfjsDatasetObjectSetType } from "./RdfjsDatasetObjectSetType.js";
import { Reusables } from "./Reusables.js";
import { Service } from "./Service.js";
import { SparqlObjectSetType } from "./SparqlObjectSetType.js";
import { TsFeature } from "./TsFeature.js";
import type { Type } from "./Type.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";
import { UberObjectDiscriminatedUnionType } from "./UberObjectDiscriminatedUnionType.js";

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
          tsNamedObjectDiscriminatedUnionTypes.push(tsNamedType);
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

    declarations = declarations.concat(
      new UberObjectDiscriminatedUnionType({
        configuration,
        logger: this.logger,
        members: tsNamedObjectTypes,
        reusables,
      }).declaration.toList(),
    );

    declarations = declarations.concat(
      this.objectSetTypeDeclarations({
        configuration,
        namedObjectTypes: tsNamedObjectTypes,
        namedObjectDiscriminatedUnionTypes:
          tsNamedObjectDiscriminatedUnionTypes,
        reusables,
      }),
    );

    declarations = declarations.concat(
      this.serviceDeclarations({
        configuration,
        services: ast_.services.map(
          (astService) =>
            new Service({
              configuration,
              comment: astService.comment,
              label: astService.label,
              logger: this.logger,
              name: astService.name,
              operations: astService.operations.map((astOperation) => {
                const operation = new Operation({
                  configuration,
                  comment: astOperation.comment,
                  error: astOperation.error.map((astType) => {
                    switch (astType.kind) {
                      case "DiscriminatedUnion":
                        return typeFactory.createObjectDiscriminatedUnionType(
                          astType,
                        );
                      case "Struct":
                        return typeFactory.createObjectType(astType);
                      default:
                        astType satisfies never;
                        throw new Error("should never reach this point");
                    }
                  }),
                  label: astOperation.label,
                  lazyBindings: (): readonly Operation.Binding[] =>
                    astOperation.bindings.map(
                      (astBinding) =>
                        new Operation.HttpBinding({
                          operation,
                          request: astBinding.request,
                          response: astBinding.response,
                          reusables,
                        }),
                    ),
                  logger: this.logger,
                  name: astOperation.name,
                  parameter: astOperation.parameter.map((astType) =>
                    typeFactory.createObjectType(astType),
                  ),
                  result: astOperation.result.map((astType) =>
                    typeFactory.createType(astType),
                  ),
                  reusables,
                  service: { name: astService.name },
                });
                return operation;
              }),
              reusables,
            }),
        ),
      }),
    );

    if (configuration.features.has("GraphQL")) {
      const graphqlNamedObjectTypes = tsNamedObjectTypes.filter(
        (tsNamedObjectType) =>
          tsNamedObjectType.identifierProperty.isJust() &&
          !tsNamedObjectType.synthetic,
      );
      const graphqlNamedObjectDiscriminatedUnionTypes =
        tsNamedObjectDiscriminatedUnionTypes;

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

    return joinCode(declarations, { on: "\n\n" }).toString({});
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
          namedObjectType.identifierProperty.isJust() &&
          !namedObjectType.extern &&
          !namedObjectType.synthetic,
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

  private serviceDeclarations({
    configuration,
    services,
  }: {
    configuration: TsGenerator.Configuration;
    services: readonly Service[];
  }): readonly Code[] {
    return services.flatMap((service) => {
      const declarations: Code[] = [];
      if (configuration.features.has("Service")) {
        declarations.push(service.interfaceDeclaration);
      }
      if (configuration.features.has("LoggingService")) {
        declarations.push(service.loggingClassDeclaration);
      }
      if (configuration.features.has("ServiceHttpApi")) {
        declarations.push(service.httpApiFactoryFunction);
      }
      return declarations;
    });
  }
}

function compareTsNamedType(left: Type, right: Type): number {
  return left.name.unsafeCoerce().localeCompare(right.name.unsafeCoerce());
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

    export function finalize(
      ast: ast.Ast,
      partialConfiguration?: Partial<Configuration>,
    ): Configuration {
      const requestedFeatures =
        partialConfiguration?.features ?? default_.features!;

      const featureDependencies = Object.fromEntries(
        Object.entries(TsFeature.dependencies).map(([k, v]) => [k, [...v]]),
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
