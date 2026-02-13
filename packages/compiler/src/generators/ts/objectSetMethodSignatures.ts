import { type Code, code } from "ts-poet";
import type { ObjectType } from "./ObjectType.js";
import { sharedImports } from "./sharedImports.js";
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
}): Readonly<Record<keyof ObjectType.ObjectSetMethodNames, Code>> {
  const { objectType } = parameters;
  const parameterNamePrefix = parameters?.parameterNamePrefix ?? "";
  const queryT = parameters.queryT ?? `${syntheticNamePrefix}ObjectSet.Query`;

  const methodNames = objectType.objectSetMethodNames;
  return {
    object: code`${methodNames.object}(${parameterNamePrefix}identifier: ${objectType.identifierTypeAlias}): Promise<${sharedImports.Either}<Error, ${objectType.name}>`,
    objectIdentifiers: code`${methodNames.objectIdentifiers}(${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}>): Promise<${sharedImports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]>>`,
    objects: code`${methodNames.objects}(${parameterNamePrefix}query?: ${queryT}<${objectType.filterType}>): Promise<${sharedImports.Either}<Error, readonly ${objectType.name}[]>>`,
    objectsCount: code`${methodNames.objectsCount}(${parameterNamePrefix}query?: Pick<${queryT}<${objectType.filterType}>, "filter">): Promise<${sharedImports.Either}<Error, number>>`,
  };
}
