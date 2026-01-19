import type { MethodSignatureStructure, OptionalKind } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function objectSetMethodSignatures(parameters: {
  objectType: {
    readonly filterType: string;
    readonly identifierTypeAlias: string;
    readonly objectSetMethodNames: ObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
  queryT?: string;
}): Readonly<
  Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >
> {
  const { objectType } = parameters;
  const queryT = parameters.queryT ?? `${syntheticNamePrefix}ObjectSet.Query`;

  const methodNames = objectType.objectSetMethodNames;
  return {
    object: {
      name: methodNames.object,
      parameters: [
        {
          name: "identifier",
          type: objectType.identifierTypeAlias,
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
          type: `${queryT}<${objectType.filterType}>`,
        },
      ],
      returnType: `Promise<purify.Either<Error, readonly ${objectType.identifierTypeAlias}[]>>`,
    },
    objects: {
      name: methodNames.objects,
      parameters: [
        {
          hasQuestionToken: true,
          name: "query",
          type: `${queryT}<${objectType.filterType}>`,
        },
      ],
      returnType: `Promise<purify.Either<Error, readonly ${objectType.name}[]>>`,
    },
    objectsCount: {
      name: methodNames.objectsCount,
      parameters: [
        {
          hasQuestionToken: true,
          name: "query",
          type: `Pick<${queryT}<${objectType.identifierTypeAlias}>, "where">`,
        },
      ],
      returnType: "Promise<purify.Either<Error, number>>",
    },
  };
}
