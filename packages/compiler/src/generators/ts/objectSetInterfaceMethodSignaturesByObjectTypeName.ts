import type { MethodSignatureStructure, OptionalKind } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

export type ObjectSetInterfaceMethodSignaturesByObjectTypeName = Record<
  string,
  Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >
>;

export function objectSetInterfaceMethodSignaturesByObjectTypeName({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): ObjectSetInterfaceMethodSignaturesByObjectTypeName {
  return objectTypes.reduce((result, objectType) => {
    const methodNames = objectType.objectSetMethodNames;
    result[objectType.name] = {
      object: {
        name: methodNames.object,
        parameters: [
          {
            name: "identifier",
            type: objectType.identifierType.name,
          },
        ],
        returnType: `Promise<purify.Either<Error, ${objectType.name}>>`,
      },
      objectIdentifiers: {
        name: methodNames.objectIdentifiers,
        parameters: [
          {
            hasQuestionToken: true,
            name: "query",
            type: `$ObjectSet.Query<${objectType.identifierType.name}>`,
          },
        ],
        returnType: `Promise<purify.Either<Error, readonly ${objectType.identifierType.name}[]>>`,
      },
      objects: {
        name: methodNames.objects,
        parameters: [
          {
            hasQuestionToken: true,
            name: "query",
            type: `$ObjectSet.Query<${objectType.identifierType.name}>`,
          },
        ],
        returnType: `Promise<readonly purify.Either<Error, ${objectType.name}>[]>`,
      },
      objectsCount: {
        name: methodNames.objectsCount,
        parameters: [
          {
            hasQuestionToken: true,
            name: "query",
            type: `Pick<$ObjectSet.Query<${objectType.identifierType.name}>, "where">`,
          },
        ],
        returnType: "Promise<purify.Either<Error, number>>",
      },
    };
    return result;
  }, {} as ObjectSetInterfaceMethodSignaturesByObjectTypeName);
}
