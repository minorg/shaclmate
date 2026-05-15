import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import * as ast from "../../ast/index.js";
import type { Generator } from "../Generator.js";
import { BlankNodeType } from "./BlankNodeType.js";
import { graphqlSchemaVariableStatement } from "./graphqlSchemaVariableStatement.js";
import { IdentifierType } from "./IdentifierType.js";
import { IriType } from "./IriType.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetDeclarations } from "./objectSetDeclarations.js";
import { Reusables } from "./Reusables.js";
import type { TsFeature } from "./TsFeature.js";
import { TypeFactory } from "./TypeFactory.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export class TsGenerator implements Generator {
  private readonly typeFactory: TypeFactory;

  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly reusables: Reusables;

  constructor({
    configuration,
    logger,
  }: { configuration?: TsGenerator.Configuration; logger: Logger }) {
    if (!configuration) {
      configuration = TsGenerator.Configuration.default_;
    }
    this.configuration = {
      ...configuration,
      features: TsGenerator.Configuration.inferFeatures(configuration.features),
    };
    this.logger = logger;
    this.reusables = new Reusables({ configuration, logger });
    this.typeFactory = new TypeFactory({
      configuration,
      logger,
      reusables: this.reusables,
    });
  }

  generate(ast_: ast.Ast): string {
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
        this.typeFactory.createType(astNamedUnionType).declaration.toList(),
      );
    }

    const namedObjectTypesToposorted = ast.ObjectType.toposort(
      ast_.namedObjectTypes,
    ).map((astObjectType) =>
      this.typeFactory.createNamedObjectType(astObjectType),
    );

    const namedObjectUnionTypesToposorted = ast_.namedUnionTypes
      .filter((_) => _.isObjectUnionType())
      .map((astObjectUnionType) =>
        this.typeFactory.createNamedObjectUnionType(astObjectUnionType),
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
      (left, right) => left.name.localeCompare(right.name),
    );

    const namedObjectUnionTypesNameSorted =
      namedObjectUnionTypesToposorted.toSorted((left, right) =>
        left.name.localeCompare(right.name),
      );

    switch (namedObjectTypesNameSorted.length) {
      case 0:
        break;
      case 1:
        declarations.push(
          code`type ${this.configuration.syntheticNamePrefix}Object = ${namedObjectTypesNameSorted[0].name};`,
        );
        break;
      default: {
        const uberObjectUnionType = this.synthesizeUberObjectUnionType(
          namedObjectTypesToposorted.toReversed(), // Reverse topological order so children ane before parents
        );
        declarations = declarations.concat(
          uberObjectUnionType.declaration.toList(),
        );
        namedObjectUnionTypesNameSorted.push(uberObjectUnionType);
      }
    }

    declarations.push(
      ...objectSetDeclarations.call(this, {
        namedObjectTypes: namedObjectTypesNameSorted,
        namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
      }),
    );

    declarations.push(
      ...graphqlSchemaVariableStatement
        .call(this, {
          namedObjectTypes: namedObjectTypesNameSorted,
          namedObjectUnionTypes: namedObjectUnionTypesNameSorted,
        })
        .toList(),
    );

    declarations.splice(
      0,
      0,
      joinCode(this.reusables.snippets.ifUsed, { on: "\n\n" }),
    );

    return joinCode(declarations).toString({});
  }

  /**
   * Synthesize the $Object union.
   */
  private synthesizeUberObjectUnionType(
    namedObjectTypes: readonly NamedObjectType[],
  ): NamedObjectUnionType {
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
        comment: Maybe.empty(),
        configuration: this.configuration,
        label: Maybe.empty(),
        logger: this.logger,
        reusables: this.reusables,
      });
    } else {
      switch ([...nodeKinds][0]) {
        case "BlankNode":
          identifierType = new BlankNodeType({
            comment: Maybe.empty(),
            configuration: this.configuration,
            label: Maybe.empty(),
            logger: this.logger,
            reusables: this.reusables,
          });
          break;
        case "IRI":
          identifierType = new IriType({
            comment: Maybe.empty(),
            configuration: this.configuration,
            hasValues: [],
            in_: [],
            label: Maybe.empty(),
            logger: this.logger,
            reusables: this.reusables,
          });
          break;
      }
    }

    return new NamedObjectUnionType({
      comment: Maybe.empty(),
      configuration: this.configuration,
      identifierType,
      label: Maybe.empty(),
      logger: this.logger,
      members: filteredNamedObjectTypes.map((namedObjectType) => ({
        discriminantValue: Maybe.empty(),
        type: namedObjectType,
      })),
      name: `${this.configuration.syntheticNamePrefix}Object`,
      recursive: false,
      reusables: this.reusables,
    });
  }
}

export namespace TsGenerator {
  export interface Configuration {
    readonly features: ReadonlySet<TsFeature>;
    readonly syntheticNamePrefix: string;
  }

  export namespace Configuration {
    export const default_: Configuration = {
      features: new Set(["create", "equals", "hash", "json", "rdf"]),
      syntheticNamePrefix: "$",
    };

    export function inferFeatures(features: ReadonlySet<TsFeature>) {
      const inferredFeatures = new Set(features);

      if (inferredFeatures.has("graphql") || inferredFeatures.has("sparql")) {
        inferredFeatures.add("rdf");
      }

      if (inferredFeatures.has("json") || inferredFeatures.has("rdf")) {
        inferredFeatures.add("create");
      }

      return inferredFeatures;
    }
  }
}
