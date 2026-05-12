import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export function objectSetInterfaceDeclaration(
  this: TsGenerator,
  {
    namedObjectTypes,
    namedObjectUnionTypes,
  }: {
    namedObjectTypes: readonly NamedObjectType[];
    namedObjectUnionTypes: readonly NamedObjectUnionType[];
  },
): Code {
  return code`\
export interface ${syntheticNamePrefix}ObjectSet {
  ${joinCode(
    namedObjectTypes
      .flatMap((namedObjectType) =>
        Object.values(
          objectSetMethodSignatures.call(this, { namedObjectType }),
        ),
      )
      .concat(
        namedObjectUnionTypes.flatMap((namedObjectUnionType) =>
          Object.values(
            objectSetMethodSignatures.call(this, {
              namedObjectType: namedObjectUnionType,
            }),
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
  export interface Query<ObjectFilterT, ObjectIdentifierT extends ${this.reusables.imports.BlankNode} | ${this.reusables.imports.NamedNode}> {
    readonly filter?: ObjectFilterT;
    readonly graph?: Exclude<${this.reusables.imports.Quad_Graph}, ${this.reusables.imports.Variable}>;
    readonly identifiers?: readonly ObjectIdentifierT[];
    readonly limit?: number;
    readonly offset?: number;
    readonly preferredLanguages?: readonly string[];
  }
}`;
}
