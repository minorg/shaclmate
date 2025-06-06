import type { ObjectType } from "generators/ts/ObjectType.js";
import { tsComment } from "generators/ts/tsComment.js";
import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";

export function jsonTypeAliasDeclaration(
  this: ObjectType,
): Maybe<TypeAliasDeclarationStructure> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    members.push(
      `{ ${this.ownProperties
        .flatMap((property) => property.jsonPropertySignature.toList())
        .map(
          (propertySignature) =>
            `readonly "${propertySignature.name}": ${propertySignature.type}`,
        )
        .join("; ")} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(parentObjectType.jsonName);
  }

  return Maybe.of({
    isExported: true,
    leadingTrivia: this.comment.alt(this.label).map(tsComment).extract(),
    kind: StructureKind.TypeAlias,
    name: this.name,
    type: members.length > 0 ? members.join(" & ") : "object",
  } satisfies TypeAliasDeclarationStructure);
}
