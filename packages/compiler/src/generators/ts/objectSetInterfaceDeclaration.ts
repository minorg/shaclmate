import { imports } from "./imports.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export function objectSetInterfaceDeclaration({
  objectTypes,
  namedObjectUnionTypes,
}: {
  objectTypes: readonly ObjectType[];
  namedObjectUnionTypes: readonly NamedObjectUnionType[];
}): Code {
  return code`\
export interface ${syntheticNamePrefix}ObjectSet {
  ${joinCode(
    objectTypes
      .flatMap((objectType) =>
        Object.values(objectSetMethodSignatures({ objectType })),
      )
      .concat(
        namedObjectUnionTypes.flatMap((namedObjectUnionType) =>
          Object.values(
            objectSetMethodSignatures({ objectType: namedObjectUnionType }),
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
    readonly graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
    readonly preferredLanguages?: readonly string[];
  }
}`;
}
