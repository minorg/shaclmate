import { type MethodDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";

export function unsupportedObjectSetMethodDeclarations({
  objectType,
}: { objectType: ObjectType }): readonly MethodDeclarationStructure[] {
  return Object.entries(objectSetMethodSignatures({ objectType })).map(
    ([methodName, methodSignature]) => ({
      ...methodSignature,
      kind: StructureKind.Method,
      parameters: methodSignature.parameters
        ? methodSignature.parameters!.map((parameter) => ({
            ...parameter,
            name: `_${parameter.name}`,
          }))
        : methodSignature.parameters,
      isAsync: true,
      statements:
        methodName === "objects"
          ? [`return [purify.Left(new Error("${methodName}: not supported"))];`]
          : [`return purify.Left(new Error("${methodName}: not supported"));`],
    }),
  );
}
