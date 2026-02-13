import type { MethodSignatureStructure, OptionalKind } from "ts-morph";
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
  queryT?: string;
}): Readonly<Record<keyof ObjectType.ObjectSetMethodNames, Code>> {
  const { objectType } = parameters;
  const queryT = parameters.queryT ?? `${syntheticNamePrefix}ObjectSet.Query`;

  const methodNames = objectType.objectSetMethodNames;
  return {
    object: code`${methodNames.object}(identifier: ${objectType.identifierTypeAlias}): Promise<${sharedImports.Either}<Error, ${objectType.name}>`,
    objectIdentifiers: code`${methodNames.objectIdentifiers}(query?: ${queryT}<${objectType.filterType}>): Promise<${sharedImports.Either}<Error, readonly ${objectType.identifierTypeAlias}[]>>`,
    objects: code`${methodNames.objects}(query?: ${queryT}<${objectType.filterType}>): Promise<${sharedImports.Either}<Error, readonly ${objectType.name}[]>>`,
    objectsCount: code`${methodNames.objectsCount}(query?: Pick<${queryT}<${objectType.filterType}>, "filter">): Promise<${sharedImports.Either}<Error, number>>`,
  };
}
