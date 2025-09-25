import { type ClassDeclarationStructure, Scope, StructureKind } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function forwardingObjectSetClassDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): ClassDeclarationStructure {
  const delegateName = `${syntheticNamePrefix}delegate`;
  return {
    getAccessors: [
      {
        isAbstract: true,
        name: delegateName,
        scope: Scope.Protected,
        returnType: `${syntheticNamePrefix}ObjectSet`,
      },
    ],
    implements: [`${syntheticNamePrefix}ObjectSet`],
    isAbstract: true,
    isExported: true,
    kind: StructureKind.Class,
    name: `${syntheticNamePrefix}ForwardingObjectSet`,
    methods: [...objectTypes, ...objectUnionTypes].flatMap((objectType) =>
      Object.values(objectSetMethodSignatures({ objectType })).map(
        (methodSignature) => ({
          ...methodSignature,
          kind: StructureKind.Method,
          statements: [
            `return this.${delegateName}.${methodSignature.name}(${methodSignature.parameters!.map((parameter) => parameter.name).join(", ")});`,
          ],
        }),
      ),
    ),
  };
}
