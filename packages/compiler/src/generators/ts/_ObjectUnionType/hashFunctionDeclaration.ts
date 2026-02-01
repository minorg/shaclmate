import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { hasherTypeConstraint } from "../_ObjectType/hashFunctionOrMethodDeclarations.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function hashFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("hash")) {
    return Maybe.empty();
  }

  const hasherVariable = "_hasher";

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
    statements: this.concreteMemberTypes
      .map((memberType) => {
        let returnExpression: string;
        switch (memberType.declarationType) {
          case "class":
            returnExpression = `${this.thisVariable}.${syntheticNamePrefix}hash(${hasherVariable})`;
            break;
          case "interface":
            returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}hash(${this.thisVariable}, ${hasherVariable})`;
            break;
        }
        return `if (${memberType.staticModuleName}.is${memberType.name}(${this.thisVariable})) { return ${returnExpression}; }`;
      })
      .concat(`throw new Error("unrecognized type");`),
    typeParameters: [
      {
        name: "HasherT",
        constraint: hasherTypeConstraint,
      },
    ],
  });
}
