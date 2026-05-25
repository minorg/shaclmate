import type { Logger } from "ts-log";
import type { NamedObjectType } from "./NamedObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { Reusables } from "./Reusables.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractObjectSetType {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly reusables: Reusables;
  protected readonly namedObjectTypes: readonly NamedObjectType[];
  protected readonly namedObjectUnionTypes: readonly ObjectUnionType[];

  constructor({
    configuration,
    logger,
    namedObjectTypes,
    namedObjectUnionTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly ObjectUnionType[];
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.logger = logger;
    this.namedObjectTypes = namedObjectTypes;
    this.namedObjectUnionTypes = namedObjectUnionTypes;
    this.reusables = reusables;
  }

  abstract readonly declaration: Code;

  protected methodSignatures(
    namedObjectType: {
      readonly filterType: Code;
      readonly identifierTypeAlias: Code;
      readonly objectSetMethodNames: NamedObjectType.ObjectSetMethodNames;
      readonly name: Code | string;
    },
    options?: {
      parameterNamePrefix?: string;
      queryT?: string;
    },
  ): Readonly<
    Record<
      keyof NamedObjectType.ObjectSetMethodNames,
      {
        readonly name: string;
        readonly parameters: Code;
        readonly returnType: Code;
      }
    >
  > {
    const parameterNamePrefix = options?.parameterNamePrefix ?? "";
    const queryT =
      options?.queryT ??
      `${this.configuration.syntheticNamePrefix}ObjectSet.Query`;

    const methodNames = namedObjectType.objectSetMethodNames;
    return {
      object: {
        name: methodNames.object,
        parameters: code`${parameterNamePrefix}identifier: ${namedObjectType.identifierTypeAlias}, options?: { preferredLanguages?: readonly string[]; }`,
        returnType: code`Promise<${this.reusables.imports.Either}<Error, ${namedObjectType.name}>>`,
      },
      objectCount: {
        name: methodNames.objectCount,
        parameters: code`${parameterNamePrefix}query?: Pick<${queryT}<${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>, "filter">`,
        returnType: code`Promise<${this.reusables.imports.Either}<Error, number>>`,
      },
      objectIdentifiers: {
        name: methodNames.objectIdentifiers,
        parameters: code`${parameterNamePrefix}query?: ${queryT}<${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>`,
        returnType: code`Promise<${this.reusables.imports.Either}<Error, readonly ${namedObjectType.identifierTypeAlias}[]>>`,
      },
      objects: {
        name: methodNames.objects,
        parameters: code`${parameterNamePrefix}query?: ${queryT}<${namedObjectType.filterType}, ${namedObjectType.identifierTypeAlias}>`,
        returnType: code`Promise<${this.reusables.imports.Either}<Error, readonly ${namedObjectType.name}[]>>`,
      },
    };
  }
}
