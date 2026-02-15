import { type Code, code } from "ts-poet";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function objectSetMethodSignatures(parameters: {
  objectType: {
    readonly filterType: Code;
    readonly identifierTypeAlias: Code;
    readonly objectSetMethodNames: ObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
  parameterNamePrefix?: string;
  queryT?: string;
}): Readonly<
  Record<
    keyof ObjectType.ObjectSetMethodNames,
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
      parameters: code`${parameterNamePrefix}identifier: ${objectType.identifierTypeAlias}`,
      returnType: code`Promise<${imports.Either}<Error, ${objectType.name}>>`,
    },
    objectIdentifiers: {
      name: methodNames.objectIdentifiers,
      parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}>`,
      returnType: code`Promise<${imports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]>>`,
    },
    objects: {
      name: methodNames.objects,
      parameters: code`${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}>`,
      returnType: code`Promise<${imports.Either}<Error, readonly ${objectType.name}[]>>`,
    },
    objectsCount: {
      name: methodNames.objectsCount,
      parameters: code`${parameterNamePrefix}query?: Pick<${queryT}<${objectType.filterType}>, "filter">`,
      returnType: code`Promise<${imports.Either}<Error, number>>`,
    },
  };
}
