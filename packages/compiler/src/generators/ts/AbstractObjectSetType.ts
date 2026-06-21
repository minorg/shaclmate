import type { Maybe } from "purify-ts";
import type { Logger } from "ts-log";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Reusables } from "./Reusables.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractObjectSetType {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly reusables: Reusables;
  protected readonly namedObjectTypes: readonly ObjectType[];
  protected readonly namedObjectDiscriminatedUnionTypes: readonly ObjectDiscriminatedUnionType[];

  constructor({
    configuration,
    logger,
    namedObjectTypes,
    namedObjectDiscriminatedUnionTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    namedObjectTypes: readonly ObjectType[];
    namedObjectDiscriminatedUnionTypes: readonly ObjectDiscriminatedUnionType[];
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.logger = logger;
    this.namedObjectTypes = namedObjectTypes;
    this.namedObjectDiscriminatedUnionTypes =
      namedObjectDiscriminatedUnionTypes;
    this.reusables = reusables;
  }

  abstract readonly declaration: Code;

  protected methodSignatures(
    namedObjectType: {
      readonly filterType: Code;
      readonly identifierTypeAlias: Code;
      readonly name: Maybe<string>;
      readonly objectSetMethodNames: ObjectType.ObjectSetMethodNames;
    },
    options?: {
      parameterNamePrefix?: string;
      queryT?: string;
    },
  ): Readonly<
    Record<
      keyof ObjectType.ObjectSetMethodNames,
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
        returnType: code`Promise<${this.reusables.imports.Either}<Error, ${namedObjectType.name.unsafeCoerce()}>>`,
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
        returnType: code`Promise<${this.reusables.imports.Either}<Error, readonly ${namedObjectType.name.unsafeCoerce()}[]>>`,
      },
    };
  }
}
