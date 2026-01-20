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
  if (this.properties.length > 0) {
    const filterProperties: Record<string, string> = {};
    for (const property of this.properties) {
      property.filterProperty.ifJust(({ name, type }) => {
        filterProperties[name] = type;
      });
    }
    if (Object.entries(filterProperties).length > 0) {
      members.push(
        `{ ${Object.entries(filterProperties)
          .map(([name, type]) => `readonly ${name}?: ${type}`)
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
