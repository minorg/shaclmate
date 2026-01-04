import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function jsonTypeAliasDeclaration(
  this: ObjectType,
): Maybe<TypeAliasDeclarationStructure> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.extern) {
    return Maybe.empty();
  }

  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    members.push(
      `{ ${this.ownProperties
        .flatMap((property) => property.jsonPropertySignature.toList())
        .map(
          (propertySignature) =>
            `readonly "${propertySignature.name}"${propertySignature.hasQuestionToken ? "?" : ""}: ${propertySignature.type}`,
        )
        .join("; ")} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(parentObjectType.jsonType().name);
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Json`,
    type: members.length > 0 ? members.join(" & ") : "object",
  });
}
