import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterTypeDeclaration(
  this: ObjectUnionType,
): TypeAliasDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Filter`,
    type: `{ readonly on?: { ${this.memberTypes.map((memberType) => `readonly ${memberType.name}?: ${memberType.filterType};`).join(" ")} } }`,
  };
}
