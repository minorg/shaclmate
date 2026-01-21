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
    type: `\
{
  readonly ${syntheticNamePrefix}identifier?: ${this.identifierType.filterType};
  readonly on?: { ${this.concreteMemberTypes.map((memberType) => `readonly ${memberType.name}?: Omit<${memberType.filterType}, "${syntheticNamePrefix}identifier">`).join(";")} }
}`,
  };
}
