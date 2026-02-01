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
        type: this.filterType,
      },
      {
        name: "value",
        type: this.name,
      },
    ],
    name: `${syntheticNamePrefix}filter`,
    returnType: "boolean",
    statements: [
      `\
if (typeof filter.${syntheticNamePrefix}identifier !== "undefined" && !${this.identifierType.filterFunction}(filter.${syntheticNamePrefix}identifier, value.${syntheticNamePrefix}identifier)) {
  return false;
}`,
      ...this.memberTypes.map(
        (memberType) => `\
if (${memberType.staticModuleName}.is${memberType.name}(value) && filter.on?.${memberType.name} && !${memberType.filterFunction}(filter.on.${memberType.name}, value as ${memberType.name})) {
  return false;
}`,
      ),
      `return true;`,
    ],
  };
}
