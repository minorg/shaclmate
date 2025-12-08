import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { hasherTypeConstraint } from "../_ObjectType/hashFunctionOrMethodDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function hashFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("hash")) {
    return Maybe.empty();
  }

  const hasherVariable = "_hasher";

  const caseBlocks = this.memberTypes.map((memberType) => {
    let returnExpression: string;
    switch (memberType.declarationType) {
      case "class":
        returnExpression = `${this.thisVariable}.${syntheticNamePrefix}hash(${hasherVariable})`;
        break;
      case "interface":
        returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}hash(${this.thisVariable}, ${hasherVariable})`;
        break;
    }
    return `${memberType.discriminantPropertyValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${returnExpression};`;
  });
  caseBlocks.push(
    `default: ${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
  );

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}hash`,
    parameters: [
      {
        name: this.thisVariable,
        type: this.name,
      },
      {
        name: hasherVariable,
        type: "HasherT",
      },
    ],
    returnType: "HasherT",
    statements: `switch (${this.thisVariable}.${this._discriminantProperty.name}) { ${caseBlocks.join(" ")} }`,
    typeParameters: [
      {
        name: "HasherT",
        constraint: hasherTypeConstraint,
      },
    ],
  });
}
