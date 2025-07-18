import {
  type InterfaceDeclarationStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { ObjectType } from "./ObjectType.js";

export type ObjectSetInterfaceMethodSignaturesByObjectTypeName = Record<
  string,
  Record<
    keyof ObjectType.ObjectSetMethodNames,
    OptionalKind<MethodSignatureStructure>
  >
>;

export function objectSetInterfaceDeclaration({
  objectSetInterfaceMethodSignaturesByObjectTypeName,
}: {
  objectSetInterfaceMethodSignaturesByObjectTypeName: ObjectSetInterfaceMethodSignaturesByObjectTypeName;
}): InterfaceDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Interface,
    methods: Object.values(
      objectSetInterfaceMethodSignaturesByObjectTypeName,
    ).flatMap(Object.values),
    name: "$ObjectSet",
  };
}
