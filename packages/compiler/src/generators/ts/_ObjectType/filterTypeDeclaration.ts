import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function filterTypeDeclaration(
  this: ObjectType,
): Maybe<TypeAliasDeclarationStructure> {
  if (this.extern) {
    return Maybe.empty();
  }

  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    const combinedProperties: Record<string, string> = {};
    for (const ownProperty of this.ownProperties) {
      ownProperty.filterProperty.ifJust(({ name, type }) => {
        combinedProperties[name] = type;
      });
    }
    if (Object.entries(combinedProperties).length > 0) {
      members.push(
        `{ ${Object.entries(combinedProperties)
          .map(([name, type]) => `readonly ${name}?: ${type};`)
          .join(";")} }`,
      );
    }
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(
      `${parentObjectType.staticModuleName}.${syntheticNamePrefix}Filter`,
    );
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Filter`,
    type: members.length > 0 ? members.join(" & ") : "object",
  });
}
