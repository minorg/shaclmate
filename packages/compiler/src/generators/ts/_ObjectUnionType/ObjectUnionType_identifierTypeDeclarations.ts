import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectUnionType_identifierTypeDeclarations(
  this: ObjectUnionType,
): readonly Code[] {
  return [
    code`export type ${syntheticNamePrefix}Identifier = ${this.identifierType.name};`,
    code`export namespace ${syntheticNamePrefix}Identifier { ${joinCode([this.identifierType.fromStringFunction, this.identifierType.toStringFunction])} }`,
  ];
}
