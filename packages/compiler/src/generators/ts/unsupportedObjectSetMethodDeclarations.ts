import { type MethodDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";

export function unsupportedObjectSetMethodDeclarations({
  objectType,
}: {
  objectType: {
    readonly filterType: string;
    readonly identifierTypeAlias: string;
    readonly objectSetMethodNames: ObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
}): readonly MethodDeclarationStructure[] {
  return Object.values(objectSetMethodSignatures({ objectType })).map(
    (methodSignature) => ({
      ...methodSignature,
      kind: StructureKind.Method,
      parameters: methodSignature.parameters
        ? methodSignature.parameters!.map((parameter) => ({
            ...parameter,
            name: `_${parameter.name}`,
          }))
        : methodSignature.parameters,
      isAsync: true,
      statements: [
        `return purify.Left(new Error("${methodSignature.name}: not supported")) satisfies Awaited<${methodSignature.returnType}>;`,
      ],
    }),
  );
}
