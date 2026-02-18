import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export function objectSetInterfaceDeclaration({
  objectTypes,
  objectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  objectUnionTypes: readonly ObjectUnionType[];
}): Code {
  return code`\
export interface ${syntheticNamePrefix}ObjectSet {
  ${joinCode(
    objectTypes
      .flatMap((objectType) =>
        Object.values(objectSetMethodSignatures({ objectType })),
      )
      .concat(
        objectUnionTypes.flatMap((objectUnionType) =>
          Object.values(
            objectSetMethodSignatures({ objectType: objectUnionType }),
          ),
        ),
      )
      .map(
        (methodSignature) =>
          code`${methodSignature.name}(${methodSignature.parameters}): ${methodSignature.returnType};`,
      ),
    { on: "\n\n" },
  )}
}

export namespace ${syntheticNamePrefix}ObjectSet {
  export interface Query<ObjectFilterT, ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}> {
    readonly filter?: ObjectFilterT;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
  }
}`;
}
