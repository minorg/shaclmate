import {
  type MethodDeclarationStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

export function unsupportedObjectSetMethodDeclarations({
  objectSetMethodSignatures,
}: {
  objectSetMethodSignatures: Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >;
}): readonly MethodDeclarationStructure[] {
  return Object.entries(objectSetMethodSignatures).map(
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
