import type { Logger } from "@rdfx/logger";

import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import type { AbstractType } from "./AbstractType.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Reusables } from "./Reusables.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractObjectSetType {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly namedObjectTypes: readonly (
    | ObjectDiscriminatedUnionType
    | ObjectIntersectionType
    | ObjectType
  )[];
  protected readonly reusables: Reusables;

  abstract readonly declaration: Code;

  constructor({
    configuration,
    logger,
    namedObjectTypes,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    namedObjectTypes: readonly (
      | ObjectDiscriminatedUnionType
      | ObjectIntersectionType
      | ObjectType
    )[];
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.logger = logger;
    this.namedObjectTypes = namedObjectTypes;
    this.reusables = reusables;
  }

  @Memoize()
  protected get typeParameters() {
    return {
      ObjectT: code`ObjectT extends { readonly $identifier: () => ObjectIdentifierT; ${this.configuration.objectDiscriminantProperty.name}: string; }`,
      ObjectFilterT: code`ObjectFilterT`,
      ObjectIdentifierT: code`ObjectIdentifierT extends ${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode}`,
    };
  }

  protected methodSignatures(
    objectType: {
      readonly discriminatedType: Maybe<AbstractType.DiscriminatedType>;
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
        readonly asyncReturnType: Code;
        readonly name: string;
        readonly parameters: Code;
        readonly syncReturnType: Code;
      }
    >
  > {
    const objectDiscriminatedTypeExpression =
      objectType.discriminatedType.unsafeCoerce().expression;
    const parameterNamePrefix = options?.parameterNamePrefix ?? "";
    const queryT =
      options?.queryT ??
      `${this.configuration.syntheticNamePrefix}ObjectSet.Query`;

    const methodNames = objectType.objectSetMethodNames;

    const returnTypes = (syncReturnType: Code) => ({
      asyncReturnType: code`Promise<${syncReturnType}>`,
      syncReturnType,
    });

    return {
      object: {
        name: methodNames.object,
        parameters: code`${parameterNamePrefix}identifier: ${objectType.identifierTypeAlias}, options?: { preferredLanguages?: readonly string[]; }`,
        ...returnTypes(
          code`${this.reusables.imports.Either}<Error, ${objectDiscriminatedTypeExpression}>`,
        ),
      },
      objectCount: {
        name: methodNames.objectCount,
        parameters: code`${parameterNamePrefix}query?: Pick<${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>, "filter">`,
        ...returnTypes(code`${this.reusables.imports.Either}<Error, number>`),
      },
      objectIdentifiers: {
        name: methodNames.objectIdentifiers,
        parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>`,
        ...returnTypes(
          code`${this.reusables.imports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]>`,
        ),
      },
      objects: {
        name: methodNames.objects,
        parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>`,
        ...returnTypes(
          code`${this.reusables.imports.Either}<Error, readonly ${objectDiscriminatedTypeExpression}[]>`,
        ),
      },
    };
  }
}
