import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function equalsFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("equals")) {
    return Maybe.empty();
  }

  const caseBlocks = this.memberTypes.map((memberType) => {
    let returnExpression: string;
    switch (memberType.declarationType) {
      case "class":
        returnExpression = `left.${syntheticNamePrefix}equals(right as unknown as ${memberType.name})`;
        break;
      case "interface":
        returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}equals(left, right as unknown as ${memberType.name})`;
        break;
    }
    return `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${returnExpression};`;
  });
  caseBlocks.push(
    'default: left satisfies never; throw new Error("unrecognized type");',
  );

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}equals`,
    parameters: [
      {
        name: "left",
        type: this.name,
      },
      {
        name: "right",
        type: this.name,
      },
    ],
    returnType: `${syntheticNamePrefix}EqualsResult`,
    statements: `\
    return ${syntheticNamePrefix}strictEquals(left.${syntheticNamePrefix}type, right.${syntheticNamePrefix}type).chain(() => {
      switch (left.${this._discriminatorProperty.name}) {
       ${caseBlocks.join(" ")}
      }
    })`,
  });
}
