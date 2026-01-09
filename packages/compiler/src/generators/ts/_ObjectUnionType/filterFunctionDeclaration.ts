import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Function,
    parameters: [
      {
        name: "filter",
        type: this.filterType.name,
      },
      {
        name: "value",
        type: this.name,
      },
    ],
    name: `${syntheticNamePrefix}filter`,
    returnType: "boolean",
    statements: this.memberTypes
      .map(
        (memberType) => `\
if (typeof filter.on?.${memberType.name} !== "undefined" && !${memberType.filterFunction}(filter.on.${memberType.name}, value)) {
  return false;  
}`,
      )
      .concat(`return true;`),
  };
}
