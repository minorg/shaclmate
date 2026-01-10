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
if (typeof filter.on?.${memberType.name} !== "undefined") {
  switch (value.${this._discriminantProperty.name}) {
    ${memberType.discriminantPropertyValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join(" ")}
      if (!${memberType.filterFunction}(filter.on.${memberType.name}, value)) {
        return false;
      }
      break;
  }
}`,
      )
      .concat(`return true;`),
  };
}
