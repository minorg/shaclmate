import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

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
      .map((methodSignature) => code`${methodSignature};`),
  )}
}

export namespace ${syntheticNamePrefix}ObjectSet {
  export interface Query<ObjectFilterT extends { readonly $identifier?: { readonly in?: readonly (${sharedImports.BlankNode} | ${sharedImports.NamedNode})[] } }> {
    readonly filter?: ObjectFilterT;
    readonly limit?: number;
    readonly offset?: number;
  }
}`;
}
