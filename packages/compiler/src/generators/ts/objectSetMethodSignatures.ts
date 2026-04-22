import { imports } from "./imports.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export function objectSetMethodSignatures(parameters: {
  objectType: {
    readonly filterType: Code;
    readonly identifierTypeAlias: Code;
    readonly objectSetMethodNames: NamedObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
  parameterNamePrefix?: string;
  queryT?: string;
}): Readonly<
  Record<
    keyof NamedObjectType.ObjectSetMethodNames,
    {
      readonly name: string;
      readonly parameters: Code;
      readonly returnType: Code;
    }
  >
> {
  const { objectType } = parameters;
  const parameterNamePrefix = parameters?.parameterNamePrefix ?? "";
  const queryT = parameters.queryT ?? `${syntheticNamePrefix}ObjectSet.Query`;

  const methodNames = objectType.objectSetMethodNames;
  return {
    object: {
      name: methodNames.object,
      parameters: code`${parameterNamePrefix}identifier: ${objectType.identifierTypeAlias}, options?: { preferredLanguages?: readonly string[]; }`,
      returnType: code`Promise<${imports.Either}<Error, ${objectType.name}>>`,
    },
    objectCount: {
      name: methodNames.objectCount,
      parameters: code`${parameterNamePrefix}query?: Pick<${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>, "filter">`,
      returnType: code`Promise<${imports.Either}<Error, number>>`,
    },
    objectIdentifiers: {
      name: methodNames.objectIdentifiers,
      parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>`,
      returnType: code`Promise<${imports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]>>`,
    },
    objects: {
      name: methodNames.objects,
      parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}, ${objectType.identifierTypeAlias}>`,
      returnType: code`Promise<${imports.Either}<Error, readonly ${objectType.name}[]>>`,
    },
  };
}
