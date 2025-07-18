import {
  type MethodDeclarationStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

export function unsupportedObjectSetMethodDeclarations({
  objectSetInterfaceMethodSignatures,
}: {
  objectSetInterfaceMethodSignatures: Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >;
}): readonly MethodDeclarationStructure[] {
  return Object.entries(objectSetInterfaceMethodSignatures).map(
    ([methodName, methodSignature]) => ({
      ...methodSignature,
      kind: StructureKind.Method,
      parameters:
        methodName !== "objects" && methodSignature.parameters
          ? methodSignature.parameters!.map((parameter) => ({
              ...parameter,
              name: `_${parameter.name}`,
            }))
          : methodSignature.parameters,
      isAsync: true,
      statements:
        methodName === "objects"
          ? [
              `return identifiers.map(() => purify.Left(new Error("${methodName}: not supported")));`,
            ]
          : [`return purify.Left(new Error("${methodName}: not supported"));`],
    }),
  );
}
