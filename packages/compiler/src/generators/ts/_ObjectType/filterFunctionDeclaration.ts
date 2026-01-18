import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (this.extern) {
    return Maybe.empty();
  }

  const statements: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      `if (!${parentObjectType.filterFunction}(filter, value)) { return false; }`,
    );
  }

  if (this.ownProperties.length > 0) {
    for (const ownProperty of this.ownProperties) {
      ownProperty.filterProperty.ifJust(({ name }) => {
        statements.push(
          `if (typeof filter.${name} !== "undefined" && !${ownProperty.type.filterFunction}(filter.${name}, value.${ownProperty.name})) { return false; }`,
        );
      });
    }
  }

  statements.push(`return true;`);

  return Maybe.of({
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
    statements,
  } satisfies FunctionDeclarationStructure);
}
